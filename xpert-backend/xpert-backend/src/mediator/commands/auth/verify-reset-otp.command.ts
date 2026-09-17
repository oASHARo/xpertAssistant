import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import { AuthService } from '../../../services/auth.service.js';
import type { Handler } from '../../mediator.js';

export interface VerifyResetOtpCommand {
  type: 'auth.verify-reset-otp';
  email: string;
  code: string;
  tenantDb: TenantPrismaClient;
}

export class VerifyResetOtpHandler implements Handler<VerifyResetOtpCommand, { resetToken: string }> {
  constructor(private readonly authService: AuthService) {}
  handle(command: VerifyResetOtpCommand): Promise<{ resetToken: string }> {
    return this.authService.verifyResetOtp(command);
  }
}
