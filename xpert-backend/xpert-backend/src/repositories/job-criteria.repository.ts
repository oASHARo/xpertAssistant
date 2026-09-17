import type { TenantPrismaClient } from '../db/tenant-resolver/tenant-connection-factory.js';
import type { Prisma } from '../generated/tenant/index.js';
export class JobCriteriaRepository {
  constructor(private readonly db: TenantPrismaClient | Prisma.TransactionClient) {}
  linkMany(jobId: string, criteriaIds: string[]) { return this.db.jobCriterion.createMany({ data: [...new Set(criteriaIds)].map(criteriaId => ({ jobId, criteriaId })), skipDuplicates: true }); }
  findByJobId(jobId: string) { return this.db.jobCriterion.findMany({ where: { jobId }, include: { criterion: true } }); }
  unlinkAll(jobId: string) { return this.db.jobCriterion.deleteMany({ where: { jobId } }); }
}
