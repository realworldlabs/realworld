# Deploys the whole stack (RWA registry, walls, launchpad, initial underlyings) to Robinhood Chain (Windows PowerShell).
# Run from the repository root:  powershell -ExecutionPolicy Bypass -File contracts\script\deploy-mainnet.ps1
# Needs the RPC proxy on :8548 (node contracts\script\rpc-proxy.mjs) and the Foundry keystore "deployer".
# Writes contracts\deployments\mainnet.json; commit that file afterwards.
$ErrorActionPreference = "Stop"
$root = Join-Path $PSScriptRoot "..\.."
Set-Location $root

# 1. Opening prices from the live sources (no key needed).
pnpm --filter @rwa/keeper seed
if ($LASTEXITCODE -ne 0) { throw "seed failed: a price source did not agree; wait and retry" }

# 2. Broadcast.
Set-Location (Join-Path $root "contracts")
Get-Content "deploy\wallets.env" | ForEach-Object {
  if ($_ -match '^\s*([A-Z_]+)=(.+)$') { Set-Item -Path "env:$($Matches[1])" -Value $Matches[2].Trim() }
}
$forge = Join-Path $env:USERPROFILE ".foundry\bin\forge.exe"
& $forge script script/DeployMainnet.s.sol --rpc-url http://127.0.0.1:8548 --account deployer --sender $env:DEPLOYER --broadcast --slow
