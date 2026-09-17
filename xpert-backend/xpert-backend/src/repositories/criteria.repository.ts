import type { TenantPrismaClient } from '../db/tenant-resolver/tenant-connection-factory.js';
import type { Prisma } from '../generated/tenant/index.js';

export type CriterionMetadata = Prisma.InputJsonObject & {
  ratingCalculationExplanation?: string;
  idealAnswer?: string;
};

export interface CriterionInput {
  title: string;
  description: string;
  createdBy: string;
  metadata?: CriterionMetadata;
}

export class CriteriaRepository {
  constructor(private readonly db: TenantPrismaClient | Prisma.TransactionClient) {}

  findAllByUser(userId: string) {
    return this.db.criterion.findMany({
      where: { createdBy: userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: CriterionInput) {
    return this.db.criterion.create({ data });
  }

  findById(id: string) {
    return this.db.criterion.findUnique({ where: { id } });
  }

  update(id: string, data: { title?: string; description?: string; status?: 'active' | 'inactive'; metadata?: CriterionMetadata }) {
    return this.db.criterion.update({ where: { id }, data });
  }

  softDelete(id: string) {
    return this.db.criterion.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
