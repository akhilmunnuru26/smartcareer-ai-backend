import { Request, Response } from 'express';
import { GeminiService } from '../services/gemini.service';
import { prisma } from '../config/prisma';
import { memoryCache } from '../services/memoryCache.service';

const geminiService = new GeminiService();

interface JobMatchResult {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchedExperience: string[];
  missingExperience: string[];
  recommendations: string[];
  overallAssessment: string;
}

export class JobController {
  async matchJob(req: Request, res: Response): Promise<void> {
    try {
      const { resumeText, jobDescription, userId } = req.body;

      // Validation
      if (!resumeText || resumeText.trim().length < 100) {
        res.status(400).json({
          success: false,
          error: 'Resume text is required and must be at least 100 characters',
        });
        return;
      }

      if (!jobDescription || jobDescription.trim().length < 100) {
        res.status(400).json({
          success: false,
          error: 'Job description is required and must be at least 100 characters',
        });
        return;
      }

      // Check cache first
      const cacheKey = memoryCache.getJobMatchKey(resumeText, jobDescription);
      const cachedMatch = memoryCache.get<JobMatchResult>(cacheKey);

      let matchResult: JobMatchResult;
      let fromCache = false;

      if (cachedMatch) {
        // Use cached result
        matchResult = cachedMatch;
        fromCache = true;
        console.log('⚡ Using cached job match (saved API call!)');
      } else {
        // Generate new match analysis
        console.log('🔍 Analyzing job match with AI...');
        matchResult = await geminiService.analyzeJobMatch(resumeText, jobDescription);

        // Cache the result for 1 hour
        memoryCache.set(cacheKey, matchResult, 3600);
      }

      // Save to database if userId provided
      let savedMatch = null;
      if (userId) {
        try {
          // Extract job title from job description (simple approach)
          const jobTitleMatch = jobDescription.match(/(?:title|position|role):\s*([^\n]+)/i);
          const jobTitle = jobTitleMatch ? jobTitleMatch[1].trim() : 'Job Position';

          savedMatch = await prisma.jobMatch.create({
            data: {
              userId,
              jobTitle,
              jobDescription,
              resumeText,
              matchPercentage: matchResult.matchPercentage,
              matchedSkills: matchResult.matchedSkills,
              missingSkills: matchResult.missingSkills,
              matchedExperience: matchResult.matchedExperience,
              missingExperience: matchResult.missingExperience,
              recommendations: matchResult.recommendations,
              overallAssessment: matchResult.overallAssessment,
            },
          });
          console.log('💾 Job match saved to database with ID:', savedMatch.id);
        } catch (dbError) {
          console.error('❌ Database save error:', dbError);
          // Don't fail the request if DB save fails
        }
      } else {
        console.log('⚠️ No userId provided - match not saved to database');
      }

      res.status(200).json({
        success: true,
        data: {
          ...matchResult,
          matchId: savedMatch?.id,
        },
        meta: {
          cached: fromCache,
          saved: !!savedMatch,
        },
      });
    } catch (error) {
      console.error('Job match error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze job match',
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

      const [matches, total] = await Promise.all([
        prisma.jobMatch.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
          select: {
            id: true,
            jobTitle: true,
            matchPercentage: true,
            createdAt: true,
          },
        }),
        prisma.jobMatch.count({ where: { userId } }),
      ]);

      res.status(200).json({
        success: true,
        data: matches,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Get job match history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch job match history',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getMatchById(req: Request, res: Response): Promise<void> {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : '';

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Match ID is required',
        });
        return;
      }

      const match = await prisma.jobMatch.findUnique({
        where: { id },
      });

      if (!match) {
        res.status(404).json({
          success: false,
          error: 'Job match not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: match,
      });
    } catch (error) {
      console.error('Get job match error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch job match',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deleteMatch(req: Request, res: Response): Promise<void> {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : '';

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Match ID is required',
        });
        return;
      }

      await prisma.jobMatch.delete({
        where: { id },
      });

      res.status(200).json({
        success: true,
        message: 'Job match deleted successfully',
      });
    } catch (error) {
      console.error('Delete job match error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete job match',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}