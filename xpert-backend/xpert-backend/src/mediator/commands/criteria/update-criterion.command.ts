import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import type { Command, Handler } from '../../mediator.js';
import { CriteriaService } from '../../../services/criteria.service.js';
import type { CriterionMetadata } from '../../../repositories/criteria.repository.js';

export interface UpdateCriterionCommand extends Command {
  type: 'criteria.update'; tenantDb: TenantPrismaClient; userId: string; id: string;
  title?: string; description?: string; status?: 'active' | 'inactive'; metadata?: CriterionMetadata;
}
export class UpdateCriterionHandler implements Handler<UpdateCriterionCommand, unknown> {
  constructor(private readonly service = new CriteriaService()) {}
  handle(c: UpdateCriterionCommand) { return this.service.update(c.tenantDb, c.userId, c.id, { title: c.title, description: c.description, status: c.status, metadata: c.metadata }); }
}
