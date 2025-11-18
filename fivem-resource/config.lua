Config = {}

-- Logger API Configuration
Config.LoggerURL = "http://localhost:4000/api/webhook/custom/fivem" -- Change this to your logging server URL
Config.LoggerLevel = "info" -- Default level: info, warn, error, debug

-- Resource-specific logging paths (optional)
-- You can set custom paths per resource, e.g., /api/webhook/custom/esx
Config.CustomPaths = {
    -- ["es_extended"] = "esx",
    -- ["qb-core"] = "qbcore",
}

-- Screenshot settings
Config.EnableScreenshots = true
Config.ScreenshotWebhook = "https://discord.com/api/webhooks/YOUR_WEBHOOK_HERE" -- Optional: Discord webhook for screenshots

-- What to log
Config.LogPlayerJoin = true
Config.LogPlayerDrop = true
Config.LogChatMessages = false -- Be careful with privacy
Config.LogResourceStart = false
Config.LogResourceStop = false
