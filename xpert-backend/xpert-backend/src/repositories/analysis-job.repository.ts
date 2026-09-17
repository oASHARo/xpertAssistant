import type { TenantPrismaClient } from '../db/tenant-resolver/tenant-connection-factory.js';
import type { AnalysisStatus } from '../generated/tenant/index.js';
import type { Prisma } from '../generated/tenant/index.js';
export class AnalysisJobRepository {
  constructor(private readonly db: TenantPrismaClient | Prisma.TransactionClient) {}
  createMany(jobId: string, resumeIds: string[]) { return this.db.analysisJob.createMany({ data: [...new Set(resumeIds)].map(resumeId => ({ jobId, resumeId })) , skipDuplicates: true }); }
  findPending() { return this.db.analysisJob.findMany({ where: { status: 'pending' }, orderBy: { createdAt: 'asc' } }); }
  updateStatus(id: string, status: AnalysisStatus, error?: string) { return this.db.analysisJob.update({ where: { id }, data: { status, errorMessage: error } }); }
}
