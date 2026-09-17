import { randomInt } from 'node:crypto';
import bcrypt from 'bcryptjs';

export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 12);
}

export function verifyOtp(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
