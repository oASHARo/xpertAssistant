export function buildScorePrompt(resumeText: string, criteria: Array<{ title: string; description: string; idealAnswer: string }>): string {
  return `Analyze this resume against the criteria and return JSON with candidateName, candidateEmail, candidatePhone, candidateAddress, candidateDomain, candidateRole, experienceScore, skillsScore, educationScore, status ("recommended" or "rejected"), and tags (string array).
Criteria: ${JSON.stringify(criteria)}
Resume: ${resumeText}`;
}
