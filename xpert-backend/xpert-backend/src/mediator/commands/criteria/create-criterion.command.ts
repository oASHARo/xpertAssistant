import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import type { Command, Handler } from '../../mediator.js';
import { CriteriaService } from '../../../services/criteria.service.js';
import type { CriterionMetadata } from '../../../repositories/criteria.repository.js';

export interface CreateCriterionCommand extends Command {
  type: 'criteria.create'; tenantDb: TenantPrismaClient; userId: string;
  title: string; description: string; metadata?: CriterionMetadata;
}
export class CreateCriterionHandler implements Handler<CreateCriterionCommand, unknown> {
  constructor(private readonly service = new CriteriaService()) {}
  handle(c: CreateCriterionCommand) { return this.service.create(c.tenantDb, { title: c.title, description: c.description, createdBy: c.userId, metadata: c.metadata }); }
}
