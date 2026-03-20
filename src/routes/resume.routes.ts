// import { Router } from "express";
// import { ResumeController} from "../controllers/resume.controller";

// const router = Router();
// const resumeController = new ResumeController();

// router.post("/analyze", (req,res) => resumeController.analyzeResume(req,res));

// export default router;

import { Router } from 'express';
import { ResumeController } from '../controllers/resume.controller';
import { resumeAnalysisLimiter } from '../middlewares/rateLimiter';

const router = Router();
const resumeController = new ResumeController();

// Apply rate limiter to analyze endpoint
router.post('/analyze', resumeAnalysisLimiter, (req, res) => resumeController.analyzeResume(req, res));
router.get('/history/:userId', (req, res) => resumeController.getHistory(req, res));
router.get('/analysis/:id', (req, res) => resumeController.getAnalysisById(req, res));
router.delete('/analysis/:id', (req, res) => resumeController.deleteAnalysis(req, res));

export default router;