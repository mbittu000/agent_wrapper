# Agent Wrapper

A lightweight npm package that simplifies building AI agents using the OpenAI Agents SDK. This wrapper eliminates boilerplate code and provides a straightforward API for creating and running intelligent agents with OpenAI or any OpenAI-compatible API provider.

## ✨ Features

- 🚀 **Simple API** - Easy-to-use `AiAgent` class with sensible defaults
- 🔌 **OpenAI Compatible** - Works with OpenAI and any OpenAI-compatible API providers
- ⚙️ **Minimal Configuration** - All parameters are optional with smart defaults
- 🛠️ **Tool Support** - Built-in support for OpenAI Agent tools
- 📝 **TypeScript Support** - Fully typed for excellent development experience
- 🔒 **Production Ready** - Tracing disabled by default for cleaner output
- 📦 **Zero Dependencies Bloat** - Only essential dependencies included

## 📦 Installation

```bash
npm install agent_wrapper
```

Or with your preferred package manager:

```bash
# Bun
bun add agent_wrapper

# Yarn
yarn add agent_wrapper

# pnpm
pnpm add agent_wrapper
```

## 🚀 Quick Start

```typescript
import AiAgent from 'agent_wrapper';

// Create an agent with minimal configuration
const agent = new AiAgent({
  key: 'sk-your-api-key',
  instructions: 'You are a helpful assistant'
});

// Run the agent
const result = await agent.runAgent('What is the capital of France?');
console.log(result);
```

## 📚 API Documentation

### AiAgent

The main class for creating and managing AI agents.

#### Constructor

```typescript
new AiAgent({
  name?: string,
  key?: string,
  baseUrl?: string,
  instructions?: string,
  modelName?: string,
  tools?: Tool[]
})
```

**Parameters:**

All parameters are optional with the following defaults:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `name` | string | `'Agent'` | Unique identifier for your agent |
| `key` | string | `''` | API key for authentication |
| `baseUrl` | string | `'https://api.openai.com/v1'` | Base URL of the API endpoint |
| `instructions` | string | `'You are a helpful assistant.'` | System prompt that defines agent behavior |
| `modelName` | string | `'gpt-4'` | Model identifier (e.g., 'gpt-4', 'gpt-3.5-turbo') |
| `tools` | Tool[] | `[]` | Array of tools for the agent to use |

#### Methods

##### `runAgent(input: string): Promise<string | undefined>`

Executes the agent with the provided input and returns the final output.

**Parameters:**
- `input` (string) - The prompt or query to send to the agent

**Returns:** `Promise<string | undefined>` - The agent's response

**Example:**
```typescript
const response = await agent.runAgent('Explain quantum computing');
console.log(response);
```

## 💡 Usage Examples

### Basic Chat Agent

```typescript
import AiAgent from 'agent_wrapper';

const chatAgent = new AiAgent({
  key: process.env.OPENAI_API_KEY,
  instructions: 'You are a friendly and helpful chatbot that answers questions clearly and concisely.',
  modelName: 'gpt-4'
});

const response = await chatAgent.runAgent('Tell me a joke about programming');
console.log(response);
```

### Custom API Provider

```typescript
import AiAgent from 'agent_wrapper';

const customAgent = new AiAgent({
  name: 'DataAnalyst',
  key: process.env.CUSTOM_API_KEY,
  baseUrl: 'https://api.example.com/v1',  // Your custom provider
  instructions: 'You are an expert data analyst specializing in business intelligence.',
  modelName: 'custom-model-v1'
});

const analysis = await customAgent.runAgent('Analyze sales trends for Q4');
console.log(analysis);
```

### With Environment Variables

```typescript
import AiAgent from 'agent_wrapper';

const agent = new AiAgent({
  name: process.env.AGENT_NAME || 'DefaultAgent',
  key: process.env.OPENAI_API_KEY,
  baseUrl: process.env.API_BASE_URL || 'https://api.openai.com/v1',
  instructions: 'You are a professional writing assistant.',
  modelName: process.env.MODEL_NAME || 'gpt-4'
});

const result = await agent.runAgent('Write a professional email...');
```

### Using Tools

```typescript
import AiAgent from 'agent_wrapper';
import { tool } from '@openai/agents';
import { z } from 'zod';

// Define a custom tool
const weatherTool = tool({
  name: 'get_weather',
  description: 'Get the current weather for a location',
  parameters: z.object({
    location: z.string().describe('The city name')
  }),
  execute: async ({ location }) => {
    // Your weather API logic here
    return `The weather in ${location} is sunny, 72°F`;
  }
});

// Create agent with tools
const agent = new AiAgent({
  key: process.env.OPENAI_API_KEY,
  instructions: 'You are a helpful assistant that can check weather.',
  tools: [weatherTool]
});

const result = await agent.runAgent('What is the weather in San Francisco?');
console.log(result);
```

### Minimal Configuration (All Defaults)

```typescript
import AiAgent from 'agent_wrapper';

// Uses all default values - just needs API key set in environment or passed
const agent = new AiAgent({
  key: 'sk-your-api-key'
});

const result = await agent.runAgent('Hello!');
```

## 🔧 Requirements

- **Node.js** 18.0.0 or higher, or **Bun** 1.0.0 or higher
- **TypeScript** 5.0 or higher (peer dependency)
- Valid API credentials (OpenAI or compatible provider)

## 📋 Dependencies

- `@openai/agents` - Core agent framework
- `@ai-sdk/openai-compatible` - OpenAI-compatible API support
- `@openai/agents-extensions` - Agent SDK extensions
- `zod` - Schema validation

## 🌍 Environment Variables

Create a `.env` file in your project root:

```bash
# OpenAI API key (required)
OPENAI_API_KEY=sk-your-api-key-here

# Optional: Custom API endpoint
API_BASE_URL=https://api.openai.com/v1

# Optional: Model selection
MODEL_NAME=gpt-4

# Optional: Agent name
AGENT_NAME=MyAgent
```

Load your environment variables:

```typescript
import 'dotenv/config';
import AiAgent from 'agent_wrapper';

const agent = new AiAgent({
  key: process.env.OPENAI_API_KEY,
  baseUrl: process.env.API_BASE_URL,
  modelName: process.env.MODEL_NAME,
  instructions: 'You are helpful'
});
```

## 🛠️ Development

### Building from Source

```bash
# Install dependencies
npm install

# Build the package
npm run build
```

This generates TypeScript declaration files and compiled JavaScript in the `dist/` directory.

### Running Tests

```bash
npm test
```

### Publishing to npm

1. Ensure you have an npm account and are logged in:
   ```bash
   npm login
   ```
2. Build and publish:
   ```bash
   npm publish
   ```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

To contribute:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Issues & Support

For bugs, feature requests, or questions:
- Open an issue on [GitHub Issues](https://github.com/mbittu000/agent_wrapper/issues)
- Check existing issues for solutions
- Provide minimal reproducible examples when reporting bugs

## 📚 Related Resources

- [OpenAI Agents Documentation](https://platform.openai.com/docs/guides/agents)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🚀 Roadmap

- [x] Simple object-based API with defaults
- [x] Tool support for OpenAI Agents
- [ ] Add streaming response support
- [ ] Add agent memory management
- [ ] Add error handling examples
- [ ] Add more comprehensive examples
- [ ] Add agent conversation history

---

**Package:** agent_wrapper  
**Version:** 0.1.0  
**Author:** mbittu000  
**Repository:** [github.com/mbittu000/agent_wrapper](https://github.com/mbittu000/agent_wrapper)
