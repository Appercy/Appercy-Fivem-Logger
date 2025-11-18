#!/bin/bash
# FiveM Logging System - Linux/Mac Installer
# This script installs the logging system without Docker

set -e

echo "========================================"
echo "FiveM Logging System - Setup"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Bun is installed
echo "[1/6] Checking for Bun runtime..."
if ! command -v bun &> /dev/null; then
    echo -e "${RED}ERROR: Bun is not installed!${NC}"
    echo ""
    echo "Please install Bun first:"
    echo "  curl -fsSL https://bun.sh/install | bash"
    echo ""
    echo "Then restart your terminal and run this script again."
    exit 1
fi
echo -e "${GREEN}✓ Bun is installed${NC}"
echo ""

# Check if MySQL is installed
echo "[2/6] Checking for MySQL..."
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}ERROR: MySQL is not installed!${NC}"
    echo ""
    echo "Please install MySQL first:"
    echo ""
    echo "  Ubuntu/Debian:"
    echo "    sudo apt update"
    echo "    sudo apt install mysql-server"
    echo ""
    echo "  macOS:"
    echo "    brew install mysql"
    echo ""
    echo "Then restart this script."
    exit 1
fi
echo -e "${GREEN}✓ MySQL is installed${NC}"
echo ""

# Get database credentials
echo "[3/6] Database Configuration"
echo ""
echo "Please enter your MySQL database credentials:"
echo ""

read -p "MySQL Host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "MySQL Port (default: 3306): " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "MySQL Username (default: root): " DB_USER
DB_USER=${DB_USER:-root}

read -sp "MySQL Password: " DB_PASSWORD
echo ""

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}ERROR: Password cannot be empty!${NC}"
    exit 1
fi

read -p "Database Name (default: fivem_logging): " DB_NAME
DB_NAME=${DB_NAME:-fivem_logging}

echo ""
echo "Testing database connection..."

# Test database connection
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" &> /dev/null; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}ERROR: Cannot connect to MySQL with provided credentials!${NC}"
    echo "Please check your credentials and try again."
    exit 1
fi
echo ""

# Create database
echo "[4/6] Creating database..."
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;" &> /dev/null; then
    echo -e "${GREEN}✓ Database '$DB_NAME' created${NC}"
else
    echo -e "${RED}ERROR: Failed to create database!${NC}"
    exit 1
fi
echo ""

# Import schema
echo "[5/6] Importing database schema..."
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < src/db/schema.sql; then
    echo -e "${GREEN}✓ Schema imported successfully${NC}"
else
    echo -e "${RED}ERROR: Failed to import schema!${NC}"
    exit 1
fi
echo ""

# Create .env file
echo "[6/6] Creating configuration file..."
cat > .env << EOF
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
PORT=4000
EOF

echo -e "${GREEN}✓ Configuration saved to .env${NC}"
echo ""

# Install dependencies
echo "Installing dependencies..."
if bun install; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}ERROR: Failed to install dependencies!${NC}"
    exit 1
fi
echo ""

echo "========================================"
echo -e "${GREEN}Installation Complete! 🎉${NC}"
echo "========================================"
echo ""
echo "Your database configuration has been saved to .env"
echo ""
echo "To start the server, run:"
echo -e "  ${YELLOW}bun run src/index.ts${NC}"
echo ""
echo "Then open your browser to:"
echo -e "  ${YELLOW}http://localhost:4000/setup.html${NC}"
echo ""
echo "Create your admin account and start logging!"
echo "========================================"
echo ""
