import OpenAI from 'openai';
import { config } from '../../../config/env.js';
import type { LlmClient } from './llm-client.interface.js';

export class OpenAiAdapter implements LlmClient {
  private readonly client = new OpenAI({ apiKey: config.LLM_OPENAI_API_KEY ?? config.LLM_API_KEY, timeout: 25_000 });
  async complete(prompt: string, options: { temperature?: number; maxTokens?: number; responseFormat?: 'json' } = {}) {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature ?? 0.0,
      max_tokens: options.maxTokens ?? 2000,
      ...(options.responseFormat === 'json' ? { response_format: { type: 'json_object' as const } } : {}),
    });
    return response.choices[0]?.message.content ?? '';
  }
}
