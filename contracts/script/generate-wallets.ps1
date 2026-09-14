# Creates every wallet the deployment needs as encrypted Foundry keystores and prints ONLY their addresses.
#
#   powershell -ExecutionPolicy Bypass -File contracts\script\generate-wallets.ps1
#
# - Private keys never touch the screen or a plain file: cast encrypts each one with a password you type at a
#   hidden prompt, into ~\.foundry\keystores\underlying-<role>.
# - Addresses are written to contracts\deploy\wallets.env for DeployMainnet.s.sol.
# - Back up ~\.foundry\keystores\underlying-* and the passwords. Losing them loses the protocol's admin rights and
#   any funds in those wallets.
# - Refuses to overwrite existing keystores.
param(
    [string]$KeystoreDir = (Join-Path $env:USERPROFILE ".foundry\keystores")
)
$ErrorActionPreference = "Stop"

$cast = Join-Path $env:USERPROFILE ".foundry\bin\cast.exe"
if (-not (Test-Path $cast)) { throw "Foundry cast not found at $cast. Install Foundry first." }

$contractsDir = Split-Path -Parent $PSScriptRoot
$outFile = Join-Path $contractsDir "deploy\wallets.env"
New-Item -ItemType Directory -Force -Path $KeystoreDir, (Split-Path $outFile) | Out-Null

$roles = [ordered]@{
    deployer = "signs the deployment; fund ~0.006 ETH"
    owner    = "owns AssetRegistry + LaunchFactory (admin); fund ~0.002 ETH"
    guardian = "can pause assets and switch off buybacks; fund ~0.001 ETH"
    treasury = "receives protocol, launch and redemption fees; no funding needed"
    keeper   = "hot wallet for price moves, graduations, buybacks; fund ~0.01 ETH and top up"
}

foreach ($role in $roles.Keys) {
    if (Test-Path (Join-Path $KeystoreDir "underlying-$role")) {
        throw "Keystore underlying-$role already exists in $KeystoreDir. Refusing to overwrite."
    }
}

Write-Host "Creating $($roles.Count) wallets. For each one, type a password when asked (nothing shows while typing)."
Write-Host ""
$lines = @()
foreach ($role in $roles.Keys) {
    Write-Host "== ${role}: $($roles[$role])"
    # With stdout captured, cast prints only the new address; the password prompt still uses the console.
    $output = & $cast wallet new $KeystoreDir "underlying-$role"
    if ($LASTEXITCODE -ne 0) { throw "cast failed while creating $role" }
    $address = ([regex]::Matches(($output -join "`n"), "0x[0-9a-fA-F]{40}") | Select-Object -Last 1).Value
    if (-not $address) { throw "Could not read the address for $role" }
    Write-Host "   $address"
    $lines += "$($role.ToUpper())=$address"
}

# LF line endings so bash `source` also works.
[System.IO.File]::WriteAllText($outFile, (($lines -join "`n") + "`n"))

Write-Host ""
Write-Host "Addresses saved to $outFile"
$lines | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Next:"
Write-Host "  1. Back up $KeystoreDir\underlying-* and the passwords."
Write-Host "  2. Fund DEPLOYER, OWNER, GUARDIAN and KEEPER on Robinhood Chain (amounts above)."
Write-Host "  3. Tell Claude 'sudah'."
