import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { coinbaseWallet, injectedWallet, metaMaskWallet, rabbyWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { mock } from "wagmi/connectors";
import { DEVNET, robinhood, WALLETCONNECT_PROJECT_ID } from "./config";

/** anvil's first default account: unlocked on the local fork, so the node signs for it. */
const DEVNET_ACCOUNT = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" as const;

const wallets = connectorsForWallets(
  [
    {
      groupName: "Wallets",
      wallets: WALLETCONNECT_PROJECT_ID
        ? [injectedWallet, rabbyWallet, metaMaskWallet, coinbaseWallet, walletConnectWallet]
        : [injectedWallet, rabbyWallet, metaMaskWallet, coinbaseWallet],
    },
  ],
  { appName: "RealWorld", projectId: WALLETCONNECT_PROJECT_ID ?? "unused" },
);

export const wagmiConfig = createConfig({
  chains: [robinhood],
  connectors: DEVNET ? [mock({ accounts: [DEVNET_ACCOUNT], features: { reconnect: true } }), ...wallets] : wallets,
  // Reads go through the indexer's /rpc proxy (see NEXT_PUBLIC_RPC_URL); batch to keep the request count low and
  // retry, since the upstream is rate-limited. Wallets submit transactions through their own RPC.
  transports: { [robinhood.id]: http(undefined, { batch: { batchSize: 20, wait: 50 }, retryCount: 5, retryDelay: 600, timeout: 25_000 }) },
  ssr: true,
  pollingInterval: 4_000,
});
