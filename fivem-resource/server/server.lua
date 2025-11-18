-- Server-side logging functions

-- Internal function to send log to API
local function sendLogToAPI(level, message, metadata, screenshot)
    local resourceName = metadata.resource or GetCurrentResourceName()
    local url = Config.LoggerURL
    
    -- Check for custom path for this resource
    if Config.CustomPaths[resourceName] then
        url = Config.LoggerURL:gsub("/fivem$", "/" .. Config.CustomPaths[resourceName])
    end
    
    -- Add level to URL if specified
    if level and level ~= "info" then
        url = url .. "/" .. level
    end
    
    local payload = {
        level = level or Config.LoggerLevel,
        message = message,
        resource = resourceName,
        server = GetConvar("sv_hostname", "Unknown Server"),
        timestamp = os.date("%Y-%m-%dT%H:%M:%S"),
    }
    
    -- Merge metadata
    if metadata then
        for k, v in pairs(metadata) do
            payload[k] = v
        end
    end
    
    -- Add screenshot if provided
    if screenshot then
        payload.screenshot = screenshot
    end
    
    PerformHttpRequest(url, function(statusCode, response, headers)
        if statusCode ~= 200 then
            print(("^3[Logger] Failed to send log: %s - %s^7"):format(statusCode, response))
        end
    end, 'POST', json.encode(payload), {
        ['Content-Type'] = 'application/json'
    })
end

-- Public export: Log a message
---@param level string Log level (info, warn, error, debug)
---@param message string Log message
---@param metadata table Additional metadata
exports('log', function(level, message, metadata)
    sendLogToAPI(level, message, metadata or {})
end)

-- Public export: Log with screenshot
---@param level string Log level
---@param message string Log message
---@param metadata table Additional metadata
---@param source number Player source ID for screenshot
exports('logWithScreenshot', function(level, message, metadata, source)
    if not Config.EnableScreenshots then
        sendLogToAPI(level, message, metadata or {})
        return
    end
    
    if source then
        exports['screenshot-basic']:requestClientScreenshot(source, {
            fileName = 'screenshot.jpg',
            encoding = 'jpg',
            quality = 0.8
        }, function(err, data)
            if not err then
                -- Upload to Discord or include in metadata
                if Config.ScreenshotWebhook and Config.ScreenshotWebhook ~= "https://discord.com/api/webhooks/YOUR_WEBHOOK_HERE" then
                    -- Send screenshot to Discord
                    PerformHttpRequest(Config.ScreenshotWebhook, function() end, 'POST', json.encode({
                        content = message,
                        embeds = {{
                            title = "Screenshot",
                            image = { url = data }
                        }}
                    }), { ['Content-Type'] = 'application/json' })
                end
                
                local metadataWithScreenshot = metadata or {}
                metadataWithScreenshot.screenshot_url = data
                sendLogToAPI(level, message, metadataWithScreenshot, data)
            else
                sendLogToAPI(level, message, metadata or {})
            end
        end)
    else
        sendLogToAPI(level, message, metadata or {})
    end
end)

-- Event: Log from server
RegisterNetEvent('logger:server:log', function(level, message, metadata)
    local source = source
    local playerName = GetPlayerName(source)
    local identifiers = GetPlayerIdentifiers(source)
    
    local logMetadata = metadata or {}
    logMetadata.player = playerName
    logMetadata.identifiers = identifiers
    
    sendLogToAPI(level, message, logMetadata)
end)

-- Event: Log with screenshot from server
RegisterNetEvent('logger:server:logWithScreenshot', function(level, message, metadata)
    local source = source
    local playerName = GetPlayerName(source)
    local identifiers = GetPlayerIdentifiers(source)
    
    local logMetadata = metadata or {}
    logMetadata.player = playerName
    logMetadata.identifiers = identifiers
    
    exports['screenshot-basic']:requestClientScreenshot(source, {
        fileName = 'screenshot.jpg',
        encoding = 'jpg',
        quality = 0.8
    }, function(err, data)
        if not err then
            if Config.ScreenshotWebhook and Config.ScreenshotWebhook ~= "https://discord.com/api/webhooks/YOUR_WEBHOOK_HERE" then
                PerformHttpRequest(Config.ScreenshotWebhook, function() end, 'POST', json.encode({
                    content = message,
                    embeds = {{
                        title = "Screenshot - " .. playerName,
                        image = { url = data }
                    }}
                }), { ['Content-Type'] = 'application/json' })
            end
            
            logMetadata.screenshot_url = data
            sendLogToAPI(level, message, logMetadata, data)
        else
            sendLogToAPI(level, message, logMetadata)
        end
    end)
end)

-- Built-in event logging
if Config.LogPlayerJoin then
    AddEventHandler('playerConnecting', function(name, setKickReason, deferrals)
        local source = source
        local identifiers = GetPlayerIdentifiers(source)
        
        sendLogToAPI('info', 'Player connecting: ' .. name, {
            event = 'playerConnecting',
            player = name,
            identifiers = identifiers
        })
    end)
end

if Config.LogPlayerDrop then
    AddEventHandler('playerDropped', function(reason)
        local source = source
        local playerName = GetPlayerName(source)
        local identifiers = GetPlayerIdentifiers(source)
        
        sendLogToAPI('info', 'Player disconnected: ' .. playerName, {
            event = 'playerDropped',
            player = playerName,
            reason = reason,
            identifiers = identifiers
        })
    end)
end

if Config.LogResourceStart then
    AddEventHandler('onResourceStart', function(resourceName)
        sendLogToAPI('debug', 'Resource started: ' .. resourceName, {
            event = 'onResourceStart',
            resource = resourceName
        })
    end)
end

if Config.LogResourceStop then
    AddEventHandler('onResourceStop', function(resourceName)
        sendLogToAPI('debug', 'Resource stopped: ' .. resourceName, {
            event = 'onResourceStop',
            resource = resourceName
        })
    end)
end

-- Command example for testing
RegisterCommand('testlog', function(source, args, rawCommand)
    local level = args[1] or 'info'
    local message = table.concat(args, ' ', 2) or 'Test log message'
    
    if source == 0 then
        -- Console
        sendLogToAPI(level, message, { source = 'console' })
        print('^2[Logger] Test log sent^7')
    else
        -- Player
        local playerName = GetPlayerName(source)
        local identifiers = GetPlayerIdentifiers(source)
        
        sendLogToAPI(level, message, {
            player = playerName,
            identifiers = identifiers,
            source = 'command'
        })
        
        TriggerClientEvent('chat:addMessage', source, {
            args = {'[Logger]', 'Test log sent'}
        })
    end
end, false)

print('^2[Logger] Server-side loaded successfully^7')
