import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  togglePublish,
  deleteProjectImage,
  getProjectBySlug,
} from '../controllers/project.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';
import {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
} from '../validators/project.schema';

const router = Router();

// ─── Public ───────────────────────────────────────────────────────────────
// ─── Public ───────────────────────────────────────────────────────────────
router.get('/', validate(projectQuerySchema), getProjects);

// ✅ Must be BEFORE /:id and BEFORE router.use(protect)
router.get('/slug/:slug', getProjectBySlug);

// /:id comes after so "slug" isn't swallowed as an id
router.get('/:id', getProjectById);

// ─── Protected (admin / superadmin) ───────────────────────────────────────
router.use(protect, restrictTo('admin', 'superadmin'));

// ─── Protected (admin / superadmin) ───────────────────────────────────────
router.use(protect, restrictTo('admin', 'superadmin'));

// POST /api/v1/projects
// fields: coverImage (single), images (multiple, max 20)
router.post(
  '/',
  upload.fields([
    { name: 'coverImage', maxCount: 1  },
    { name: 'images',     maxCount: 20 },
  ]),
  validate(createProjectSchema),
  createProject
);

// PATCH /api/v1/projects/:id
router.patch(
  '/:id',
  upload.fields([
    { name: 'coverImage', maxCount: 1  },
    { name: 'images',     maxCount: 20 },
  ]),
  validate(updateProjectSchema),
  updateProject
);


// PATCH /api/v1/projects/:id/toggle-publish
router.patch('/:id/toggle-publish', togglePublish);

// DELETE /api/v1/projects/:id
router.delete('/:id', deleteProject);

// DELETE /api/v1/projects/:id/images/:publicId  — remove single gallery image
router.delete('/:id/images/:publicId', deleteProjectImage);

export default router;