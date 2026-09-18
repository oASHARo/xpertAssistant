import { LocalDiskAdapter } from './local-disk.adapter.js';
import type { StorageProvider } from './storage-provider.interface.js';

class StorageFactory {
  private instance: StorageProvider | null = null;

  getProvider(): StorageProvider {
    if (this.instance) {
      return this.instance;
    }

    const providerType = process.env.STORAGE_PROVIDER || 'local';

    switch (providerType.toLowerCase()) {
      case 's3':
        // Future implementation: return new S3Adapter();
        throw new Error('S3 storage provider is not yet implemented.');
      case 'gcs':
        // Future implementation: return new GcsAdapter();
        throw new Error('GCS storage provider is not yet implemented.');
      case 'local':
      default:
        this.instance = new LocalDiskAdapter();
        return this.instance;
    }
  }
}

export const storageFactory = new StorageFactory();
