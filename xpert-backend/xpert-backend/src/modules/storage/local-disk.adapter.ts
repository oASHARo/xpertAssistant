import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { config } from '../../config/env.js';
import type { StorageProvider } from './storage-provider.interface.js';

export class LocalDiskAdapter implements StorageProvider {
  private readonly root = path.resolve(config.STORAGE_LOCAL_DIR);
  async save(buffer: Buffer, filename: string) {
    await mkdir(this.root, { recursive: true });
    const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `${randomUUID()}-${safeName}`;
    await writeFile(path.join(this.root, storageKey), buffer);
    return { fileUrl: '', storageKey };
  }
  getBuffer(storageKey: string) {
    const safeKey = path.basename(storageKey);
    return readFile(path.join(this.root, safeKey));
  }
  async delete(storageKey: string) {
    try { await unlink(path.join(this.root, path.basename(storageKey))); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
}
