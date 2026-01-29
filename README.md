# Agent Wrapper

A powerful, lightweight SDK for building AI agents using the OpenAI Agents SDK. Works seamlessly with **OpenAI**, **Groq**, and any OpenAI-compatible API.

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
- 📝 **TypeScript First** - Full type safety and excellent DX

## 📦 Installation

```bash
npm install agent_wrapper
# or
bun add agent_wrapper
# or
pnpm add agent_wrapper
```

**Requirements:** Node.js 22+ or Bun 1.0+

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
  modelName?: string,       // Model (default: 'gpt-4o')
  tools?: Tool[],           // Callable tools
  handoffs?: Agent[],       // Agents to delegate to
  handoffDescription?: string,
  modelSettings?: {
    temperature?: number,   // 0.0-2.0
    maxTokens?: number,
    topP?: number,
  },
  enableTracing?: boolean,  // Default: false
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
bun run test-suite.ts      # 31 unit tests
bun run test-live-groq.ts  # Live API tests
```

## 🔄 Migration from 0.1.x

```diff
- const result = await agent.runAgent('Hello');
+ const result = await agent.run('Hello');
```

## 📋 Dependencies

- `@openai/agents` ^0.2.1
- `@ai-sdk/openai-compatible` ^1.0.22
- `zod` ^4.1.12

## 📄 License

MIT License - see [LICENSE](LICENSE)

## 🤝 Contributing

Contributions welcome! See [GitHub Issues](https://github.com/mbittu000/agent_wrapper/issues).

---

**Version:** 0.2.0 | **Author:** mbittu000 | [GitHub](https://github.com/mbittu000/agent_wrapper)
