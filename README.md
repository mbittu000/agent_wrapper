# Agent Wrapper

A powerful, lightweight SDK for building AI agents using the OpenAI Agents SDK. Features streaming, multi-agent handoffs, guardrails, and structured outputs.

## ✨ Features

- 🚀 **Simple API** - Easy-to-use `AiAgent` class with sensible defaults
- 🔄 **Streaming** - Real-time response streaming with `runStream()`
- 🤝 **Multi-Agent** - Handoffs between specialized agents
- 🛡️ **Guardrails** - Input/output validation for safety
- 📊 **Structured Output** - Zod schema validation for typed responses
- 💬 **Session Support** - Conversation history with `runWithHistory()`
- 🔌 **OpenAI Compatible** - Works with OpenAI and compatible APIs
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

```typescript
import { AiAgent } from 'agent_wrapper';

const agent = new AiAgent({
  key: process.env.OPENAI_API_KEY,
  instructions: 'You are a helpful assistant.',
});

const result = await agent.run('What is the capital of France?');
console.log(result);
```

## 📚 API Reference

### AiAgent

The main class for creating and managing AI agents.

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
  inputGuardrails?: GuardrailFunction[],
  outputGuardrails?: GuardrailFunction[],
  outputType?: z.ZodSchema, // For structured output
  modelSettings?: {
    temperature?: number,
    maxTokens?: number,
    topP?: number,
  },
  enableTracing?: boolean,  // Default: false
})
```

#### Methods

| Method | Description |
|--------|-------------|
| `run(input, options?)` | Run agent, return final output |
| `runStream(input)` | Stream responses in real-time |
| `runWithHistory(messages, options?)` | Run with conversation history |
| `getAgent()` | Get underlying Agent instance |

## 💡 Examples

### Streaming Responses

```typescript
import { AiAgent } from 'agent_wrapper';

const agent = new AiAgent({
  key: process.env.OPENAI_API_KEY,
  instructions: 'You are a creative storyteller.',
});

for await (const event of agent.runStream('Tell me a story')) {
  if (event.type === 'text') {
    process.stdout.write(event.content || '');
  }
}
```

### Using Tools

```typescript
import { AiAgent, createTool } from 'agent_wrapper';
import { z } from 'zod';

const weatherTool = createTool({
  name: 'get_weather',
  description: 'Get weather for a city',
  parameters: z.object({
    city: z.string().describe('City name'),
  }),
  execute: async ({ city }) => `Weather in ${city}: Sunny, 72°F`,
});

const agent = new AiAgent({
  key: process.env.OPENAI_API_KEY,
  instructions: 'You can check weather using the get_weather tool.',
  tools: [weatherTool],
});

const result = await agent.run('What\'s the weather in Paris?');
```

### Multi-Agent Handoffs

```typescript
import { Agent } from '@openai/agents';
import { AiAgent } from 'agent_wrapper';

// Create specialist agents
const billingAgent = new Agent({
  name: 'Billing',
  instructions: 'Handle billing questions.',
  handoffDescription: 'Billing specialist',
});

// Router agent delegates to specialists
const router = new AiAgent({
  key: process.env.OPENAI_API_KEY,
  instructions: 'Route billing questions to Billing agent.',
  handoffs: [billingAgent],
});

const result = await router.run('I have a billing question');
```

### Guardrails

```typescript
import { AiAgent, createInputGuardrail } from 'agent_wrapper';

const blockMalicious = createInputGuardrail({
  name: 'security_guard',
  description: 'Block malicious input',
  guardFunction: async (ctx, input) => ({
    tripwireTriggered: input.includes('DROP TABLE'),
    output: 'Blocked: Suspicious input',
  }),
});

const agent = new AiAgent({
  key: process.env.OPENAI_API_KEY,
  instructions: 'You are a helpful assistant.',
  inputGuardrails: [blockMalicious],
});
```

### Conversation History

```typescript
const agent = new AiAgent({
  key: process.env.OPENAI_API_KEY,
});

const history = [
  { role: 'user', content: 'My name is Alice' },
  { role: 'assistant', content: 'Nice to meet you, Alice!' },
  { role: 'user', content: 'What is my name?' },
];

const result = await agent.runWithHistory(history);
// "Your name is Alice."
```

## 🔄 Migration from 0.1.x

```diff
import AiAgent from 'agent_wrapper';

const agent = new AiAgent({ ... });

- const result = await agent.runAgent('Hello');
+ const result = await agent.run('Hello');
```

The `runAgent()` method still works but is deprecated.

## 📋 Dependencies

- `@openai/agents` ^0.2.1
- `@ai-sdk/openai-compatible` ^1.0.22
- `zod` ^4.1.12

## 📄 License

MIT License - see [LICENSE](LICENSE)

## 🤝 Contributing

Contributions welcome! See [GitHub Issues](https://github.com/mbittu000/agent_wrapper/issues).

---

**Version:** 0.2.0 | **Author:** mbittu000
