import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import { JobResponseRepository } from '../../../repositories/job-response.repository.js';

export interface GetJobCandidatesQuery {
  type: 'jobs.candidates';
  id: string;
  tenantDb: TenantPrismaClient;
}

export class GetJobCandidatesHandler {
  async handle(query: GetJobCandidatesQuery) {
    const jobResponses = await new JobResponseRepository(query.tenantDb).findByJobId(query.id);

    const recommendedMap = new Map<string, any>();
    const rejectedMap = new Map<string, any>();

    for (const r of jobResponses) {
      const c = {
        id: r.resumeId,
        name: r.candidateName || (r as any).resume?.fileName || 'Unknown',
        role: r.candidateRole || 'Candidate',
        email: r.candidateEmail || 'N/A',
        phone: r.candidatePhone || 'N/A',
        address: r.candidateAddress || 'N/A',
        status: r.status,
        scoreBreakdown: {
          experience: r.experienceScore || 0,
          skills: r.skillsScore || 0,
          education: r.educationScore || 0
        },
        cvFileId: r.resumeId,
        cvDownloadUrl: `/api/cvs/download/${r.resumeId}`,
        uploadedAt: (r as any).resume?.createdAt ? new Date((r as any).resume.createdAt).toISOString() : new Date(r.createdAt).toISOString()
      };
      
      // Deep Deduplication: Deduplicate by exact email or normalized name
      // This catches duplicate CVs uploaded under completely different file names
      const emailKey = c.email && c.email !== 'N/A' ? c.email.toLowerCase() : '';
      const nameKey = c.name.toLowerCase().trim();
      const uniqueKey = emailKey || nameKey;
      
      // Since results are ordered by createdAt: 'desc', the first time we see a uniqueKey, it's their NEWEST CV.
      // We skip any older CVs so the candidate's latest upload strictly dictates their status.
      if (recommendedMap.has(uniqueKey) || rejectedMap.has(uniqueKey)) {
        continue;
      }
      
      if (r.status === 'recommended' || r.status === 'shortlisted') {
        recommendedMap.set(uniqueKey, c);
      } else {
        rejectedMap.set(uniqueKey, c);
      }
    }

    const getTotalScore = (c: any) => c.scoreBreakdown.experience + c.scoreBreakdown.skills + c.scoreBreakdown.education;
    
    const recommended = Array.from(recommendedMap.values()).sort((a, b) => getTotalScore(b) - getTotalScore(a));
    const rejected = Array.from(rejectedMap.values()).sort((a, b) => getTotalScore(b) - getTotalScore(a));

    const total = recommended.length + rejected.length;
    const jobScore = {
      matchedPercent: total > 0 ? Math.round((recommended.length / total) * 100) : 0,
      rejectedPercent: total > 0 ? Math.round((rejected.length / total) * 100) : 0,
    };
    
    return { recommended, rejected, jobScore };
  }
}
