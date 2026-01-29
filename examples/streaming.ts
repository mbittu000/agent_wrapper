/**
 * Streaming Example - Real-time Response Streaming
 *
 * This example demonstrates how to stream responses from an AI agent,
 * getting text chunks as they are generated.
 *
 * Run with: bun run examples/streaming.ts
 */

import { AiAgent } from '../src/index';

// Create an agent
const agent = new AiAgent({
    key: process.env.OPENAI_API_KEY || 'your-api-key',
    name: 'StreamingAssistant',
    instructions: 'You are a creative storyteller. Tell engaging and detailed stories.',
    modelName: 'gpt-4o',
    modelSettings: {
        temperature: 1.2, // Higher for more creative output
    },
});

async function main() {
    console.log('Streaming response...\n');
    console.log('---');

    // Stream the response
    const stream = agent.runStream('Tell me a short story about a robot learning to dream.');

    for await (const event of stream) {
        switch (event.type) {
            case 'text':
                // Print text chunks as they arrive
                process.stdout.write(event.content || '');
                break;

            case 'tool_call':
                console.log(`\n[Tool Call: ${event.tool?.name}]`);
                break;

            case 'tool_result':
                console.log(`[Tool Result: ${JSON.stringify(event.result)}]`);
                break;

            case 'handoff':
                console.log(`\n[Handing off to: ${event.targetAgent}]`);
                break;

            case 'done':
                console.log('\n---');
                console.log('\nStream complete!');
                break;
        }
    }
}

main().catch(console.error);
