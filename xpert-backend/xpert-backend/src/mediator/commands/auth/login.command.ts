import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import { AuthService, type LoginResponse } from '../../../services/auth.service.js';
import type { Handler } from '../../mediator.js';
import { ForbiddenError } from '../../../shared/errors/forbidden.error.js';
import { sendOtpEmail } from '../../../modules/mailer/mailer.service.js';

export interface LoginCommand {
  type: 'auth.login';
  email: string;
  password?: string;
  tenantId: string;
  tenantDb: TenantPrismaClient;
}

export class LoginHandler implements Handler<LoginCommand, Omit<LoginResponse, 'rawOtp'>> {
  constructor(private readonly authService: AuthService) {}
  async handle(command: LoginCommand): Promise<Omit<LoginResponse, 'rawOtp'>> {
    try {
      const response = await this.authService.login(command);
      await sendOtpEmail(response.email, response.rawOtp, 'login');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { rawOtp, ...rest } = response;
      return rest;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        const delivery = await this.authService.resendRegistrationOtp(command);
        await sendOtpEmail(delivery.email, delivery.otp, 'registration');
      }
      throw error;
    }
  }
}
