import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();
const authController = new AuthController();

router.post('/signup',authLimiter, (req, res) => authController.signup(req, res));
router.post('/signin', authLimiter, (req, res) => authController.signin(req, res));

export default router;