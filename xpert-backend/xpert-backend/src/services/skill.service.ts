import { ForbiddenError } from '../shared/errors/forbidden.error.js';
import { NotFoundError } from '../shared/errors/not-found.error.js';
import type { TenantPrismaClient } from '../db/tenant-resolver/tenant-connection-factory.js';
import { SkillRepository } from '../repositories/skill.repository.js';

export class SkillService {
  async list(db: TenantPrismaClient, userId: string) {
    return new SkillRepository(db).findAll(userId);
  }

  async create(db: TenantPrismaClient, userId: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) throw new NotFoundError('Skill name is required');
    return new SkillRepository(db).findOrCreateByName(trimmed, userId);
  }

  async delete(db: TenantPrismaClient, userId: string, id: string) {
    const repository = new SkillRepository(db);
    const skill = await repository.findById(id);
    if (!skill) throw new NotFoundError('Skill not found');
    if (skill.createdBy !== userId) throw new ForbiddenError('You do not own this skill');
    return repository.deleteById(id);
  }
}
