import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import type { Command, Handler } from '../../mediator.js';
import { JobService, type CreateJobInput } from '../../../services/job.service.js';
import { eventBus } from '../../../events/event-bus.js';
import type { AnalysisJobsEnqueuedEvent } from '../../../events/events/analysis-jobs-enqueued.event.js';
import { GetJobDetailHandler } from '../../queries/jobs/get-job-detail.query.js';

export interface CreateJobCommand extends CreateJobInput, Command { type: 'jobs.create'; tenantDb: TenantPrismaClient; userId: string; tenantId: string }

export class CreateJobHandler implements Handler<CreateJobCommand, unknown> {
  constructor(private readonly service = new JobService()) {}
  async handle(c: CreateJobCommand) {
    const jobId = await this.service.create(c.tenantDb, c.userId, c);
    eventBus.publish<AnalysisJobsEnqueuedEvent>({ type: 'analysis.enqueued', jobId, count: c.resumeFileIds.length, tenantId: c.tenantId });
    return new GetJobDetailHandler().handle({ type: 'jobs.detail', tenantDb: c.tenantDb, userId: c.userId, id: jobId });
  }
}
