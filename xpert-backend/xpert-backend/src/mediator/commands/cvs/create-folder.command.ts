import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import type { Command, Handler } from '../../mediator.js';
import { CvFolderRepository } from '../../../repositories/cv-folder.repository.js';
import { ValidationError } from '../../../shared/errors/validation.error.js';
export interface CreateFolderCommand extends Command { type: 'cvs.folder.create'; tenantDb: TenantPrismaClient; userId: string; name: string }
export class CreateFolderHandler implements Handler<CreateFolderCommand, unknown> {
  handle(c: CreateFolderCommand) {
    const name = c.name.trim();
    if (!name) throw new ValidationError('Folder name is required');
    return new CvFolderRepository(c.tenantDb).create(name, c.userId);
  }
}
