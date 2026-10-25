#!/usr/bin/env bash
# ==============================================================================
# FestivaPulseAI — Local Full-Stack Development Runner (POSIX / macOS / Linux)
# ==============================================================================
set -e

echo "=========================================================="
echo " Starting FestivaPulseAI Full-Stack Development Runtime  "
echo "=========================================================="

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Check Python environment
if [ -d ".venv" ]; then
    echo "[1/4] Activating Python virtual environment..."
    source .venv/bin/activate
elif [ -d "venv" ]; then
    echo "[1/4] Activating venv..."
    source venv/bin/activate
else
    echo "[1/4] Creating virtual environment (.venv)..."
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
fi

# Run backend fast verification
echo "[2/4] Verifying domain invariants..."
python -m pytest backend/tests -q

# Start Backend API in background
echo "[3/4] Launching FastAPI Backend on http://127.0.0.1:8000..."
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

# Trap signals to cleanly kill backend on exit
trap "kill $BACKEND_PID 2>/dev/null || true" EXIT INT TERM

# Start Frontend Dev Server
echo "[4/4] Starting Vite React Cockpit on http://localhost:5173..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
npm run dev

wait $BACKEND_PID
