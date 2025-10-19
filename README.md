# OpenAI Agent SDK Template

A lightweight npm package that simplifies building AI agents using the OpenAI Agents SDK. This template eliminates boilerplate code and provides a straightforward API for creating and running intelligent agents with OpenAI or any OpenAI-compatible API provider.

## ✨ Features

- 🚀 **Simple API** - Easy-to-use `AgentTemplate` class for quick agent setup
- 🔌 **OpenAI Compatible** - Works with OpenAI and any OpenAI-compatible API providers
- ⚙️ **Minimal Configuration** - Set up a fully functional agent with just 5 parameters
- 📝 **TypeScript Support** - Fully typed for excellent development experience
- 🔒 **Production Ready** - Tracing disabled by default for cleaner output
- 📦 **Zero Dependencies Bloat** - Only essential dependencies included

## 📦 Installation

```bash
npm install openai-agent-template
```

Or with your preferred package manager:

```bash
# Bun
bun add openai-agent-template

# Yarn
yarn add openai-agent-template

# pnpm
pnpm add openai-agent-template
```

## 🚀 Quick Start

```typescript
import AgentTemplate from 'openai-agent-template';

// Create an agent
const agent = new AgentTemplate(
  'MyAssistant',                    // Agent name
  'sk-your-api-key',               // OpenAI API key
  'https://api.openai.com/v1',     // API base URL
  'You are a helpful assistant',    // System instructions
  'gpt-4'                           // Model name
);

// Run the agent
const result = await agent.runAgent('What is the capital of France?');
console.log(result);
```

## 📚 API Documentation

### AgentTemplate

The main class for creating and managing AI agents.

#### Constructor

```typescript
new AgentTemplate(
  name: string,
  key: string,
  baseUrl: string,
  instructions: string,
  modelName: string
)
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Unique identifier for your agent |
| `key` | string | API key for authentication |
| `baseUrl` | string | Base URL of the API endpoint |
| `instructions` | string | System prompt that defines agent behavior |
| `modelName` | string | Model identifier (e.g., 'gpt-4', 'gpt-3.5-turbo') |

#### Methods

##### `runAgent(input: string): Promise<string>`

Executes the agent with the provided input and returns the final output.

**Parameters:**
- `input` (string) - The prompt or query to send to the agent

**Returns:** Promise<string> - The agent's response

**Example:**
```typescript
const response = await agent.runAgent('Explain quantum computing');
console.log(response);
```

## 💡 Usage Examples

### Basic Chat Agent

```typescript
import AgentTemplate from 'openai-agent-template';

const chatAgent = new AgentTemplate(
  'ChatBot',
  process.env.OPENAI_API_KEY!,
  'https://api.openai.com/v1',
  'You are a friendly and helpful chatbot that answers questions clearly and concisely.',
  'gpt-4'
);

const response = await chatAgent.runAgent('Tell me a joke about programming');
console.log(response);
```

### Custom API Provider

```typescript
import AgentTemplate from 'openai-agent-template';

const customAgent = new AgentTemplate(
  'DataAnalyst',
  process.env.CUSTOM_API_KEY!,
  'https://api.example.com/v1',  // Your custom provider
  'You are an expert data analyst specializing in business intelligence.',
  'custom-model-v1'
);

const analysis = await customAgent.runAgent('Analyze sales trends for Q4');
console.log(analysis);
```

### With Environment Variables

```typescript
import AgentTemplate from 'openai-agent-template';

const agent = new AgentTemplate(
  process.env.AGENT_NAME || 'DefaultAgent',
  process.env.OPENAI_API_KEY!,
  process.env.API_BASE_URL || 'https://api.openai.com/v1',
  'You are a professional writing assistant.',
  process.env.MODEL_NAME || 'gpt-4'
);

const result = await agent.runAgent('Write a professional email...');
```

## 🔧 Requirements

- **Node.js** 18.0.0 or higher
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
# OpenAI API key
OPENAI_API_KEY=sk-your-api-key-here

# Optional: Custom API endpoint
API_BASE_URL=https://api.openai.com/v1

# Optional: Model selection
MODEL_NAME=gpt-4
```

Load your environment variables:

```typescript
import 'dotenv/config';

const agent = new AgentTemplate(
  'MyAgent',
  process.env.OPENAI_API_KEY!,
  process.env.API_BASE_URL || 'https://api.openai.com/v1',
  'You are helpful',
  process.env.MODEL_NAME || 'gpt-4'
);
```

## 🛠️ Development

### Building from Source

```bash
npm run build
```

This generates TypeScript declaration files and compiled JavaScript in the `dist/` directory.

### Running Tests

```bash
npm test
```

### Publishing to npm

1. Update your repository information in `package.json`
2. Ensure you have an npm account and are logged in:
   ```bash
   npm login
   ```
3. Publish the package:
   ```bash
   npm publish
   ```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

To contribute:
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 🐛 Issues & Support

For bugs, feature requests, or questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Provide minimal reproducible examples when reporting bugs

## 📚 Related Resources

- [OpenAI Agents Documentation](https://platform.openai.com/docs/guides/agents)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🚀 Roadmap

- [ ] Add tool/function calling support
- [ ] Add streaming response support
- [ ] Add agent memory management
- [ ] Add error handling examples
- [ ] Add more comprehensive examples

---

**Version:** 1.0.0  
**Last Updated:** October 2025
