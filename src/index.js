require('dotenv').config();

console.log(`
╔═══════════════════════════════════════════════════════════╗
║         🤖 OpenClaw Ultra - AI Engine Starting...         ║
╚═══════════════════════════════════════════════════════════╝
`);

// Start web server
const { app, server, io } = require('./web/backend/server');

// Start Telegram bot
const telegramBot = require('./telegram/bot');

console.log(`
🎉 OpenClaw Ultra is running!

🌐 Web Interface: http://localhost:${process.env.PORT || 3000}
💬 Telegram: Send /start to your bot

📝 Available commands:
   /start   - Welcome message
   /chat    - Chat with AI
   /agent   - Run autonomous agent
   /research - Research topic
   /code    - Generate code
   /automation - Create automation
   /history - View chat history
   /clear   - Clear history

⚙️  Press Ctrl+C to stop
`);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
