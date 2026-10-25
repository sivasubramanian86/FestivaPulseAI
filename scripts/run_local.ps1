# FestivaPulseAI Local Development Runner
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Launching FestivaPulseAI Full-Stack Architecture " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Start FastAPI Backend on port 8000
Write-Host "[1/2] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
$backendProcess = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd backend; ..\.venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload" -PassThru

# Wait 2 seconds for backend to initialize
Start-Sleep -Seconds 2

# 2. Start Vite Frontend on port 5173
Write-Host "[2/2] Starting Vite Frontend on http://localhost:5173..." -ForegroundColor Green
$frontendProcess = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -PassThru

Write-Host "FestivaPulseAI is running live!" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "API Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
