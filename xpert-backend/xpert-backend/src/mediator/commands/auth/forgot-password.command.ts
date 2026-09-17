import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import { AuthService, type OtpDelivery } from '../../../services/auth.service.js';
import type { Handler } from '../../mediator.js';
import { sendOtpEmail } from '../../../modules/mailer/mailer.service.js';

export interface ForgotPasswordCommand {
  type: 'auth.forgot-password';
  email: string;
  tenantDb: TenantPrismaClient;
}

export class ForgotPasswordHandler implements Handler<ForgotPasswordCommand, OtpDelivery | undefined> {
  constructor(private readonly authService: AuthService) {}
  async handle(command: ForgotPasswordCommand): Promise<OtpDelivery | undefined> {
    const delivery = await this.authService.forgotPassword(command);
    if (delivery) {
      await sendOtpEmail(delivery.email, delivery.otp, 'password_reset');
    }
    return delivery;
  }
}
