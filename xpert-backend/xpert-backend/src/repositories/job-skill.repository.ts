import type { TenantPrismaClient } from '../db/tenant-resolver/tenant-connection-factory.js';
import type { Prisma } from '../generated/tenant/index.js';
export class JobSkillRepository {
  constructor(private readonly db: TenantPrismaClient | Prisma.TransactionClient) {}
  linkMany(jobId: string, skillIds: string[]) { return this.db.jobSkill.createMany({ data: [...new Set(skillIds)].map(skillId => ({ jobId, skillId })), skipDuplicates: true }); }
  findByJobId(jobId: string) { return this.db.jobSkill.findMany({ where: { jobId }, include: { skill: true } }); }
  unlinkAll(jobId: string) { return this.db.jobSkill.deleteMany({ where: { jobId } }); }
}
