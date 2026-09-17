import type { TenantPrismaClient } from '../db/tenant-resolver/tenant-connection-factory.js';
export interface ResumeInput { createdBy: string; folderId?: string; fileName: string; fileUrl: string; fileType: string; fileSize: string; fileExtension: string; storageKey: string }
export class ResumeRepository {
  constructor(private readonly db: TenantPrismaClient) {}
  create(data: ResumeInput) { return this.db.resume.create({ data }); }
  findById(id: string, createdBy: string) { return this.db.resume.findFirst({ where: { id, createdBy } }); }
  findByFolderId(folderId: string, createdBy: string) { return this.db.resume.findMany({ where: { folderId, createdBy }, orderBy: { createdAt: 'desc' } }); }
  findRecentByUser(createdBy: string, limit: number) { return this.db.resume.findMany({ where: { createdBy }, orderBy: { createdAt: 'desc' }, take: limit }); }
  deleteById(id: string, createdBy: string) { return this.db.resume.deleteMany({ where: { id, createdBy } }); }
}
