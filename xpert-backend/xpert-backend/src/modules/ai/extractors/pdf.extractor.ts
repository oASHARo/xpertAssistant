import { PDFParse } from 'pdf-parse';
import type { TextExtractor } from './text-extractor.interface.js';
import { createWorker } from 'tesseract.js';

export class PdfExtractor implements TextExtractor {
  async extract(buffer: Buffer) {
    const parser = new PDFParse({ data: buffer });
    let text = '';
    try { 
      text = (await parser.getText()).text; 
    } finally { 
      await parser.destroy(); 
    }

    if (text.trim().length < 50) {
      console.warn('Extracted text is too short, falling back to OCR...');
      const worker = await createWorker('eng');
      try {
        const ret = await worker.recognize(buffer);
        text = ret.data.text;
      } finally {
        await worker.terminate();
      }
    }

    return text;
  }
}
