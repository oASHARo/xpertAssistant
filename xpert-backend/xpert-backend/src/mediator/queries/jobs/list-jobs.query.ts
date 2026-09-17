import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import type { Command, Handler } from '../../mediator.js';
import { JobRepository } from '../../../repositories/job.repository.js';

export interface ListJobsQuery extends Command { type: 'jobs.list'; tenantDb: TenantPrismaClient; userId: string; search?: string; category?: string; page?: number; pageSize?: number }

export class ListJobsHandler implements Handler<ListJobsQuery, unknown> { 
  async handle(q: ListJobsQuery) { 
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 20;
    const repo = new JobRepository(q.tenantDb);
    const [jobs, total] = await repo.findAll(q.userId, q.search, q.category, (page - 1) * pageSize, pageSize);
    
    const stats = await repo.getStatsForJobs(jobs.map(j => j.id));
    const statsMap = new Map(stats.map(s => [s.jobId, s]));

    return {
      jobs: jobs.map(job => {
        const s = statsMap.get(job.id) || { resumeCount: 0, shortListCount: 0, matchedPercent: 0, rejectedPercent: 0 };
        return {
          id: job.id,
          title: job.title,
          category: job.category,
          description: job.description,
          skills: job.jobSkills.map((x: any) => x.skill.name),
          shortListCount: s.shortListCount,
          resumeCount: s.resumeCount,
          analysisRatio: { matchedPercent: s.matchedPercent, rejectedPercent: s.rejectedPercent },
          createdAt: job.createdAt.toISOString(),
          createdByEmail: job.creator.email
        };
      }),
      total
    };
  } 
}
