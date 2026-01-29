/**
 * Multi-Agent Example - Agent Handoffs
 *
 * This example demonstrates how to create multiple specialized agents
 * that can hand off tasks to each other.
 *
 * Run with: bun run examples/multi-agent.ts
 */

import { Agent } from '@openai/agents';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { aisdk } from '@openai/agents-extensions';
import { AiAgent, createTool } from '../src/index';
import { z } from 'zod';

const apiKey = process.env.OPENAI_API_KEY || 'your-api-key';

// Create OpenAI-compatible client for specialist agents
const client = createOpenAICompatible({
    apiKey,
    baseURL: 'https://api.openai.com/v1',
    name: 'OpenAI',
});
const model = aisdk(client('gpt-4o'));

// Tool for the billing agent
const checkInvoiceTool = createTool({
    name: 'check_invoice',
    description: 'Look up an invoice by ID',
    parameters: z.object({
        invoiceId: z.string().describe('The invoice ID to look up'),
    }),
    execute: async ({ invoiceId }) => {
        // Simulated invoice lookup
        return `Invoice ${invoiceId}: $99.99 due on 2026-02-15. Status: Unpaid.`;
    },
});

// Tool for the technical support agent
const checkSystemStatusTool = createTool({
    name: 'check_system_status',
    description: 'Check if a service is operational',
    parameters: z.object({
        service: z.string().describe('The service name to check'),
    }),
    execute: async ({ service }) => {
        // Simulated status check
        return `${service} is operational. Uptime: 99.9%. No issues reported.`;
    },
});

// Create specialist agents
const billingAgent = new Agent({
    model,
    name: 'Billing Support',
    instructions: `You are a billing support specialist. Help customers with:
- Invoice inquiries
- Payment issues
- Account balances
- Billing disputes

Use the check_invoice tool to look up invoice information.`,
    handoffDescription: 'Specialist in billing, invoices, and payment questions.',
    tools: [checkInvoiceTool],
});

const techAgent = new Agent({
    model,
    name: 'Technical Support',
    instructions: `You are a technical support specialist. Help customers with:
- System issues
- API problems
- Service outages
- Technical troubleshooting

Use the check_system_status tool to verify service status.`,
    handoffDescription: 'Specialist in technical issues and troubleshooting.',
    tools: [checkSystemStatusTool],
});

// Create the main router agent using AiAgent
const routerAgent = new AiAgent({
    key: apiKey,
    name: 'Customer Service',
    instructions: `You are a customer service router. Your job is to:
1. Understand the customer's issue
2. Route them to the appropriate specialist:
   - Billing questions (invoices, payments, accounts) → Billing Support
   - Technical issues (bugs, outages, API problems) → Technical Support
3. If the query doesn't fit either category, handle it yourself with general assistance.

Be friendly and helpful. Always explain who you're transferring them to and why.`,
    modelName: 'gpt-4o',
    handoffs: [billingAgent, techAgent],
});

async function main() {
    console.log('Multi-Agent Customer Service Example\n');
    console.log('=====================================\n');

    const queries = [
        'I need help with my invoice from last month. The ID is INV-12345.',
        'The API is returning 500 errors when I try to upload files.',
        'What are your business hours?',
    ];

    for (const query of queries) {
        console.log(`Customer: "${query}"\n`);

        try {
            const response = await routerAgent.run(query, { maxTurns: 10 });
            console.log(`Response: ${response}\n`);
        } catch (error) {
            console.error('Error:', error);
        }

        console.log('---\n');
    }
}

main().catch(console.error);
