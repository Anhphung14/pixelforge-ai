#!/usr/bin/env bash

# Resolve project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Check if port 8000 is currently occupied and kill existing zombie if needed
PORT_PID=$(lsof -ti :8000 2>/dev/null)
if [ -n "$PORT_PID" ]; then
    echo "⚠️  Port 8000 is occupied by PID $PORT_PID. Terminating previous process..."
    kill -9 $PORT_PID 2>/dev/null || true
    sleep 1
fi

echo "🚀 Starting PixelForge AI Backend..."

# Activate virtual environment
if [ -f "$PROJECT_ROOT/.venv/bin/activate" ]; then
    source "$PROJECT_ROOT/.venv/bin/activate"
else
    echo "❌ Error: Virtual environment .venv not found in $PROJECT_ROOT"
    exit 1
fi

export PYTHONPATH="$PROJECT_ROOT/services/ai-api:$PROJECT_ROOT:$PYTHONPATH"

echo "🌿 Running in low-priority mode (nice -n 10) to keep macOS smooth and responsive."
exec nice -n 10 uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
