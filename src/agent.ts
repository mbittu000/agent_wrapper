import { Agent, run, setTracingDisabled } from '@openai/agents';
import type { Tool, StreamedRunResult } from '@openai/agents';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { aisdk } from '@openai/agents-extensions';
import type {
    AiAgentOptions,
    RunOptions,
    StreamEvent,
    Message,
    ModelSettings,
} from './types';

/**
 * AiAgent - A powerful wrapper for building AI agents
 *
 * @example
 * ```typescript
 * import { AiAgent } from 'agent_wrapper';
 *
 * const agent = new AiAgent({
 *   key: 'your-api-key',
 *   instructions: 'You are a helpful assistant.',
 * });
 *
 * const result = await agent.run('Hello!');
 * console.log(result);
 * ```
 */
export class AiAgent {
    /** Agent name */
    readonly name: string;
    /** API key */
    private readonly key: string;
    /** Base URL */
    readonly baseUrl: string;
    /** System instructions */
    readonly instructions: string;
    /** Model name */
    readonly modelName: string;
    /** Tools array */
    readonly tools: Tool[];
    /** Handoff agents */
    readonly handoffs: Agent<unknown>[];
    /** Handoff description */
    readonly handoffDescription?: string;
    /** Model settings */
    readonly modelSettings?: ModelSettings;
    /** The underlying OpenAI Agent instance */
    private readonly _agent: Agent<unknown>;

    /**
     * Create a new AiAgent instance
     */
    constructor(options: AiAgentOptions) {
        // Set required and optional properties with defaults
        this.name = options.name ?? 'Agent';
        this.key = options.key;
        this.baseUrl = options.baseUrl ?? 'https://api.openai.com/v1';

        // Handle instructions - convert function to string if needed
        const rawInstructions = options.instructions ?? 'You are a helpful assistant.';
        this.instructions = typeof rawInstructions === 'string'
            ? rawInstructions
            : 'You are a helpful assistant.';

        this.modelName = options.modelName ?? 'gpt-4o';
        this.tools = options.tools ?? [];
        this.handoffs = options.handoffs ?? [];
        this.handoffDescription = options.handoffDescription;
        this.modelSettings = options.modelSettings;

        // Configure tracing (disabled by default)
        setTracingDisabled(!(options.enableTracing ?? false));

        // Create OpenAI-compatible client
        const client = createOpenAICompatible({
            apiKey: this.key,
            baseURL: this.baseUrl,
            name: this.name,
        });

        // Create model wrapper
        const model = aisdk(client(this.modelName));

        // Create the underlying agent
        // Note: Using Agent.create for proper handoff support
        if (this.handoffs.length > 0) {
            this._agent = Agent.create({
                model,
                name: this.name,
                instructions: this.instructions,
                tools: this.tools,
                handoffs: this.handoffs,
                handoffDescription: this.handoffDescription,
                modelSettings: this.modelSettings,
            });
        } else {
            this._agent = new Agent({
                model,
                name: this.name,
                instructions: this.instructions,
                tools: this.tools,
                handoffDescription: this.handoffDescription,
                modelSettings: this.modelSettings,
            });
        }
    }

    /**
     * Run the agent with a single input and return the final output
     *
     * @param input - The prompt or query to send to the agent
     * @param options - Optional run configuration
     * @returns The agent's response
     *
     * @example
     * ```typescript
     * const result = await agent.run('What is the capital of France?');
     * console.log(result); // "The capital of France is Paris."
     * ```
     */
    async run(input: string, options?: RunOptions): Promise<string | undefined> {
        const result = await run(this._agent, input, {
            maxTurns: options?.maxTurns,
            context: options?.context,
        });
        return result.finalOutput as string | undefined;
    }

    /**
     * Run the agent with streaming, yielding events as they occur
     *
     * @param input - The prompt or query to send to the agent
     * @yields Stream events including text chunks, tool calls, and handoffs
     *
     * @example
     * ```typescript
     * for await (const event of agent.runStream('Tell me a story')) {
     *   if (event.type === 'text') {
     *     process.stdout.write(event.content);
     *   }
     * }
     * ```
     */
    async *runStream(input: string): AsyncGenerator<StreamEvent> {
        const streamedResult = await run(this._agent, input, { stream: true }) as StreamedRunResult<unknown, Agent<unknown>>;

        // Stream events as they come in
        for await (const event of streamedResult) {
            // Map internal event types to our StreamEvent format
            if (typeof event === 'object' && event !== null) {
                const eventObj = event as unknown as Record<string, unknown>;
                const eventType = eventObj.type as string;

                if (eventType === 'raw_model_stream_event') {
                    // Handle raw model streaming events
                    const data = eventObj.data as Record<string, unknown> | undefined;
                    if (data && data.delta) {
                        const delta = data.delta as Record<string, unknown>;
                        if (delta.content) {
                            yield {
                                type: 'text',
                                content: delta.content as string,
                            };
                        }
                    }
                } else if (eventType === 'run_item_stream_event') {
                    const item = eventObj.item as Record<string, unknown> | undefined;
                    if (item) {
                        const itemType = item.type as string;
                        if (itemType === 'tool_call_item') {
                            yield {
                                type: 'tool_call',
                                tool: {
                                    name: (item.rawItem as Record<string, unknown>)?.name as string || 'unknown',
                                    arguments: (item.rawItem as Record<string, unknown>)?.arguments,
                                },
                            };
                        } else if (itemType === 'tool_call_output_item') {
                            yield {
                                type: 'tool_result',
                                result: item.output,
                            };
                        } else if (itemType === 'handoff_output_item') {
                            yield {
                                type: 'handoff',
                                targetAgent: (item.targetAgent as Record<string, unknown>)?.name as string,
                            };
                        } else if (itemType === 'message_output_item') {
                            const rawItem = item.rawItem as Record<string, unknown> | undefined;
                            if (rawItem) {
                                const content = rawItem.content as Array<Record<string, unknown>> | undefined;
                                if (content) {
                                    for (const part of content) {
                                        if (part.type === 'output_text') {
                                            yield {
                                                type: 'text',
                                                content: part.text as string,
                                            };
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        yield { type: 'done' };
    }

    /**
     * Run the agent with conversation history
     *
     * @param messages - Array of messages representing the conversation
     * @param options - Optional run configuration
     * @returns The agent's response
     *
     * @example
     * ```typescript
     * const history = [
     *   { role: 'user', content: 'My name is Alice' },
     *   { role: 'assistant', content: 'Nice to meet you, Alice!' },
     *   { role: 'user', content: 'What is my name?' },
     * ];
     * const result = await agent.runWithHistory(history);
     * console.log(result); // "Your name is Alice."
     * ```
     */
    async runWithHistory(
        messages: Message[],
        options?: RunOptions
    ): Promise<string | undefined> {
        // Convert messages to the format expected by the SDK
        const formattedMessages = messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
        }));

        const result = await run(this._agent, formattedMessages, {
            maxTurns: options?.maxTurns,
            context: options?.context,
        });

        return result.finalOutput as string | undefined;
    }

    /**
     * Get the underlying Agent instance for advanced use cases
     *
     * @returns The OpenAI Agent instance
     *
     * @example
     * ```typescript
     * const underlyingAgent = agent.getAgent();
     * // Use with other @openai/agents functions directly
     * ```
     */
    getAgent(): Agent<unknown> {
        return this._agent;
    }

    /**
     * @deprecated Use `run()` instead. This method is provided for backwards compatibility.
     */
    async runAgent(input: string): Promise<string | undefined> {
        return this.run(input);
    }
}
