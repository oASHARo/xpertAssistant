export function buildScorePrompt(resumeText: string, jobDetails: { title: string; description: string; skills: string[] }, criteria: Array<{ title: string; description: string; idealAnswer: string }>): string {
  return `You are an expert technical recruiter and HR evaluator. Analyze the provided resume against the given Job Details and Criteria.

JOB DETAILS:
- Title: ${jobDetails.title}
- Description: ${jobDetails.description}
- Required Skills: ${jobDetails.skills.join(', ')}

INSTRUCTIONS:
1. Extract candidateName, candidateEmail, candidatePhone, candidateAddress, candidateDomain, and candidateRole. If a field is missing, use "N/A".
2. Evaluate the resume strictly on a scale of 0 to 10 for each of the following:
   - experienceScore: Based on years of relevant experience for the "${jobDetails.title}" role (0=None, 10=Expert).
   - skillsScore: Based on the match between resume skills and the Job Required Skills + Criteria (0=No match, 10=Perfect match).
   - educationScore: Based on relevance and level of education/certifications for this field (0=None, 10=Highly relevant advanced degree/certs).
3. Determine "status":
   - Calculate total score = experienceScore + skillsScore + educationScore.
   - If total score is less than 15 out of 30, the status MUST be "rejected".
   - If total score is 15 or higher, the status MUST be "recommended".
4. Extract 5-10 relevant technical or professional keywords as "tags" (string array).

Return the exact JSON structure:
{
  "candidateName": "string",
  "candidateEmail": "string",
  "candidatePhone": "string",
  "candidateAddress": "string",
  "candidateDomain": "string",
  "candidateRole": "string",
  "experienceScore": number,
  "skillsScore": number,
  "educationScore": number,
  "status": "recommended" | "rejected",
  "tags": ["string"]
}

Criteria: ${JSON.stringify(criteria)}

Resume:
${resumeText}`;
}
