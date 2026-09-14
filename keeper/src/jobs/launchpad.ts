import type { Address } from "viem";
import type { KeeperChain } from "../chain.ts";
import type { Logger } from "../alerts.ts";

export interface LaunchpadJobState {
  /** Tokens seen so far, in launch order. */
  tokens: Address[];
  /** Tokens known to be graduated; never checked again. */
  graduated: Set<Address>;
}

export function newLaunchpadState(): LaunchpadJobState {
  return { tokens: [], graduated: new Set() };
}

/** Graduates every coin whose curve has sold out. Migration is permissionless, so failures only cost gas. */
export async function runGraduations(chain: KeeperChain, state: LaunchpadJobState, logger: Logger): Promise<Address[]> {
  state.tokens.push(...(await chain.launchTokens(state.tokens.length)));
  const migrated: Address[] = [];
  for (const token of state.tokens) {
    if (state.graduated.has(token)) continue;
    try {
      if (await chain.isGraduated(token)) {
        state.graduated.add(token);
        continue;
      }
      if (!(await chain.isReadyToMigrate(token))) continue;
      const txHash = await chain.migrate(token);
      state.graduated.add(token);
      migrated.push(token);
      logger.log("info", "coin graduated", { token, txHash });
    } catch (e) {
      logger.log("error", "graduation failed", { token, error: String((e as Error).message ?? e) });
    }
  }
  return migrated;
}

/** Spends buyback budgets above a minimum. The keeper must be a BuybackVault operator. */
export async function runBuybacks(
  chain: KeeperChain,
  state: LaunchpadJobState,
  minBudget: bigint,
  logger: Logger,
): Promise<Address[]> {
  const executed: Address[] = [];
  for (const token of state.tokens) {
    try {
      const budget = await chain.buybackBudget(token);
      if (budget < minBudget) continue;
      const txHash = await chain.executeBuyback(token);
      executed.push(token);
      logger.log("info", "buyback executed", { token, budget, txHash });
    } catch (e) {
      logger.log("warn", "buyback failed", { token, error: String((e as Error).message ?? e) });
    }
  }
  return executed;
}
