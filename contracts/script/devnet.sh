#!/usr/bin/env bash
# Starts an anvil fork of Robinhood Chain on :8545 and populates it with the full stack.
#   ./script/devnet.sh            (expects the RPC proxy on :8548, see script/rpc-proxy.mjs)
# Leaves anvil running in the background; its PID is written to .devnet.pid.
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="$HOME/.foundry/bin:$PATH"

FORK_URL="${FORK_URL:-http://127.0.0.1:8548}"
RPC="http://127.0.0.1:8545"
# anvil's first default dev account (public, test-only key)
DEV=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
DEV_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
USDG=0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168
POOL_MANAGER=0x8366a39CC670B4001A1121B8F6A443A643e40951

anvil --fork-url "$FORK_URL" --port 8545 --silent &
echo $! > .devnet.pid
for _ in $(seq 1 60); do cast chain-id --rpc-url "$RPC" >/dev/null 2>&1 && break; sleep 1; done

# Fund the dev account with USDG by impersonating the PoolManager, which holds plenty.
cast rpc anvil_setBalance "$POOL_MANAGER" 0x56BC75E2D63100000 --rpc-url "$RPC" >/dev/null
cast rpc anvil_impersonateAccount "$POOL_MANAGER" --rpc-url "$RPC" >/dev/null
cast send "$USDG" "transfer(address,uint256)" "$DEV" 1000000000000 --from "$POOL_MANAGER" --unlocked --rpc-url "$RPC" >/dev/null
cast rpc anvil_stopImpersonatingAccount "$POOL_MANAGER" --rpc-url "$RPC" >/dev/null

mkdir -p deployments
forge script script/Devnet.s.sol --rpc-url "$RPC" --private-key "$DEV_KEY" --broadcast --slow
echo "devnet ready on $RPC (anvil pid $(cat .devnet.pid))"
