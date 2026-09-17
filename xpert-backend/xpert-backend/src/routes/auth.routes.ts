import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller.js';
import { JwtService } from '../modules/auth/jwt.service.js';
import { AuthService } from '../services/auth.service.js';
import { Mediator } from '../mediator/mediator.js';
import { RegisterUserHandler } from '../mediator/commands/auth/register-user.command.js';
import { VerifyRegistrationOtpHandler } from '../mediator/commands/auth/verify-registration-otp.command.js';
import { ResendRegistrationOtpHandler } from '../mediator/commands/auth/resend-registration-otp.command.js';
import { LoginHandler } from '../mediator/commands/auth/login.command.js';
import { ForgotPasswordHandler } from '../mediator/commands/auth/forgot-password.command.js';
import { VerifyResetOtpHandler } from '../mediator/commands/auth/verify-reset-otp.command.js';
import { ResetPasswordHandler } from '../mediator/commands/auth/reset-password.command.js';
import { RefreshTokenHandler } from '../mediator/commands/auth/refresh-token.command.js';
import { LogoutHandler } from '../mediator/commands/auth/logout.command.js';
import { VerifyLoginOtpHandler } from '../mediator/commands/auth/verify-login-otp.command.js';

const email = { type: 'string', format: 'email', maxLength: 320 };
const password = { type: 'string', minLength: 8, maxLength: 128 };
const authBody = {
  type: 'object',
  required: ['email', 'password'],
  additionalProperties: false,
  properties: { email, password },
};
const emailBody = {
  type: 'object',
  required: ['email'],
  additionalProperties: false,
  properties: { email },
};
const otpBody = {
  type: 'object',
  required: ['email', 'code'],
  additionalProperties: false,
  properties: {
    email,
    code: { type: 'string', pattern: '^[0-9]{6}$' },
  },
};
const loginOtpBody = {
  type: 'object',
  required: ['loginToken', 'code'],
  additionalProperties: false,
  properties: {
    loginToken: { type: 'string', minLength: 1 },
    code: { type: 'string', pattern: '^[0-9]{6}$' },
  },
};
const resetBody = {
  type: 'object',
  required: ['resetToken', 'newPassword'],
  additionalProperties: false,
  properties: { resetToken: { type: 'string' }, newPassword: password },
};
const refreshBody = {
  type: 'object',
  required: ['refreshToken'],
  additionalProperties: false,
  properties: { refreshToken: { type: 'string', minLength: 1 } },
};
const headerTenantConfig = { tenantResolution: 'header' as const };

export default fp(async (fastify: FastifyInstance) => {
  const authService = new AuthService(new JwtService(fastify));
  const mediator = new Mediator();
  mediator.register('auth.register', new RegisterUserHandler(authService));
  mediator.register('auth.verify-registration-otp', new VerifyRegistrationOtpHandler(authService));
  mediator.register('auth.resend-registration-otp', new ResendRegistrationOtpHandler(authService));
  mediator.register('auth.login', new LoginHandler(authService));
  mediator.register('auth.verify-login-otp', new VerifyLoginOtpHandler(authService));
  mediator.register('auth.forgot-password', new ForgotPasswordHandler(authService));
  mediator.register('auth.verify-reset-otp', new VerifyResetOtpHandler(authService));
  mediator.register('auth.reset-password', new ResetPasswordHandler(authService));
  mediator.register('auth.refresh-token', new RefreshTokenHandler(authService));
  mediator.register('auth.logout', new LogoutHandler(authService));

  const controller = new AuthController(mediator);
  await fastify.register(async (scope) => {
    scope.post('/register', { config: { ...headerTenantConfig, rateLimit: { max: 5, timeWindow: '1 minute' } }, schema: { body: authBody } }, controller.register.bind(controller));
    scope.post('/register/verify', { config: headerTenantConfig, schema: { body: otpBody } }, controller.verifyRegistrationOtp.bind(controller));
    scope.post('/register/resend', { config: headerTenantConfig, schema: { body: emailBody } }, controller.resendRegistrationOtp.bind(controller));
    scope.post('/login', { config: { ...headerTenantConfig, rateLimit: { max: 5, timeWindow: '1 minute' } }, schema: { body: authBody } }, controller.login.bind(controller));
    scope.post('/login/verify', { config: headerTenantConfig, schema: { body: loginOtpBody } }, controller.verifyLoginOtp.bind(controller));
    scope.post('/forgot-password', { config: { ...headerTenantConfig, rateLimit: { max: 3, timeWindow: '1 minute' } }, schema: { body: emailBody } }, controller.forgotPassword.bind(controller));
    scope.post('/forgot-password/verify', { config: headerTenantConfig, schema: { body: otpBody } }, controller.verifyResetOtp.bind(controller));
    scope.post('/reset-password', { config: headerTenantConfig, schema: { body: resetBody } }, controller.resetPassword.bind(controller));
    scope.post('/refresh', { config: { ...headerTenantConfig, rateLimit: { max: 30, timeWindow: '1 minute' } }, schema: { body: refreshBody } }, controller.refreshToken.bind(controller));
    scope.post('/logout', { config: headerTenantConfig, schema: { body: refreshBody } }, controller.logout.bind(controller));
  }, { prefix: '/api/auth' });
});
