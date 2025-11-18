# FiveM Logging System - Quick Start Guide

Complete step-by-step guide to get your logging system up and running in minutes.

## Table of Contents
1. [Installation](#installation)
2. [First-Time Setup](#first-time-setup)
3. [FiveM Resource Integration](#fivem-resource-integration)
4. [Discord Webhook Configuration](#discord-webhook-configuration)
5. [Using the Dashboard](#using-the-dashboard)
6. [Admin Panel Guide](#admin-panel-guide)
7. [Troubleshooting](#troubleshooting)

---

## Installation

### Prerequisites
- **Docker** and **Docker Compose** installed
- **Port 4000** available on your system
- Internet connection for downloading dependencies

### Step 1: Get the Code

```bash
# Clone the repository
git clone <repository-url>
cd fivem-logging-copilot-add-webapp-with-logging

# Or if you already have it, just navigate to the directory
cd fivem-logging-copilot-add-webapp-with-logging
```

### Step 2: Start the System

```bash
# Start all containers
docker compose up -d

# Wait 30-60 seconds for MySQL to initialize
# You can watch the logs to see when it's ready
docker compose logs -f
```

You should see:
```
app-1    | Server listening on port 4000
mysql-1  | [Server] /usr/sbin/mysqld: ready for connections.
```

Press `Ctrl+C` to exit the logs view.

### Step 3: Verify Installation

```bash
# Check that both containers are running
docker compose ps

# You should see both 'app' and 'mysql' with status 'Up'
```

---

## First-Time Setup

### Step 1: Create Admin Account

1. Open your browser and go to: **http://localhost:4000/setup.html**

2. Fill in the form:
   - **Username**: Choose your admin username (e.g., `admin`)
   - **Password**: Choose a strong password (minimum 8 characters)

3. Click **"Create Account"**

4. You'll be automatically redirected to the login page

### Step 2: Login

1. On the login page at **http://localhost:4000/login.html**:
   - Enter your username
   - Enter your password
   - Click **"Login"**

2. You'll be redirected to the dashboard

### Step 3: Explore the Dashboard

You should now see:
- **Header**: Username, Admin Panel button, Logout button
- **Filters**: Type, level, resource, search, date range
- **Logs table**: Currently empty
- **Theme toggle**: 🌙 for dark mode
- **Language selector**: English/Deutsch

---

## FiveM Resource Integration

### Method 1: Using the Generated Resource

The system can generate a ready-to-use FiveM resource for you!

1. **Open Admin Panel**
   - Click **"Admin Panel"** button in dashboard header

2. **Navigate to Webhooks Tab**
   - Click on **"Webhooks"** tab

3. **Generate FiveM Resource**
   - Click **"Generate FiveM Resource"** button
   - A `fivem-logging.zip` file will download

4. **Install in Your FiveM Server**
   ```bash
   # Extract the zip file to your resources folder
   cd /path/to/your/fivem/server/resources
   unzip fivem-logging.zip
   
   # Add to server.cfg
   ensure fivem-logging
   
   # Restart your server
   ```

5. **Configure the Resource**
   - Edit `resources/fivem-logging/config.lua`
   - Set your webhook URL (found in Admin Panel)
   ```lua
   Config.WebhookURL = "http://your-server:4000/api/webhook/fivem"
   ```

### Method 2: Manual Integration

Add logging to any existing resource:

```lua
-- In your resource's server-side code

local WEBHOOK_URL = "http://localhost:4000/api/webhook/fivem"

function SendLog(level, message, metadata)
    PerformHttpRequest(WEBHOOK_URL, function(err, text, headers)
        -- Optional: Handle response
    end, 'POST', json.encode({
        level = level,
        message = message,
        resource = GetCurrentResourceName(),
        metadata = metadata or {}
    }), {
        ['Content-Type'] = 'application/json'
    })
end

-- Usage examples:
SendLog("info", "Player connected", {
    player = GetPlayerName(source),
    identifier = GetPlayerIdentifier(source)
})

SendLog("warn", "Suspicious activity detected", {
    player = GetPlayerName(source),
    action = "tried to spawn vehicle",
    vehicle = "adder"
})

SendLog("error", "Database query failed", {
    query = "SELECT * FROM users",
    error = "Connection timeout"
})
```

### Test Your Integration

1. Trigger a log from your FiveM server
2. Refresh the dashboard
3. You should see your log appear!

---

## Discord Webhook Configuration

### Step 1: Add a Webhook in Admin Panel

1. **Open Admin Panel** → **Webhooks Tab**

2. **Click "Add Webhook"**

3. **Fill in the form**:
   - **Name**: `Discord Alerts` (or any name you prefer)
   - **Type**: `discord`
   - **URL**: Your Discord webhook URL (see below)
   - **Description**: `Critical server alerts`

4. **Click "Save"**

### Step 2: Get Your Webhook URL

The system provides webhook endpoints at:
- `http://your-server:4000/api/webhook/discord` - Default Discord endpoint
- `http://your-server:4000/api/webhook/fivem` - Default FiveM endpoint
- `http://your-server:4000/api/webhook/custom-name` - Custom paths

### Step 3: Send Logs from Discord

You can send logs to your system from Discord or any service by posting to the webhook endpoint:

```bash
curl -X POST http://localhost:4000/api/webhook/discord \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Server is starting up",
    "embeds": [{
      "title": "Server Status",
      "description": "FiveM server is online",
      "color": 3066993,
      "fields": [
        {"name": "Players", "value": "0/32", "inline": true},
        {"name": "Uptime", "value": "Just started", "inline": true}
      ]
    }],
    "attachments": [{
      "url": "https://i.imgur.com/example.png",
      "content_type": "image/png",
      "filename": "screenshot.png"
    }]
  }'
```

### Step 4: Test with Images/Videos

```bash
curl -X POST http://localhost:4000/api/webhook/discord \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Player screenshot",
    "attachments": [{
      "url": "https://cdn.discordapp.com/attachments/xxx/yyy/image.png",
      "content_type": "image/png",
      "filename": "player-screenshot.png"
    }]
  }'
```

The system will:
- ✅ Download the image to local storage
- ✅ Display it inline on the dashboard
- ✅ Keep the original URL accessible
- ✅ Prevent broken links if Discord message is deleted

---

## Using the Dashboard

### Viewing Logs

**Dashboard URL**: http://localhost:4000/dashboard.html

#### Basic Features
- **Refresh**: Click "Refresh" button to reload logs
- **Theme**: Click 🌙 to toggle dark mode
- **Language**: Select English or Deutsch from dropdown

#### Filtering Logs

1. **By Type**:
   - Select `discord` or `fivem` from Type dropdown
   - Or leave as "All" to see everything

2. **By Level**:
   - Enter level in text field: `info`, `warn`, `error`, `debug`
   - Multiple levels: `info,warn` (comma-separated)

3. **By Resource** (FiveM logs):
   - Enter resource name: `esx_policejob`, `qb-core`, etc.

4. **By Search**:
   - Searches in message and metadata
   - Example: `player`, `vehicle`, `money`

5. **By Date Range**:
   - Click Start Date calendar icon
   - Click End Date calendar icon
   - Select date and time

6. **Apply Filters**:
   - Click **"Apply Filters"** button
   - Logs will update automatically

7. **Clear Filters**:
   - Click **"Clear"** button to reset all filters

#### Viewing Media

**Images**: 
- Displayed as thumbnails
- Click to open full size in new tab
- Hover for zoom effect

**Videos**:
- HTML5 video player with controls
- Play/pause, volume, fullscreen
- Multiple format support

**URLs**:
- Click "Show URL" to reveal original Discord URL
- Click again to hide

#### Viewing Metadata

- Click **"View"** button next to any log
- Formatted JSON viewer appears
- Click **"Hide"** to close

#### Deleting Logs (Admin Only)

**Single Delete**:
- Click the ❌ button on any log row
- Confirm deletion

**Bulk Delete**:
1. Check the checkbox on logs you want to delete
2. Click **"Delete Selected"** button (appears when logs are selected)
3. Confirm deletion

---

## Admin Panel Guide

**Access**: Click **"Admin Panel"** button in dashboard header

### User Management Tab

#### View Users
- See all registered users
- View role (Admin/User)
- See creation date

#### Add New User
1. Click **"Add User"** button
2. Enter username
3. Enter password (min 8 characters)
4. Select role: Admin or User
5. Click **"Create User"**

#### Reset Password
1. Click **"Reset Password"** button next to user
2. Enter new password
3. Click **"Reset Password"**

#### Delete User
1. Click **"Delete"** button next to user
2. Confirm deletion
3. User and their sessions are removed

### Webhooks Tab

#### View Webhooks
- See all configured webhooks
- Status: Active/Inactive
- View URLs and descriptions

#### Add Webhook
1. Click **"Add Webhook"**
2. Fill in details:
   - **Name**: Friendly name
   - **Type**: discord, fivem, or custom
   - **URL**: Full webhook URL
   - **Description**: Purpose of webhook
3. Click **"Save"**

#### Edit Webhook
1. Click **"Edit"** button
2. Update any fields
3. Click **"Save"**

#### Enable/Disable Webhook
- Click **"Enable"** to activate
- Click **"Disable"** to deactivate
- Disabled webhooks are not processed

#### Delete Webhook
1. Click **"Delete"** button
2. Confirm deletion

#### Generate FiveM Resource
1. Click **"Generate FiveM Resource"**
2. Download the ZIP file
3. Extract to your FiveM resources folder
4. Add `ensure fivem-logging` to server.cfg

---

## Troubleshooting

### Can't Access http://localhost:4000

**Check if containers are running:**
```bash
docker compose ps
```

**Restart containers:**
```bash
docker compose restart
```

**Check logs for errors:**
```bash
docker compose logs -f
```

**Port already in use:**
```bash
# Find what's using port 4000
lsof -i :4000

# Change port in docker-compose.yml if needed
```

### Database Connection Errors

**Wait for MySQL to fully start:**
```bash
# Watch logs until you see "ready for connections"
docker compose logs -f mysql
```

**Reset database:**
```bash
docker compose down -v
docker compose up -d
```

### Setup Page Shows "Error"

**Common causes:**
1. Admin account already exists → Use login page
2. Database not ready → Wait 60 seconds and retry
3. Password too short → Use 8+ characters

**Check logs:**
```bash
docker compose logs app
```

### Logs Not Appearing

**Check webhook URL:**
- Ensure it's reachable from FiveM server
- Use IP address instead of localhost if on different machines

**Test webhook manually:**
```bash
curl -X POST http://localhost:4000/api/webhook/fivem \
  -H "Content-Type: application/json" \
  -d '{"level":"info","message":"Test log","resource":"test"}'
```

**Check dashboard filters:**
- Clear all filters
- Refresh the page

### Media Not Displaying

**Check uploads directory:**
```bash
ls -la src/public/uploads/
```

**Check permissions:**
```bash
chmod 755 src/public/uploads/
```

**View browser console:**
- Open developer tools (F12)
- Check Console tab for errors

**Rebuild containers:**
```bash
docker compose down
docker compose up -d --build
```

### Translations Not Working

**Check language selector:**
- Select language from dropdown
- Page should reload automatically

**Clear browser cache:**
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

**Check HTML elements:**
- Elements need `data-i18n` attribute to be translated

**Verify locale.js loaded:**
- Open developer tools (F12)
- Check Network tab for locale.js

### Dark Mode Not Persisting

**Check localStorage:**
- Open developer tools (F12)
- Go to Application → Local Storage
- Should see `theme` key

**Clear browser data and retry:**
- Settings → Clear browsing data
- Reload page

### Admin Panel Not Showing

**Verify admin status:**
```bash
# Check database
docker exec -it fivem-logging-mysql mysql -u root -ppassword fivem_logging -e "SELECT username, is_admin FROM users;"
```

**Make user admin:**
```bash
docker exec -it fivem-logging-mysql mysql -u root -ppassword fivem_logging -e "UPDATE users SET is_admin = 1 WHERE username = 'yourusername';"
```

**Clear session and re-login:**
- Click Logout
- Login again

---

## Advanced Configuration

### Change Default Port

Edit `docker-compose.yml`:
```yaml
services:
  app:
    ports:
      - "8080:4000"  # Change 8080 to your desired port
```

Then restart:
```bash
docker compose down
docker compose up -d
```

### Change Database Credentials

Edit `docker-compose.yml`:
```yaml
services:
  mysql:
    environment:
      MYSQL_ROOT_PASSWORD: your_secure_password
      MYSQL_DATABASE: fivem_logging
  app:
    environment:
      DB_PASSWORD: your_secure_password
```

Restart with fresh database:
```bash
docker compose down -v
docker compose up -d
```

### Backup Database

**Export:**
```bash
docker exec fivem-logging-mysql mysqldump -u root -ppassword fivem_logging > backup_$(date +%Y%m%d).sql
```

**Import:**
```bash
docker exec -i fivem-logging-mysql mysql -u root -ppassword fivem_logging < backup_20250118.sql
```

### Clean Up Old Logs

**Delete logs older than 30 days:**
```bash
docker exec -i fivem-logging-mysql mysql -u root -ppassword fivem_logging << 'EOF'
DELETE FROM logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL 30 DAY);
EOF
```

**Delete all logs:**
```bash
docker exec -i fivem-logging-mysql mysql -u root -ppassword fivem_logging -e "TRUNCATE TABLE logs;"
```

### Clean Up Media Files

**Delete old media (files older than 30 days):**
```bash
find src/public/uploads/ -type f -mtime +30 -delete
```

### View Container Stats

```bash
docker stats fivem-logging-app fivem-logging-mysql
```

---

## Best Practices

### Security
1. **Change default passwords** in docker-compose.yml
2. **Use strong admin passwords** (16+ characters)
3. **Don't expose MySQL port** externally
4. **Use HTTPS** in production with reverse proxy
5. **Keep webhook URLs private**

### Performance
1. **Regular database backups** (daily recommended)
2. **Clean old logs** monthly (30-90 days retention)
3. **Monitor disk space** for uploads directory
4. **Limit webhook payload size** to prevent abuse

### Maintenance
1. **Update Docker images** regularly
2. **Monitor container logs** for errors
3. **Test backups** periodically
4. **Document custom configurations**

### FiveM Integration
1. **Use consistent resource names** for better filtering
2. **Include meaningful metadata** in logs
3. **Use appropriate log levels** (info, warn, error)
4. **Don't log sensitive data** (passwords, tokens)

---

## Quick Reference Commands

```bash
# Start system
docker compose up -d

# Stop system
docker compose down

# View logs
docker compose logs -f

# Restart
docker compose restart

# Rebuild
docker compose up -d --build

# Complete reset
docker compose down -v && docker compose up -d

# Backup database
docker exec fivem-logging-mysql mysqldump -u root -ppassword fivem_logging > backup.sql

# Check status
docker compose ps

# Access MySQL
docker exec -it fivem-logging-mysql mysql -u root -ppassword fivem_logging
```

---

## Support

For additional help:
1. Check the main [README.md](README.md)
2. Review Docker logs for error messages
3. Verify all prerequisites are met
4. Check the troubleshooting section above

---

**Happy Logging! 🎉**

If you found this helpful, consider starring the repository!
