#!/usr/bin/env bash
# ============================================================
# Don't Get Deactivated! — Run Anywhere
# macOS / Linux launcher
# ============================================================
set -euo pipefail

cd "$(dirname "$0")"

echo "⏳ Installing dependencies (npm ci)..."
npm ci --no-audit --no-fund

echo "🔧 Starting the game server..."
# Allow overriding port via $1 (argument) or $DGD_PORT env var
PORT="${1:-${DGD_PORT:-3000}}"
PORT="$PORT" node scripts/serve.mjs
