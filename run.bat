@echo off
REM ============================================================
REM Don't Get Deactivated! — Run Anywhere (PWA Ready)
REM Windows launcher
REM
REM Install:  Place in project folder, double-click
REM Run anywhere: Works offline via PWA (after first visit)
REM ============================================================
cd /d "%~dp0"

echo ⏳ Installing dependencies (npm ci) ...
call npm ci --no-audit --no-fund

echo 🔧 Starting the game server...
echo.
echo Open your browser to: http://localhost:3000
echo (Or visit http://<your-ip>:3000 on other devices on your network)
echo.
echo The game is a PWA — install it on your device for offline play
echo after the first visit.
echo.

rem Start the server and keep the window open
node scripts/serve.mjs
