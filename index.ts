import { Agent, run,setTracingDisabled } from "@openai/agents";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { aisdk } from "@openai/agents-extensions";

class AgentTemplate {
    // agent properties
    name: string;
    key: string;
    baseUrl: string;
    instructions: string;
    modelName: string;
    agent: Agent;

    constructor(name: string, key: string, baseUrl: string, instructions: string, modelName: string) {
        this.name = name;
        this.key = key;
        this.baseUrl = baseUrl;
        this.instructions = instructions;
        this.modelName = modelName;

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
        this.agent=new Agent({
            model: model,
            instructions: this.instructions,
            name: this.name,
        });
    }

    async runAgent(input: string) {
        const result = await run(this.agent, input);
        return result.finalOutput;
    }
}

export default AgentTemplate;