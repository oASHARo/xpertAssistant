import type { TenantPrismaClient } from '../db/tenant-resolver/tenant-connection-factory.js';
export class JobResponseRepository {
  constructor(private readonly db: TenantPrismaClient) {}
  create(data: { jobId: string; resumeId: string; createdBy: string; candidateName?: string; candidateEmail?: string; candidatePhone?: string; candidateAddress?: string; candidateDomain?: string; candidateRole?: string; experienceScore: number; skillsScore: number; educationScore: number; status: 'recommended' | 'rejected' }) { return this.db.jobResponse.create({ data }); }
  createTags(jobResponseId: string, tags: string[]) { return this.db.jobResponseTag.createMany({ data: tags.map(tagName => ({ jobResponseId, tagName })) }); }
  findByJobId(jobId: string) { return this.db.jobResponse.findMany({ where: { jobId }, orderBy: { createdAt: 'desc' }, include: { resume: true } }); }
}
