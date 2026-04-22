#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PYTHON_BIN="${LOCAL_WHISPER_PYTHON_BIN:-python3}"

if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  echo "❌ Python executable '$PYTHON_BIN' not found. Install Python 3.10+ and re-run."
  exit 1
fi

"$PYTHON_BIN" -m pip install --upgrade pip
"$PYTHON_BIN" -m pip install -r "$ROOT_DIR/requirements-whisper.txt"

echo "✅ Local Whisper dependencies installed."
echo "Next steps:"
echo "1) Set in server/.env -> LOCAL_TRANSCRIBE_MODE=local-only"
echo "2) Start server: npm run dev --workspace server"
