"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const textExtraction_service_1 = require("../services/textExtraction.service");
const textExtractionService = new textExtraction_service_1.TextExtractionService();
class UploadController {
    async extractText(req, res) {
        try {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    message: 'No file uploaded',
                });
                return;
            }
            console.log('📄 File received:', req.file.originalname);
            console.log('📊 File size:', (req.file.size / 1024 / 1024).toFixed(2), 'MB');
            console.log('🔍 MIME type:', req.file.mimetype);
            const text = await textExtractionService.extractText(req.file.path, req.file.mimetype);
            if (!text || text.trim().length < 50) {
                res.status(400).json({
                    success: false,
                    message: 'Could not extract sufficient text from file. Please ensure the file contains readable text.',
                });
                return;
            }
            console.log('✅ Text extracted successfully');
            console.log('📝 Text length:', text.length, 'characters');
            res.status(200).json({
                success: true,
                text: text.trim(),
                metadata: {
                    filename: req.file.originalname,
                    size: req.file.size,
                    type: req.file.mimetype,
                    extractedLength: text.length,
                },
            });
        }
        catch (error) {
            console.error('❌ Upload error:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to process file',
            });
        }
    }
}
exports.UploadController = UploadController;
