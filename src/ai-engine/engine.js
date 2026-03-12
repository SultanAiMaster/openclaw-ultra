require('dotenv').config();
const Groq = require('groq-sdk');

class AIEngine {
  constructor() {
    this.groq = null;
    this.model = 'llama-3.3-70b-versatile'; // Default Groq model
    this.initialize();
  }

  initialize() {
    if (process.env.GROQ_API_KEY) {
      this.groq = new Groq({ 
        apiKey: process.env.GROQ_API_KEY 
      });
      console.log('✅ Groq API initialized');
    } else {
      console.log('⚠️ GROQ_API_KEY not set - AI features disabled');
    }
  }

  async chat(messages, options = {}) {
    if (!this.groq) {
      return {
        error: 'AI not configured. Please set GROQ_API_KEY in .env'
      };
    }

    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: options.systemPrompt || 'You are OpenClaw AI, a helpful assistant. Be concise and helpful.'
          },
          ...messages
        ],
        model: options.model || this.model,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2048,
        top_p: options.topP || 1,
        stop: options.stop || null,
      });

      return {
        success: true,
        content: chatCompletion.choices[0]?.message?.content || 'No response',
        model: chatCompletion.model,
        usage: chatCompletion.usage
      };
    } catch (error) {
      console.error('Groq API Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async processMessage(message, context = {}) {
    const messages = [
      {
        role: 'user',
        content: message
      }
    ];

    const systemPrompt = context.systemPrompt || 
      `You are OpenClaw Ultra AI. A boundary-free AI assistant.
      - Be helpful, creative, and direct
      - You can help with coding, research, automation, and more
      - User context: ${context.userId || 'anonymous'}
      ${context.context ? `- Additional context: ${context.context}` : ''}`;

    return await this.chat(messages, {
      systemPrompt,
      temperature: 0.8,
      maxTokens: 2048
    });
  }

  async runAgent(task, userId) {
    const agentPrompt = `You are an autonomous AI agent. Break down the task and execute it step by step.
    
Task: ${task}

Provide:
1. Analysis of the task
2. Step-by-step plan
3. Execution results
4. Final output

Be thorough and complete the task effectively.`;

    const messages = [
      { role: 'user', content: agentPrompt }
    ];

    return await this.chat(messages, {
      systemPrompt: 'You are OpenClaw Agent - an autonomous task executor.',
      temperature: 0.9,
      maxTokens: 4096
    });
  }

  async research(query) {
    const researchPrompt = `Research task: ${query}

Provide:
- Summary of the topic
- Key findings
- Relevant details
- Sources if applicable

Be comprehensive and accurate.`;

    const messages = [
      { role: 'user', content: researchPrompt }
    ];

    return await this.chat(messages, {
      systemPrompt: 'You are a research assistant. Provide thorough, accurate information.',
      temperature: 0.5,
      maxTokens: 4096
    });
  }

  async code(task, language = 'javascript') {
    const codePrompt = `Generate code for: ${task}
Language: ${language}

Provide:
- Complete, working code
- Brief explanation
- Usage example if helpful`;

    const messages = [
      { role: 'user', content: codePrompt }
    ];

    return await this.chat(messages, {
      systemPrompt: `You are an expert ${language} programmer. Write clean, efficient code.`,
      temperature: 0.3,
      maxTokens: 2048
    });
  }

  async automation(task) {
    const autoPrompt = `Automation task: ${task}

Create a step-by-step automation plan or script. Consider:
- What needs to be done
- How to do it automatically
- Potential issues and solutions`;

    const messages = [
      { role: 'user', content: autoPrompt }
    ];

    return await this.chat(messages, {
      systemPrompt: 'You are an automation expert. Create efficient automated solutions.',
      temperature: 0.7,
      maxTokens: 2048
    });
  }
}

module.exports = new AIEngine();
