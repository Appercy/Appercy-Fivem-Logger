fx_version 'cerulean'
game 'gta5'

name 'logger'
description 'FiveM Logging Resource - Send logs to centralized logging server'
author 'Your Name'
version '1.0.0'

shared_scripts {
    'config.lua'
}

server_scripts {
    'server/server.lua'
}

client_scripts {
    'client/client.lua'
}
