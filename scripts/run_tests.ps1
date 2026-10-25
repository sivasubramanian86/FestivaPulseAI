# ==============================================================================
# FestivaPulseAI — Unified Test Suite Runner (PowerShell)
# Executes:
# 1. Backend Pytest + Coverage Suite (Target >= 85%)
# 2. Frontend Vitest Component Test Suite
# 3. Frontend TypeScript Compilation & Vite Production Bundle Build
# 4. Lean Repository Size Gate (< 10 MB)
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Running FestivaPulseAI Full-Stack Enterprise Test Gates  " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Set-Location $ProjectRoot

# 1. Backend Pytest
Write-Host "`n[1/4] Running Backend Pytest Suite with Coverage..." -ForegroundColor Yellow
& .venv\Scripts\pytest backend/tests -v --cov=backend.app --cov-report=term-missing --cov-fail-under=85
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED: Backend pytest checks failed!" -ForegroundColor Red
    exit 1
}
Write-Host "PASSED: All backend unit, integration, and agent mesh tests passed." -ForegroundColor Green

# 2. Frontend Vitest
Write-Host "`n[2/4] Running Frontend Vitest Component Tests..." -ForegroundColor Yellow
Set-Location "$ProjectRoot\frontend"
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED: Frontend component tests failed!" -ForegroundColor Red
    exit 1
}
Write-Host "PASSED: Frontend vitest assertions passed." -ForegroundColor Green

# 3. Frontend Production Build
Write-Host "`n[3/4] Verifying Frontend TypeScript Compilation & Bundle Build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED: Frontend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "PASSED: Production bundle compiled successfully." -ForegroundColor Green

# 4. Repository Size Gate
Write-Host "`n[4/4] Checking Repository Size Invariant (< 10 MB)..." -ForegroundColor Yellow
Set-Location $ProjectRoot
& pwsh scripts/verify_repo_size.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED: Repository size exceeds safety threshold!" -ForegroundColor Red
    exit 1
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " ALL TEST GATES PASSED (100% GREEN)                       " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
