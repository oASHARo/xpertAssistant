import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import type { Command, Handler } from '../../mediator.js';
import { CriteriaService } from '../../../services/criteria.service.js';

export interface DeleteCriterionCommand extends Command {
  type: 'criteria.delete'; tenantDb: TenantPrismaClient; userId: string; id: string;
}
export class DeleteCriterionHandler implements Handler<DeleteCriterionCommand, unknown> {
  constructor(private readonly service = new CriteriaService()) {}
  handle(c: DeleteCriterionCommand) { return this.service.delete(c.tenantDb, c.userId, c.id); }
}
