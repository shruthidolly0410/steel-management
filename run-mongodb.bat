@echo off
echo Starting MongoDB on 127.0.0.1:27017...
echo.
echo NOTE: Make sure MongoDB is installed and mongod is in your PATH.
echo       If not, adjust the path below to your mongod.exe location.
echo.

REM Create data directory if it doesn't exist
if not exist "%~dp0data\db" mkdir "%~dp0data\db"

mongod --bind_ip 127.0.0.1 --port 27017 --dbpath "%~dp0data\db"

pause
