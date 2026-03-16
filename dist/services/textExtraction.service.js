"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextExtractionService = void 0;
const fs_1 = __importDefault(require("fs"));
const mammoth_1 = __importDefault(require("mammoth"));
const tesseract_js_1 = __importDefault(require("tesseract.js"));
class TextExtractionService {
    async extractText(filePath, mimeType) {
        try {
            if (mimeType === 'application/pdf') {
                return await this.extractFromPDF(filePath);
            }
            else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                mimeType === 'application/msword') {
                return await this.extractFromDOCX(filePath);
            }
            else if (mimeType.startsWith('image/')) {
                return await this.extractFromImage(filePath);
            }
            else {
                throw new Error('Unsupported file type');
            }
        }
        finally {
            // Clean up uploaded file
            this.deleteFile(filePath);
        }
    }
    async extractFromPDF(filePath) {
        try {
            // Use CommonJS require directly
            const pdf = require('pdf-parse');
            const dataBuffer = fs_1.default.readFileSync(filePath);
            console.log('📖 Parsing PDF...');
            const data = await pdf(dataBuffer);
            console.log('✅ PDF parsed successfully');
            return data.text || '';
        }
        catch (error) {
            console.error('PDF extraction error:', error);
            throw new Error('Failed to extract text from PDF');
        }
    }
    async extractFromDOCX(filePath) {
        try {
            console.log('📖 Parsing DOCX...');
            const result = await mammoth_1.default.extractRawText({ path: filePath });
            console.log('✅ DOCX parsed successfully');
            return result.value || '';
        }
        catch (error) {
            console.error('DOCX extraction error:', error);
            throw new Error('Failed to extract text from DOCX');
        }
    }
    async extractFromImage(filePath) {
        try {
            console.log('🖼️ Starting OCR on image...');
            const { data: { text } } = await tesseract_js_1.default.recognize(filePath, 'eng', {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                    }
                },
            });
            console.log('✅ OCR completed');
            return text || '';
        }
        catch (error) {
            console.error('OCR error:', error);
            throw new Error('Failed to extract text from image');
        }
    }
    deleteFile(filePath) {
        try {
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
                console.log('🗑️ Temporary file deleted:', filePath);
            }
        }
        catch (error) {
            console.error('Error deleting file:', error);
        }
    }
}
exports.TextExtractionService = TextExtractionService;
