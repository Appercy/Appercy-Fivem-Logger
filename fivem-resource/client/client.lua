-- Client-side logging functions

-- Public export: Log from client
---@param level string Log level (info, warn, error, debug)
---@param message string Log message
---@param metadata table Additional metadata
exports('log', function(level, message, metadata)
    TriggerServerEvent('logger:server:log', level, message, metadata or {})
end)

-- Public export: Log with screenshot from client
---@param level string Log level
---@param message string Log message
---@param metadata table Additional metadata
exports('logWithScreenshot', function(level, message, metadata)
    TriggerServerEvent('logger:server:logWithScreenshot', level, message, metadata or {})
end)

-- Example: Log when player spawns
AddEventHandler('playerSpawned', function()
    -- Uncomment to log player spawns
    -- exports['logger']:log('debug', 'Player spawned', {
    --     event = 'playerSpawned'
    -- })
end)

-- Command to test screenshot logging
RegisterCommand('testscreenshot', function()
    exports['logger']:logWithScreenshot('info', 'Test screenshot log', {
        action = 'test_screenshot_command'
    })
    
    TriggerEvent('chat:addMessage', {
        args = {'[Logger]', 'Screenshot log sent'}
    })
end, false)

print('^2[Logger] Client-side loaded successfully^7')
