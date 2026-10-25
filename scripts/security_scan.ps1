# FestivaPulseAI — Local Security & Pre-Push Scanner
# Runs Python security scanner script

Write-Host "Running FestivaPulseAI Local Pre-Push Security Scanner..." -ForegroundColor Cyan
python scripts/security_scan.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "[BLOCKED] Security scan failed. Aborting git push." -ForegroundColor Red
    exit 1
} else {
    Write-Host "[SUCCESS] Security scan passed successfully." -ForegroundColor Green
    exit 0
}
