"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BaseError, erc20Abi, maxUint256, type Address, type Hash } from "viem";
import { useAccount, useConfig } from "wagmi";
import { getPublicClient, writeContract, waitForTransactionReceipt } from "wagmi/actions";

export type TxState =
  | { status: "idle" }
  | { status: "pending"; label: string }
  | { status: "success"; hash: Hash }
  | { status: "error"; message: string };

/** Human message from a viem/wagmi error, including custom error names from our contracts. */
export function errorMessage(e: unknown): string {
  if (e instanceof BaseError) {
    const revert = e.walk((err) => (err as { name?: string }).name === "ContractFunctionRevertedError") as
      | { data?: { errorName?: string } ; shortMessage?: string }
      | null;
    if (revert?.data?.errorName) return revert.data.errorName.replace(/([a-z])([A-Z])/g, "$1 $2");
    return e.shortMessage;
  }
  return e instanceof Error ? e.message : String(e);
}

/**
 * Runs a sequence of writes: ERC-20 approvals when allowance is short, then the action.
 * Each write is simulated first so reverts surface before the wallet prompt.
 */
export function useTx() {
  const config = useConfig();
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [state, setState] = useState<TxState>({ status: "idle" });

  async function ensureAllowance(token: Address, spender: Address, amount: bigint) {
    if (!address) throw new Error("Connect a wallet");
    const client = getPublicClient(config)!;
    const allowance = await client.readContract({ address: token, abi: erc20Abi, functionName: "allowance", args: [address, spender] });
    if (allowance >= amount) return;
    setState({ status: "pending", label: "Approve in wallet" });
    const hash = await writeContract(config, { address: token, abi: erc20Abi, functionName: "approve", args: [spender, maxUint256] });
    setState({ status: "pending", label: "Approving" });
    await waitForTransactionReceipt(config, { hash });
  }

  async function run(
    label: string,
    /** Returns a simulated request (wagmi simulateContract result); its exact generic type varies per ABI. */
    action: () => Promise<{ request: unknown }>,
    approvals: { token: Address; spender: Address; amount: bigint }[] = [],
  ): Promise<Hash | undefined> {
    try {
      for (const a of approvals) await ensureAllowance(a.token, a.spender, a.amount);
      setState({ status: "pending", label: "Confirm in wallet" });
      const { request } = await action();
      const hash = await writeContract(config, request as Parameters<typeof writeContract>[1]);
      setState({ status: "pending", label });
      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status !== "success") throw new Error("Transaction reverted");
      setState({ status: "success", hash });
      // Let the indexer catch up, then refresh everything on screen.
      setTimeout(() => queryClient.invalidateQueries(), 1_500);
      return hash;
    } catch (e) {
      setState({ status: "error", message: errorMessage(e) });
      return undefined;
    }
  }

  return { state, run, reset: () => setState({ status: "idle" }) };
}
