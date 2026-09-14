#!/usr/bin/env bash
# Creates every wallet the deployment needs as encrypted Foundry keystores and prints ONLY their addresses.
#
#   bash contracts/script/generate-wallets.sh
#
# - Private keys never touch the screen, the clipboard or a plain file: cast encrypts each one with a password
#   you type at a hidden prompt, into ~/.foundry/keystores/underlying-<role>.
# - Addresses are written to contracts/deploy/wallets.env for DeployMainnet.s.sol.
# - Back up ~/.foundry/keystores/underlying-* and the passwords somewhere safe. Losing them loses the protocol's
#   admin rights and any funds in those wallets.
# - Run it in your own terminal (it is interactive). It refuses to overwrite existing keystores.
set -euo pipefail
export PATH="$HOME/.foundry/bin:$PATH"
cd "$(dirname "$0")/.."

KEYSTORES="$HOME/.foundry/keystores"
OUT="deploy/wallets.env"
mkdir -p "$KEYSTORES" deploy

declare -A PURPOSE=(
  [deployer]="signs the deployment; fund ~0.006 ETH"
  [owner]="owns AssetRegistry + LaunchFactory (admin); fund ~0.002 ETH for acceptOwnership"
  [guardian]="can pause assets and switch off buybacks; fund ~0.001 ETH"
  [treasury]="receives protocol, launch and redemption fees; no funding needed"
  [keeper]="hot wallet for price moves, graduations, buybacks; fund ~0.01 ETH and top up"
)
ROLES=(deployer owner guardian treasury keeper)

for role in "${ROLES[@]}"; do
  if [ -e "$KEYSTORES/underlying-$role" ]; then
    echo "Keystore underlying-$role already exists. Refusing to overwrite. Move it away first if you really want a new one." >&2
    exit 1
  fi
done

echo "Creating ${#ROLES[@]} wallets. You will be asked for a password for each (input is hidden)."
echo
: > "$OUT"
for role in "${ROLES[@]}"; do
  echo "== $role: ${PURPOSE[$role]}"
  # When stdout is not a terminal, cast prints only the new address; the password prompt still uses the terminal.
  address=$(cast wallet new "$KEYSTORES" "underlying-$role" | grep -oE '0x[0-9a-fA-F]{40}' | tail -1)
  if [ -z "$address" ]; then
    echo "Could not read the address for $role" >&2
    exit 1
  fi
  echo "   $address"
  echo "$(echo "$role" | tr '[:lower:]' '[:upper:]')=$address" >> "$OUT"
done

echo
echo "Addresses saved to contracts/$OUT:"
cat "$OUT"
echo
echo "Next:"
echo "  1. Back up $KEYSTORES/underlying-* and the passwords."
echo "  2. Fund DEPLOYER, OWNER, GUARDIAN and KEEPER on Robinhood Chain (amounts above)."
echo "  3. Continue with docs/DEPLOY.md step 1."
