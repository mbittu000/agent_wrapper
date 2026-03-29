import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { aisdk } from '@openai/agents-extensions/ai-sdk';
import type { Model } from '@openai/agents-core';

export interface OpenAICompatibleProviderOptions {
    name: string;
    apiKey?: string;
    baseURL: string;
    headers?: Record<string, string>;
}

export function createCompatibleModel(provider: OpenAICompatibleProviderOptions, modelName: string): Model {
    const client = createOpenAICompatible({
        name: provider.name,
        apiKey: provider.apiKey,
        baseURL: provider.baseURL,
        headers: provider.headers,
    });
    return aisdk(client(modelName));
}

export interface OllamaOptions {
    baseURL?: string;
    apiKey?: string;
}

export function createOllamaModel(options: OllamaOptions = {}, modelName: string = 'llama3'): Model {
    return createCompatibleModel({
        name: 'ollama',
        apiKey: options.apiKey,
        baseURL: options.baseURL ?? 'http://localhost:11434/v1',
    }, modelName);
}

export interface TogetherAIOptions {
    apiKey?: string;
}

export function createTogetherAIModel(options: TogetherAIOptions, modelName: string): Model {
    return createCompatibleModel({
        name: 'together-ai',
        apiKey: options.apiKey,
        baseURL: 'https://api.together.ai/v1',
    }, modelName);
}

export interface HuggingFaceOptions {
    apiKey?: string;
}

export function createHuggingFaceModel(options: HuggingFaceOptions, modelName: string): Model {
    return createCompatibleModel({
        name: 'huggingface',
        apiKey: options.apiKey,
        baseURL: 'https://api-inference.huggingface.co/v1',
    }, modelName);
}

export interface ReplicateOptions {
    apiKey?: string;
}

export function createReplicateModel(options: ReplicateOptions, modelName: string): Model {
    return createCompatibleModel({
        name: 'replicate',
        apiKey: options.apiKey,
        baseURL: 'https://api.replicate.com/v1',
    }, modelName);
}

export { createOpenAICompatible, aisdk };
export type { AiSdkModel } from '@openai/agents-extensions/ai-sdk';
