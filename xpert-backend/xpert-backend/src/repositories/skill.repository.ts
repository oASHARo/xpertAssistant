import type { TenantPrismaClient } from '../db/tenant-resolver/tenant-connection-factory.js';
import type { Prisma } from '../generated/tenant/index.js';

export class SkillRepository {
  constructor(private readonly db: TenantPrismaClient | Prisma.TransactionClient) {}

  findAll(userId: string) {
    return this.db.skill.findMany({ where: { createdBy: userId }, orderBy: { name: 'asc' } });
  }

  findOrCreateByName(name: string, userId: string) {
    return this.db.skill.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    }).then((existing) => existing ?? this.db.skill.create({ data: { name, createdBy: userId } }));
  }

  findById(id: string) {
    return this.db.skill.findUnique({ where: { id } });
  }

  deleteById(id: string) {
    return this.db.skill.delete({ where: { id } });
  }
}
