# FiveM Logger Resource

A comprehensive logging resource for FiveM servers that sends logs to a centralized logging server with support for screenshots and custom log levels.

## Features

- 🚀 Easy integration with any FiveM resource
- 📸 Screenshot support (requires `screenshot-basic`)
- 🎯 Custom log levels (info, warn, error, debug)
- 🔧 Configurable logging endpoints
- 📊 Client and Server-side logging
- 🎨 Custom webhook paths per resource
- 🌐 Automatic player identification

## Installation

1. Download and place the `logger` folder in your `resources` directory
2. Add `ensure logger` to your `server.cfg`
3. Configure `config.lua` with your logging server URL
4. (Optional) Install `screenshot-basic` for screenshot support

## Configuration

Edit `config.lua`:

```lua
Config.LoggerURL = "http://your-server:4000/api/webhook/custom/fivem"
Config.LoggerLevel = "info"
Config.EnableScreenshots = true
```

## Usage

### Server-Side Examples

```lua
-- Simple log
exports['logger']:log('info', 'Player purchased item', {
    item = 'bread',
    price = 10
})

-- Log with screenshot
exports['logger']:logWithScreenshot('warn', 'Suspicious activity detected', {
    player = playerName,
    action = 'speed_hack'
}, playerId)

-- From event
TriggerEvent('logger:server:log', 'error', 'Database connection failed', {
    error = err
})
```

### Client-Side Examples

```lua
-- Simple log from client
exports['logger']:log('info', 'Player entered zone', {
    zone = 'airport'
})

-- Log with screenshot from client
exports['logger']:logWithScreenshot('warn', 'Player in restricted area', {
    coords = GetEntityCoords(PlayerPedId())
})
```

### ESX/QB-Core Integration Examples

#### ESX Example
```lua
-- In es_extended or your custom resource
RegisterNetEvent('esx:playerLoaded')
AddEventHandler('esx:playerLoaded', function(xPlayer)
    exports['logger']:log('info', 'Player loaded into ESX', {
        identifier = xPlayer.identifier,
        job = xPlayer.job.name,
        money = xPlayer.getMoney()
    })
end)

-- Log item purchases
RegisterServerEvent('esx_shops:buyItem')
AddEventHandler('esx_shops:buyItem', function(itemName, price)
    local xPlayer = ESX.GetPlayerFromId(source)
    exports['logger']:log('info', 'Item purchased', {
        player = xPlayer.getName(),
        identifier = xPlayer.identifier,
        item = itemName,
        price = price
    })
end)
```

#### QB-Core Example
```lua
-- In qb-core or your custom resource
RegisterNetEvent('QBCore:Server:PlayerLoaded')
AddEventHandler('QBCore:Server:PlayerLoaded', function(Player)
    exports['logger']:log('info', 'Player loaded into QB-Core', {
        identifier = Player.PlayerData.citizenid,
        job = Player.PlayerData.job.name,
        cash = Player.PlayerData.money.cash
    })
end)

-- Log vehicle purchases
RegisterNetEvent('qb-vehicleshop:server:buyVehicle')
AddEventHandler('qb-vehicleshop:server:buyVehicle', function(vehicle, price)
    local Player = QBCore.Functions.GetPlayer(source)
    exports['logger']:log('info', 'Vehicle purchased', {
        player = Player.PlayerData.name,
        identifier = Player.PlayerData.citizenid,
        vehicle = vehicle,
        price = price
    })
end)
```

## Custom Log Levels in URL

You can specify the log level in the URL:

```lua
-- Will send to: /api/webhook/custom/esx/warn
exports['logger']:log('warn', 'Low stock warning', {...})
```

## Commands

- `/testlog [level] [message]` - Send a test log (server)
- `/testscreenshot` - Send a test log with screenshot (client)

## API Endpoints

The resource sends logs to:
- Default: `http://your-server:4000/api/webhook/custom/fivem`
- With level: `http://your-server:4000/api/webhook/custom/fivem/warn`
- Custom path: `http://your-server:4000/api/webhook/custom/esx`

## Payload Format

```json
{
  "level": "info",
  "message": "Player action",
  "resource": "es_extended",
  "server": "My FiveM Server",
  "timestamp": "2024-01-01T12:00:00",
  "player": "John Doe",
  "identifiers": ["steam:xxx", "license:yyy"],
  "screenshot_url": "data:image/jpeg;base64,..."
}
```

## Dependencies

- None (required)
- `screenshot-basic` (optional, for screenshot support)

## License

Open source - modify as needed for your server.
