import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export class DashboardController {
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = typeof req.params.userId === 'string' ? req.params.userId : '';

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required',
        });
        return;
      }

      console.log('📊 Fetching dashboard stats for user:', userId);

      // Get all stats in parallel
      const [
        totalResumes,
        totalInterviews,
        totalJobMatches,
        recentResumes,
        recentInterviews,
        recentJobMatches,
        averageResumeScore,
        averageJobMatchScore,
      ] = await Promise.all([
        // Total counts
        prisma.resumeAnalysis.count({ where: { userId } }),
        prisma.interviewSession.count({ where: { userId } }),
        prisma.jobMatch.count({ where: { userId } }),

        // Recent activities (last 5)
        prisma.resumeAnalysis.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            targetRole: true,
            overallScore: true,
            createdAt: true,
          },
        }),
        prisma.interviewSession.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            role: true,
            difficulty: true,
            questionsAnswered: true,
            createdAt: true,
          },
        }),
        prisma.jobMatch.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            jobTitle: true,
            matchPercentage: true,
            createdAt: true,
          },
        }),

        // Average scores
        prisma.resumeAnalysis.aggregate({
          where: { userId },
          _avg: { overallScore: true },
        }),
        prisma.jobMatch.aggregate({
          where: { userId },
          _avg: { matchPercentage: true },
        }),
      ]);

      console.log('✅ Stats fetched successfully');

      res.status(200).json({
        success: true,
        data: {
          stats: {
            totalResumes,
            totalInterviews,
            totalJobMatches,
            averageResumeScore: Math.round(averageResumeScore._avg.overallScore || 0),
            averageJobMatchScore: Math.round(averageJobMatchScore._avg.matchPercentage || 0),
          },
          recentActivity: {
            resumes: recentResumes,
            interviews: recentInterviews,
            jobMatches: recentJobMatches,
          },
        },
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}