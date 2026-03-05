import rateLimit from 'express-rate-limit';
import { CONSTANTS } from '../config/constants';

export const globalRateLimit = rateLimit({
  windowMs: CONSTANTS.RATE_LIMIT_WINDOW_MS,
  max: CONSTANTS.RATE_LIMIT_MAX,
  message: { success: false, message: 'Too many requests — try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const contactRateLimit = rateLimit({
  windowMs: CONSTANTS.RATE_LIMIT_WINDOW_MS * 4,  // 60 min
  max: CONSTANTS.CONTACT_RATE_LIMIT_MAX,
  message: { success: false, message: 'Too many enquiries — please wait before submitting again' },
});

export const authRateLimit = rateLimit({
  windowMs: CONSTANTS.RATE_LIMIT_WINDOW_MS,
  max: CONSTANTS.AUTH_RATE_LIMIT_MAX,
  message: { success: false, message: 'Too many login attempts — please wait' },
});