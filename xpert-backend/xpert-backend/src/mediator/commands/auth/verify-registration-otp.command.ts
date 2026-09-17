import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import { AuthService, type AuthResponse } from '../../../services/auth.service.js';
import type { Handler } from '../../mediator.js';

export interface VerifyRegistrationOtpCommand {
  type: 'auth.verify-registration-otp';
  email: string;
  code: string;
  tenantId: string;
  tenantDb: TenantPrismaClient;
}

export class VerifyRegistrationOtpHandler implements Handler<VerifyRegistrationOtpCommand, AuthResponse> {
  constructor(private readonly authService: AuthService) {}
  handle(command: VerifyRegistrationOtpCommand): Promise<AuthResponse> {
    return this.authService.verifyRegistrationOtp(command);
  }
}
