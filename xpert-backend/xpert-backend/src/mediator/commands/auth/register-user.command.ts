import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import { AuthService, type OtpDelivery } from '../../../services/auth.service.js';
import type { Handler } from '../../mediator.js';
import { sendOtpEmail } from '../../../modules/mailer/mailer.service.js';

export interface RegisterUserCommand {
  type: 'auth.register';
  email: string;
  password?: string;
  tenantDb: TenantPrismaClient;
}

export class RegisterUserHandler implements Handler<RegisterUserCommand, OtpDelivery> {
  constructor(private readonly authService: AuthService) {}

  async handle(command: RegisterUserCommand): Promise<OtpDelivery> {
    const delivery = await this.authService.register(command);
    await sendOtpEmail(delivery.email, delivery.otp, 'registration');
    return delivery;
  }
}
