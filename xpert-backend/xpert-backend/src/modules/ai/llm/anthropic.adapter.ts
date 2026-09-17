import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../../config/env.js';
import type { LlmClient } from './llm-client.interface.js';

export class AnthropicAdapter implements LlmClient {
  private readonly client = new Anthropic({ apiKey: config.LLM_ANTHROPIC_API_KEY ?? config.LLM_API_KEY });
  async complete(prompt: string, options: { temperature?: number; maxTokens?: number; responseFormat?: 'json' } = {}) {
    const response = await this.client.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: options.maxTokens ?? 2000,
      temperature: options.temperature ?? 0.2,
      system: options.responseFormat === 'json' ? 'Return only valid JSON.' : undefined,
      messages: [{ role: 'user', content: prompt }],
    });
    const block = response.content.find((item) => item.type === 'text');
    return block?.type === 'text' ? block.text : '';
  }
}
