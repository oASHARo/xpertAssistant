import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import type { Command, Handler } from '../../mediator.js';
import { JobService } from '../../../services/job.service.js';
import { GetJobDetailHandler } from '../../queries/jobs/get-job-detail.query.js';

export interface UpdateJobCommand extends Command { type: 'jobs.update'; tenantDb: TenantPrismaClient; userId: string; id: string; title?: string; description?: string; category?: string; jobCode?: string; embeddedEmail?: string }

export class UpdateJobHandler implements Handler<UpdateJobCommand, unknown> { 
  constructor(private readonly service = new JobService()) {} 
  async handle(c: UpdateJobCommand) { 
    const jobId = await this.service.update(c.tenantDb, c.userId, c.id, c);
    return new GetJobDetailHandler().handle({ type: 'jobs.detail', tenantDb: c.tenantDb, userId: c.userId, id: jobId });
  } 
}
