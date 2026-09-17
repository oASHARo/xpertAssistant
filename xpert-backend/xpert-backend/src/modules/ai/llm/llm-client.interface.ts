export interface LlmClient {
  complete(prompt: string, options?: { temperature?: number; maxTokens?: number; responseFormat?: 'json' }): Promise<string>;
}
