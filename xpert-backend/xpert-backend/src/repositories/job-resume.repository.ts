import type { TenantPrismaClient } from '../db/tenant-resolver/tenant-connection-factory.js';
import type { Prisma } from '../generated/tenant/index.js';
export class JobResumeRepository {
  constructor(private readonly db: TenantPrismaClient | Prisma.TransactionClient) {}
  linkMany(jobId: string, resumeIds: string[], userId: string) { return this.db.jobResume.createMany({ data: [...new Set(resumeIds)].map(resumeId => ({ jobId, resumeId, createdBy: userId })), skipDuplicates: true }); }
  findByJobId(jobId: string) { return this.db.jobResume.findMany({ where: { jobId }, include: { resume: true } }); }
}
