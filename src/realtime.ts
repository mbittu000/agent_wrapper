import { RealtimeAgent, RealtimeSession, DEFAULT_OPENAI_REALTIME_MODEL } from '@openai/agents-realtime';
import type { Tool } from '@openai/agents';

export interface RealtimeAgentOptions {
    name: string;
    instructions?: string;
    voice?: string;
    handoffs?: RealtimeAgent[];
    tools?: Tool[];
}

export interface RealtimeSessionConnectOptions {
    apiKey: string;
    model?: string;
}

export class VoiceAgent {
    private _agent: RealtimeAgent;
    private _session: RealtimeSession | null = null;
    readonly name: string;
    readonly instructions: string;
    readonly voice: string;
    readonly tools: Tool[];

    constructor(options: RealtimeAgentOptions) {
        this.name = options.name;
        this.instructions = options.instructions ?? 'You are a helpful voice assistant.';
        this.voice = options.voice ?? 'alloy';
        this.tools = options.tools ?? [];

        this._agent = new RealtimeAgent({
            name: this.name,
            instructions: this.instructions,
            voice: this.voice,
            tools: this.tools,
            handoffs: options.handoffs,
        });
    }

    getAgent(): RealtimeAgent {
        return this._agent;
    }

    async createSession(options: RealtimeSessionConnectOptions): Promise<RealtimeSession> {
        this._session = new RealtimeSession(this._agent);
        
        await this._session.connect({
            apiKey: options.apiKey,
            model: options.model ?? DEFAULT_OPENAI_REALTIME_MODEL,
        });
        
        return this._session;
    }

    getSession(): RealtimeSession | null {
        return this._session;
    }
}

export { RealtimeAgent, RealtimeSession, DEFAULT_OPENAI_REALTIME_MODEL };
export type { RealtimeAgentConfiguration, RealtimeSessionOptions, RealtimeContextData } from '@openai/agents-realtime';
