import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'node:crypto';
import { config } from '../config/env.js';

const ENCRYPTED_PREFIX = 'enc:v1:';
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function encryptionKey(): Buffer {
  const key = Buffer.from(config.TENANT_CREDENTIALS_KEY, 'base64');
  if (key.length !== KEY_LENGTH) {
    throw new Error('TENANT_CREDENTIALS_KEY must decode to exactly 32 bytes');
  }
  return key;
}

export function encryptTenantCredential(value: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${ENCRYPTED_PREFIX}${Buffer.concat([iv, authTag, ciphertext]).toString('base64')}`;
}

export function decryptTenantCredential(value: string): string {
  if (!value.startsWith(ENCRYPTED_PREFIX)) {
    throw new Error('Tenant database credentials must be encrypted at rest');
  }

  const payload = Buffer.from(value.slice(ENCRYPTED_PREFIX.length), 'base64');
  if (payload.length <= IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('Invalid encrypted tenant credential');
  }

  const iv = payload.subarray(0, IV_LENGTH);
  const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
