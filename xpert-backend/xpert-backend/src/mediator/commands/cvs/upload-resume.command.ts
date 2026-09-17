import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import type { Command, Handler } from '../../mediator.js';
import { ResumeService } from '../../../services/resume.service.js';
import type { StorageProvider } from '../../../modules/storage/storage-provider.interface.js';
export interface UploadResumeCommand extends Command { type: 'cvs.upload'; tenantDb: TenantPrismaClient; userId: string; buffer: Buffer; filename: string; folderId?: string }
export class UploadResumeHandler implements Handler<UploadResumeCommand, unknown> {
  constructor(private readonly service: ResumeService) {}
  handle(c: UploadResumeCommand) { return this.service.upload(c.tenantDb, c.userId, c.buffer, c.filename, c.folderId); }
}
