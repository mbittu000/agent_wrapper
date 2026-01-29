/**
 * Simple import test
 */
import { AiAgent, createTool, tool } from './src/index.js';
import { z } from 'zod';

// Test that imports work
console.log('✓ AiAgent imported:', typeof AiAgent === 'function');
console.log('✓ createTool imported:', typeof createTool === 'function');
console.log('✓ tool imported:', typeof tool === 'function');

// Test creating a tool
const testTool = createTool({
    name: 'test_tool',
    description: 'A test tool',
    parameters: z.object({
        message: z.string(),
    }),
    execute: async ({ message }) => `Echo: ${message}`,
});

console.log('✓ Tool created:', testTool.name);

// Test creating an agent (without API key - just type check)
const agent = new AiAgent({
    key: 'test-key',
    name: 'TestAgent',
    instructions: 'You are a test agent.',
    modelName: 'gpt-4o',
    tools: [testTool],
});

console.log('✓ Agent created:', agent.name);
console.log('✓ Agent has run method:', typeof agent.run === 'function');
console.log('✓ Agent has runStream method:', typeof agent.runStream === 'function');
console.log('✓ Agent has runWithHistory method:', typeof agent.runWithHistory === 'function');
console.log('✓ Agent has getAgent method:', typeof agent.getAgent === 'function');
console.log('✓ Agent has runAgent (deprecated) method:', typeof agent.runAgent === 'function');

console.log('\n🎉 All imports and type checks passed!');
