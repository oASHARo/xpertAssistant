import type { RefreshToken } from '../generated/tenant/index.js';
import type { TenantPrismaClient } from '../db/tenant-resolver/tenant-connection-factory.js';

export interface CreateRefreshTokenInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export class RefreshTokenRepository {
  constructor(private readonly db: TenantPrismaClient) {}

  create(input: CreateRefreshTokenInput): Promise<RefreshToken> {
    return this.db.refreshToken.create({ data: input });
  }

  findByTokenHash(hash: string): Promise<RefreshToken | null> {
    return this.db.refreshToken.findFirst({
      where: { tokenHash: hash, revokedAt: null, expiresAt: { gt: new Date() } },
    });
  }

  revoke(tokenId: string): Promise<RefreshToken> {
    return this.db.refreshToken.update({
      where: { id: tokenId },
      data: { revokedAt: new Date() },
    });
  }

  revokeAllForUser(userId: string): Promise<{ count: number }> {
    return this.db.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
