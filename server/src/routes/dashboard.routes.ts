import { Router } from 'express';
import { getDashboardOverview } from '../controllers/dashboard.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// All dashboard routes require authentication
router.use(protect);

// GET /api/v1/dashboard/overview
// Accessible by admin and superadmin only
router.get('/overview', restrictTo('admin', 'superadmin'), getDashboardOverview);

export default router;