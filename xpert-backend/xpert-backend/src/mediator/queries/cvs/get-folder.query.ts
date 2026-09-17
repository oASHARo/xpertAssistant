import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import type { Command, Handler } from '../../mediator.js';
import { ResumeService } from '../../../services/resume.service.js';
export interface GetFolderQuery extends Command { type: 'cvs.folder.get'; tenantDb: TenantPrismaClient; userId: string; folderId: string }
export class GetFolderHandler implements Handler<GetFolderQuery, unknown> {
  constructor(private readonly service: ResumeService) {}
  handle(q: GetFolderQuery) { return this.service.folder(q.tenantDb, q.userId, q.folderId); }
}
