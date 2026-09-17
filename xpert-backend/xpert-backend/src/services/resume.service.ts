import path from 'node:path';
import { ForbiddenError } from '../shared/errors/forbidden.error.js';
import { NotFoundError } from '../shared/errors/not-found.error.js';
import { ValidationError } from '../shared/errors/validation.error.js';
import type { TenantPrismaClient } from '../db/tenant-resolver/tenant-connection-factory.js';
import { CvFolderRepository } from '../repositories/cv-folder.repository.js';
import { ResumeRepository } from '../repositories/resume.repository.js';
import type { StorageProvider } from '../modules/storage/storage-provider.interface.js';

export class ResumeService {
  constructor(private readonly storage: StorageProvider) {}
  async upload(db: TenantPrismaClient, userId: string, buffer: Buffer, filename: string, folderId?: string) {
    const extension = path.extname(filename).toLowerCase();
    if (!['.pdf', '.docx'].includes(extension)) throw new ValidationError('Only PDF and DOCX files are supported');
    if (folderId && !(await new CvFolderRepository(db).findById(folderId, userId))) throw new NotFoundError('Folder not found');
    const stored = await this.storage.save(buffer, filename);
    try {
      const resume = await new ResumeRepository(db).create({ createdBy: userId, folderId, fileName: filename, fileUrl: '', fileType: extension.slice(1), fileSize: String(buffer.byteLength), fileExtension: extension, storageKey: stored.storageKey });
      const updated = await db.resume.update({ where: { id: resume.id }, data: { fileUrl: `/api/cvs/download/${resume.id}` } });
      if (folderId) await new CvFolderRepository(db).updateFileCount(folderId, 1);
      return updated;
    } catch (error) {
      await this.storage.delete(stored.storageKey);
      throw error;
    }
  }
  async download(db: TenantPrismaClient, userId: string, id: string) {
    const resume = await new ResumeRepository(db).findById(id, userId);
    if (!resume) throw new NotFoundError('Resume not found');
    return { resume, buffer: await this.storage.getBuffer(resume.storageKey ?? '') };
  }
  async folder(db: TenantPrismaClient, userId: string, id: string) {
    const folder = await new CvFolderRepository(db).findById(id, userId);
    if (!folder) throw new NotFoundError('Folder not found');
    return folder;
  }
}
