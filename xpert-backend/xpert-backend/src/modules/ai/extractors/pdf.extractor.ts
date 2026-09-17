import { PDFParse } from 'pdf-parse';
import type { TextExtractor } from './text-extractor.interface.js';
export class PdfExtractor implements TextExtractor {
  async extract(buffer: Buffer) {
    const parser = new PDFParse({ data: buffer });
    try { return (await parser.getText()).text; }
    finally { await parser.destroy(); }
  }
}
