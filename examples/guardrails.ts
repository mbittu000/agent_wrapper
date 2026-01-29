/**
 * Guardrails Example - Input/Output Validation
 *
 * This example demonstrates how to use guardrails to validate
 * user input and agent output for safety and compliance.
 *
 * NOTE: This example shows the guardrail helper functions for reference.
 * Full guardrail integration with the AiAgent class requires the SDK
 * to pass guardrails to the underlying @openai/agents Runner.
 *
 * Run with: bun run examples/guardrails.ts
 */

import { AiAgent, createInputGuardrail, createOutputGuardrail } from '../src/index';

// Create an input guardrail to block potentially malicious inputs
const blockMaliciousInput = createInputGuardrail({
    name: 'malicious_input_guard',
    description: 'Blocks SQL injection and code execution attempts',
    guardFunction: async (_context, input) => {
        const maliciousPatterns = [
            /DROP\s+TABLE/i,
            /DELETE\s+FROM/i,
            /exec\s*\(/i,
            /eval\s*\(/i,
            /<script>/i,
        ];

        const isMalicious = maliciousPatterns.some((pattern) => pattern.test(input));

        return {
            tripwireTriggered: isMalicious,
            output: isMalicious
                ? 'Blocked: Input contains potentially dangerous patterns'
                : 'OK',
        };
    },
});

// Create an input guardrail to filter inappropriate content
const contentFilter = createInputGuardrail({
    name: 'content_filter',
    description: 'Filters inappropriate or off-topic requests',
    guardFunction: async (_context, input) => {
        const offTopicPatterns = [
            /how to hack/i,
            /illegal/i,
            /bypass security/i,
        ];

        const isOffTopic = offTopicPatterns.some((pattern) => pattern.test(input));

        return {
            tripwireTriggered: isOffTopic,
            output: isOffTopic
                ? 'Blocked: Request appears to be off-topic or inappropriate'
                : 'OK',
        };
    },
});

// Create an output guardrail to filter sensitive data
const sensitiveDataFilter = createOutputGuardrail({
    name: 'sensitive_data_filter',
    description: 'Prevents leaking email addresses and phone numbers',
    guardFunction: async (_context, output) => {
        const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;

        const hasEmail = emailPattern.test(output);
        const hasPhone = phonePattern.test(output);

        if (hasEmail || hasPhone) {
            return {
                tripwireTriggered: true,
                output: 'Blocked: Response contains sensitive personal information',
            };
        }

        return {
            tripwireTriggered: false,
            output: 'OK',
        };
    },
});

// Create an agent (guardrails shown for demonstration)
const agent = new AiAgent({
    key: process.env.OPENAI_API_KEY || 'your-api-key',
    name: 'GuardedAssistant',
    instructions: `You are a helpful assistant for a customer support system.
Answer questions about general topics, products, and services.
Never share personal information like email addresses or phone numbers.`,
    modelName: 'gpt-4o',
});

// Helper function to manually apply input guardrail
async function checkInput(input: string): Promise<{ blocked: boolean; message: string }> {
    const maliciousResult = await blockMaliciousInput.guardFunction({} as any, input);
    if (maliciousResult.tripwireTriggered) {
        return { blocked: true, message: maliciousResult.output };
    }

    const contentResult = await contentFilter.guardFunction({} as any, input);
    if (contentResult.tripwireTriggered) {
        return { blocked: true, message: contentResult.output };
    }

    return { blocked: false, message: 'OK' };
}

async function main() {
    console.log('Guardrails Example\n');
    console.log('==================\n');

    const testInputs = [
        // Normal query - should pass
        'What are your store hours?',

        // Malicious query - should be blocked by input guardrail
        "DROP TABLE users; SELECT * FROM passwords",

        // Off-topic query - should be blocked by content filter
        'How to hack into a system?',

        // Normal query
        'Tell me about your return policy.',
    ];

    for (const input of testInputs) {
        console.log(`Input: "${input}"`);

        // Check input guardrails manually
        const check = await checkInput(input);
        if (check.blocked) {
            console.log(`Blocked: ${check.message}\n`);
            console.log('---\n');
            continue;
        }

        try {
            const response = await agent.run(input);
            console.log(`Response: ${response}\n`);
        } catch (error) {
            if (error instanceof Error) {
                console.log(`Error: ${error.message}\n`);
            }
        }

        console.log('---\n');
    }
}

main().catch(console.error);
