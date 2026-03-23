import { Request, Response } from 'express';
import { GeminiService } from '../services/gemini.service';
import { prisma } from '../config/prisma';

const geminiService = new GeminiService();

export class InterviewController {
  async generateQuestions(req: Request, res: Response): Promise<void> {
    try {
      const { role, difficulty, userId } = req.body;

      if (!role || !role.trim()) {
        res.status(400).json({
          success: false,
          error: 'Job role is required',
        });
        return;
      }

      console.log('🎯 Generating interview questions for:', role, difficulty);

      const questions = await geminiService.generateInterviewQuestions(role, difficulty || 'mid');

      // Create interview session in database if userId provided
      let sessionId = null;
      if (userId) {
        try {
          const session = await prisma.interviewSession.create({
            data: {
              userId,
              role,
              difficulty: difficulty || 'mid',
              questionsAnswered: 0,
            },
          });
          sessionId = session.id;
          console.log('💾 Interview session created with ID:', sessionId);
        } catch (dbError) {
          console.error('❌ Database save error:', dbError);
        }
      }

      console.log('✅ Questions generated:', questions.length);

      res.status(200).json({
        success: true,
        questions,
        sessionId, // Send session ID to frontend
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
      const { question, answer, role, userId, sessionId } = req.body;

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

      // Save question and evaluation to database if sessionId provided
      if (sessionId) {
        try {
          await prisma.interviewQuestion.create({
            data: {
              sessionId,
              question,
              answer,
              score: evaluation.score,
              feedback: evaluation.feedback,
            },
          });

          // Update session with questionsAnswered count and average score
          const questionCount = await prisma.interviewQuestion.count({
            where: { sessionId },
          });

          const avgScore = await prisma.interviewQuestion.aggregate({
            where: { sessionId },
            _avg: { score: true },
          });

          await prisma.interviewSession.update({
            where: { id: sessionId },
            data: {
              questionsAnswered: questionCount,
              averageScore: avgScore._avg.score || null,
            },
          });

          console.log('💾 Answer and evaluation saved to database');
        } catch (dbError) {
          console.error('❌ Database save error:', dbError);
        }
      }

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

  async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = typeof req.params.userId === 'string' ? req.params.userId : '';
      const page = typeof req.query.page === 'string' ? req.query.page : '1';
      const limit = typeof req.query.limit === 'string' ? req.query.limit : '10';

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required',
        });
        return;
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [sessions, total] = await Promise.all([
        prisma.interviewSession.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
          select: {
            id: true,
            role: true,
            difficulty: true,
            questionsAnswered: true,
            averageScore: true,
            createdAt: true,
          },
        }),
        prisma.interviewSession.count({ where: { userId } }),
      ]);

      res.status(200).json({
        success: true,
        data: sessions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Get interview history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch interview history',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getSessionById(req: Request, res: Response): Promise<void> {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : '';

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Session ID is required',
        });
        return;
      }

      const session = await prisma.interviewSession.findUnique({
        where: { id },
        include: {
          questions: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Interview session not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: session,
      });
    } catch (error) {
      console.error('Get interview session error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch interview session',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}