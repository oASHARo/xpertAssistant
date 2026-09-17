import { config } from '../../../config/env.js';
import { AppError } from '../../../shared/errors/app-error.js';
import type { LlmClient } from './llm-client.interface.js';
import { OpenAiAdapter } from './openai.adapter.js';
import { GrokAdapter } from './grok.adapter.js';
import { AnthropicAdapter } from './anthropic.adapter.js';

export type LlmProvider = 'openai' | 'grok' | 'anthropic';

export class LlmStrategyRegistry {
  private readonly strategies = new Map<LlmProvider, LlmClient>();
  private readonly order: LlmProvider[];

  constructor() {
    const configured: Array<[LlmProvider, boolean]> = [
      ['openai', Boolean(config.LLM_OPENAI_API_KEY || (config.LLM_PROVIDER === 'openai' && config.LLM_API_KEY))],
      ['grok', Boolean(config.LLM_GROK_API_KEY || (config.LLM_PROVIDER === 'grok' && config.LLM_API_KEY))],
      ['anthropic', Boolean(config.LLM_ANTHROPIC_API_KEY || (config.LLM_PROVIDER === 'anthropic' && config.LLM_API_KEY))],
    ];
    for (const [provider, available] of configured) {
      if (available) this.strategies.set(provider, provider === 'openai' ? new OpenAiAdapter() : provider === 'grok' ? new GrokAdapter() : new AnthropicAdapter());
    }
    this.order = [config.LLM_PROVIDER, ...configured.map(([provider]) => provider)].filter((provider, index, values): provider is LlmProvider => values.indexOf(provider) === index);
  }

  async complete(prompt: string, options?: Parameters<LlmClient['complete']>[1]): Promise<string> {
    if (!this.strategies.size) throw new AppError('No LLM provider is configured', 503);
    let lastError: unknown;
    for (const provider of this.order) {
      const strategy = this.strategies.get(provider);
      if (!strategy) continue;
      try { return await strategy.complete(prompt, options); }
      catch (error) { lastError = error; }
    }
    throw new AppError(`All configured LLM providers failed: ${lastError instanceof Error ? lastError.message : 'unknown provider error'}`, 503);
  }
}
