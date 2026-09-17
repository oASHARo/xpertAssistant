import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import { AuthService } from '../../../services/auth.service.js';
import type { Handler } from '../../mediator.js';

export interface ResetPasswordCommand {
  type: 'auth.reset-password';
  resetToken: string;
  newPassword?: string;
  tenantDb: TenantPrismaClient;
}

export class ResetPasswordHandler implements Handler<ResetPasswordCommand, void> {
  constructor(private readonly authService: AuthService) {}
  handle(command: ResetPasswordCommand): Promise<void> {
    return this.authService.resetPassword(command);
  }
}
