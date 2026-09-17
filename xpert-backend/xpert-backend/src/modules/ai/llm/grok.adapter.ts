import OpenAI from 'openai';
import { config } from '../../../config/env.js';
import type { LlmClient } from './llm-client.interface.js';

export class GrokAdapter implements LlmClient {
  private readonly apiKey = config.LLM_GROK_API_KEY ?? config.LLM_API_KEY ?? '';
  private readonly isGroqKey = this.apiKey.startsWith('gsk_');
  private readonly client = new OpenAI({
    apiKey: this.apiKey,
    baseURL: this.isGroqKey ? 'https://api.groq.com/openai/v1' : config.LLM_GROK_BASE_URL,
    timeout: 25_000,
  });

  async complete(prompt: string, options: { temperature?: number; maxTokens?: number; responseFormat?: 'json' } = {}) {
    const response = await this.client.chat.completions.create({
      model: this.isGroqKey ? 'openai/gpt-oss-120b' : config.LLM_GROK_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 2000,
      ...(options.responseFormat === 'json' ? { response_format: { type: 'json_object' as const } } : {}),
    });
    return response.choices[0]?.message.content ?? '';
  }
}
