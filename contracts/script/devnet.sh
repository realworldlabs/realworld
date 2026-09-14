#!/usr/bin/env bash
# Local devnet with the full stack, sample assets, launches, trades and one graduation.
#
#   ./script/devnet.sh          plain anvil (chain id 31337) with its own v4 PoolManager and mock USDG
#   FORK=1 ./script/devnet.sh   anvil fork of Robinhood Chain via the RPC proxy on :8548 (script/rpc-proxy.mjs).
#                               The public RPC is not an archive node, so a fork stops mining once its fork
#                               block ages out of the RPC's state window; restart it when that happens.
#
# Reuses an anvil already listening on :8545, otherwise starts one in the background (PID in .devnet.pid).
# Writes deployments/devnet.json for the indexer and the web app.
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="$HOME/.foundry/bin:$PATH"

RPC="http://127.0.0.1:8545"
# anvil's first default dev account (public, test-only key)
DEV=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
DEV_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
USDG=0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168
POOL_MANAGER=0x8366a39CC670B4001A1121B8F6A443A643e40951

if ! cast chain-id --rpc-url "$RPC" >/dev/null 2>&1; then
  if [ "${FORK:-0}" = "1" ]; then
    anvil --fork-url "${FORK_URL:-http://127.0.0.1:8548}" --port 8545 --silent &
  else
    # The v4 PoolManager is above the 24 KB limit when compiled for tests.
    anvil --port 8545 --disable-code-size-limit --silent &
  fi
  echo $! > .devnet.pid
  for _ in $(seq 1 60); do cast chain-id --rpc-url "$RPC" >/dev/null 2>&1 && break; sleep 1; done
fi

if [ "$(cast chain-id --rpc-url "$RPC")" = "4663" ]; then
  # Fund the dev account with real USDG by impersonating the PoolManager, which holds plenty.
  cast rpc anvil_setBalance "$POOL_MANAGER" 0x56BC75E2D63100000 --rpc-url "$RPC" >/dev/null
  cast rpc anvil_impersonateAccount "$POOL_MANAGER" --rpc-url "$RPC" >/dev/null
  cast send "$USDG" "transfer(address,uint256)" "$DEV" 1000000000000 --from "$POOL_MANAGER" --unlocked --rpc-url "$RPC" >/dev/null
  cast rpc anvil_stopImpersonatingAccount "$POOL_MANAGER" --rpc-url "$RPC" >/dev/null
fi

mkdir -p deployments
forge script script/Devnet.s.sol --rpc-url "$RPC" --private-key "$DEV_KEY" --broadcast --slow
echo "devnet ready on $RPC"
