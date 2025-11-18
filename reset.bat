@echo off
REM Reset Script for Windows - Clears all data and resets to initial setup
REM This will delete all logs, users, and webhooks from the database

echo =========================================
echo FiveM Logging System - Reset Script
echo =========================================
echo.
echo WARNING: This will delete ALL data including:
echo   - All users (you'll need to create admin again)
echo   - All logs
echo   - All webhooks
echo   - All configuration
echo.
set /p confirm="Are you sure you want to continue? (yes/no): "

if /i not "%confirm%"=="yes" (
    echo Reset cancelled.
    exit /b 0
)

echo.
echo Stopping containers...
docker compose down

echo.
echo Removing database volume...
docker volume rm fivem-logging-copilot-add-webapp-with-logging_mysql-data 2>nul || echo Volume already removed or doesn't exist

echo.
echo Starting containers...
docker compose up -d

echo.
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo =========================================
echo Reset complete!
echo =========================================
echo.
echo Next steps:
echo 1. Visit http://localhost:4000/setup.html
echo 2. Create your admin account
echo 3. Login and configure webhooks
echo.
pause
