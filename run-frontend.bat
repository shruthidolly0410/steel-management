@echo off
echo Starting Steel MMS Frontend on port 5173...
echo.
cd /d "%~dp0frontend"
npm run dev
pause
