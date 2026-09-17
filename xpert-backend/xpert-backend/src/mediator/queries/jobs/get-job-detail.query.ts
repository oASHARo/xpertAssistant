import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import type { Command, Handler } from '../../mediator.js';
import { JobRepository } from '../../../repositories/job.repository.js';
import { NotFoundError } from '../../../shared/errors/not-found.error.js';

export interface GetJobDetailQuery extends Command { type: 'jobs.detail'; tenantDb: TenantPrismaClient; userId: string; id: string }

export class GetJobDetailHandler implements Handler<GetJobDetailQuery, unknown> {
  async handle(q: GetJobDetailQuery) {
    const repo = new JobRepository(q.tenantDb);
    const job = await repo.findById(q.id, q.userId);
    if (!job) throw new NotFoundError('Job not found');

    const s = await repo.getStatsForJob(job.id) || { resumeCount: 0, shortListCount: 0, totalCandidates: 0, matchedPercent: 0, rejectedPercent: 0 };

    const pendingAnalysisCount = await q.tenantDb.analysisJob.count({
      where: {
        jobId: job.id,
        status: { in: ['pending', 'processing'] }
      }
    });

    return {
      id: job.id,
      title: job.title,
      category: job.category,
      description: job.description,
      skills: job.jobSkills.map((x: any) => x.skill.name),
      shortListCount: s.shortListCount,
      rejectedCount: Number(s.totalCandidates || 0) - Number(s.shortListCount || 0),
      resumeCount: s.resumeCount,
      analysisRatio: { matchedPercent: s.matchedPercent, rejectedPercent: s.rejectedPercent },
      isProcessing: pendingAnalysisCount > 0,
      createdAt: job.createdAt.toISOString(),
      createdByEmail: job.creator.email,
      criteria: job.jobCriteria.map((x: any) => ({
        id: x.criterion.id,
        title: x.criterion.title,
        ratingCalculationExplanation: x.criterion.metadata?.ratingCalculationExplanation ?? '',
        idealAnswer: x.criterion.metadata?.idealAnswer ?? ''
      })),
      candidates: job.jobResponses.map((x: any) => ({
        candidateId: x.resumeId,
        status: x.status
      }))
    };
  }
}
