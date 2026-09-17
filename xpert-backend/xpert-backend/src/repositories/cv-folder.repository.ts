import type { TenantPrismaClient } from '../db/tenant-resolver/tenant-connection-factory.js';
export class CvFolderRepository {
  constructor(private readonly db: TenantPrismaClient) {}
  create(name: string, createdBy: string) { return this.db.cvFolder.create({ data: { name, createdBy } }); }
  findAllByUser(createdBy: string) { return this.db.cvFolder.findMany({ where: { createdBy }, orderBy: { createdAt: 'desc' } }); }
  findById(id: string, createdBy: string) { return this.db.cvFolder.findFirst({ where: { id, createdBy } }); }
  updateFileCount(id: string, delta: number) { return this.db.cvFolder.update({ where: { id }, data: { fileCount: { increment: delta } } }); }
  deleteById(id: string, createdBy: string) { return this.db.cvFolder.deleteMany({ where: { id, createdBy } }); }
}
