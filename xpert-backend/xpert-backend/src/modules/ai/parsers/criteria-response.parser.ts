import { randomUUID } from 'node:crypto';
import { ValidationError } from '../../../shared/errors/validation.error.js';
export interface GeneratedCriterion { id: string; title: string; ratingCalculationExplanation: string; idealAnswer: string }
export function parseCriteriaResponse(raw: string): GeneratedCriterion[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    const values = Array.isArray(parsed) ? parsed : (parsed as { criteria?: unknown }).criteria;
    if (!Array.isArray(values) || values.length === 0) throw new Error('criteria array missing');
    return values.map((item) => {
      if (typeof item !== 'object' || item === null) throw new Error('invalid criterion');
      const value = item as Record<string, unknown>;
      if (typeof value.title !== 'string' || typeof value.ratingCalculationExplanation !== 'string' || typeof value.idealAnswer !== 'string') throw new Error('criterion fields missing');
      return { id: randomUUID(), title: value.title, ratingCalculationExplanation: value.ratingCalculationExplanation, idealAnswer: value.idealAnswer };
    });
  } catch {
    throw new ValidationError('AI returned malformed criteria data');
  }
}
