export interface StorageProvider {
  save(buffer: Buffer, filename: string): Promise<{ fileUrl: string; storageKey: string }>;
  getBuffer(storageKey: string): Promise<Buffer>;
  delete(storageKey: string): Promise<void>;
}
