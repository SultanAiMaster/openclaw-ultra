require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🚀 OpenClaw Ultra Setup\n');

// Check required env vars
const required = ['GROQ_API_KEY', 'TELEGRAM_BOT_TOKEN'];
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.log('⚠️  Missing required environment variables:');
  missing.forEach(key => console.log(`   - ${key}`));
  console.log('\n📝 Please copy env/example.env to .env and fill in your values\n');
}

// Create data directory
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created data directory');
}

// Create .env from example if not exists
const envPath = path.join(__dirname, '../.env');
const envExamplePath = path.join(__dirname, '../env/example.env');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ Created .env from example');
  console.log('📝 Please edit .env and add your API keys\n');
}

// Create uploads directory
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

console.log('✅ Setup complete!');
console.log('\n📖 Next steps:');
console.log('1. Edit .env with your GROQ_API_KEY and TELEGRAM_BOT_TOKEN');
console.log('2. Run: npm run dev');
console.log('3. Start chatting on Telegram or visit http://localhost:3000\n');
