import type { TenantPrismaClient } from '../db/tenant-resolver/tenant-connection-factory.js';
import type { AnalysisStatus } from '../generated/tenant/index.js';
import type { Prisma } from '../generated/tenant/index.js';
export class AnalysisJobRepository {
  constructor(private readonly db: TenantPrismaClient | Prisma.TransactionClient) {}
  createMany(jobId: string, resumeIds: string[]) { return this.db.analysisJob.createMany({ data: [...new Set(resumeIds)].map(resumeId => ({ jobId, resumeId })) , skipDuplicates: true }); }
  async acquireNextJobs(limit: number = 5) {
    return this.db.$queryRaw<any[]>`
      UPDATE analysis_jobs
      SET status = 'processing', started_at = NOW()
      WHERE id IN (
        SELECT id FROM analysis_jobs
        WHERE status = 'pending'
        ORDER BY created_at ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING *;
    `;
  }
  async markCompleted(id: string) {
    return this.db.analysisJob.update({
      where: { id },
      data: { status: 'completed', completedAt: new Date(), errorMessage: null }
    });
  }

  async markFailed(id: string, error: string, currentAttempt: number) {
    const nextAttempt = currentAttempt + 1;
    const status = nextAttempt >= 3 ? 'failed' : 'pending';
    return this.db.analysisJob.update({
      where: { id },
      data: { status, errorMessage: error, attemptCount: nextAttempt }
    });
  }
}
