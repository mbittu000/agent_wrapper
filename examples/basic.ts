/**
 * Basic Example - Simple Agent Usage
 *
 * This example demonstrates the simplest way to create and run an AI agent.
 *
 * Run with: bun run examples/basic.ts
 */

import { AiAgent } from '../src/index';

// Create a simple agent
const agent = new AiAgent({
    key: process.env.OPENAI_API_KEY || 'your-api-key',
    name: 'BasicAssistant',
    instructions: 'You are a helpful and friendly assistant. Answer questions clearly and concisely.',
    modelName: 'gpt-4o',
});

async function main() {
    console.log('Running basic agent...\n');

    // Simple question
    const result = await agent.run('What is the capital of France?');
    console.log('Response:', result);
    console.log();

    // Follow-up using history
    const history = [
        { role: 'user' as const, content: 'My name is Alice' },
        { role: 'assistant' as const, content: 'Nice to meet you, Alice!' },
        { role: 'user' as const, content: 'What is my name?' },
    ];

    const historyResult = await agent.runWithHistory(history);
    console.log('With history:', historyResult);
}

main().catch(console.error);
