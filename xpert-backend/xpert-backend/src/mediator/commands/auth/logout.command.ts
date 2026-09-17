import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import { AuthService } from '../../../services/auth.service.js';
import type { Handler } from '../../mediator.js';

export interface LogoutCommand {
  type: 'auth.logout';
  refreshToken: string;
  tenantDb: TenantPrismaClient;
}

export class LogoutHandler implements Handler<LogoutCommand, void> {
  constructor(private readonly authService: AuthService) {}
  handle(command: LogoutCommand): Promise<void> {
    return this.authService.logout(command);
  }
}
