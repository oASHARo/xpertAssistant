import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import { AuthService, type AuthResponse } from '../../../services/auth.service.js';
import type { Handler } from '../../mediator.js';

export interface VerifyLoginOtpCommand {
  type: 'auth.verify-login-otp';
  loginToken: string;
  code: string;
  tenantDb: TenantPrismaClient;
}

export class VerifyLoginOtpHandler implements Handler<VerifyLoginOtpCommand, AuthResponse> {
  constructor(private readonly authService: AuthService) {}
  async handle(command: VerifyLoginOtpCommand): Promise<AuthResponse> {
    return await this.authService.verifyLoginOtp(command);
  }
}
