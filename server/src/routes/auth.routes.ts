import { Router } from 'express';
import {
  login,
  register,
  logout,
  getMe,
  refreshAccessToken,
  changePassword,
} from '../controllers/auth.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  refreshTokenSchema,
} from '../validators/auth.schema';

const router = Router();

// Public routes
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refreshAccessToken);

// Protected routes (any authenticated user)
router.use(protect);
router.get('/me', getMe);
router.post('/logout', logout);
router.patch('/change-password', validate(changePasswordSchema), changePassword);

// Superadmin only
router.post(
  '/register',
  restrictTo('superadmin'),
  validate(registerSchema),
  register
);

export default router;