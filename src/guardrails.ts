import type { RunContext } from '@openai/agents';
import type { GuardrailFunction, GuardrailFunctionResult } from './types';

/**
 * Configuration for creating a guardrail
 */
export interface GuardrailConfig {
    /** Unique name for the guardrail */
    name: string;
    /** Description of what the guardrail checks */
    description: string;
    /** Function that performs the validation */
    guardFunction: (
        context: RunContext<unknown>,
        input: string
    ) => Promise<GuardrailResult>;
}

/**
 * Result returned by a guardrail check
 */
export interface GuardrailResult {
    /** If true, execution is halted with an error */
    tripwireTriggered: boolean;
    /** Message describing the result (shown if triggered) */
    output: string;
}

/**
 * Create an input guardrail to validate user input before it reaches the agent
 *
 * Input guardrails run before the agent processes the input. If the guardrail
 * triggers (returns tripwireTriggered: true), execution is halted.
 *
 * @param config - Guardrail configuration
 * @returns A guardrail function to use with AiAgent
 *
 * @example
 * ```typescript
 * import { createInputGuardrail, AiAgent } from 'agent_wrapper';
 *
 * const blockMaliciousInput = createInputGuardrail({
 *   name: 'malicious_input_guard',
 *   description: 'Blocks attempts to exploit the agent',
 *   guardFunction: async (context, input) => {
 *     const isMalicious = input.includes('DROP TABLE') || input.includes('exec(');
 *     return {
 *       tripwireTriggered: isMalicious,
 *       output: isMalicious ? 'Blocked: Suspicious input detected' : 'OK',
 *     };
 *   },
 * });
 *
 * const agent = new AiAgent({
 *   key: 'your-api-key',
 *   instructions: 'You are a helpful assistant.',
 *   inputGuardrails: [blockMaliciousInput],
 * });
 * ```
 */
export function createInputGuardrail(config: GuardrailConfig): GuardrailFunction {
    return {
        name: config.name,
        description: config.description,
        guardFunction: async (
            context: RunContext<unknown>,
            input: string
        ): Promise<GuardrailFunctionResult> => {
            const result = await config.guardFunction(context, input);
            return {
                tripwireTriggered: result.tripwireTriggered,
                output: result.output,
            };
        },
    };
}

/**
 * Create an output guardrail to validate agent responses before returning
 *
 * Output guardrails run after the agent generates a response. If the guardrail
 * triggers (returns tripwireTriggered: true), execution is halted and the
 * response is blocked.
 *
 * @param config - Guardrail configuration
 * @returns A guardrail function to use with AiAgent
 *
 * @example
 * ```typescript
 * import { createOutputGuardrail, AiAgent } from 'agent_wrapper';
 *
 * const filterSensitiveData = createOutputGuardrail({
 *   name: 'sensitive_data_filter',
 *   description: 'Removes email addresses and phone numbers',
 *   guardFunction: async (context, output) => {
 *     const hasEmail = /@/.test(output);
 *     const hasPhone = /\d{3}-\d{3}-\d{4}/.test(output);
 *
 *     if (hasEmail || hasPhone) {
 *       return {
 *         tripwireTriggered: true,
 *         output: 'Blocked: Output contains sensitive data',
 *       };
 *     }
 *
 *     return {
 *       tripwireTriggered: false,
 *       output: 'OK',
 *     };
 *   },
 * });
 *
 * const agent = new AiAgent({
 *   key: 'your-api-key',
 *   instructions: 'You are a helpful assistant.',
 *   outputGuardrails: [filterSensitiveData],
 * });
 * ```
 */
export function createOutputGuardrail(config: GuardrailConfig): GuardrailFunction {
    return {
        name: config.name,
        description: config.description,
        guardFunction: async (
            context: RunContext<unknown>,
            output: string
        ): Promise<GuardrailFunctionResult> => {
            const result = await config.guardFunction(context, output);
            return {
                tripwireTriggered: result.tripwireTriggered,
                output: result.output,
            };
        },
    };
}
