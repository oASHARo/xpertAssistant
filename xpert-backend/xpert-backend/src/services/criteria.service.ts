import { ForbiddenError } from '../shared/errors/forbidden.error.js';
import { NotFoundError } from '../shared/errors/not-found.error.js';
import type { TenantPrismaClient } from '../db/tenant-resolver/tenant-connection-factory.js';
import { CriteriaRepository, type CriterionInput, type CriterionMetadata } from '../repositories/criteria.repository.js';

export class CriteriaService {
  async list(db: TenantPrismaClient, userId: string) { return new CriteriaRepository(db).findAllByUser(userId); }

  async create(db: TenantPrismaClient, data: CriterionInput) {
    return new CriteriaRepository(db).create(data);
  }

  async update(db: TenantPrismaClient, userId: string, id: string, data: { title?: string; description?: string; status?: 'active' | 'inactive'; metadata?: CriterionMetadata }) {
    const repository = new CriteriaRepository(db);
    const criterion = await repository.findById(id);
    if (!criterion) throw new NotFoundError('Criterion not found');
    if (criterion.createdBy !== userId) throw new ForbiddenError('You do not own this criterion');
    if (criterion.status === 'inactive') throw new ForbiddenError('Inactive criteria cannot be edited');
    return repository.update(id, data);
  }

  async delete(db: TenantPrismaClient, userId: string, id: string) {
    const repository = new CriteriaRepository(db);
    const criterion = await repository.findById(id);
    if (!criterion) throw new NotFoundError('Criterion not found');
    if (criterion.createdBy !== userId) throw new ForbiddenError('You do not own this criterion');
    return repository.softDelete(id);
  }
}
