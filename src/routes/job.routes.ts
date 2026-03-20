// import { Router } from 'express';
// import { JobController } from '../controllers/job.controller';

// const router = Router();
// const jobController = new JobController();

// router.post('/match', (req, res) => jobController.analyzeMatch(req, res));

// export default router;

import { Router } from 'express';
import { JobController } from '../controllers/job.controller';
import { jobMatchLimiter} from '../middlewares/rateLimiter';



const router = Router();
const jobController = new JobController();

// Apply rate limiter
router.post('/match', jobMatchLimiter, (req, res) => jobController.matchJob(req, res));
router.get('/history/:userId', (req, res) => jobController.getHistory(req, res));
router.get('/match/:id', (req, res) => jobController.getMatchById(req, res));
router.delete('/match/:id', (req, res) => jobController.deleteMatch(req, res));

export default router;