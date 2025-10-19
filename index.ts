import { Agent, run, setTracingDisabled, Tool } from "@openai/agents";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { aisdk } from "@openai/agents-extensions";

class AiAgent {
    // agent properties
    name: string;
    key: string;
    baseUrl: string;
    instructions: string;
    modelName: string;
    agent: Agent;
    tools: Tool[];
    constructor({
        name = 'Agent',
        key = '',
        baseUrl = 'https://api.openai.com/v1',
        instructions = 'You are a helpful assistant.',
        modelName = 'gpt-4',
        tools = []
    }: { name: string, key: string, baseUrl: string, instructions: string, modelName: string, tools: Tool[] }) {
        this.name = name;
        this.key = key;
        this.baseUrl = baseUrl;
        this.instructions = instructions;
        this.modelName = modelName;
        this.tools = tools;

        // disable tracing
        setTracingDisabled(true);
        // client setup
        const client = createOpenAICompatible({
            apiKey: this.key,
            baseURL: this.baseUrl,
            name: this.name,
        });
        // model setup
        const model = aisdk(client(this.modelName));
        // agent setup
        this.agent = new Agent({
            model: model,
            instructions: this.instructions,
            name: this.name,
            tools: this.tools,
        });
    }

    async runAgent(input: string) {
        const result = await run(this.agent, input);
        return result.finalOutput;
    }
}

export default AiAgent;