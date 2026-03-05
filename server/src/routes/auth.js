import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import protect from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { registerSchema, loginSchema, updateMeSchema, onboardingSchema } from '../schemas/auth.js';
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  updateMe,
  completeOnboarding,
  recalculateGoals,
} from '../controllers/authController.js';

const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, message: { message: 'Too many attempts, try again later' } });
const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', authLimiter, refresh);
router.post('/logout', logout);

router.get('/me', protect, getMe);
router.put('/me', protect, validate(updateMeSchema), updateMe);
router.put('/onboarding', protect, validate(onboardingSchema), completeOnboarding);
router.post('/recalculate-goals', protect, recalculateGoals);

export default router;
