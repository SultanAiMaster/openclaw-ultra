require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const aiEngine = require('../ai-engine/engine');
const memory = require('../config/memory');

class TelegramBotService {
  constructor() {
    this.bot = null;
    this.adminId = process.env.ADMIN_USER_ID;
    this.initialize();
  }

  initialize() {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.log('⚠️ TELEGRAM_BOT_TOKEN not set - Telegram bot disabled');
      return;
    }

    try {
      this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
      console.log('✅ Telegram bot initialized');
      this.setupCommands();
      this.setupCallbacks();
    } catch (error) {
      console.error('Telegram bot error:', error);
    }
  }

  setupCommands() {
    const commands = [
      { command: 'start', description: 'Welcome message & help' },
      { command: 'chat', description: 'Start AI chat mode' },
      { command: 'agent', description: 'Run autonomous agent task' },
      { command: 'research', description: 'Research any topic' },
      { command: 'code', description: 'Generate code (add language)' },
      { command: 'automation', description: 'Create automation plan' },
      { command: 'history', description: 'View chat history' },
      { command: 'clear', description: 'Clear your chat history' },
      { command: 'stats', description: 'View your usage stats' }
    ];

    this.bot.setMyCommands(commands).then(() => {
      console.log('✅ Commands registered');
    });

    // Command handlers
    this.bot.onText(/\/start/, (msg) => this.cmdStart(msg));
    this.bot.onText(/\/chat(.+)?/, (msg, match) => this.cmdChat(msg, match));
    this.bot.onText(/\/agent(.+)?/, (msg, match) => this.cmdAgent(msg, match));
    this.bot.onText(/\/research(.+)?/, (msg, match) => this.cmdResearch(msg, match));
    this.bot.onText(/\/code(.+)?/, (msg, match) => this.cmdCode(msg, match));
    this.bot.onText(/\/automation(.+)?/, (msg, match) => this.cmdAutomation(msg, match));
    this.bot.onText(/\/history/, (msg) => this.cmdHistory(msg));
    this.bot.onText(/\/clear/, (msg) => this.cmdClear(msg));
    this.bot.onText(/\/stats/, (msg) => this.cmdStats(msg));
    
    // Handle regular messages (chat mode)
    this.bot.on('message', (msg) => {
      if (!msg.text || msg.text.startsWith('/')) return;
      this.handleChat(msg);
    });
  }

  setupCallbacks() {
    this.bot.on('callback_query', async (query) => {
      const { data, message } = query;
      
      if (data === 'clear_confirm') {
        await memory.clearHistory(query.from.id);
        this.bot.answerCallbackQuery(query.id, { text: 'History cleared! ✅' });
        this.bot.editMessageText('🗑️ Chat history cleared!', {
          chat_id: message.chat.id,
          message_id: message.message_id
        });
      }
      
      this.bot.answerCallbackQuery(query.id);
    });
  }

  async cmdStart(msg) {
    const chatId = msg.chat.id;
    const user = msg.from;
    
    const welcome = `🤖 *OpenClaw Ultra*

*Welcome ${user.first_name}!*

I'm your AI assistant powered by Groq. Here's what I can do:

/chat \`message\` - Chat with AI
/agent \`task\` - Run autonomous agent
/research \`topic\` - Research any topic
/code \`task\` - Generate code
/automation \`task\` - Create automation plan
/history - View chat history
/clear - Clear chat history
/stats - View your stats

*Boundary-free AI* - I can help with almost anything! 🚀
`;

    this.bot.sendMessage(chatId, welcome, { parse_mode: 'Markdown' });
  }

  async cmdChat(msg, match) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const query = match[1]?.trim() || 'Hello!';
    
    await this.bot.sendMessage(chatId, '🤔 Thinking...');
    
    const response = await aiEngine.processMessage(query, { 
      userId: userId.toString(),
      context: 'telegram'
    });
    
    await memory.saveMessage(userId, query, response.content);
    
    this.bot.sendMessage(chatId, response.content || response.error, { 
      parse_mode: 'Markdown' 
    });
  }

  async cmdAgent(msg, match) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const task = match[1]?.trim();
    
    if (!task) {
      this.bot.sendMessage(chatId, '❌ Please provide a task!\nExample: /agent Create a Python script to backup my files');
      return;
    }
    
    await this.bot.sendMessage(chatId, '🕵️ Agent task accepted...\nThis may take a moment.');
    
    const response = await aiEngine.runAgent(task, userId.toString());
    
    this.bot.sendMessage(chatId, response.content || response.error, { 
      parse_mode: 'Markdown' 
    });
  }

  async cmdResearch(msg, match) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const query = match[1]?.trim();
    
    if (!query) {
      this.bot.sendMessage(chatId, '❌ Please provide a topic!\nExample: /research Quantum computing basics');
      return;
    }
    
    await this.bot.sendMessage(chatId, '🔍 Researching...');
    
    const response = await aiEngine.research(query);
    
    this.bot.sendMessage(chatId, response.content || response.error, { 
      parse_mode: 'Markdown' 
    });
  }

  async cmdCode(msg, match) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const input = match[1]?.trim();
    
    if (!input) {
      this.bot.sendMessage(chatId, '❌ Please provide a coding task!\nExample: /code Python: Create a REST API');
      return;
    }
    
    // Parse language if specified (e.g., "/code python: create a function")
    let language = 'javascript';
    let task = input;
    
    const langMatch = input.match(/^(\w+):\s*/);
    if (langMatch) {
      language = langMatch[1].toLowerCase();
      task = input.slice(langMatch[0].length);
    }
    
    await this.bot.sendMessage(chatId, '💻 Generating code...');
    
    const response = await aiEngine.code(task, language);
    
    this.bot.sendMessage(chatId, `*${language.toUpperCase()} Code:*\n\n\`\`\`${language}\n${response.content || response.error}\n\`\`\``, { 
      parse_mode: 'Markdown' 
    });
  }

  async cmdAutomation(msg, match) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const task = match[1]?.trim();
    
    if (!task) {
      this.bot.sendMessage(chatId, '❌ Please provide an automation task!\nExample: /automation Sync files between folders daily');
      return;
    }
    
    await this.bot.sendMessage(chatId, '⚙️ Creating automation plan...');
    
    const response = await aiEngine.automation(task);
    
    this.bot.sendMessage(chatId, response.content || response.error, { 
      parse_mode: 'Markdown' 
    });
  }

  async cmdHistory(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    const history = await memory.getHistory(userId.toString());
    
    if (!history || history.length === 0) {
      this.bot.sendMessage(chatId, '📝 No chat history yet!');
      return;
    }
    
    const recent = history.slice(-5).map((m, i) => 
      `${i + 1}. *You:* ${m.user}\n*AI:* ${m.ai.substring(0, 100)}...`
    ).join('\n\n');
    
    this.bot.sendMessage(chatId, `📝 *Recent History:*\n\n${recent}`, { 
      parse_mode: 'Markdown' 
    });
  }

  async cmdClear(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: '✅ Yes, clear', callback_data: 'clear_confirm' },
          { text: '❌ No, cancel', callback_data: 'clear_cancel' }
        ]
      ]
    };
    
    this.bot.sendMessage(chatId, '🗑️ Clear all chat history?', {
      reply_markup: keyboard
    });
  }

  async cmdStats(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    const history = await memory.getHistory(userId.toString());
    
    this.bot.sendMessage(chatId, `📊 *Your Stats:*

• Total messages: ${history.length}
• User: ${msg.from.first_name}
• Mode: Boundary-free AI 🤖`, { 
      parse_mode: 'Markdown' 
    });
  }

  async handleChat(msg) {
    if (!msg.text || msg.text.startsWith('/')) return;
    
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    await this.bot.sendMessage(chatId, '🤔 Thinking...');
    
    const response = await aiEngine.processMessage(msg.text, { 
      userId: userId.toString(),
      context: 'telegram chat'
    });
    
    await memory.saveMessage(userId, msg.text, response.content);
    
    this.bot.sendMessage(chatId, response.content || response.error, { 
      parse_mode: 'Markdown' 
    });
  }

  // Admin functions
  isAdmin(userId) {
    return this.adminId && userId.toString() === this.adminId.toString();
  }

  async broadcast(message) {
    // Implement broadcast to all users if needed
    console.log('Broadcast:', message);
  }
}

module.exports = new TelegramBotService();
