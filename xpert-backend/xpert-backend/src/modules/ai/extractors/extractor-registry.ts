import { NotFoundError } from '../../../shared/errors/not-found.error.js';
import { PdfExtractor } from './pdf.extractor.js';
import { DocxExtractor } from './docx.extractor.js';
import type { TextExtractor } from './text-extractor.interface.js';
export class ExtractorRegistry {
  private readonly extractors = new Map([['pdf', new PdfExtractor()], ['docx', new DocxExtractor()]]);
  getExtractor(extension: string): TextExtractor {
    const extractor = this.extractors.get(extension.toLowerCase().replace('.', ''));
    if (!extractor) throw new NotFoundError(`Unsupported resume format: ${extension}`);
    return extractor;
  }
}
