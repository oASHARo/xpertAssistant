export function buildCriteriaPrompt(input: { jobTitle: string; description: string; skills: string[]; numberOfCriteria: number }): string {
  return `Generate exactly ${input.numberOfCriteria} job evaluation criteria as JSON.
Return an object with a single "criteria" array. Every item must contain title, ratingCalculationExplanation, and idealAnswer.
Job title: ${input.jobTitle}
Description: ${input.description}
Skills: ${input.skills.join(', ')}`;
}
