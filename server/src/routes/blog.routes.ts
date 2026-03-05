import { Router } from 'express';
import {
  getAllPosts,
  getFeaturedPosts,
  getCategories,
  getTags,
  getPostBySlug,
  getAdminPosts,
  getPostById,
  createPost,
  updatePost,
  updatePostStatus,
  toggleFeatured,
  deletePost,
} from '../controllers/blog.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate }            from '../middleware/validate.middleware';
import { upload }              from '../middleware/upload.middleware';
import { createBlogSchema, updateBlogSchema } from '../validators/blog.schema';

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/',              getAllPosts);
router.get('/featured',      getFeaturedPosts);
router.get('/categories',    getCategories);
router.get('/tags',          getTags);
router.get('/:slug',         getPostBySlug);

// ── Admin (protected) ─────────────────────────────────────────────────────────
router.use(protect, restrictTo('admin', 'superadmin'));

router.get('/admin/all',           getAdminPosts);
router.get('/admin/:id',           getPostById);

router.post(  '/',                 upload.single('coverImage'), validate(createBlogSchema), createPost);
router.put(   '/:id',              upload.single('coverImage'), validate(updateBlogSchema), updatePost);
router.patch( '/:id/status',       updatePostStatus);
router.patch( '/:id/feature',      toggleFeatured);
router.delete('/:id',              deletePost);

export default router;