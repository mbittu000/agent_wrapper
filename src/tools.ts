import { tool as openaiTool, computerTool, shellTool, applyPatchTool } from '@openai/agents-core';
import { connectMcpServers, getAllMcpTools, mcpToFunctionTool, MCPServerStdio, MCPServerSSE, MCPServerStreamableHttp, MCPServers, type MCPServer } from '@openai/agents-core';
import type { Tool } from '@openai/agents';
import type { z } from 'zod';

export interface ToolConfig<T extends z.ZodType> {
    name: string;
    description: string;
    parameters: T;
    execute: (params: z.infer<T>) => Promise<unknown>;
}

export const tool = openaiTool;

export const computer = computerTool;

export const shell = shellTool;

export const applyPatch = applyPatchTool;

export function createTool<T extends z.ZodType>(config: ToolConfig<T>): Tool {
    return openaiTool({
        name: config.name,
        description: config.description,
        parameters: config.parameters as any,
        execute: config.execute as any,
        strict: true,
    });
}

export async function connectToMCPServers(servers: MCPServer[]): Promise<MCPServers> {
    return connectMcpServers(servers);
}

export async function getMCPToolsFromServer(server: MCPServer): Promise<Tool[]> {
    return getAllMcpTools([server]);
}

export async function getToolsFromMCPServers(mcpServers: MCPServers): Promise<Tool[]> {
    const allTools: Tool[] = [];
    for (const server of mcpServers.all) {
        const tools = await getAllMcpTools([server]);
        allTools.push(...tools);
    }
    return allTools;
}

export { computerTool, shellTool, applyPatchTool };
export { connectMcpServers, getAllMcpTools, mcpToFunctionTool, MCPServerStdio, MCPServerSSE, MCPServerStreamableHttp, MCPServers };
export type { MCPServer } from '@openai/agents-core';
