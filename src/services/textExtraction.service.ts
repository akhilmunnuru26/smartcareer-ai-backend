import fs from 'fs';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import path from 'path';

export class TextExtractionService {
  async extractText(filePath: string, mimeType: string): Promise<string> {
    try {
      if (mimeType === 'application/pdf') {
        return await this.extractFromPDF(filePath);
      } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword'
      ) {
        return await this.extractFromDOCX(filePath);
      } else if (mimeType.startsWith('image/')) {
        return await this.extractFromImage(filePath);
      } else {
        throw new Error('Unsupported file type');
      }
    } finally {
      // Clean up uploaded file
      this.deleteFile(filePath);
    }
  }

  private async extractFromPDF(filePath: string): Promise<string> {
    try {
      // Use CommonJS require directly
      const pdf = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      
      console.log('📖 Parsing PDF...');
      const data = await pdf(dataBuffer);
      console.log('✅ PDF parsed successfully');
      
      return data.text || '';
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  private async extractFromDOCX(filePath: string): Promise<string> {
    try {
      console.log('📖 Parsing DOCX...');
      const result = await mammoth.extractRawText({ path: filePath });
      console.log('✅ DOCX parsed successfully');
      return result.value || '';
    } catch (error) {
      console.error('DOCX extraction error:', error);
      throw new Error('Failed to extract text from DOCX');
    }
  }

  private async extractFromImage(filePath: string): Promise<string> {
    try {
      console.log('🖼️ Starting OCR on image...');
      
      const { data: { text } } = await Tesseract.recognize(
        filePath,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          },
        }
      );

      console.log('✅ OCR completed');
      return text || '';
    } catch (error) {
      console.error('OCR error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  private deleteFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('🗑️ Temporary file deleted:', filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
}