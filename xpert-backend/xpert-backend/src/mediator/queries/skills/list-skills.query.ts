import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import type { Command, Handler } from '../../mediator.js';
import { SkillService } from '../../../services/skill.service.js';

export interface ListSkillsQuery extends Command {
  type: 'skills.list';
  tenantDb: TenantPrismaClient;
  userId: string;
}
export class ListSkillsHandler implements Handler<ListSkillsQuery, unknown> {
  constructor(private readonly service = new SkillService()) {}
  handle(query: ListSkillsQuery) { return this.service.list(query.tenantDb, query.userId); }
}
