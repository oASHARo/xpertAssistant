import type { FastifyInstance } from 'fastify';
import { config } from '../../config/env.js';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
}

export interface RefreshTokenPayload {
  sub: string;
  tenantId: string;
}

export interface LoginOtpTokenPayload {
  sub: string;
  tenantId: string;
  otpHash: string;
  purpose: 'login_otp';
}

export interface ResetTokenPayload {
  sub: string;
  purpose: 'password_reset';
}

export class JwtService {
  constructor(private readonly fastify: FastifyInstance) {}

  signAccessToken(payload: AccessTokenPayload): string {
    return this.fastify.jwt.sign(payload, { expiresIn: config.JWT_ACCESS_EXPIRY });
  }

  signRefreshToken(payload: RefreshTokenPayload): string {
    return this.fastify.jwt.sign(payload, { expiresIn: config.JWT_REFRESH_EXPIRY });
  }

  signResetToken(userId: string): string {
    return this.fastify.jwt.sign(
      { sub: userId, purpose: 'password_reset' },
      { expiresIn: '5m' },
    );
  }

  signLoginOtpToken(payload: Omit<LoginOtpTokenPayload, 'purpose'>): string {
    return this.fastify.jwt.sign(
      { ...payload, purpose: 'login_otp' },
      { expiresIn: '5m' },
    );
  }

  verifyToken<T extends object = AccessTokenPayload>(token: string): T {
    return this.fastify.jwt.verify<T>(token);
  }
}
