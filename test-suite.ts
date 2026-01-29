/**
 * Comprehensive Test Suite for Agent Wrapper SDK
 */

import {
    AiAgent,
    createTool,
    tool,
    createInputGuardrail,
    createOutputGuardrail,
} from './src/index';
import { z } from 'zod';

console.log('🧪 Agent Wrapper SDK - Comprehensive Test Suite\n');
console.log('================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function test(name: string, fn: () => boolean | Promise<boolean>) {
    try {
        const result = fn();
        if (result instanceof Promise) {
            return result.then((r) => {
                if (r) {
                    console.log(`  ✅ ${name}`);
                    testsPassed++;
                } else {
                    console.log(`  ❌ ${name}`);
                    testsFailed++;
                }
            });
        }
        if (result) {
            console.log(`  ✅ ${name}`);
            testsPassed++;
        } else {
            console.log(`  ❌ ${name}`);
            testsFailed++;
        }
    } catch (e) {
        console.log(`  ❌ ${name} - Error: ${e}`);
        testsFailed++;
    }
}

async function runTests() {
    // === Test 1: Imports ===
    console.log('1️⃣  Import Tests');
    test('AiAgent is a function', () => typeof AiAgent === 'function');
    test('createTool is a function', () => typeof createTool === 'function');
    test('tool is a function', () => typeof tool === 'function');
    test('createInputGuardrail is a function', () => typeof createInputGuardrail === 'function');
    test('createOutputGuardrail is a function', () => typeof createOutputGuardrail === 'function');
    console.log();

    // === Test 2: Tool Creation ===
    console.log('2️⃣  Tool Creation Tests');
    const testTool = createTool({
        name: 'test_tool',
        description: 'A test tool',
        parameters: z.object({
            message: z.string(),
        }),
        execute: async ({ message }) => `Echo: ${message}`,
    });
    test('Tool has correct name', () => testTool.name === 'test_tool');
    test('Tool is an object', () => typeof testTool === 'object');
    console.log();

    // === Test 3: Agent Creation ===
    console.log('3️⃣  Agent Creation Tests');
    const agent = new AiAgent({
        key: 'test-key',
        name: 'TestAgent',
        instructions: 'Test instructions',
        modelName: 'gpt-4o',
        tools: [testTool],
        modelSettings: {
            temperature: 0.7,
            maxTokens: 1000,
        },
    });
    test('Agent has correct name', () => agent.name === 'TestAgent');
    test('Agent has correct baseUrl', () => agent.baseUrl === 'https://api.openai.com/v1');
    test('Agent has correct instructions', () => agent.instructions === 'Test instructions');
    test('Agent has correct modelName', () => agent.modelName === 'gpt-4o');
    test('Agent has tools', () => agent.tools.length === 1);
    test('Agent has modelSettings', () => agent.modelSettings?.temperature === 0.7);
    test('Agent has run method', () => typeof agent.run === 'function');
    test('Agent has runStream method', () => typeof agent.runStream === 'function');
    test('Agent has runWithHistory method', () => typeof agent.runWithHistory === 'function');
    test('Agent has getAgent method', () => typeof agent.getAgent === 'function');
    test('Agent has deprecated runAgent method', () => typeof agent.runAgent === 'function');
    console.log();

    // === Test 4: Guardrail Creation ===
    console.log('4️⃣  Guardrail Creation Tests');
    const inputGuard = createInputGuardrail({
        name: 'test_input_guard',
        description: 'Test input guardrail',
        guardFunction: async (_ctx, input) => ({
            tripwireTriggered: input.includes('blocked'),
            output: input.includes('blocked') ? 'Blocked!' : 'OK',
        }),
    });
    test('Input guardrail has correct name', () => inputGuard.name === 'test_input_guard');
    test('Input guardrail has guard function', () => typeof inputGuard.guardFunction === 'function');

    // Test guardrail execution
    const guardResult1 = await inputGuard.guardFunction({} as any, 'normal input');
    test('Input guardrail allows normal input', () => !guardResult1.tripwireTriggered);

    const guardResult2 = await inputGuard.guardFunction({} as any, 'this should be blocked');
    test('Input guardrail blocks bad input', () => guardResult2.tripwireTriggered);

    const outputGuard = createOutputGuardrail({
        name: 'test_output_guard',
        description: 'Test output guardrail',
        guardFunction: async (_ctx, output) => ({
            tripwireTriggered: output.includes('secret'),
            output: output.includes('secret') ? 'Blocked!' : 'OK',
        }),
    });
    test('Output guardrail has correct name', () => outputGuard.name === 'test_output_guard');
    console.log();

    // === Test 5: Agent with Handoffs ===
    console.log('5️⃣  Agent with Handoffs Tests');
    const specialistAgent = new AiAgent({
        key: 'test-key',
        name: 'Specialist',
        instructions: 'You are a specialist',
        handoffDescription: 'Handles special tasks',
    });
    test('Specialist agent has handoff description', () => specialistAgent.handoffDescription === 'Handles special tasks');

    const routerAgent = new AiAgent({
        key: 'test-key',
        name: 'Router',
        instructions: 'Route to specialists',
        handoffs: [specialistAgent.getAgent()],
    });
    test('Router agent has handoffs', () => routerAgent.handoffs.length === 1);
    console.log();

    // === Test 6: Default Values ===
    console.log('6️⃣  Default Value Tests');
    const minimalAgent = new AiAgent({
        key: 'minimal-key',
    });
    test('Default name is Agent', () => minimalAgent.name === 'Agent');
    test('Default baseUrl is OpenAI', () => minimalAgent.baseUrl === 'https://api.openai.com/v1');
    test('Default instructions exist', () => minimalAgent.instructions === 'You are a helpful assistant.');
    test('Default modelName is gpt-4o', () => minimalAgent.modelName === 'gpt-4o');
    test('Default tools is empty array', () => minimalAgent.tools.length === 0);
    test('Default handoffs is empty array', () => minimalAgent.handoffs.length === 0);
    console.log();

    // === Summary ===
    console.log('================================================');
    console.log(`\n📊 Test Results: ${testsPassed} passed, ${testsFailed} failed`);
    console.log();

    if (testsFailed === 0) {
        console.log('🎉 All tests passed!\n');
    } else {
        console.log('⚠️  Some tests failed.\n');
        process.exit(1);
    }
}

runTests().catch(console.error);
