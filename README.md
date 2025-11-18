# FiveM Logging System

A comprehensive web-based logging solution for FiveM servers with Discord integration, advanced filtering, dark mode, and multi-language support.

## 🌟 Features

- 🚀 **Fast Performance** - Built with Bun runtime
- 🔐 **Secure Authentication** - Session-based auth with bcrypt password hashing
- 📊 **Advanced Filtering** - Filter by type, level, resource, search text, and date range
- 🔗 **Multiple Webhooks** - Discord, FiveM, and custom webhook endpoints
- 💾 **MySQL Database** - Persistent storage with efficient indexing
- 🎨 **Modern UI** - Responsive design with dark mode support
- 🌍 **Multi-Language** - English and German (easily extendable)
- 🗑️ **Log Management** - Single and bulk delete with admin permissions
- 📸 **Media Support** - Display images, videos, and files from Discord
- 👥 **User Management** - Create multiple users with role-based access
- 🐳 **Docker Ready** - Easy deployment with Docker Compose

## 📋 Quick Links

- [Installation with Docker](#-installation-with-docker-recommended)
- [Installation without Docker](#-installation-without-docker)
- [FiveM Integration](#-fivem-integration)
- [Webhook Usage](#-webhook-endpoints)
- [Resetting System](#-resetting-the-system)

---

## 🐳 Installation with Docker (Recommended)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) v20.10+
- [Docker Compose](https://docs.docker.com/compose/install/) v2.0+

### Installation Steps

1. **Clone the repository:**
```bash
git clone <repository-url>
cd fivem-logging-copilot-add-webapp-with-logging
```

2. **(Optional) Configure settings:**
Edit `docker-compose.yml` to change default password:
```yaml
environment:
  - DB_PASSWORD=your-secure-password  # Change this!
```

3. **Start the application:**
```bash
docker compose up -d
```

4. **Access the web interface:**
- Local: `http://localhost:4000/setup.html`
- External: `http://your-server-ip:4000/setup.html`

5. **Create your admin account** through the web interface

### Docker Management Commands

```bash
# View logs
docker compose logs -f

# Stop containers
docker compose down

# Restart containers
docker compose restart

# Rebuild after code changes
docker compose up -d --build

# Remove all data (WARNING: Deletes database)
docker compose down -v
```

---

## 💻 Installation without Docker

### Prerequisites
- **Bun** - JavaScript runtime ([Download](https://bun.sh))
- **MySQL** - Database server ([Download](https://dev.mysql.com/downloads/))

### Automated Installation (Recommended)

We provide installation scripts that will set everything up for you!

#### Windows Users

1. **Download the project** and open PowerShell/Command Prompt in the project folder

2. **Run the installer:**
```cmd
install.bat
```

3. **Follow the prompts:**
   - Enter your MySQL host (default: localhost)
   - Enter your MySQL port (default: 3306)
   - Enter your MySQL username (default: root)
   - Enter your MySQL password
   - Enter database name (default: fivem_logging)

4. **The script will:**
   - ✅ Check if Bun is installed
   - ✅ Check if MySQL is installed
   - ✅ Test your database connection
   - ✅ Create the database
   - ✅ Import the database schema
   - ✅ Create a `.env` configuration file
   - ✅ Install dependencies

5. **Start the server:**
```cmd
bun run src/index.ts
```

#### Linux/Mac Users

1. **Download the project** and open terminal in the project folder

2. **Run the installer:**
```bash
./install.sh
```

3. **Follow the prompts** (same as Windows above)

4. **Start the server:**
```bash
bun run src/index.ts
```

### Manual Installation

If you prefer to install manually or the automatic script doesn't work:

1. **Install Bun:**
```bash
# Linux/macOS
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

2. **Install MySQL:**
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install mysql-server

# macOS
brew install mysql

# Windows: Download from https://dev.mysql.com/downloads/
```

3. **Create the database:**
```bash
mysql -u root -p
```
Then in MySQL:
```sql
CREATE DATABASE fivem_logging;
USE fivem_logging;
SOURCE src/db/schema.sql;
EXIT;
```

4. **Configure the application:**

Create a file named `.env` in the project root:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=fivem_logging
PORT=4000
```

**Important:** Replace `your_mysql_password` with your actual MySQL password!

5. **Install dependencies:**
```bash
bun install
```

6. **Start the server:**
```bash
bun run src/index.ts
```

7. **Access the web interface:**
- Open: `http://localhost:4000/setup.html`
- Create your admin account
- Start logging!

---

## 🎮 FiveM Integration
```

**Windows:**
Download from [MySQL Downloads](https://dev.mysql.com/downloads/installer/)

3. **Create database:**
```bash
mysql -u root -p

# In MySQL prompt:
CREATE DATABASE fivem_logging;
CREATE USER 'fivem_logger'@'localhost' IDENTIFIED BY 'your-password';
GRANT ALL PRIVILEGES ON fivem_logging.* TO 'fivem_logger'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

4. **Clone and configure:**
```bash
git clone <repository-url>
cd fivem-logging-copilot-add-webapp-with-logging

# Create environment file
cat > .env << EOF
DB_HOST=localhost
DB_PORT=3306
DB_USER=fivem_logger
DB_PASSWORD=your-password
DB_NAME=fivem_logging
PORT=4000
SKIP_CLI_SETUP=false
EOF
```

5. **Install dependencies:**
```bash
bun install
```

6. **Run the application:**

**Development:**
```bash
bun run dev
```

**Production:**
```bash
bun run start
```

**With PM2 (recommended for production):**
```bash
npm install -g pm2
pm2 start bun --name "fivem-logging" -- run start
pm2 startup
pm2 save
```

7. **Access the application:**
- Visit `http://localhost:4000/setup.html`

---

## 🎯 First-Time Setup

### Web-Based Setup (Default for Docker)
1. Visit `http://localhost:4000/setup.html`
2. Enter admin username (any name)
3. Enter password (minimum 8 characters)
4. Click "Create Account"
5. Login at `http://localhost:4000/login.html`

### CLI Setup (Non-Docker only)
If `SKIP_CLI_SETUP=false` in your environment:
1. Start the application
2. Follow the terminal prompts:
   ```
   ========================================
   First Run Setup - Create Admin Account
   ========================================
   
   Enter admin username: admin
   Enter admin password: ********
   ```

---

## 🎮 FiveM Integration

There are **two ways** to send logs from FiveM:

### Option 1: Direct HTTP Requests (Simple)

Use this in any FiveM resource without installing anything:

```lua
-- Example: Log a player purchase
PerformHttpRequest('http://your-server:4000/api/webhook/custom/esx', 
  function(statusCode, response, headers)
    -- Handle response
  end, 
  'POST', 
  json.encode({
    level = 'info',
    message = 'Player purchased item',
    player = 'John Doe',
    identifier = 'steam:110000123456789',
    item = 'bread',
    price = 10
  }), 
  {['Content-Type'] = 'application/json'}
)
```

### Option 2: FiveM Logger Resource (Recommended)

A ready-to-use resource with exports, screenshot support, and auto-logging.

#### Installation:
1. Copy `fivem-resource/` to your server's `resources/` folder
2. Rename to `logger`
3. Edit `config.lua`:
   ```lua
   Config.LoggerURL = "http://your-server:4000/api/webhook/custom/fivem"
   ```
4. Add to `server.cfg`:
   ```
   ensure logger
   ```

#### Usage:

**Server-Side:**
```lua
-- Simple log
exports['logger']:log('info', 'Player purchased item', {
    item = 'bread',
    price = 10
})

-- Log with screenshot (requires screenshot-basic)
exports['logger']:logWithScreenshot('warn', 'Suspicious activity', {
    action = 'speed_hack'
}, playerId)

-- ESX integration example
RegisterNetEvent('esx:playerLoaded')
AddEventHandler('esx:playerLoaded', function(xPlayer)
    exports['logger']:log('info', 'Player loaded', {
        identifier = xPlayer.identifier,
        job = xPlayer.job.name
    })
end)
```

**Client-Side:**
```lua
-- Log from client
exports['logger']:log('info', 'Player entered zone', {
    zone = 'airport'
})

-- Screenshot from client
exports['logger']:logWithScreenshot('warn', 'Restricted area', {
    coords = GetEntityCoords(PlayerPedId())
})
```

**Test Commands:**
- Server: `/testlog info Test message`
- Client: `/testscreenshot`

📖 **Full documentation:** See [fivem-resource/README.md](fivem-resource/README.md)

---

## 📡 Webhook Endpoints

### Discord Webhook
```bash
POST http://your-server:4000/api/webhook/discord

# Payload example:
{
  "content": "Message text",
  "embeds": [...],
  "attachments": [
    {
      "url": "https://example.com/image.jpg",
      "content_type": "image/jpeg"
    }
  ]
}
```

**Features:**
- ✅ Automatic media extraction (images, videos)
- ✅ Embed support
- ✅ Avatar and username tracking

### FiveM Webhook
```bash
POST http://your-server:4000/api/webhook/fivem

# Payload example:
{
  "level": "info",
  "message": "Player action",
  "resource": "es_extended",
  "player": "John Doe",
  "identifier": "steam:110000123456789"
}
```

### Custom Webhook Paths
```bash
# Basic custom path
POST http://your-server:4000/api/webhook/custom/esx

# With log level in URL
POST http://your-server:4000/api/webhook/custom/esx/warn
POST http://your-server:4000/api/webhook/custom/qbcore/error
```

**Creating custom paths:**
1. Login as admin
2. Go to Admin Panel
3. Click "Add Webhook"
4. Enter custom path (e.g., "esx" for `/api/webhook/custom/esx`)

---

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | Web server port |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | MySQL username |
| `DB_PASSWORD` | `password` | MySQL password |
| `DB_NAME` | `fivem_logging` | Database name |
| `SKIP_CLI_SETUP` | `false` | Skip CLI admin prompt |

### Log Levels

- `debug` - Detailed debugging information
- `info` - General informational messages (default)
- `warn` - Warning messages
- `error` - Error messages

---

## 🌙 Dark Mode & Localization

### Dark Mode
- Toggle using the 🌙/☀️ button in the header
- Preference is saved to localStorage
- Applies to all pages (dashboard, admin, login, setup)

### Language Support
- **English** (en) - Default
- **German** (de) - Deutsch

Change language using the dropdown in the header. Preference is saved to localStorage.

**Adding more languages:**
1. Edit `src/public/js/locale.js`
2. Add your language code and translations
3. Rebuild/restart the application

---

## 🗑️ Log Management

### Viewing Logs
- **Dashboard**: `http://localhost:4000/dashboard.html`
- **Filters**: Type, Level, Resource, Search, Date Range
- **Search**: Searches in message text and metadata

### Deleting Logs (Admin Only)

**Single Delete:**
1. Click "Delete" button next to any log
2. Confirm deletion

**Bulk Delete:**
1. Check boxes next to logs you want to delete
2. Click "Delete Selected (X)" button
3. Confirm deletion

---

## 🔄 Resetting the System

To completely reset and start fresh:

### Linux/macOS:
```bash
./reset.sh
```

### Windows:
```batch
reset.bat
```

### Manual Reset:
```bash
docker compose down
docker volume rm fivem-logging-copilot-add-webapp-with-logging_mysql-data
docker compose up -d
```

**⚠️ WARNING:** This deletes ALL data:
- All users (including admin)
- All logs
- All webhooks
- All configuration

After reset, visit `/setup.html` to create a new admin account.

---

## 👥 User Management (Admin Only)

### Create User
1. Login as admin
2. Go to Admin Panel
3. Click "Add User"
4. Enter username and password
5. Select role (Admin or User)

### Reset Password
1. Go to Admin Panel → Users
2. Click "Reset Password" next to user
3. Enter new password
4. Confirm

### Delete User
1. Go to Admin Panel → Users
2. Click "Delete" next to user
3. Confirm deletion

**Note:** Users can view logs, admins can manage users, webhooks, and delete logs.

---

## 🛠️ Development

### Project Structure
```
.
├── docker-compose.yml          # Docker orchestration
├── Dockerfile                  # Application container
├── package.json                # Dependencies
├── reset.sh / reset.bat        # Reset scripts
├── src/
│   ├── index.ts               # Main entry point
│   ├── db/
│   │   ├── index.ts           # Database functions
│   │   └── schema.sql         # Database schema
│   ├── middleware/
│   │   └── auth.ts            # Authentication
│   ├── routes/
│   │   ├── auth.ts            # Auth endpoints
│   │   ├── logs.ts            # Log endpoints
│   │   ├── webhook.ts         # Webhook endpoints
│   │   └── admin.ts           # Admin endpoints
│   └── public/
│       ├── *.html             # Web pages
│       ├── css/style.css      # Styles
│       └── js/
│           ├── dashboard.js   # Dashboard logic
│           ├── admin.js       # Admin panel
│           ├── theme.js       # Dark mode
│           └── locale.js      # Translations
└── fivem-resource/            # FiveM integration
    ├── fxmanifest.lua
    ├── config.lua
    ├── server/server.lua
    ├── client/client.lua
    └── README.md
```

### Building
```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Run production server
bun run start

# Build Docker image
docker compose build
```

### Database Access
```bash
# Connect to MySQL (Docker)
docker exec -it fivem-logging-mysql mysql -u root -p fivem_logging

# Backup database
docker exec fivem-logging-mysql mysqldump -u root -p fivem_logging > backup.sql

# Restore database
docker exec -i fivem-logging-mysql mysql -u root -p fivem_logging < backup.sql
```

---

## 🐛 Troubleshooting

### Container won't start
```bash
docker compose logs
docker compose down
docker compose up -d --build
```

### Can't access web interface
- Check firewall settings
- Verify port 4000 is not in use: `docker ps`
- Check if app is running: `docker compose ps`

### Database connection errors
- Wait 10-15 seconds after starting (MySQL needs time)
- Check logs: `docker compose logs mysql`
- Verify credentials in `docker-compose.yml`

### Webhooks not working
- Verify URL is correct
- Check payload format matches examples
- View logs: `docker compose logs app`
- Test with curl (see examples above)

### Logs not appearing
- Check filters (clear all filters)
- Verify webhook sent successfully (200 response)
- Check database: `docker exec -it fivem-logging-mysql mysql -u root -p -e "SELECT COUNT(*) FROM fivem_logging.logs;"`

---

## 📝 API Documentation

### Authentication
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}

Response:
{
  "sessionId": "...",
  "username": "admin",
  "isAdmin": true
}
```

### Get Logs
```http
GET /api/logs?type=fivem&level=warn&resource=esx&search=player&limit=100
Authorization: Bearer {sessionId}

Response:
{
  "logs": [...]
}
```

### Delete Log (Admin)
```http
DELETE /api/logs/{id}
Authorization: Bearer {sessionId}

Response:
{
  "success": true
}
```

### Bulk Delete (Admin)
```http
POST /api/logs/delete-bulk
Authorization: Bearer {sessionId}
Content-Type: application/json

{
  "ids": [1, 2, 3]
}

Response:
{
  "success": true,
  "deletedCount": 3
}
```

---

## 🔒 Security

- ✅ Bcrypt password hashing (10 rounds)
- ✅ Session-based authentication
- ✅ Admin-only route protection
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (HTML escaping)
- ⚠️ **Change default MySQL password in production!**
- ⚠️ **Use HTTPS in production (reverse proxy)**

---

## 📄 License

Open source - modify as needed for your server.

---

## 🤝 Contributing

Contributions welcome! Fork, create feature branch, and submit PR.

---

## 📞 Support

- **Issues**: Open a GitHub issue
- **Docs**: See README and fivem-resource/README.md
- **Tests**: All features tested ✅

---

**Built with:** Bun • Fastify • MySQL • Docker • TypeScript

**Version:** 1.0.0
