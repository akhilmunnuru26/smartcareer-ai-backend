"use strict";
// // // import {Request, Response} from 'express';
// // // import { ClaudeService } from '../services/gemini.service';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeController = void 0;
const gemini_service_1 = require("../services/gemini.service");
const prisma_1 = require("../config/prisma");
const memoryCache_service_1 = require("../services/memoryCache.service");
const geminiService = new gemini_service_1.GeminiService();
class ResumeController {
    async analyzeResume(req, res) {
        try {
            const { resumeText, targetRole, userId } = req.body;
            // Validation
            if (!resumeText || resumeText.trim().length < 100) {
                res.status(400).json({
                    error: 'Resume text is required and must be at least 100 characters'
                });
                return;
            }
            // Check cache first
            const cacheKey = memoryCache_service_1.memoryCache.getResumeAnalysisKey(resumeText, targetRole);
            const cachedAnalysis = memoryCache_service_1.memoryCache.get(cacheKey);
            let analysis;
            let fromCache = false;
            if (cachedAnalysis) {
                // Use cached result
                analysis = cachedAnalysis;
                fromCache = true;
                console.log('⚡ Using cached analysis (saved API call!)');
            }
            else {
                // Generate new analysis
                console.log('🔍 Analyzing resume with AI...');
                analysis = await geminiService.analyzeResume(resumeText, targetRole);
                // Cache the result for 1 hour (3600 seconds)
                memoryCache_service_1.memoryCache.set(cacheKey, analysis, 3600);
            }
            // Save to database if userId provided
            let savedAnalysis = null;
            if (userId) {
                try {
                    savedAnalysis = await prisma_1.prisma.resumeAnalysis.create({
                        data: {
                            userId,
                            resumeText,
                            targetRole: targetRole || null,
                            overallScore: analysis.overallScore,
                            strengths: analysis.strengths,
                            improvements: analysis.improvements,
                            atsOptimization: analysis.atsOptimization,
                            tailoredAdvice: analysis.tailoredAdvice,
                        },
                    });
                    console.log('💾 Analysis saved to database with ID:', savedAnalysis.id);
                }
                catch (dbError) {
                    console.error('❌ Database save error:', dbError);
                    // Don't fail the request if DB save fails
                }
            }
            else {
                console.log('⚠️ No userId provided - analysis not saved to database');
            }
            res.status(200).json({
                success: true,
                data: {
                    ...analysis,
                    analysisId: savedAnalysis?.id,
                },
                meta: {
                    cached: fromCache,
                    saved: !!savedAnalysis,
                },
            });
        }
        catch (error) {
            console.error('Resume analysis error:', error);
            res.status(500).json({
                error: 'Failed to analyze resume',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async getHistory(req, res) {
        try {
            const userId = typeof req.params.userId === 'string' ? req.params.userId : '';
            const page = typeof req.query.page === 'string' ? req.query.page : '1';
            const limit = typeof req.query.limit === 'string' ? req.query.limit : '10';
            if (!userId) {
                res.status(400).json({
                    error: 'User ID is required',
                });
                return;
            }
            const skip = (Number(page) - 1) * Number(limit);
            const [analyses, total] = await Promise.all([
                prisma_1.prisma.resumeAnalysis.findMany({
                    where: { userId },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: Number(limit),
                    select: {
                        id: true,
                        targetRole: true,
                        overallScore: true,
                        createdAt: true,
                    },
                }),
                prisma_1.prisma.resumeAnalysis.count({ where: { userId } }),
            ]);
            res.status(200).json({
                success: true,
                data: analyses,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit)),
                },
            });
        }
        catch (error) {
            console.error('Get history error:', error);
            res.status(500).json({
                error: 'Failed to fetch history',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async getAnalysisById(req, res) {
        try {
            const id = typeof req.params.id === 'string' ? req.params.id : '';
            if (!id) {
                res.status(400).json({
                    error: 'Analysis ID is required',
                });
                return;
            }
            const analysis = await prisma_1.prisma.resumeAnalysis.findUnique({
                where: { id },
            });
            if (!analysis) {
                res.status(404).json({
                    error: 'Analysis not found',
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: analysis,
            });
        }
        catch (error) {
            console.error('Get analysis error:', error);
            res.status(500).json({
                error: 'Failed to fetch analysis',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async deleteAnalysis(req, res) {
        try {
            const id = typeof req.params.id === 'string' ? req.params.id : '';
            if (!id) {
                res.status(400).json({
                    error: 'Analysis ID is required',
                });
                return;
            }
            await prisma_1.prisma.resumeAnalysis.delete({
                where: { id },
            });
            res.status(200).json({
                success: true,
                message: 'Analysis deleted successfully',
            });
        }
        catch (error) {
            console.error('Delete analysis error:', error);
            res.status(500).json({
                error: 'Failed to delete analysis',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}
exports.ResumeController = ResumeController;
