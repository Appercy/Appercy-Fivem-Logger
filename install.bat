@echo off
REM FiveM Logging System - Windows Installer
REM This script installs the logging system without Docker

echo ========================================
echo FiveM Logging System - Windows Setup
echo ========================================
echo.

REM Check if Bun is installed
echo [1/6] Checking for Bun runtime...
bun --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Bun is not installed!
    echo.
    echo Please install Bun first:
    echo 1. Visit: https://bun.sh
    echo 2. Run: powershell -c "irm bun.sh/install.ps1 | iex"
    echo 3. Restart this terminal and run install.bat again
    echo.
    pause
    exit /b 1
)
echo ✓ Bun is installed
echo.

REM Check if MySQL is installed
echo [2/6] Checking for MySQL...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MySQL is not installed!
    echo.
    echo Please install MySQL first:
    echo 1. Download from: https://dev.mysql.com/downloads/mysql/
    echo 2. Install MySQL Server
    echo 3. Remember your root password
    echo 4. Restart this terminal and run install.bat again
    echo.
    pause
    exit /b 1
)
echo ✓ MySQL is installed
echo.

REM Get database credentials
echo [3/6] Database Configuration
echo.
echo Please enter your MySQL database credentials:
echo.

set /p DB_HOST="MySQL Host (default: localhost): "
if "%DB_HOST%"=="" set DB_HOST=localhost

set /p DB_PORT="MySQL Port (default: 3306): "
if "%DB_PORT%"=="" set DB_PORT=3306

set /p DB_USER="MySQL Username (default: root): "
if "%DB_USER%"=="" set DB_USER=root

set /p DB_PASSWORD="MySQL Password: "
if "%DB_PASSWORD%"=="" (
    echo ERROR: Password cannot be empty!
    pause
    exit /b 1
)

set /p DB_NAME="Database Name (default: fivem_logging): "
if "%DB_NAME%"=="" set DB_NAME=fivem_logging

echo.
echo Testing database connection...

REM Test database connection
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% -e "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Cannot connect to MySQL with provided credentials!
    echo Please check your credentials and try again.
    echo.
    pause
    exit /b 1
)
echo ✓ Database connection successful
echo.

REM Create database
echo [4/6] Creating database...
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME%;" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Failed to create database!
    pause
    exit /b 1
)
echo ✓ Database '%DB_NAME%' created
echo.

REM Import schema
echo [5/6] Importing database schema...
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < src\db\schema.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to import schema!
    pause
    exit /b 1
)
echo ✓ Schema imported successfully
echo.

REM Create .env file
echo [6/6] Creating configuration file...
(
echo DB_HOST=%DB_HOST%
echo DB_PORT=%DB_PORT%
echo DB_USER=%DB_USER%
echo DB_PASSWORD=%DB_PASSWORD%
echo DB_NAME=%DB_NAME%
echo PORT=4000
) > .env

echo ✓ Configuration saved to .env
echo.

REM Install dependencies
echo Installing dependencies...
call bun install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo ========================================
echo Installation Complete! 🎉
echo ========================================
echo.
echo Your database configuration has been saved to .env
echo.
echo To start the server, run:
echo   bun run src/index.ts
echo.
echo Then open your browser to:
echo   http://localhost:4000/setup.html
echo.
echo Create your admin account and start logging!
echo ========================================
echo.
pause
