import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();
const dashboardController = new DashboardController();

router.get('/stats/:userId', (req, res) => dashboardController.getStats(req, res));

export default router;