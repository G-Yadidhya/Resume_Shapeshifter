@echo off
REM Resume Shapeshifter — dev server (fixes Node/npm not on PATH)
set "PATH=C:\Program Files\nodejs;%PATH%"

where npm >nul 2>&1
if errorlevel 1 (
  echo Node.js was not found. Install from https://nodejs.org/ then reopen your terminal.
  pause
  exit /b 1
)

cd /d "%~dp0"
echo Starting dev server at http://localhost:3000
npm run dev
