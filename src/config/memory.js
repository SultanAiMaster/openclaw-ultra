require('dotenv').config();
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');
const fs = require('fs');

class Memory {
  constructor() {
    this.db = null;
    this.type = process.env.MEMORY_TYPE || 'local';
    this.initialize();
  }

  async initialize() {
    if (this.type === 'redis') {
      await this.initRedis();
    } else {
      this.initLocal();
    }
  }

  initLocal() {
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const file = path.join(dataDir, 'memory.json');
    this.adapter = new JSONFile(file);
    this.db = new Low(this.adapter, { users: {} });
    
    // Read existing data
    try {
      this.db.read();
    } catch (e) {
      this.db.data = { users: {} };
    }
    
    console.log('✅ Local memory initialized');
  }

  async initRedis() {
    try {
      const Redis = require('ioredis');
      this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
      console.log('✅ Redis memory initialized');
    } catch (error) {
      console.log('⚠️ Redis connection failed, falling back to local');
      this.type = 'local';
      this.initLocal();
    }
  }

  async saveMessage(userId, userMessage, aiMessage) {
    if (this.type === 'redis') {
      return this.saveMessageRedis(userId, userMessage, aiMessage);
    }
    return this.saveMessageLocal(userId, userMessage, aiMessage);
  }

  async saveMessageLocal(userId, userMessage, aiMessage) {
    try {
      this.db.read();
      
      if (!this.db.data.users[userId]) {
        this.db.data.users[userId] = {
          messages: [],
          createdAt: new Date().toISOString()
        };
      }

      this.db.data.users[userId].messages.push({
        user: userMessage,
        ai: aiMessage,
        timestamp: new Date().toISOString()
      });

      // Keep last 100 messages per user
      if (this.db.data.users[userId].messages.length > 100) {
        this.db.data.users[userId].messages = 
          this.db.data.users[userId].messages.slice(-100);
      }

      await this.db.write();
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  async saveMessageRedis(userId, userMessage, aiMessage) {
    try {
      const key = `memory:${userId}`;
      const message = JSON.stringify({
        user: userMessage,
        ai: aiMessage,
        timestamp: new Date().toISOString()
      });
      
      await this.redis.rpush(key, message);
      await this.redis.ltrim(key, -100, -1); // Keep last 100
    } catch (error) {
      console.error('Redis save error:', error);
    }
  }

  async getHistory(userId, limit = 50) {
    if (this.type === 'redis') {
      return this.getHistoryRedis(userId, limit);
    }
    return this.getHistoryLocal(userId, limit);
  }

  getHistoryLocal(userId, limit = 50) {
    try {
      this.db.read();
      const user = this.db.data.users[userId];
      if (!user || !user.messages) return [];
      return user.messages.slice(-limit);
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  }

  async getHistoryRedis(userId, limit = 50) {
    try {
      const key = `memory:${userId}`;
      const messages = await this.redis.lrange(key, -limit, -1);
      return messages.map(m => JSON.parse(m));
    } catch (error) {
      console.error('Redis get error:', error);
      return [];
    }
  }

  async clearHistory(userId) {
    if (this.type === 'redis') {
      await this.redis.del(`memory:${userId}`);
    } else {
      try {
        this.db.read();
        if (this.db.data.users[userId]) {
          this.db.data.users[userId].messages = [];
          await this.db.write();
        }
      } catch (error) {
        console.error('Error clearing history:', error);
      }
    }
  }

  async getStats(userId) {
    const history = await this.getHistory(userId, 1000);
    return {
      totalMessages: history.length,
      userId,
      oldestMessage: history[0]?.timestamp,
      newestMessage: history[history.length - 1]?.timestamp
    };
  }
}

module.exports = new Memory();
