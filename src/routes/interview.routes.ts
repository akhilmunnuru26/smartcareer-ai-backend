import { Router } from 'express';
import { InterviewController } from '../controllers/interview.controller';

const router = Router();
const interviewController = new InterviewController();

router.post('/generate', (req, res) => interviewController.generateQuestions(req, res));
router.post('/evaluate', (req, res) => interviewController.evaluateAnswer(req, res));

export default router;