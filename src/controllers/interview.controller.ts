import { Request, Response } from 'express';
import { GeminiService } from '../services/gemini.service';

const geminiService = new GeminiService();

export class InterviewController {
  async generateQuestions(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
      console.error('Generate questions error:', error);
      res.status(500).json({
        error: 'Failed to generate questions',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async evaluateAnswer(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
      console.error('Evaluate answer error:', error);
      res.status(500).json({
        error: 'Failed to evaluate answer',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}