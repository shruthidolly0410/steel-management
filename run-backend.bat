@echo off
echo Starting Steel MMS Backend on port 5000...
echo.
cd /d "%~dp0backend"
node server.js
pause
