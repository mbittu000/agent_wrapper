/**
 * Agent Wrapper SDK
 * A powerful, lightweight SDK for building AI agents with OpenAI Agents SDK.
 *
 * @packageDocumentation
 */

// Main agent class
export { AiAgent } from './agent';
export type { AiAgentOptions, RunOptions, StreamEvent } from './types';

// Tool helpers
export { createTool, tool } from './tools';
export type { ToolConfig } from './tools';

// Guardrail helpers
export { createInputGuardrail, createOutputGuardrail } from './guardrails';
export type { GuardrailConfig, GuardrailResult } from './guardrails';

// Type re-exports from @openai/agents
export type {
    Agent,
    Tool,
    RunContext,
} from './types';

// Default export for backwards compatibility
export { AiAgent as default } from './agent';
