import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import type { Command, Handler } from '../../mediator.js';
import { ResumeRepository } from '../../../repositories/resume.repository.js';
export interface GetFolderFilesQuery extends Command { type: 'cvs.files.list'; tenantDb: TenantPrismaClient; userId: string; folderId: string }
export class GetFolderFilesHandler implements Handler<GetFolderFilesQuery, unknown> { handle(q: GetFolderFilesQuery) { return new ResumeRepository(q.tenantDb).findByFolderId(q.folderId, q.userId); } }
