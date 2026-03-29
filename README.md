# Agent Wrapper

A powerful, lightweight SDK for building AI agents using the OpenAI Agents SDK. Works seamlessly with **OpenAI**, **Groq**, **Ollama**, **Together AI**, and any OpenAI-compatible API.

[![npm version](https://img.shields.io/npm/v/agent_wrapper.svg)](https://www.npmjs.com/package/agent_wrapper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🚀 **Simple API** - Easy-to-use `AiAgent` class with sensible defaults
- 🔄 **Streaming** - Real-time response streaming with `runStream()`
- 🛠️ **Tool Support** - Create and use custom tools with `createTool()`
- 🤝 **Multi-Agent** - Handoffs between specialized agents
- 🛡️ **Guardrails** - Input/output validation helpers
- 💬 **Conversation History** - `runWithHistory()` for multi-turn chats
- 🔌 **OpenAI Compatible** - Works with OpenAI, Groq, Ollama, and more
- 🖥️ **Computer Use** - Built-in computer automation tool
- 🔧 **MCP Support** - Connect to Model Context Protocol servers
- 🎙️ **Voice Agents** - Real-time voice interactions with `VoiceAgent`
- 🌐 **Multi-Model** - Support for various AI providers via Vercel AI SDK
- 📝 **TypeScript First** - Full type safety and excellent DX

## 📦 Installation

```bash
npm install agent_wrapper
# or
bun add agent_wrapper
# or
pnpm add agent_wrapper
```

**Requirements:** Node.js 22+

## 🚀 Quick Start

### Basic Usage

```typescript
import { AiAgent } from 'agent_wrapper';

const agent = new AiAgent({
  key: process.env.OPENAI_API_KEY,
  instructions: 'You are a helpful assistant.',
});

const result = await agent.run('What is the capital of France?');
console.log(result); // "Paris"
```

### Using with Groq

```typescript
const agent = new AiAgent({
  key: process.env.GROQ_API_KEY,
  baseUrl: 'https://api.groq.com/openai/v1',
  modelName: 'llama-3.3-70b-versatile',
  instructions: 'You are a helpful assistant.',
});

const result = await agent.run('Hello!');
```

### Using Tools

```typescript
import { AiAgent, createTool } from 'agent_wrapper';
import { z } from 'zod';

const calculatorTool = createTool({
  name: 'calculator',
  description: 'Perform math calculations',
  parameters: z.object({
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
    a: z.number(),
    b: z.number(),
  }),
  execute: async ({ operation, a, b }) => {
    const ops = { add: a + b, subtract: a - b, multiply: a * b, divide: a / b };
    return `Result: ${ops[operation]}`;
  },
});

const agent = new AiAgent({
  key: process.env.OPENAI_API_KEY,
  instructions: 'Use the calculator for math.',
  tools: [calculatorTool],
});

const result = await agent.run('What is 15 multiplied by 7?');
// Tool is called automatically, returns "105"
```

### Streaming Responses

```typescript
for await (const event of agent.runStream('Tell me a story')) {
  if (event.type === 'text') {
    process.stdout.write(event.content || '');
  }
}
```

## 🖥️ Computer Use & Shell Tools

```typescript
import { AiAgent, computer, shell, applyPatch } from 'agent_wrapper';

const agent = new AiAgent({
  key: process.env.OPENAI_API_KEY,
  instructions: 'You can use computer, shell, and patch tools to help the user.',
  tools: [computer, shell, applyPatch],
});
```

## 🔧 MCP Server Integration

```typescript
import { AiAgent, connectToMCPServers, MCPServerStdio } from 'agent_wrapper';

// Connect to an MCP server
const server = new MCPServerStdio({
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-filesystem', './data'],
  name: 'filesystem',
});

const mcpServers = await connectToMCPServers([server]);
const tools = await mcpServers.getAllTools();

const agent = new AiAgent({
  key: process.env.OPENAI_API_KEY,
  instructions: 'Use available tools to help the user.',
  tools: [...tools],
});
```

## 🎙️ Voice Agents

```typescript
import { VoiceAgent } from 'agent_wrapper';

const voiceAgent = new VoiceAgent({
  name: 'Assistant',
  instructions: 'You are a helpful voice assistant.',
  voice: 'alloy', // or 'shimmer', 'echo', etc.
});

const session = await voiceAgent.createSession({
  apiKey: process.env.OPENAI_API_KEY,
});

// Now you can use session for voice interactions
// See @openai/agents-realtime for full voice API
```

## 🌐 Multi-Model Support

```typescript
import { AiAgent, createOllamaModel, createTogetherAIModel, createHuggingFaceModel } from 'agent_wrapper';

// Using Ollama
const ollamaModel = createOllamaModel({}, 'llama3');
// Note: You'll need to use the raw model with Agent directly

// Using Together AI
const togetherModel = createTogetherAIModel({ apiKey: process.env.TOGETHER_API_KEY }, 'meta-llama/Llama-3.3-70B-Instruct-Turbo');

// Using Hugging Face
const hfModel = createHuggingFaceModel({ apiKey: process.env.HF_TOKEN }, 'meta-llama/Llama-3-70b');
```

## 📚 API Reference

### AiAgent Constructor

```typescript
new AiAgent({
  // Required
  key: string,              // API key

  // Optional
  name?: string,            // Agent name (default: 'Agent')
  baseUrl?: string,         // API endpoint (default: OpenAI)
  instructions?: string,    // System prompt
  modelName?: string,      // Model (default: 'gpt-4o')
  tools?: Tool[],          // Callable tools
  handoffs?: Agent[],      // Agents to delegate to
  handoffDescription?: string,
  modelSettings?: {
    temperature?: number,  // 0.0-2.0
    maxTokens?: number,
    topP?: number,
  },
  enableTracing?: boolean, // Default: false
})
```

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `run(input, options?)` | Run agent, return final output | `Promise<string>` |
| `runStream(input)` | Stream responses in real-time | `AsyncGenerator<StreamEvent>` |
| `runWithHistory(messages)` | Run with conversation history | `Promise<string>` |
| `getAgent()` | Get underlying Agent instance | `Agent` |

### Helper Functions

```typescript
import { createTool, createInputGuardrail, createOutputGuardrail } from 'agent_wrapper';
```

### Available Tool Functions

```typescript
import { 
  createTool,    // Create custom tools with Zod schemas
  computer,      // Computer automation tool
  shell,         // Shell command execution
  applyPatch,    // Apply code patches
} from 'agent_wrapper';
```

### MCP Functions

```typescript
import { 
  connectToMCPServers,
  getMCPToolsFromServer,
  MCPServerStdio,
  MCPServerSSE,
  MCPServerStreamableHttp,
} from 'agent_wrapper';
```

### Voice Agent

```typescript
import { VoiceAgent, RealtimeSession } from 'agent_wrapper';

const voiceAgent = new VoiceAgent({
  name: 'Assistant',
  instructions: 'You are helpful.',
  voice: 'alloy',
});

const session = await voiceAgent.createSession({
  apiKey: 'your-api-key',
});
```

## 💡 Examples

### Multi-Agent Handoffs

```typescript
import { Agent } from '@openai/agents';
import { AiAgent } from 'agent_wrapper';

const billingAgent = new Agent({
  name: 'Billing',
  instructions: 'Handle billing questions.',
  handoffDescription: 'Billing specialist',
});

const router = new AiAgent({
  key: process.env.OPENAI_API_KEY,
  instructions: 'Route billing questions to Billing agent.',
  handoffs: [billingAgent],
});
```

### Custom API Provider (Ollama)

```typescript
const agent = new AiAgent({
  key: 'ollama',  // Ollama doesn't need a real key
  baseUrl: 'http://localhost:11434/v1',
  modelName: 'llama3',
  instructions: 'You are helpful.',
});
```

## ✅ Tested & Verified

This SDK has been tested with:
- ✅ **Groq** - llama-3.3-70b-versatile
- ✅ **OpenAI** - gpt-4o, gpt-4
- ✅ **Tool Execution** - Custom tools work correctly
- ✅ **Streaming** - Real-time response streaming

Run the tests yourself:
```bash
npm run test        # Run tests
npm run typecheck  # Type check
npm run build      # Build
```

## 🔄 Migration from 0.1.x

```diff
- const result = await agent.runAgent('Hello');
+ const result = await agent.run('Hello');
```

## 📋 Dependencies

- `@openai/agents` ^0.8.1
- `@openai/agents-core` ^0.8.1
- `@openai/agents-realtime` ^0.8.1 (optional, for voice)
- `@openai/agents-extensions` ^0.8.1
- `@ai-sdk/openai-compatible` ^2.0.37
- `openai` ^4.70.0
- `ai` ^5.40.0 (optional, for Vercel AI SDK)
- `zod` ^4.3.6
- `dotenv` ^16.4.7

## 📄 License

MIT License - see [LICENSE](LICENSE)

## 🤝 Contributing

Contributions welcome! See [GitHub Issues](https://github.com/mbittu000/agent_wrapper/issues).

---

**Version:** 0.3.0 | **Author:** mbittu000 | [GitHub](https://github.com/mbittu000/agent_wrapper)
