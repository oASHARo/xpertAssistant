import mammoth from 'mammoth';
import type { TextExtractor } from './text-extractor.interface.js';
export class DocxExtractor implements TextExtractor { async extract(buffer: Buffer) { return (await mammoth.extractRawText({ buffer })).value; } }
