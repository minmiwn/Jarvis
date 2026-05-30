#!/bin/bash

# ============================================
#  🤖 JARVIS - Run All Services
#  Chạy: Agent + Token Server + Frontend
# ============================================

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

# Màu sắc cho output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Lưu PID để cleanup khi tắt
PIDS=()

cleanup() {
    echo ""
    echo -e "${YELLOW}⏹  Đang tắt tất cả services...${NC}"
    for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null
            wait "$pid" 2>/dev/null
        fi
    done
    echo -e "${GREEN}✅ Đã tắt sạch. Tạm biệt!${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

echo -e "${CYAN}"
echo "  ╔═══════════════════════════════════════╗"
echo "  ║        🤖 JARVIS - Starting Up        ║"
echo "  ╠═══════════════════════════════════════╣"
echo "  ║  Agent:        python agent.py start  ║"
echo "  ║  Token Server: uvicorn :8000          ║"
echo "  ║  Frontend:     vite :5173             ║"
echo "  ╚═══════════════════════════════════════╝"
echo -e "${NC}"

# --- Activate virtual environment ---
if [ -d "$ROOT_DIR/.venv" ]; then
    source "$ROOT_DIR/.venv/bin/activate"
fi

# --- Check & install dependencies ---
echo -e "${YELLOW}🔍 Checking dependencies...${NC}"

# Check Python deps
cd "$ROOT_DIR"
if ! python -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}   📦 Installing Python dependencies...${NC}"
    uv pip install -r requirements.txt
fi

# Check Node deps
cd "$FRONTEND_DIR"
if [ ! -d "node_modules/@livekit" ]; then
    echo -e "${YELLOW}   📦 Installing frontend dependencies...${NC}"
    npm install
    npm install @livekit/components-react @livekit/components-styles livekit-client
fi

echo -e "${GREEN}   ✅ Dependencies OK${NC}"
echo ""

# --- 1. Token Server ---
echo -e "${GREEN}[1/3]${NC} 🔑 Starting Token Server on :8000..."
cd "$BACKEND_DIR"
uvicorn token_server:app --port 8000 --host 0.0.0.0 2>&1 | sed 's/^/  [Token] /' &
PIDS+=($!)
sleep 2

# --- 2. Agent ---
echo -e "${GREEN}[2/3]${NC} 🤖 Starting LiveKit Agent..."
cd "$BACKEND_DIR"
python agent.py start 2>&1 | sed 's/^/  [Agent] /' &
PIDS+=($!)
sleep 1

# --- 3. Frontend ---
echo -e "${GREEN}[3/3]${NC} 🌐 Starting Frontend on :5173..."
cd "$FRONTEND_DIR"
npm run dev 2>&1 | sed 's/^/  [Front] /' &
PIDS+=($!)

echo ""
echo -e "${GREEN}✅ All services started!${NC}"
echo -e "${CYAN}   Frontend: http://localhost:5173${NC}"
echo -e "${CYAN}   Token:    http://localhost:8000${NC}"
echo ""
echo -e "${YELLOW}   Nhấn Ctrl+C để tắt tất cả${NC}"
echo ""

# Chờ tất cả processes
wait
