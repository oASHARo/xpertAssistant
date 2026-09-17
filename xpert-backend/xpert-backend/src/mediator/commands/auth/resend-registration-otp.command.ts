import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import { AuthService, type OtpDelivery } from '../../../services/auth.service.js';
import type { Handler } from '../../mediator.js';
import { sendOtpEmail } from '../../../modules/mailer/mailer.service.js';

export interface ResendRegistrationOtpCommand {
  type: 'auth.resend-registration-otp';
  email: string;
  tenantDb: TenantPrismaClient;
}

export class ResendRegistrationOtpHandler implements Handler<ResendRegistrationOtpCommand, OtpDelivery> {
  constructor(private readonly authService: AuthService) {}
  async handle(command: ResendRegistrationOtpCommand): Promise<OtpDelivery> {
    const delivery = await this.authService.resendRegistrationOtp(command);
    await sendOtpEmail(delivery.email, delivery.otp, 'registration');
    return delivery;
  }
}
