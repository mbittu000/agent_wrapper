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
export { createTool, tool, computer, shell, applyPatch, connectToMCPServers, getMCPToolsFromServer, getToolsFromMCPServers, computerTool, shellTool, applyPatchTool, connectMcpServers, getAllMcpTools, mcpToFunctionTool, MCPServerStdio, MCPServerSSE, MCPServerStreamableHttp, MCPServers } from './tools';
export type { ToolConfig } from './tools';
export type { MCPServer } from '@openai/agents-core';

// Guardrail helpers
export { createInputGuardrail, createOutputGuardrail } from './guardrails';
export type { GuardrailConfig, GuardrailResult } from './guardrails';

// Realtime/Voice agent support
export { VoiceAgent, RealtimeAgent, RealtimeSession, DEFAULT_OPENAI_REALTIME_MODEL } from './realtime';
export type { RealtimeAgentOptions, RealtimeSessionConnectOptions, RealtimeAgentConfiguration, RealtimeContextData } from './realtime';

// Multi-model provider support
export { createCompatibleModel, createOllamaModel, createTogetherAIModel, createHuggingFaceModel, createReplicateModel, createOpenAICompatible, aisdk } from './providers';
export type { OpenAICompatibleProviderOptions, OllamaOptions, TogetherAIOptions, HuggingFaceOptions, ReplicateOptions, AiSdkModel } from './providers';

// Type re-exports from @openai/agents
export type {
    Agent,
    Tool,
    RunContext,
    Model,
    Runner,
    StreamedRunResult,
    RunResult,
    CoreModelSettings,
} from './types';
