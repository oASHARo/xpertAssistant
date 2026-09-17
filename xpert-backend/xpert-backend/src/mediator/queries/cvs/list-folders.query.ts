import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import type { Command, Handler } from '../../mediator.js';
import { CvFolderRepository } from '../../../repositories/cv-folder.repository.js';
export interface ListFoldersQuery extends Command { type: 'cvs.folders.list'; tenantDb: TenantPrismaClient; userId: string }
export class ListFoldersHandler implements Handler<ListFoldersQuery, unknown> { handle(q: ListFoldersQuery) { return new CvFolderRepository(q.tenantDb).findAllByUser(q.userId); } }
