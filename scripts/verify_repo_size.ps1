# FestivaPulseAI Repository Size Verification Script
# Strict constraint: Public GitHub repository must remain below 10 MB.
# Conservative safety threshold: 8,000,000 bytes (8 MB).

$ThresholdBytes = 8000000

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " FestivaPulseAI - Repository Size Verification Gate " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$trackedFiles = git ls-files
if (-not $trackedFiles) {
    Write-Host "[INFO] No tracked files found in git yet. Checking working directory size..." -ForegroundColor Yellow
    $allFiles = Get-ChildItem -Path . -Recurse -File | Where-Object { 
        $_.FullName -notmatch '\\\.git\\' -and 
        $_.FullName -notmatch '\\node_modules\\' -and 
        $_.FullName -notmatch '\\\.venv\\' 
    }
    $totalBytes = ($allFiles | Measure-Object -Property Length -Sum).Sum
    $fileCount = $allFiles.Count
} else {
    $totalBytes = 0
    $fileCount = 0
    foreach ($file in $trackedFiles) {
        if (Test-Path $file) {
            $item = Get-Item $file
            $totalBytes += $item.Length
            $fileCount++
        }
    }
}

$totalMB = [Math]::Round($totalBytes / 1MB, 2)
$totalKB = [Math]::Round($totalBytes / 1KB, 2)

Write-Host "Total Tracked Files: $fileCount" -ForegroundColor Green
Write-Host "Total Size: $totalKB KB ($totalMB MB)" -ForegroundColor Green
Write-Host "Allowed Threshold: 8.00 MB (8,000,000 bytes)" -ForegroundColor Gray

if ($totalBytes -gt $ThresholdBytes) {
    Write-Host "[FAIL] Repository size ($totalMB MB) EXCEEDS conservative threshold of 8.00 MB!" -ForegroundColor Red
    exit 1
} else {
    Write-Host "[PASS] Repository size is well within the < 10 MB competition limit!" -ForegroundColor Green
}
