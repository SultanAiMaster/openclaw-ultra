require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const aiEngine = require('../../ai-engine/engine');
const memory = require('../../config/memory');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId, context } = req.body;
    const response = await aiEngine.processMessage(message, { userId, context });
    
    // Save to memory
    await memory.saveMessage(userId, message, response);
    
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/agent', async (req, res) => {
  try {
    const { task, userId } = req.body;
    const result = await aiEngine.runAgent(task, userId);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/memory/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await memory.getHistory(userId);
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/memory/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await memory.clearHistory(userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Socket.IO for real-time
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('chat', async (data) => {
    const response = await aiEngine.processMessage(data.message, { 
      userId: data.userId 
    });
    socket.emit('response', response);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Web server running on port ${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT} to access the chat UI`);
});

module.exports = { app, server, io };
