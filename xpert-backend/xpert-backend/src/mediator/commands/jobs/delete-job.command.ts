import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import type { Command, Handler } from '../../mediator.js';
import { JobService } from '../../../services/job.service.js';
export interface DeleteJobCommand extends Command { type: 'jobs.delete'; tenantDb: TenantPrismaClient; userId: string; id: string }
export class DeleteJobHandler implements Handler<DeleteJobCommand, void> { constructor(private readonly service = new JobService()) {} async handle(c: DeleteJobCommand) { await this.service.delete(c.tenantDb, c.userId, c.id); } }
