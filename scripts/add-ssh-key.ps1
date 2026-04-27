# PowerShell script to add SSH key to server
# Run: .\scripts\add-ssh-key.ps1

$Server = "38.180.146.98"
$Username = "root"
$Password = "tdA6FoncKG"
$PublicKey = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPbvxUzG2+x6Qur6N0b1tyHslOtZzk4DLm743HiSTazk claude-deploy"

Write-Host "Adding SSH key to $Server..." -ForegroundColor Cyan

# Using plink if available
$plinkPath = Get-Command plink.exe -ErrorAction SilentlyContinue
if ($plinkPath) {
    Write-Host "Using plink.exe" -ForegroundColor Green
    $cmd = "mkdir -p ~/.ssh && echo `"$PublicKey`" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && cat ~/.ssh/authorized_keys"
    echo $cmd | & $plinkPath.Path -ssh -pw $Password "$Username@$Server"
    Write-Host "Done!" -ForegroundColor Green
} else {
    Write-Host "plink.exe not found. Please install PuTTY or add key manually:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manual steps:" -ForegroundColor Cyan
    Write-Host "1. ssh root@$Server"
    Write-Host "2. mkdir -p ~/.ssh"
    Write-Host "3. echo `"$PublicKey`" >> ~/.ssh/authorized_keys"
    Write-Host "4. chmod 600 ~/.ssh/authorized_keys"
}
