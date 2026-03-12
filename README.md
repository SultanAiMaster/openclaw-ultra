# OpenClaw Ultra - AI Engine

Self-hosted AI system with Groq + Telegram + Web Interface

## Features

- 🤖 **AI Engine** - Groq-powered reasoning with OpenClaw orchestration
- 💬 **Telegram Bot** - Chat, /agent, /research, /code, /automation commands
- 🌐 **Web Interface** - Next.js chat UI
- 🧠 **Memory** - Local JSON/Redis memory store
- 🔒 **Security** - .env based config, admin auth

## Quick Start

```bash
# 1. Clone & install
git clone https://github.com/SultanAiMaster/openclaw-ultra.git
cd openclaw-ultra
npm install

# 2. Configure environment
cp env/example.env .env
# Edit .env with your keys

# 3. Start services
npm run setup    # Auto-setup
npm run dev      # Start all services
```

## Environment Variables

```env
# Required
GROQ_API_KEY=your_groq_api_key
TELEGRAM_BOT_TOKEN=your_telegram_token
ADMIN_USER_ID=your_telegram_id

# Optional
PORT=3000
MEMORY_TYPE=local  # local or redis
REDIS_URL=redis://localhost:6379
```

## Commands

### Telegram Bot
- `/start` - Welcome message
- `/chat` - Start AI chat
- `/agent` - Run autonomous agent
- `/research` - Research task
- `/code` - Code generation
- `/automation` - Automation tasks

### Web Interface
- Chat with AI
- Agent task execution
- Memory management
- History logs

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Telegram   │────▶│  AI Engine   │────▶│   Groq API  │
│     Bot     │     │  (Node.js)   │     │   (LLM)     │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
              ┌──────────┐  ┌──────────┐
              │  Web UI  │  │  Memory  │
              │ (Next.js)│  │  Store   │
              └──────────┘  └──────────┘
```

## Deployment

Deploy on free servers:
- Railway.app
- Render.com
- Fly.io
- Replit
- VPS with PM2

## License

MIT
