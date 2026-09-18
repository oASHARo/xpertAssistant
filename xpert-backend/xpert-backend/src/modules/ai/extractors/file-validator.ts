import { ValidationError } from '../../../shared/errors/validation.error.js';

export function validateMagicBytes(buffer: Buffer, expectedExtension: string): void {
  const ext = expectedExtension.toLowerCase().replace('.', '');
  
  if (ext === 'pdf') {
    // PDF Magic bytes: %PDF- (0x25 0x50 0x44 0x46)
    if (buffer.length < 4 || buffer.readUInt32BE(0) !== 0x25504446) {
      throw new ValidationError('Invalid file signature: Not a valid PDF file.');
    }
  } else if (ext === 'docx') {
    // DOCX (ZIP) Magic bytes: PK\x03\x04 (0x50 0x4B 0x03 0x04)
    if (buffer.length < 4 || buffer.readUInt32BE(0) !== 0x504B0304) {
      throw new ValidationError('Invalid file signature: Not a valid DOCX file.');
    }
  }
}
