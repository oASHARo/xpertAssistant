import type { TenantPrismaClient } from '../db/tenant-resolver/tenant-connection-factory.js';
export class JobResponseRepository {
  constructor(private readonly db: TenantPrismaClient) {}
  create(data: { jobId: string; resumeId: string; createdBy: string; candidateName?: string; candidateEmail?: string; candidatePhone?: string; candidateAddress?: string; candidateDomain?: string; candidateRole?: string; experienceScore: number; skillsScore: number; educationScore: number; status: 'recommended' | 'rejected' }) { return this.db.jobResponse.create({ data }); }
  async upsert(data: { jobId: string; resumeId: string; createdBy: string; candidateName?: string; candidateEmail?: string; candidatePhone?: string; candidateAddress?: string; candidateDomain?: string; candidateRole?: string; experienceScore: number; skillsScore: number; educationScore: number; status: 'recommended' | 'rejected' }) {
    const existing = await this.db.jobResponse.findFirst({ where: { jobId: data.jobId, resumeId: data.resumeId } });
    if (existing) {
      await this.db.jobResponseTag.deleteMany({ where: { jobResponseId: existing.id } });
      return this.db.jobResponse.update({ where: { id: existing.id }, data });
    }
    return this.db.jobResponse.create({ data });
  }
  createTags(jobResponseId: string, tags: string[]) { return this.db.jobResponseTag.createMany({ data: tags.map(tagName => ({ jobResponseId, tagName })) }); }
  findByJobId(jobId: string) { return this.db.jobResponse.findMany({ where: { jobId }, orderBy: { createdAt: 'desc' }, include: { resume: true } }); }
}
