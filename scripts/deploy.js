require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 OpenClaw Ultra - Deployment Script\n');

const platform = process.argv[2] || 'railway';

console.log(`📦 Deploying to: ${platform}\n`);

if (!fs.existsSync('.env')) {
  console.log('⚠️  .env file not found!');
  console.log('📝 Please create .env with your GROQ_API_KEY and TELEGRAM_BOT_TOKEN');
  console.log('   Copy env/example.env to .env\n');
}

switch (platform) {
  case 'railway':
    deployRailway();
    break;
  case 'render':
    deployRender();
    break;
  case 'replit':
    deployReplit();
    break;
  case 'fly':
    deployFly();
    break;
  default:
    console.log('❌ Unknown platform. Use: railway, render, replit, or fly');
}

function deployRailway() {
  console.log('📡 Deploying to Railway...');
  try {
    execSync('railway up', { stdio: 'inherit' });
    console.log('✅ Deployed to Railway!');
  } catch (e) {
    console.log('❌ Railway deployment failed');
    console.log('📝 Install Railway CLI: npm i -g @railway/cli');
  }
}

function deployRender() {
  console.log('📡 Deploying to Render...');
  console.log('📝 Connect your GitHub repo at render.com');
  console.log('   - Build command: npm install');
  console.log('   - Start command: npm start');
}

function deployReplit() {
  console.log('📡 Deploying to Replit...');
  console.log('📝 Import from GitHub on replit.com');
  console.log('   - Run: npm run setup && npm start');
}

function deployFly() {
  console.log('📡 Deploying to Fly.io...');
  try {
    execSync('fly launch', { stdio: 'inherit' });
    console.log('✅ Deployed to Fly.io!');
  } catch (e) {
    console.log('❌ Fly.io deployment failed');
  }
}

console.log('\n📖 After deployment, set these environment variables:');
console.log('   - GROQ_API_KEY');
console.log('   - TELEGRAM_BOT_TOKEN');
console.log('   - ADMIN_USER_ID\n');
