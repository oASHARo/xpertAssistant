import type { OtpCode } from '../generated/tenant/index.js';
import { OtpPurpose } from '../generated/tenant/index.js';
import type { TenantPrismaClient } from '../db/tenant-resolver/tenant-connection-factory.js';

export interface CreateOtpInput {
  userId: string;
  otpHash: string;
  purpose: OtpPurpose;
  expiresAt: Date;
}

export class OtpRepository {
  constructor(private readonly db: TenantPrismaClient) {}

  create(input: CreateOtpInput): Promise<OtpCode> {
    return this.db.otpCode.create({ data: input });
  }

  findActiveByUserAndPurpose(userId: string, purpose: OtpPurpose): Promise<OtpCode | null> {
    return this.db.otpCode.findFirst({
      where: { userId, purpose, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
  }

  markUsed(otpId: string): Promise<OtpCode> {
    return this.db.otpCode.update({ where: { id: otpId }, data: { used: true } });
  }

  incrementAttemptCount(otpId: string): Promise<OtpCode> {
    return this.db.otpCode.update({
      where: { id: otpId },
      data: { attemptCount: { increment: 1 } },
    });
  }

  delete(otpId: string): Promise<OtpCode> {
    return this.db.otpCode.delete({ where: { id: otpId } });
  }

  deleteExpiredForUser(userId: string): Promise<{ count: number }> {
    return this.db.otpCode.deleteMany({
      where: { userId, expiresAt: { lte: new Date() } },
    });
  }

  deleteAllForUser(userId: string): Promise<{ count: number }> {
    return this.db.otpCode.deleteMany({ where: { userId } });
  }
}
