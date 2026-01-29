# @openai/agents (NPM Package) - Complete Documentation

## Overview

`@openai/agents` is the official TypeScript/JavaScript SDK for building multi-agent AI workflows using OpenAI's models. It's a production-ready framework that provides a minimal set of primitives—Agents, Handoffs, Guardrails, and Tracing—enabling developers to build complex agentic systems without steep abstraction layers.

**Current Version:** 0.2.1  
**License:** MIT  
**Repository:** https://github.com/openai/openai-agents-js  
**NPM:** https://www.npmjs.com/package/@openai/agents

---

## Installation & Requirements

### System Requirements
- **Node.js:** 22 or later (non-EOL versions)
- **Package Manager:** npm, yarn, pnpm, or bun
- **TypeScript:** 5.0+ (recommended, but JavaScript supported)

### Alternative Runtimes
- **Deno:** Full support
- **Bun:** Full support
- **Cloudflare Workers:** Experimental support with `nodejs_compat` enabled

### Install via NPM

```bash
npm install @openai/agents zod@4
# or
pnpm add @openai/agents zod@4
# or
yarn add @openai/agents zod@4
```

**Important:** The SDK requires `zod@4` for schema validation. Install both packages.

### Environment Configuration

Set your OpenAI API credentials as environment variables:

```bash
export OPENAI_API_KEY="sk-..."
export OPENAI_ORG_ID="org-..."          # optional
export OPENAI_PROJECT_ID="proj-..."     # optional
```

Or load via `.env` file:

```
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...
OPENAI_PROJECT_ID=proj-...
```

The SDK reads these automatically when instantiating the OpenAI client.

---

## Core Concepts

### 1. Agents

An **Agent** is an LLM (Large Language Model) equipped with instructions, optional tools, and other configurations. It represents a specialized AI assistant capable of understanding instructions and performing tasks.

**Anatomy of an Agent:**
- `name`: Unique identifier for logging and tracing
- `instructions`: System prompt defining behavior and role
- `model`: LLM to use (defaults to `gpt-4o`)
- `tools`: Array of callable functions the agent can invoke
- `handoffDescription`: Description when used as a handoff target
- `handoffs`: Array of other agents this one can delegate to
- `guardrails`: Input/output validation functions
- `outputType`: Zod schema for structured output validation
- `modelSettings`: Configuration like temperature, max_tokens, etc.

### 2. Handoffs

**Handoffs** are specialized tool calls that transfer control from one agent to another. They enable orchestration where one agent recognizes a task needs specialization and delegates to a more suitable agent.

**Use Cases:**
- Route customer inquiries to specialized agents (billing, technical support, etc.)
- Chain agents sequentially for complex workflows
- Create decision trees where agents evaluate and route tasks

### 3. Guardrails

**Guardrails** are validation functions that run in parallel or before agent execution. They act as safety checkpoints for input and output.

**Types:**
- **Input Guardrails:** Validate user input before passing to the agent (e.g., detect spam, malicious prompts)
- **Output Guardrails:** Validate agent output before returning to user (e.g., filter sensitive data)

**Tripwire Pattern:** If a guardrail detects a violation, it raises a `GuardrailTripwireTriggered` exception, halting execution.

### 4. Tracing

**Tracing** provides built-in observability of agent runs. The SDK automatically captures:
- LLM generations and token usage
- Tool calls and results
- Handoffs between agents
- Guardrail evaluations
- Custom events

Traces are viewable in the OpenAI Platform's Traces dashboard for debugging and monitoring.

### 5. Sessions

**Sessions** maintain conversation history across multiple agent runs. They provide persistent context, eliminating manual state handling. Useful for multi-turn conversations.

---

## Getting Started

### 1. Hello World

```typescript
import { Agent, run } from '@openai/agents';

const agent = new Agent({
  name: 'Assistant',
  instructions: 'You are a helpful assistant.',
});

const result = await run(
  agent,
  'Write a haiku about recursion in programming.',
);

console.log(result.finalOutput);
// Output:
// Code within the code,
// Functions calling themselves,
// Infinite loop's dance.
```

### 2. Agent with Tools

```typescript
import { z } from 'zod';
import { Agent, run, tool } from '@openai/agents';

const getWeatherTool = tool({
  name: 'get_weather',
  description: 'Get the current weather for a city',
  parameters: z.object({
    city: z.string().describe('City name'),
    unit: z.enum(['celsius', 'fahrenheit']).default('celsius'),
  }),
  execute: async ({ city, unit }) => {
    // Your weather API call here
    return `The weather in ${city} is sunny, 22°${unit === 'celsius' ? 'C' : 'F'}.`;
  },
});

const agent = new Agent({
  name: 'Weather Agent',
  instructions: 'You are a weather information assistant. Use the get_weather tool to answer questions.',
  tools: [getWeatherTool],
});

const result = await run(agent, 'What is the weather in Tokyo?');
console.log(result.finalOutput);
```

### 3. Multi-Agent with Handoffs

```typescript
import { z } from 'zod';
import { Agent, run, tool } from '@openai/agents';

const billingTool = tool({
  name: 'check_billing',
  description: 'Check account billing information',
  parameters: z.object({ accountId: z.string() }),
  execute: async ({ accountId }) => `Billing for ${accountId}: $500 due`,
});

const techTool = tool({
  name: 'check_status',
  description: 'Check system status',
  parameters: z.object({ service: z.string() }),
  execute: async ({ service }) => `${service} is online`,
});

const billingAgent = new Agent({
  name: 'Billing Agent',
  instructions: 'Handle billing inquiries.',
  tools: [billingTool],
  handoffDescription: 'You handle billing and payment questions.',
});

const techAgent = new Agent({
  name: 'Technical Agent',
  instructions: 'Handle technical issues.',
  tools: [techTool],
  handoffDescription: 'You handle technical support.',
});

const customerServiceAgent = Agent.create({
  name: 'Customer Service',
  instructions: `You are a customer service agent. Route inquiries to the appropriate specialist:
- Billing questions → Billing Agent
- Technical issues → Technical Agent`,
  handoffs: [billingAgent, techAgent],
});

const result = await run(
  customerServiceAgent,
  'I have a billing question about my account.',
);
console.log(result.finalOutput);
```

---

## Agent Configuration

### Constructor Options

```typescript
interface AgentOptions {
  // Required
  name: string;
  instructions: string | ((context: RunContext) => string | Promise<string>);
  
  // Optional - LLM Configuration
  model?: string; // default: "gpt-4o"
  modelSettings?: {
    temperature?: number; // 0.0-2.0, default 1.0
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
  
  // Optional - Tools and Handoffs
  tools?: Tool[];
  handoffs?: Agent[];
  handoffDescription?: string;
  
  // Optional - Guardrails
  inputGuardrails?: GuardrailFunction[];
  outputGuardrails?: GuardrailFunction[];
  
  // Optional - Output Validation
  outputType?: z.ZodSchema; // For structured outputs
  
  // Optional - Metadata
  description?: string; // Human-readable description
}
```

### Creating an Agent

**Basic Agent:**
```typescript
const agent = new Agent({
  name: 'Support Assistant',
  instructions: 'You provide friendly customer support.',
});
```

**Agent with Model Settings:**
```typescript
const agent = new Agent({
  name: 'Creative Writer',
  instructions: 'You write creative stories.',
  modelSettings: {
    temperature: 1.5, // Higher for more creativity
    maxTokens: 2000,
  },
});
```

**Static Agent Creation:**

For agents with handoffs, use `Agent.create()` to ensure proper type inference for output types:

```typescript
const agent = Agent.create({
  name: 'Router',
  instructions: 'Route tasks appropriately.',
  handoffs: [specialistAgent1, specialistAgent2],
});
```

---

## Tool Integration

### Tool Definition

Tools are created using the `tool()` factory with Zod schema validation:

```typescript
import { z } from 'zod';
import { tool } from '@openai/agents';

const calculateTool = tool({
  name: 'calculate',
  description: 'Perform mathematical calculations',
  parameters: z.object({
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
    a: z.number(),
    b: z.number(),
  }),
  execute: async ({ operation, a, b }) => {
    const results: Record<string, number> = {
      add: a + b,
      subtract: a - b,
      multiply: a * b,
      divide: a / b,
    };
    return results[operation];
  },
});

const agent = new Agent({
  name: 'Calculator',
  instructions: 'Use the calculate tool to solve math problems.',
  tools: [calculateTool],
});
```

### Tool Schema Best Practices

- **Describe parameters:** Use `.describe()` for clarity on what each parameter does
- **Use enums:** Restrict choices with `z.enum([...])` for controlled options
- **Set defaults:** Use `.default()` for optional parameters
- **Validate ranges:** Use `.min()`, `.max()` for numeric constraints
- **Document error cases:** If execute() can fail, handle gracefully

```typescript
const robustTool = tool({
  name: 'fetch_data',
  description: 'Retrieve data from external source',
  parameters: z.object({
    endpoint: z.string().url().describe('Full HTTP endpoint URL'),
    timeout: z.number().min(1000).max(30000).default(5000),
    retries: z.number().min(0).max(5).default(3),
  }),
  execute: async ({ endpoint, timeout, retries }) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(endpoint, { signal: AbortSignal.timeout(timeout) });
        return await response.json();
      } catch (err) {
        if (i === retries - 1) throw err;
      }
    }
  },
});
```

### Parallel Tool Execution

The SDK supports parallel tool calls. If the LLM generates multiple tool calls, they execute concurrently:

```typescript
// LLM may call multiple tools at once
const result = await run(agent, 'Get weather and forecast for Paris and London');
// Both API calls execute in parallel if the agent decides to call both
```

---

## Handoffs & Multi-Agent Orchestration

### Creating Handoff Targets

Agents designated as handoff targets must have a `handoffDescription`:

```typescript
const specialistAgent = new Agent({
  name: 'Database Specialist',
  instructions: 'You optimize database queries.',
  handoffDescription: 'You specialize in SQL optimization and database performance tuning.',
  tools: [optimizeQueryTool],
});
```

### Using Handoffs in Parent Agents

```typescript
const parentAgent = Agent.create({
  name: 'Technical Lead',
  instructions: `You manage technical issues by delegating to specialists:
    - For database issues, delegate to the Database Specialist
    - For API issues, delegate to the API Specialist
    - Otherwise, solve directly`,
  handoffs: [databaseSpecialist, apiSpecialist],
});
```

### Handoff Behavior

When an agent hands off to another:
1. Control transfers to the new agent
2. The conversation history is maintained
3. The new agent can use its tools and handoffs
4. The loop continues until a final output is produced

---

## Structured Outputs

### Defining Output Schemas

Use Zod to define expected output structure:

```typescript
import { z } from 'zod';

const AnalysisSchema = z.object({
  summary: z.string(),
  sentiment: z.enum(['positive', 'negative', 'neutral']),
  confidence: z.number().min(0).max(1),
  key_points: z.array(z.string()),
});

const agent = new Agent({
  name: 'Analyst',
  instructions: 'Analyze text and return structured insights.',
  outputType: AnalysisSchema,
});

const result = await run(agent, 'Analyze this customer feedback: [text]');
console.log(result.finalOutput); // Typed as AnalysisSchema
// {
//   summary: "Customer is satisfied with product...",
//   sentiment: "positive",
//   confidence: 0.95,
//   key_points: ["Fast delivery", "Good quality"]
// }
```

### Complex Nested Schemas

```typescript
const ComplexSchema = z.object({
  status: z.enum(['completed', 'failed', 'pending']),
  data: z.object({
    user: z.object({
      id: z.string(),
      email: z.string().email(),
    }),
    results: z.array(z.object({
      metric: z.string(),
      value: z.number(),
    })),
  }),
  metadata: z.record(z.unknown()),
});
```

---

## Guardrails

### Input Guardrails

Input guardrails validate user input before it reaches the agent:

```typescript
import { guardConfig, GuardrailFunctionOutput, RunContext } from '@openai/agents';

const blockMaliciousInput = guardConfig({
  name: 'malicious_input_guard',
  description: 'Blocks attempts to exploit the agent',
  guardFunction: async (context: RunContext, input: string) => {
    const isMalicious = input.includes('DROP TABLE') || input.includes('exec(');
    return {
      tripwireTriggered: isMalicious,
      output: isMalicious ? 'Blocked: Suspicious input detected' : 'OK',
    };
  },
});

const agent = new Agent({
  name: 'Assistant',
  instructions: 'Help users.',
  inputGuardrails: [blockMaliciousInput],
});
```

### Output Guardrails

Output guardrails validate agent responses before returning:

```typescript
const filterSensitiveData = guardConfig({
  name: 'sensitive_data_filter',
  description: 'Removes email addresses and phone numbers',
  guardFunction: async (context: RunContext, output: string) => {
    const hasEmail = /@/.test(output);
    const hasPhone = /\d{3}-\d{3}-\d{4}/.test(output);
    
    if (hasEmail || hasPhone) {
      return {
        tripwireTriggered: true,
        output: 'Blocked: Output contains sensitive data',
      };
    }
    
    return {
      tripwireTriggered: false,
      output: 'OK',
    };
  },
});

const agent = new Agent({
  name: 'Assistant',
  instructions: 'Help users.',
  outputGuardrails: [filterSensitiveData],
});
```

### Handling Guardrail Violations

```typescript
import { GuardrailTripwireTriggered } from '@openai/agents';

try {
  const result = await run(agent, userInput);
  console.log(result.finalOutput);
} catch (err) {
  if (err instanceof GuardrailTripwireTriggered) {
    console.log('Guardrail triggered:', err.message);
  }
}
```

---

## Running Agents

### Basic Execution

```typescript
import { Agent, run } from '@openai/agents';

const result = await run(agent, 'Your prompt here');
console.log(result.finalOutput);
```

### Advanced Execution with Options

```typescript
interface RunOptions {
  maxTurns?: number; // Maximum agent loop iterations (default: 100)
  context?: any; // Custom context object
  sessionId?: string; // Resume from existing session
}

const result = await run(agent, 'Prompt', {
  maxTurns: 50,
  context: { userId: '123' },
});
```

### Streaming Responses

Stream agent outputs and events in real-time:

```typescript
import { runStream } from '@openai/agents';

const stream = await runStream(agent, 'Your prompt here');

for await (const event of stream) {
  if (event.type === 'text') {
    process.stdout.write(event.content);
  } else if (event.type === 'tool_call') {
    console.log(`\nCalling tool: ${event.tool.name}`);
  }
}

console.log('\nAgent finished.');
```

### Max Turns

By default, agents loop up to 100 turns (iterations). Each turn may involve tool calls, handoffs, or message generation. Limit this with `maxTurns`:

```typescript
try {
  const result = await run(agent, 'Complex multi-step task', {
    maxTurns: 10, // Limit to 10 iterations
  });
} catch (err) {
  if (err instanceof MaxTurnsExceededError) {
    console.log('Agent exceeded maximum turns');
  }
}
```

---

## The Agent Loop

When you call `run()`, the SDK executes the following loop:

1. **Invoke Agent:** Call the LLM with agent instructions, tools, and message history
2. **LLM Response:** The model returns a response which may include:
   - Text output (final message)
   - Tool calls (function invocations)
   - Handoff requests (delegation to another agent)
3. **Final Output Check:**
   - If `outputType` is defined, loop until structured output matches schema
   - If no `outputType`, loop until response contains no tool calls or handoffs
4. **Execute Tools (if needed):** Call all functions in parallel, append results to history
5. **Switch Agent (if needed):** If handoff requested, switch to new agent
6. **Repeat:** Continue until final output condition met or `maxTurns` exceeded

### Flow Diagram

```
Input → Agent → LLM Call
         ↓
    Has output?
    ├─ No → Execute Tools → History + Results
    ├─ Handoff? → Switch Agent → Loop
    ├─ Yes → Return Result
    └─ Timeout? → Error
```

### Final Output Definition

- **With `outputType`:** Loop continues until LLM response matches the Zod schema
- **Without `outputType`:** Loop ends at first response with no tool calls or handoffs
- **Max turns exceeded:** `MaxTurnsExceededError` is thrown

---

## Voice Agents (Realtime)

For real-time voice interaction, use the separate `@openai/agents-realtime` package:

```bash
npm install @openai/agents-realtime
```

### Voice Agent Example

```typescript
import { z } from 'zod';
import { RealtimeAgent, RealtimeSession, tool } from '@openai/agents-realtime';

const getWeatherTool = tool({
  name: 'get_weather',
  parameters: z.object({ city: z.string() }),
  execute: async ({ city }) => `Sunny, 22°C in ${city}`,
});

const agent = new RealtimeAgent({
  name: 'Voice Assistant',
  instructions: 'You are a helpful voice assistant.',
  tools: [getWeatherTool],
});

// Run in browser
const { apiKey } = await fetch('/api/get-ephemeral-key').then((r) => r.json());
const session = new RealtimeSession(agent);
await session.connect({ apiKey });
// User can now speak; audio I/O handled automatically
```

**Features:**
- Automatic speech-to-text and text-to-speech
- Low-latency streaming
- Interruption detection
- Context management

---

## Tracing & Observability

### Built-in Tracing

Tracing is enabled by default when using `OPENAI_API_KEY`. The SDK captures:
- LLM generations
- Tool calls and results
- Handoffs
- Guardrail evaluations
- Custom events

### Viewing Traces

Traces appear in the OpenAI Platform dashboard:
1. Navigate to https://platform.openai.com/playground/v1/logs
2. Filter for your agent runs
3. View full trace including tokens, timing, and decisions

### Custom Tracing

```typescript
import { createTraceContext, trace } from '@openai/agents';

const context = createTraceContext('my-agent-run');

await trace('custom_event', async () => {
  // Your code here
  return result;
}, context);
```

### Disabling Tracing

```typescript
import { setTracingDisabled } from '@openai/agents';

setTracingDisabled(true); // Disable tracing in production if needed
```

### Integrating with Observability Platforms

The SDK supports OpenTelemetry integration for platforms like:
- **Logfire** (Pydantic)
- **Datadog**
- **New Relic**
- **Azure Application Insights**

Example with Logfire:

```typescript
import * as Logfire from '@pydantic/logfire';

Logfire.configure();
// SDK will automatically export traces to Logfire
```

---

## Sessions

### What Are Sessions?

Sessions maintain conversation history across multiple `run()` calls, providing persistent context for multi-turn interactions.

### Creating a Session

```typescript
import { Session } from '@openai/agents';

const session = new Session(agent);

// First turn
const result1 = await session.run('Hello, my name is Alice');
console.log(result1.finalOutput);

// Second turn - context preserved
const result2 = await session.run('What is my name?');
console.log(result2.finalOutput); // "Your name is Alice"
```

### Manual History Management

For more control, manage message history manually:

```typescript
const history = [];

// Turn 1
history.push({ role: 'user', content: 'What is 2+2?' });
let result = await run(agent, history);
history.push({ role: 'assistant', content: result.finalOutput });

// Turn 2
history.push({ role: 'user', content: 'What about 3+3?' });
result = await run(agent, history);
```

---

## Error Handling

### Common Exceptions

```typescript
import {
  MaxTurnsExceededError,
  GuardrailTripwireTriggered,
  ToolExecutionError,
} from '@openai/agents';

try {
  const result = await run(agent, input);
} catch (err) {
  if (err instanceof MaxTurnsExceededError) {
    console.error('Agent exceeded max iterations:', err.message);
  } else if (err instanceof GuardrailTripwireTriggered) {
    console.error('Guardrail blocked:', err.message);
  } else if (err instanceof ToolExecutionError) {
    console.error('Tool failed:', err.toolName, err.cause);
  } else {
    console.error('Unexpected error:', err);
  }
}
```

### Best Practices

1. **Always wrap `run()` in try-catch** for production code
2. **Handle timeout scenarios** by setting appropriate `maxTurns`
3. **Validate tool outputs** before using them
4. **Log errors for debugging** via tracing
5. **Provide user-friendly error messages** (don't expose internal details)

---

## Best Practices

### 1. Agent Design

- **Single Responsibility:** Each agent should have a focused purpose
- **Clear Instructions:** Write detailed, unambiguous system prompts
- **Meaningful Names:** Use descriptive names for agents and tools
- **Test Handoffs:** Verify delegation logic works as expected

### 2. Tool Integration

- **Comprehensive Schemas:** Describe all parameters clearly with Zod
- **Error Handling:** Tools should gracefully handle failures
- **Performance:** Keep tool execution fast to avoid latency
- **Validation:** Validate inputs/outputs within tools

### 3. Security

- **Input Validation:** Use guardrails to block malicious input
- **Output Filtering:** Protect sensitive data with output guardrails
- **Rate Limiting:** Implement rate limits for production agents
- **Audit Logging:** Use tracing to audit all agent actions

### 4. Production Deployment

- **Monitor Traces:** Regularly review traces for issues
- **Handle Errors:** Implement comprehensive error handling
- **Set Max Turns:** Always set a reasonable `maxTurns` limit
- **Test Edge Cases:** Include malformed input, timeouts, etc.
- **Version Control:** Track agent configurations in git

---

## Examples

### Example 1: Customer Support Router

```typescript
import { z } from 'zod';
import { Agent, run, tool } from '@openai/agents';

// Billing agent
const billingAgent = new Agent({
  name: 'Billing Support',
  instructions: 'Handle billing and payment questions.',
  handoffDescription: 'Specialist in billing and account payments.',
  tools: [
    tool({
      name: 'check_invoice',
      description: 'Look up an invoice',
      parameters: z.object({ invoiceId: z.string() }),
      execute: async ({ invoiceId }) => `Invoice ${invoiceId}: $99.99 due 2025-02-15`,
    }),
  ],
});

// Technical support agent
const techAgent = new Agent({
  name: 'Technical Support',
  instructions: 'Handle technical issues and bugs.',
  handoffDescription: 'Specialist in technical troubleshooting.',
  tools: [
    tool({
      name: 'check_system_status',
      description: 'Check if services are operational',
      parameters: z.object({ service: z.string() }),
      execute: async ({ service }) => `${service} is operational`,
    }),
  ],
});

// Main router
const supportRouter = Agent.create({
  name: 'Customer Support',
  instructions: `You are a customer support router. Route inquiries appropriately:
- Billing questions, payments, invoices → Billing Support
- Technical issues, bugs, outages → Technical Support
- Other → Handle directly

Listen carefully to understand the issue type.`,
  handoffs: [billingAgent, techAgent],
});

// Usage
(async () => {
  const queries = [
    "I need to check my invoice from last month",
    "The API is returning 500 errors",
    "Can I change my billing address?",
  ];

  for (const query of queries) {
    const result = await run(supportRouter, query);
    console.log(`Query: ${query}\nResponse: ${result.finalOutput}\n`);
  }
})();
```

### Example 2: Data Analysis with Structured Output

```typescript
import { z } from 'zod';
import { Agent, run, tool } from '@openai/agents';

const DataInsightSchema = z.object({
  title: z.string(),
  key_findings: z.array(z.string()),
  trends: z.array(z.object({
    metric: z.string(),
    direction: z.enum(['up', 'down', 'stable']),
  })),
  recommendation: z.string(),
});

const analysisAgent = new Agent({
  name: 'Data Analyst',
  instructions: 'Analyze datasets and provide insights.',
  outputType: DataInsightSchema,
  tools: [
    tool({
      name: 'load_data',
      description: 'Load dataset by name',
      parameters: z.object({ datasetName: z.string() }),
      execute: async ({ datasetName }) => ({
        rows: 1000,
        columns: ['date', 'revenue', 'users'],
        sample: [[2025, 10000, 500]],
      }),
    }),
  ],
});

(async () => {
  const result = await run(analysisAgent, 'Analyze Q4 sales data');
  const insight = result.finalOutput;
  
  console.log(`Report: ${insight.title}`);
  insight.key_findings.forEach(f => console.log(`- ${f}`));
})();
```

### Example 3: Streaming Chat Interface

```typescript
import { Agent, runStream } from '@openai/agents';

const chatAgent = new Agent({
  name: 'Chat Assistant',
  instructions: 'You are a helpful conversational AI.',
});

(async () => {
  const userMessage = 'Tell me about the future of AI';
  
  process.stdout.write('Agent: ');
  const stream = await runStream(chatAgent, userMessage);
  
  for await (const event of stream) {
    if (event.type === 'text') {
      process.stdout.write(event.content);
    }
  }
  
  console.log('\n');
})();
```

---

## Troubleshooting

### Issue: Agent Exceeds Max Turns

**Problem:** `MaxTurnsExceededError` thrown  
**Solution:** 
- Check if tools are entering infinite loops
- Verify tool results are meaningful and advance the task
- Increase `maxTurns` if the task legitimately requires more iterations
- Review agent instructions for clarity

### Issue: Guardrail Always Triggers

**Problem:** Guardrail blocks legitimate requests  
**Solution:**
- Review guardrail logic for false positives
- Adjust regex patterns or thresholds
- Use less aggressive filtering
- Log guardrail decisions for debugging

### Issue: Tool Calls Fail

**Problem:** `ToolExecutionError` during run  
**Solution:**
- Validate tool implementation handles all parameter combinations
- Add proper error handling within `execute()` function
- Check external API availability (if calling external services)
- Review tool schema matches actual parameters

### Issue: Slow Performance

**Problem:** Agent runs take too long  
**Solution:**
- Check tool execution times (use async tools efficiently)
- Reduce `modelSettings.maxTokens` if overly verbose
- Enable streaming for user-facing applications
- Review agent instructions for unnecessary complexity

---

## Version Management

### Current Version
- Latest: **0.2.1** (Oct 2025)
- Check installed: `npm ls @openai/agents`

### Breaking Changes
Review `CHANGELOG.md` or GitHub releases when upgrading. The SDK aims for stability, but major versions may introduce breaking changes.

### Upgrading

```bash
npm update @openai/agents
# or
npm install @openai/agents@latest
```

---

## Contributing & Support

- **GitHub Issues:** https://github.com/openai/openai-agents-js/issues
- **Discussions:** https://github.com/openai/openai-agents-js/discussions
- **Examples:** https://github.com/openai/openai-agents-js/tree/main/examples

---

## Resources

- **Official Docs:** https://openai.github.io/openai-agents-js/
- **NPM Package:** https://www.npmjs.com/package/@openai/agents
- **GitHub Repo:** https://github.com/openai/openai-agents-js
- **OpenAI Platform:** https://platform.openai.com
- **Python SDK:** https://github.com/openai/openai-agents-python

---

## License

MIT License - See LICENSE file in repository

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**SDK Version:** 0.2.1
