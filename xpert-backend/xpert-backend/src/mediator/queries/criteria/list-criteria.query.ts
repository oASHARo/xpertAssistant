import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import type { Command, Handler } from '../../mediator.js';
import { CriteriaService } from '../../../services/criteria.service.js';

export interface ListCriteriaQuery extends Command {
  type: 'criteria.list'; tenantDb: TenantPrismaClient; userId: string;
}
export class ListCriteriaHandler implements Handler<ListCriteriaQuery, unknown> {
  constructor(private readonly service = new CriteriaService()) {}
  handle(q: ListCriteriaQuery) { return this.service.list(q.tenantDb, q.userId); }
}
