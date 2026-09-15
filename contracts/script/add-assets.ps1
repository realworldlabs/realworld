# Adds the underlyings listed in keeper\assets.next.json that are not on-chain yet (Windows PowerShell).
# Run from the repository root:  powershell -ExecutionPolicy Bypass -File contracts\script\add-assets.ps1
# Needs the RPC proxy on :8548 and the Foundry keystore of the registry owner (currently "deployer").
$ErrorActionPreference = "Stop"
$root = Join-Path $PSScriptRoot "..\.."
Set-Location (Join-Path $root "keeper")

$env:ASSETS_FILE = "assets.next.json"
# keeper\.env may hold BLS_API_KEY: the keyless BLS tier allows only 25 requests a day per address.
node --env-file-if-exists=.env src/seed.ts ../contracts/deploy/next-assets.json
if ($LASTEXITCODE -ne 0) { throw "seed failed: a price source did not agree; wait and retry" }

Set-Location (Join-Path $root "contracts")
Get-Content "deploy\wallets.env" | ForEach-Object {
  if ($_ -match '^\s*([A-Z_]+)=(.+)$') { Set-Item -Path "env:$($Matches[1])" -Value $Matches[2].Trim() }
}
$env:REGISTRY = (Get-Content "deployments\mainnet.json" | ConvertFrom-Json).assetRegistry
$env:ASSETS_FILE = "deploy/next-assets.json"
$forge = Join-Path $env:USERPROFILE ".foundry\bin\forge.exe"
& $forge script script/AddAssets.s.sol --rpc-url http://127.0.0.1:8548 --account deployer --sender $env:DEPLOYER --broadcast --slow
