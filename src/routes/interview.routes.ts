import { Router } from 'express';
import { InterviewController } from '../controllers/interview.controller';
import { interviewLimiter } from '../middlewares/rateLimiter';

const router = Router();
const interviewController = new InterviewController();


router.post('/generate', interviewLimiter, (req, res) => interviewController.generateQuestions(req, res));
router.post('/evaluate', interviewLimiter, (req, res) => interviewController.evaluateAnswer(req, res));
router.get('/history/:userId', (req, res) => interviewController.getHistory(req, res));
router.get('/session/:id', (req, res) => interviewController.getSessionById(req, res));

export default router;