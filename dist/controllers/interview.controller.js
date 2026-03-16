"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewController = void 0;
const gemini_service_1 = require("../services/gemini.service");
const geminiService = new gemini_service_1.GeminiService();
class InterviewController {
    async generateQuestions(req, res) {
        try {
            const { role, difficulty } = req.body;
            if (!role || !difficulty) {
                res.status(400).json({
                    error: 'Role and difficulty are required',
                });
                return;
            }
            console.log(`🎯 Generating ${difficulty} ${role} interview questions...`);
            const questions = await geminiService.generateInterviewQuestions(role, difficulty);
            res.status(200).json({
                success: true,
                data: { questions },
            });
        }
        catch (error) {
            console.error('Generate questions error:', error);
            res.status(500).json({
                error: 'Failed to generate questions',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async evaluateAnswer(req, res) {
        try {
            const { question, answer, role } = req.body;
            if (!question || !answer) {
                res.status(400).json({
                    error: 'Question and answer are required',
                });
                return;
            }
            console.log('📝 Evaluating interview answer...');
            const feedback = await geminiService.evaluateInterviewAnswer(question, answer, role);
            res.status(200).json({
                success: true,
                data: feedback,
            });
        }
        catch (error) {
            console.error('Evaluate answer error:', error);
            res.status(500).json({
                error: 'Failed to evaluate answer',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}
exports.InterviewController = InterviewController;
