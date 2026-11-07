@echo off
REM ============================================================
REM Don't Get Deactivated! — Run Anywhere
REM Windows launcher
REM ============================================================
cd /d "%~dp0"

echo off
echo ⏳ Installing dependencies (npm ci)...
call npm ci --no-audit --no-fund

echo 🔧 Starting the game server...
echo.
echo Open your browser to: http://localhost:3000
echo.

rem Start the server and keep the window open
node scripts/serve.mjs
