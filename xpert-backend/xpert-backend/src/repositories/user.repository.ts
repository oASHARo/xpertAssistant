import type { User } from '../generated/tenant/index.js';
import type { TenantPrismaClient } from '../db/tenant-resolver/tenant-connection-factory.js';

export interface CreateUserInput {
  email: string;
  username: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
}

export class UserRepository {
  constructor(private readonly db: TenantPrismaClient) {}

  findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { username } });
  }

  create(input: CreateUserInput): Promise<User> {
    return this.db.user.create({ data: input });
  }

  updateEmailVerified(userId: string, emailVerified: boolean): Promise<User> {
    return this.db.user.update({ where: { id: userId }, data: { emailVerified } });
  }

  updatePassword(userId: string, passwordHash: string): Promise<User> {
    return this.db.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  incrementLoginAttempts(userId: string): Promise<User> {
    return this.db.user.update({
      where: { id: userId },
      data: { loginAttempts: { increment: 1 } },
    });
  }

  resetLoginAttempts(userId: string): Promise<User> {
    return this.db.user.update({ where: { id: userId }, data: { loginAttempts: 0 } });
  }

  lockAccount(userId: string, lockedUntil: Date): Promise<User> {
    return this.db.user.update({ where: { id: userId }, data: { lockedUntil } });
  }

  updateLastLogin(userId: string): Promise<User> {
    return this.db.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }
}
