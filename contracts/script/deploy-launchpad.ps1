# Redeploys the launchpad on top of the live RWA registry (Windows PowerShell).
# Run from the repository root:  powershell -ExecutionPolicy Bypass -File contracts\script\deploy-launchpad.ps1
# Needs the RPC proxy on :8548 (node contracts\script\rpc-proxy.mjs) and the Foundry keystore "deployer".
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

Get-Content "deploy\wallets.env" | ForEach-Object {
  if ($_ -match '^\s*([A-Z_]+)=(.+)$') { Set-Item -Path "env:$($Matches[1])" -Value $Matches[2].Trim() }
}
$env:REGISTRY = "0xa6928Ba6a67fF04a069B4c7f2233954466C87C54"
$env:DEPLOYMENTS_OUT = "deployments/mainnet.json"

$forge = Join-Path $env:USERPROFILE ".foundry\bin\forge.exe"
& $forge script script/DeployLaunchpad.s.sol --rpc-url http://127.0.0.1:8548 --account deployer --sender $env:DEPLOYER --broadcast --slow
