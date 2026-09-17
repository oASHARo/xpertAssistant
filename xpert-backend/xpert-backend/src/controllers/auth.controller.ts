import type { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../shared/helpers/response.helper.js';
import type { Mediator } from '../mediator/mediator.js';

interface AuthBody {
  email: string;
  password?: string;
}

interface OtpBody {
  email: string;
  code: string;
}

interface ResetBody {
  resetToken: string;
  newPassword?: string;
}

interface RefreshBody {
  refreshToken: string;
}

export class AuthController {
  constructor(private readonly mediator: Mediator) {}

  async register(
    request: FastifyRequest<{ Body: AuthBody }>,
    reply: FastifyReply,
  ): Promise<void> {
    await this.mediator.send({
      type: 'auth.register',
      ...request.body,
      tenantDb: request.tenantDb!,
    });
    reply.send(successResponse(null, 'Registration successful. Check your email for the OTP.'));
  }

  async verifyRegistrationOtp(
    request: FastifyRequest<{ Body: OtpBody }>,
    reply: FastifyReply,
  ): Promise<void> {
    const result = await this.mediator.send({
      type: 'auth.verify-registration-otp',
      ...request.body,
      tenantId: request.headers['x-tenant-id'] as string,
      tenantDb: request.tenantDb!,
    });
    reply.send(successResponse(result));
  }

  async resendRegistrationOtp(
    request: FastifyRequest<{ Body: Pick<AuthBody, 'email'> }>,
    reply: FastifyReply,
  ): Promise<void> {
    await this.mediator.send({
      type: 'auth.resend-registration-otp',
      ...request.body,
      tenantDb: request.tenantDb!,
    });
    reply.send(successResponse(null, 'A new verification code has been sent.'));
  }

  async login(
    request: FastifyRequest<{ Body: AuthBody }>,
    reply: FastifyReply,
  ): Promise<void> {
    const result = await this.mediator.send({
      type: 'auth.login',
      ...request.body,
      tenantId: request.headers['x-tenant-id'] as string,
      tenantDb: request.tenantDb!,
    });
    reply.send(successResponse(result, 'OTP sent to your email.'));
  }

  async verifyLoginOtp(
    request: FastifyRequest<{ Body: { loginToken: string; code: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const result = await this.mediator.send({
      type: 'auth.verify-login-otp',
      ...request.body,
      tenantDb: request.tenantDb!,
    });
    reply.send(successResponse(result));
  }

  async forgotPassword(
    request: FastifyRequest<{ Body: Pick<AuthBody, 'email'> }>,
    reply: FastifyReply,
  ): Promise<void> {
    await this.mediator.send({
      type: 'auth.forgot-password',
      ...request.body,
      tenantDb: request.tenantDb!,
    });
    reply.send(successResponse(null, 'If the email exists, a reset code has been sent.'));
  }

  async verifyResetOtp(
    request: FastifyRequest<{ Body: OtpBody }>,
    reply: FastifyReply,
  ): Promise<void> {
    const result = await this.mediator.send({
      type: 'auth.verify-reset-otp',
      ...request.body,
      tenantDb: request.tenantDb!,
    });
    reply.send(successResponse(result));
  }

  async resetPassword(
    request: FastifyRequest<{ Body: ResetBody }>,
    reply: FastifyReply,
  ): Promise<void> {
    await this.mediator.send({
      type: 'auth.reset-password',
      ...request.body,
      tenantDb: request.tenantDb!,
    });
    reply.send(successResponse(null, 'Password reset successful.'));
  }

  async refreshToken(
    request: FastifyRequest<{ Body: RefreshBody }>,
    reply: FastifyReply,
  ): Promise<void> {
    const result = await this.mediator.send({
      type: 'auth.refresh-token',
      ...request.body,
      tenantId: request.headers['x-tenant-id'] as string,
      tenantDb: request.tenantDb!,
    });
    reply.send(successResponse(result));
  }

  async logout(
    request: FastifyRequest<{ Body: RefreshBody }>,
    reply: FastifyReply,
  ): Promise<void> {
    await this.mediator.send({
      type: 'auth.logout',
      ...request.body,
      tenantDb: request.tenantDb!,
    });
    reply.send(successResponse(null, 'Logout successful.'));
  }
}
