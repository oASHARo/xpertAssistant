import type { LlmClient } from './llm/llm-client.interface.js';
import { LlmStrategyRegistry } from './llm/llm-strategy.registry.js';
import { buildCriteriaPrompt } from './prompts/generate-criteria.prompt.js';
import { parseCriteriaResponse, type GeneratedCriterion } from './parsers/criteria-response.parser.js';
import { ExtractorRegistry } from './extractors/extractor-registry.js';
import { buildScorePrompt } from './prompts/score-candidate.prompt.js';
import { parseScoreResponse, type ScoredCandidate } from './parsers/score-response.parser.js';

export class AiService {
  constructor(private readonly llm: LlmClient = new LlmStrategyRegistry(), private readonly extractors = new ExtractorRegistry()) {}
  async generateCriteria(payload: { jobTitle: string; description: string; skills: string[]; numberOfCriteria: number }): Promise<GeneratedCriterion[]> {
    return parseCriteriaResponse(await this.llm.complete(buildCriteriaPrompt(payload), { responseFormat: 'json' }));
  }
  async scoreCandidate(buffer: Buffer, extension: string, criteria: Array<{ title: string; description: string; idealAnswer: string }>): Promise<ScoredCandidate> {
    const text = await this.extractors.getExtractor(extension).extract(buffer);
    return parseScoreResponse(await this.llm.complete(buildScorePrompt(text, criteria), { responseFormat: 'json', maxTokens: 1500 }));
  }
}
export const aiService = new AiService();
