import type { TenantPrismaClient } from '../db/tenant-resolver/tenant-connection-factory.js';
import { Prisma } from '../generated/tenant/index.js';

export class JobRepository {
  constructor(private readonly db: TenantPrismaClient | Prisma.TransactionClient) {}
  create(data: { title: string; description: string; category: string; jobCode?: string; embeddedEmail?: string; createdBy: string }) {
    const { title, description, category, jobCode, embeddedEmail, createdBy } = data;
    return this.db.job.create({ data: { title, description, category, jobCode, embeddedEmail, createdBy } });
  }
  findById(id: string, userId: string) {
    return this.db.job.findFirst({ where: { id, createdBy: userId }, include: { creator: true, jobSkills: { include: { skill: true } }, jobCriteria: { include: { criterion: true } }, jobResponses: true, jobResumes: true } });
  }
  findAll(userId: string, search?: string, category?: string, skip = 0, take = 20) {
    const where = { createdBy: userId, ...(category ? { category } : {}), ...(search ? { OR: [{ title: { contains: search, mode: 'insensitive' as const } }, { description: { contains: search, mode: 'insensitive' as const } }] } : {}) };
    return Promise.all([this.db.job.findMany({ where, include: { creator: true, jobSkills: { include: { skill: true } }, jobResponses: true, jobResumes: true }, orderBy: { createdAt: 'desc' }, skip, take }), this.db.job.count({ where })]);
  }
  update(id: string, userId: string, data: { title?: string; description?: string; category?: string; jobCode?: string; embeddedEmail?: string }) {
    return this.db.job.updateMany({ where: { id, createdBy: userId }, data }).then(async (result) => {
      if (!result.count) return null;
      return this.findById(id, userId);
    });
  }
  deleteById(id: string, userId: string) {
    return this.db.job.deleteMany({ where: { id, createdBy: userId } });
  }

  async getStatsForJob(jobId: string) {
    const rows = await this.db.$queryRaw<any[]>`SELECT * FROM v_job_stats WHERE job_id = ${jobId}::uuid`;
    return rows[0] ? {
      resumeCount: Number(rows[0].resume_count || 0),
      shortListCount: Number(rows[0].short_list_count || 0),
      totalCandidates: Number(rows[0].total_candidates || 0),
      matchedPercent: Number(rows[0].matched_percent || 0),
      rejectedPercent: Number(rows[0].rejected_percent || 0)
    } : null;
  }

  async getStatsForJobs(jobIds: string[]) {
    if (!jobIds.length) return [];
    const rows = await this.db.$queryRaw<any[]>`SELECT * FROM v_job_stats WHERE job_id::text IN (${Prisma.join(jobIds)})`;
    return rows.map(r => ({
      jobId: r.job_id,
      resumeCount: Number(r.resume_count || 0),
      shortListCount: Number(r.short_list_count || 0),
      matchedPercent: Number(r.matched_percent || 0),
      rejectedPercent: Number(r.rejected_percent || 0)
    }));
  }
}
