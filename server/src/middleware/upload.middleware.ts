import multer from 'multer';
import { CONSTANTS } from '../config/constants';
import { ApiError } from '../utils/ApiError';

// Store in memory — we'll stream directly to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (_req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (CONSTANTS.ALLOWED_IMAGE_TYPES.includes(file.mimetype as never)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Only JPEG, PNG, and WebP images are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: CONSTANTS.MAX_FILE_SIZE_MB * 1024 * 1024 },
});