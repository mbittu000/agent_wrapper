import type { z } from 'zod';
import type {
    Agent as OpenAIAgent,
    Tool as OpenAITool,
    RunContext as OpenAIRunContext,
} from '@openai/agents';

/**
 * Model settings for fine-tuning agent behavior
 */
export interface ModelSettings {
    /** Temperature for response randomness (0.0-2.0, default 1.0) */
    temperature?: number;
    /** Maximum tokens in response */
    maxTokens?: number;
    /** Top-p sampling parameter */
    topP?: number;
    /** Frequency penalty (-2.0 to 2.0) */
    frequencyPenalty?: number;
    /** Presence penalty (-2.0 to 2.0) */
    presencePenalty?: number;
}

/**
 * Configuration options for creating an AiAgent
 */
export interface AiAgentOptions {
    /** Unique identifier for your agent */
    name?: string;
    /** API key for authentication (required) */
    key: string;
    /** Base URL of the API endpoint */
    baseUrl?: string;
    /** System prompt that defines agent behavior */
    instructions?: string;
    /** Model identifier (e.g., 'gpt-4o', 'gpt-4') */
    modelName?: string;
    /** Array of tools for the agent to use */
    tools?: OpenAITool[];
    /** Array of agents this agent can hand off to */
    handoffs?: OpenAIAgent<unknown>[];
    /** Description when this agent is used as a handoff target */
    handoffDescription?: string;
    /** Zod schema for structured output validation */
    outputType?: z.ZodSchema;
    /** Model settings (temperature, maxTokens, etc.) */
    modelSettings?: ModelSettings;
    /** Enable/disable tracing (default: false) */
    enableTracing?: boolean;
}

/**
 * Options for running the agent
 */
export interface RunOptions {
    /** Maximum agent loop iterations (default: 100) */
    maxTurns?: number;
    /** Custom context object */
    context?: unknown;
}

/**
 * Guardrail function type
 */
export interface GuardrailFunction {
    name: string;
    description: string;
    guardFunction: (
        context: OpenAIRunContext<unknown>,
        input: string
    ) => Promise<GuardrailFunctionResult>;
}

/**
 * Result from a guardrail function
 */
export interface GuardrailFunctionResult {
    /** If true, halts execution with an error */
    tripwireTriggered: boolean;
    /** Message or result from the guardrail */
    output: string;
}

/**
 * Events emitted during streaming
 */
export interface StreamEvent {
    /** Event type */
    type: 'text' | 'tool_call' | 'tool_result' | 'handoff' | 'done';
    /** Text content (for 'text' type) */
    content?: string;
    /** Tool information (for 'tool_call' type) */
    tool?: {
        name: string;
        arguments?: unknown;
    };
    /** Tool result (for 'tool_result' type) */
    result?: unknown;
    /** Target agent name (for 'handoff' type) */
    targetAgent?: string;
}

/**
 * Message format for conversation history
 */
export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

// Re-export types from @openai/agents
export type Agent = OpenAIAgent<unknown>;
export type Tool = OpenAITool;
export type RunContext = OpenAIRunContext<unknown>;

// Re-export from agents-core
export type { Model, ModelSettings as CoreModelSettings, Runner, StreamedRunResult, RunResult } from '@openai/agents-core';
