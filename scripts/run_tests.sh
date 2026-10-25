#!/usr/bin/env bash
# ==============================================================================
# FestivaPulseAI — Unified Test Suite Runner (POSIX / Linux / macOS)
# ==============================================================================
set -e

echo "=========================================================="
echo " Running FestivaPulseAI Full-Stack Enterprise Test Gates  "
echo "=========================================================="

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# 1. Backend Pytest
echo -e "\n[1/4] Running Backend Pytest Suite with Coverage..."
pytest backend/tests -v --cov=backend.app --cov-report=term-missing --cov-fail-under=85

# 2. Frontend Vitest
echo -e "\n[2/4] Running Frontend Vitest Component Tests..."
cd "$PROJECT_ROOT/frontend"
npm test

# 3. Frontend Production Build
echo -e "\n[3/4] Verifying Frontend TypeScript Compilation & Bundle Build..."
npm run build

# 4. Repo Size Gate
echo -e "\n[4/4] Checking Repository Size Invariant (< 10 MB)..."
cd "$PROJECT_ROOT"
REPO_SIZE_KB=$(git count-objects -v | grep 'size-pack' | awk '{print $2}')
if [ -z "$REPO_SIZE_KB" ]; then
    REPO_SIZE_KB=$(git count-objects -v | grep 'size' | head -1 | awk '{print $2}')
fi
echo "Git Objects Size: ${REPO_SIZE_KB} KB"
if [ "$REPO_SIZE_KB" -gt 10240 ]; then
    echo "ERROR: Repository git size exceeds 10 MB threshold!"
    exit 1
fi

echo -e "\n=========================================================="
echo " ALL TEST GATES PASSED (100% GREEN)                       "
echo "=========================================================="
