import { Router } from 'express';
import { InterviewController } from '../controllers/interview.controller';
import { interviewLimiter } from '../middlewares/rateLimiter';
const router = Router();
const interviewController = new InterviewController();

// Apply rate limiter
router.post('/generate', interviewLimiter, (req, res) => interviewController.generateQuestions(req, res));
router.post('/evaluate', interviewLimiter, (req, res) => interviewController.evaluateAnswer(req, res));

export default router;