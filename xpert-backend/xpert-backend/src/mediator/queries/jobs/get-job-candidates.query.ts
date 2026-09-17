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

    const recommended: any[] = [];
    const rejected: any[] = [];

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
      if (r.status === 'recommended' || r.status === 'shortlisted') recommended.push(c);
      else rejected.push(c);
    }

    const getTotalScore = (c: any) => c.scoreBreakdown.experience + c.scoreBreakdown.skills + c.scoreBreakdown.education;
    
    recommended.sort((a, b) => getTotalScore(b) - getTotalScore(a));
    rejected.sort((a, b) => getTotalScore(b) - getTotalScore(a));

    const total = recommended.length + rejected.length;
    const jobScore = {
      matchedPercent: total > 0 ? Math.round((recommended.length / total) * 100) : 0,
      rejectedPercent: total > 0 ? Math.round((rejected.length / total) * 100) : 0,
    };
    
    return { recommended, rejected, jobScore };
  }
}
