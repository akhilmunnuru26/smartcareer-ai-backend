// import { Request, Response } from 'express';
// import { GeminiService } from '../services/gemini.service';

// const geminiService = new GeminiService();

// export class InterviewController {
//   async generateQuestions(req: Request, res: Response): Promise<void> {
//     try {
//       const { role, difficulty } = req.body;

//       if (!role || !difficulty) {
//         res.status(400).json({
//           error: 'Role and difficulty are required',
//         });
//         return;
//       }

//       console.log(`🎯 Generating ${difficulty} ${role} interview questions...`);
//       const questions = await geminiService.generateInterviewQuestions(role, difficulty);

//       res.status(200).json({
//         success: true,
//         data: { questions },
//       });
//     } catch (error) {
//       console.error('Generate questions error:', error);
//       res.status(500).json({
//         error: 'Failed to generate questions',
//         message: error instanceof Error ? error.message : 'Unknown error',
//       });
//     }
//   }

//   async evaluateAnswer(req: Request, res: Response): Promise<void> {
//     try {
//       const { question, answer, role } = req.body;

//       if (!question || !answer) {
//         res.status(400).json({
//           error: 'Question and answer are required',
//         });
//         return;
//       }

//       console.log('📝 Evaluating interview answer...');
//       const feedback = await geminiService.evaluateInterviewAnswer(question, answer, role);

//       res.status(200).json({
//         success: true,
//         data: feedback,
//       });
//     } catch (error) {
//       console.error('Evaluate answer error:', error);
//       res.status(500).json({
//         error: 'Failed to evaluate answer',
//         message: error instanceof Error ? error.message : 'Unknown error',
//       });
//     }
//   }
// }

import { Request, Response } from 'express';
import { GeminiService } from '../services/gemini.service';

const geminiService = new GeminiService();

export class InterviewController {
  async generateQuestions(req: Request, res: Response): Promise<void> {
    try {
      const { role, difficulty } = req.body;

      if (!role || !role.trim()) {
        res.status(400).json({
          success: false,
          error: 'Job role is required',
        });
        return;
      }

      console.log('🎯 Generating interview questions for:', role, difficulty);

      const questions = await geminiService.generateInterviewQuestions(role, difficulty || 'mid');

      console.log('✅ Questions generated:', questions.length);

      res.status(200).json({
        success: true,
        questions, // Make sure this is an array
        meta: {
          role,
          difficulty: difficulty || 'mid',
          count: questions.length,
        },
      });
    } catch (error) {
      console.error('Interview generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate interview questions',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async evaluateAnswer(req: Request, res: Response): Promise<void> {
    try {
      const { question, answer, role } = req.body;

      if (!question || !answer) {
        res.status(400).json({
          success: false,
          error: 'Question and answer are required',
        });
        return;
      }

      console.log('📝 Evaluating answer for:', role || 'general role');

      const evaluation = await geminiService.evaluateInterviewAnswer(
        question,
        answer,
        role || ''
      );

      console.log('✅ Evaluation complete, score:', evaluation.score);

      res.status(200).json({
        success: true,
        evaluation,
      });
    } catch (error) {
      console.error('Answer evaluation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to evaluate answer',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}