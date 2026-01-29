import { tool as openaiTool } from '@openai/agents';
import type { Tool } from '@openai/agents';
import type { z } from 'zod';

/**
 * Configuration for creating a tool
 */
export interface ToolConfig<T extends z.ZodType> {
    /** Unique name for the tool */
    name: string;
    /** Description of what the tool does (shown to the LLM) */
    description: string;
    /** Zod schema defining the tool's parameters */
    parameters: T;
    /** Function to execute when the tool is called */
    execute: (params: z.infer<T>) => Promise<unknown>;
}

/**
 * Re-export the original tool function from @openai/agents
 * Use this for full control over tool creation
 */
export const tool = openaiTool;

/**
 * Create a tool with simplified syntax
 *
 * This is a convenience wrapper around `@openai/agents` tool function
 * that provides better TypeScript inference.
 *
 * @param config - Tool configuration
 * @returns A Tool instance ready to use with AiAgent
 *
 * @example
 * ```typescript
 * import { z } from 'zod';
 * import { createTool } from 'agent_wrapper';
 *
 * const weatherTool = createTool({
 *   name: 'get_weather',
 *   description: 'Get the current weather for a city',
 *   parameters: z.object({
 *     city: z.string().describe('The city name'),
 *     unit: z.enum(['celsius', 'fahrenheit']).default('celsius'),
 *   }),
 *   execute: async ({ city, unit }) => {
 *     // Your weather API logic here
 *     return `The weather in ${city} is sunny, 22°${unit === 'celsius' ? 'C' : 'F'}`;
 *   },
 * });
 * ```
 */
export function createTool<T extends z.ZodType>(config: ToolConfig<T>): Tool {
    return openaiTool({
        name: config.name,
        description: config.description,
        parameters: config.parameters,
        execute: config.execute,
    });
}
