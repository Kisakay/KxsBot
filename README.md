# KxsBot

## Overview
KxsBot is a simple Discord bot built with the Bun runtime environment that connects the KxsNetwork (KxsClient) to the survev.io game. It serves as a bridge between Discord users and the survev.io game environment through the KxsNetwork protocol. The bot is extremely lightweight, running on only 7 megabytes of RAM, making it highly efficient and resource-friendly.

## Features
- Real-time connection to KxsNetwork for survev.io game integration
- Discord command interface for game-related operations
- Player count tracking and game status monitoring
- Automatic reconnection handling with the KxsNetwork

## Technical Stack
- **Runtime**: Bun
- **Framework**: Discord.js
- **Database**: SQLite
- **Network Protocol**: WebSocket for KxsNetwork communication

## Setup
1. Clone the repository
2. Copy `config.example.json` to `config.json` and fill in your Discord token and KxsNetwork URL
3. Install dependencies with `bun install`
4. Start the bot with `bun run src/index.ts`

## Configuration
The bot requires the following configuration in the `config.json` file:
- `DISCORD_TOKEN`: Your Discord bot token
- `KXS_NETWORK_URL`: The WebSocket URL for the KxsNetwork

## License
See the LICENSE file for details.
