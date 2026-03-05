import { Router } from 'express';
import { submitContact, getEnquiries, markAsRead } from '../controllers/contact.controller';
import { validate } from '../middleware/validate.middleware';
import { protect } from '../middleware/auth.middleware';
import { contactRateLimit } from '../middleware/rateLimit.middleware';
import { contactSchema } from '../validators/contact.schema';

const router = Router();

// Public routes
router.post('/', contactRateLimit, validate(contactSchema), submitContact);

// Protected admin routes
router.use(protect);
router.get('/', getEnquiries);
router.patch('/:id/read', markAsRead);

export default router;