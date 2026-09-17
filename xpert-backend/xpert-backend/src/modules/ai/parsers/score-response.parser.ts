import { ValidationError } from '../../../shared/errors/validation.error.js';
export interface ScoredCandidate { candidateName?: string; candidateEmail?: string; candidatePhone?: string; candidateAddress?: string; candidateDomain?: string; candidateRole?: string; experienceScore: number; skillsScore: number; educationScore: number; status: 'recommended' | 'rejected'; tags: string[] }
export function parseScoreResponse(raw: string): ScoredCandidate {
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    const score = (key: string) => typeof value[key] === 'number' && value[key] >= 0 && value[key] <= 10;
    if (!score('experienceScore') || !score('skillsScore') || !score('educationScore') || !['recommended', 'rejected'].includes(String(value.status)) || !Array.isArray(value.tags)) throw new Error('invalid score');
    return value as unknown as ScoredCandidate;
  } catch { throw new ValidationError('AI returned malformed candidate analysis data'); }
}
