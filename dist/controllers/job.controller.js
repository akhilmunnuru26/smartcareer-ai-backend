"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobController = void 0;
const gemini_service_1 = require("../services/gemini.service");
const geminiService = new gemini_service_1.GeminiService();
class JobController {
    async analyzeMatch(req, res) {
        try {
            const { resumeText, jobDescription } = req.body;
            if (!resumeText || resumeText.trim().length < 100) {
                res.status(400).json({
                    error: 'Resume text is required and must be at least 100 characters',
                });
                return;
            }
            if (!jobDescription || jobDescription.trim().length < 100) {
                res.status(400).json({
                    error: 'Job description is required and must be at least 100 characters',
                });
                return;
            }
            console.log('🎯 Analyzing job match...');
            const matchResult = await geminiService.analyzeJobMatch(resumeText, jobDescription);
            res.status(200).json({
                success: true,
                data: matchResult,
            });
        }
        catch (error) {
            console.error('Job match error:', error);
            res.status(500).json({
                error: 'Failed to analyze job match',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}
exports.JobController = JobController;
