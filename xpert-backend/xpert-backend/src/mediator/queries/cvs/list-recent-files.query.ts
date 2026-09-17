import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import type { Command, Handler } from '../../mediator.js';
import { ResumeRepository } from '../../../repositories/resume.repository.js';
export interface ListRecentFilesQuery extends Command { type: 'cvs.recent.list'; tenantDb: TenantPrismaClient; userId: string; limit?: number }
export class ListRecentFilesHandler implements Handler<ListRecentFilesQuery, unknown> { handle(q: ListRecentFilesQuery) { return new ResumeRepository(q.tenantDb).findRecentByUser(q.userId, q.limit ?? 20); } }
