import { Router } from 'express';
import { JobController } from '../controllers/job.controller';

const router = Router();
const jobController = new JobController();

router.post('/match', (req, res) => jobController.analyzeMatch(req, res));

export default router;