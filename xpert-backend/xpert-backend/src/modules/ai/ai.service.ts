import type { LlmClient } from './llm/llm-client.interface.js';
import { LlmStrategyRegistry } from './llm/llm-strategy.registry.js';
import { buildCriteriaPrompt } from './prompts/generate-criteria.prompt.js';
import { parseCriteriaResponse, type GeneratedCriterion } from './parsers/criteria-response.parser.js';
import { ExtractorRegistry } from './extractors/extractor-registry.js';
import { buildScorePrompt } from './prompts/score-candidate.prompt.js';
import { parseScoreResponse, type ScoredCandidate } from './parsers/score-response.parser.js';
import { validateMagicBytes } from './extractors/file-validator.js';


export class AiService {
  constructor(private readonly llm: LlmClient = new LlmStrategyRegistry(), private readonly extractors = new ExtractorRegistry()) {}
  
  async generateCriteria(payload: { jobTitle: string; description: string; skills: string[]; numberOfCriteria: number }): Promise<GeneratedCriterion[]> {
    return parseCriteriaResponse(await this.llm.complete(buildCriteriaPrompt(payload), { responseFormat: 'json' }));
  }
  
  async scoreCandidate(buffer: Buffer, extension: string, jobDetails: { title: string; description: string; skills: string[] }, criteria: Array<{ title: string; description: string; idealAnswer: string }>): Promise<ScoredCandidate> {
    validateMagicBytes(buffer, extension);
    const text = await this.extractors.getExtractor(extension).extract(buffer);
    
    try {
      // Dynamic import of the debug file outside src.
      // This will work in local dev via tsx, but safely fail and be ignored in production 
      // when the folder is deleted or running via compiled Node dist.
      // @ts-ignore - Debug script is outside rootDir and will be deleted in production
      const debugModule = await import('../../../debug/dump-text.ts');
      debugModule.dumpParsedText(`parsed-${Date.now()}-${Math.random().toString(36).substring(7)}`, text);
    } catch {
      // Ignore
    }

    return parseScoreResponse(await this.llm.complete(buildScorePrompt(text, jobDetails, criteria), { responseFormat: 'json', maxTokens: 1500 }));
  }
}
export const aiService = new AiService();
