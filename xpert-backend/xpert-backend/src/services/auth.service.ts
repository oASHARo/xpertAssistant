import { createHash } from 'node:crypto';
import { randomUUID } from 'node:crypto';
import type { TenantPrismaClient } from '../db/tenant-resolver/tenant-connection-factory.js';
import { OtpPurpose } from '../generated/tenant/index.js';
import { ForbiddenError } from '../shared/errors/forbidden.error.js';
import { UnauthorizedError } from '../shared/errors/unauthorized.error.js';
import { ValidationError } from '../shared/errors/validation.error.js';
import { OtpRepository } from '../repositories/otp.repository.js';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { hashPassword, comparePassword } from '../modules/auth/password.service.js';
import { generateOtp, hashOtp, verifyOtp } from '../modules/auth/otp.service.js';
import {
  type AccessTokenPayload,
  JwtService,
  type ResetTokenPayload,
} from '../modules/auth/jwt.service.js';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface LoginResponse {
  requiresOtp: true;
  loginToken: string;
  email: string;
  rawOtp: string;
}

export interface OtpDelivery {
  userId: string;
  email: string;
  otp: string;
}

function tokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function requiredPassword(password: string | undefined): string {
  if (!password) {
    throw new ValidationError('Password is required');
  }
  return password;
}

function userResponse(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`.trim(),
    role: user.role,
  };
}

export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  async register(input: {
    email: string;
    password?: string;
    tenantDb: TenantPrismaClient;
  }): Promise<OtpDelivery> {
    const userRepository = new UserRepository(input.tenantDb);
    const otpRepository = new OtpRepository(input.tenantDb);
    const email = input.email.trim().toLowerCase();

    if (await userRepository.findByEmail(email)) {
      throw new ValidationError('Email already registered');
    }

    const passwordHash = await hashPassword(requiredPassword(input.password));
    const localPart = email.split('@')[0] || 'user';
    const baseUsername = localPart.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 240) || 'user';
    let username = baseUsername;
    if (await userRepository.findByUsername(username)) {
      username = `${baseUsername.slice(0, 220)}_${randomUUID().slice(0, 12)}`;
    }

    const user = await userRepository.create({
      email,
      username,
      passwordHash,
      firstName: localPart,
      lastName: 'User',
    });
    const rawOtp = generateOtp();
    const otp = await hashOtp(rawOtp);
    await otpRepository.create({
      userId: user.id,
      otpHash: otp,
      purpose: OtpPurpose.registration,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    return { userId: user.id, email: user.email, otp: rawOtp };
  }

  async verifyRegistrationOtp(input: {
    email: string;
    code: string;
    tenantId: string;
    tenantDb: TenantPrismaClient;
  }): Promise<AuthResponse> {
    return this.verifyOtpAndIssueTokens(input, OtpPurpose.registration);
  }

  async resendRegistrationOtp(input: {
    email: string;
    tenantDb: TenantPrismaClient;
  }): Promise<OtpDelivery> {
    const users = new UserRepository(input.tenantDb);
    const user = await users.findByEmail(input.email.trim().toLowerCase());
    if (!user || user.emailVerified) {
      throw new UnauthorizedError('Unable to resend verification code');
    }
    const otpRepository = new OtpRepository(input.tenantDb);
    await otpRepository.deleteAllForUser(user.id);
    const rawOtp = generateOtp();
    await otpRepository.create({
      userId: user.id,
      otpHash: await hashOtp(rawOtp),
      purpose: OtpPurpose.registration,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    return { userId: user.id, email: user.email, otp: rawOtp };
  }

  async login(input: {
    email: string;
    password?: string;
    tenantId: string;
    tenantDb: TenantPrismaClient;
  }): Promise<LoginResponse> {
    const users = new UserRepository(input.tenantDb);
    const user = await users.findByEmail(input.email.trim().toLowerCase());
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedError('Account temporarily locked. Try again later');
    }

    const validPassword = await comparePassword(
      requiredPassword(input.password),
      user.passwordHash,
    );
    if (!validPassword) {
      const updated = await users.incrementLoginAttempts(user.id);
      if (updated.loginAttempts >= 5) {
        await users.lockAccount(user.id, new Date(Date.now() + 15 * 60 * 1000));
      }
      throw new UnauthorizedError('Invalid email or password');
    }
    if (!user.emailVerified) {
      throw new ForbiddenError('Email not verified');
    }

    await users.resetLoginAttempts(user.id);
    
    // Instead of issuing tokens immediately, we generate an OTP and a temporary JWT.
    const rawOtp = generateOtp();
    const otpHashValue = await hashOtp(rawOtp);
    const loginToken = this.jwt.signLoginOtpToken({
      sub: user.id,
      tenantId: input.tenantId,
      otpHash: otpHashValue,
    });

    return { requiresOtp: true, loginToken, email: user.email, rawOtp };
  }

  async verifyLoginOtp(input: {
    loginToken: string;
    code: string;
    tenantDb: TenantPrismaClient;
  }): Promise<AuthResponse> {
    let payload: import('../modules/auth/jwt.service.js').LoginOtpTokenPayload;
    try {
      payload = this.jwt.verifyToken(input.loginToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired login session');
    }
    if (payload.purpose !== 'login_otp' || !payload.sub || !payload.otpHash) {
      throw new UnauthorizedError('Invalid or expired login session');
    }

    if (!(await verifyOtp(input.code, payload.otpHash))) {
      throw new UnauthorizedError('Invalid OTP');
    }

    const users = new UserRepository(input.tenantDb);
    const user = await users.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedError('User no longer exists');
    }

    await users.updateLastLogin(user.id);
    return this.issueTokens(input.tenantDb, payload.tenantId, user);
  }

  async forgotPassword(input: {
    email: string;
    tenantDb: TenantPrismaClient;
  }): Promise<OtpDelivery | undefined> {
    const users = new UserRepository(input.tenantDb);
    const user = await users.findByEmail(input.email.trim().toLowerCase());
    if (!user) {
      return undefined;
    }
    const otpRepository = new OtpRepository(input.tenantDb);
    await otpRepository.deleteExpiredForUser(user.id);
    const rawOtp = generateOtp();
    await otpRepository.create({
      userId: user.id,
      otpHash: await hashOtp(rawOtp),
      purpose: OtpPurpose.password_reset,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    return { userId: user.id, email: user.email, otp: rawOtp };
  }

  async verifyResetOtp(input: {
    email: string;
    code: string;
    tenantDb: TenantPrismaClient;
  }): Promise<{ resetToken: string }> {
    const user = await new UserRepository(input.tenantDb)
      .findByEmail(input.email.trim().toLowerCase());
    if (!user) {
      throw new UnauthorizedError('Invalid or expired OTP');
    }
    const otp = await new OtpRepository(input.tenantDb)
      .findActiveByUserAndPurpose(user.id, OtpPurpose.password_reset);
    if (!otp) {
      throw new UnauthorizedError('Invalid or expired OTP');
    }
    const attempts = await new OtpRepository(input.tenantDb).incrementAttemptCount(otp.id);
    if (attempts.attemptCount > 5) {
      await new OtpRepository(input.tenantDb).delete(otp.id);
      throw new UnauthorizedError('Too many attempts. Please request a new OTP');
    }
    if (!(await verifyOtp(input.code, otp.otpHash))) {
      throw new UnauthorizedError('Invalid OTP');
    }
    await new OtpRepository(input.tenantDb).markUsed(otp.id);
    return { resetToken: this.jwt.signResetToken(user.id) };
  }

  async resetPassword(input: {
    resetToken: string;
    newPassword?: string;
    tenantDb: TenantPrismaClient;
  }): Promise<void> {
    let payload: ResetTokenPayload;
    try {
      payload = this.jwt.verifyToken<ResetTokenPayload>(input.resetToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired reset token');
    }
    if (payload.purpose !== 'password_reset' || !payload.sub) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }
    const users = new UserRepository(input.tenantDb);
    if (!(await users.findById(payload.sub))) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }
    await users.updatePassword(payload.sub, await hashPassword(requiredPassword(input.newPassword)));
    await new RefreshTokenRepository(input.tenantDb).revokeAllForUser(payload.sub);
    await new OtpRepository(input.tenantDb).deleteAllForUser(payload.sub);
  }

  async refreshToken(input: {
    refreshToken: string;
    tenantId: string;
    tenantDb: TenantPrismaClient;
  }): Promise<AuthResponse> {
    const tokens = new RefreshTokenRepository(input.tenantDb);
    const stored = await tokens.findByTokenHash(tokenHash(input.refreshToken));
    if (!stored) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
    let payload: { sub: string; tenantId: string };
    try {
      payload = this.jwt.verifyToken<{ sub: string; tenantId: string }>(input.refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
    if (payload.sub !== stored.userId || payload.tenantId !== input.tenantId) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
    await tokens.revoke(stored.id);
    const user = await new UserRepository(input.tenantDb).findById(stored.userId);
    if (!user) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
    return this.issueTokens(input.tenantDb, input.tenantId, user);
  }

  async logout(input: { refreshToken: string; tenantDb: TenantPrismaClient }): Promise<void> {
    const tokens = new RefreshTokenRepository(input.tenantDb);
    const stored = await tokens.findByTokenHash(tokenHash(input.refreshToken));
    if (stored) {
      await tokens.revoke(stored.id);
    }
  }

  private async verifyOtpAndIssueTokens(
    input: { email: string; code: string; tenantId: string; tenantDb: TenantPrismaClient },
    purpose: OtpPurpose,
  ): Promise<AuthResponse> {
    const users = new UserRepository(input.tenantDb);
    const user = await users.findByEmail(input.email.trim().toLowerCase());
    if (!user) {
      throw new UnauthorizedError('Invalid or expired OTP');
    }
    const otps = new OtpRepository(input.tenantDb);
    const otp = await otps.findActiveByUserAndPurpose(user.id, purpose);
    if (!otp) {
      throw new UnauthorizedError('Invalid or expired OTP');
    }
    const attempts = await otps.incrementAttemptCount(otp.id);
    if (attempts.attemptCount > 5) {
      await otps.delete(otp.id);
      throw new UnauthorizedError('Too many attempts. Please request a new OTP');
    }
    if (!(await verifyOtp(input.code, otp.otpHash))) {
      throw new UnauthorizedError('Invalid OTP');
    }
    await otps.markUsed(otp.id);
    await users.updateEmailVerified(user.id, true);
    return this.issueTokens(input.tenantDb, input.tenantId, user);
  }

  private async issueTokens(
    tenantDb: TenantPrismaClient,
    tenantId: string,
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
    },
  ): Promise<AuthResponse> {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      tenantId,
      role: user.role,
    };
    const accessToken = this.jwt.signAccessToken(payload);
    const refreshToken = this.jwt.signRefreshToken({
      sub: user.id,
      tenantId: payload.tenantId,
    });
    await new RefreshTokenRepository(tenantDb).create({
      userId: user.id,
      tokenHash: tokenHash(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return { accessToken, refreshToken, user: userResponse(user) };
  }

}
