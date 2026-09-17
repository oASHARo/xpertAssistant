import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import type { Command, Handler } from '../../mediator.js';
import { SkillService } from '../../../services/skill.service.js';

export interface CreateSkillCommand extends Command {
  type: 'skills.create';
  tenantDb: TenantPrismaClient;
  userId: string;
  name: string;
}

export class CreateSkillHandler implements Handler<CreateSkillCommand, unknown> {
  constructor(private readonly service = new SkillService()) {}
  handle(command: CreateSkillCommand) { return this.service.create(command.tenantDb, command.userId, command.name); }
}
