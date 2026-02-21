import { Router } from 'express';
// import projectRoutes from './project.routes';
// import blogRoutes from './blog.routes';
import contactRoutes from './contact.routes';
// import teamRoutes from './team.routes';
// import testimonialRoutes from './testimonial.routes';
// import careerRoutes from './career.routes';
// import uploadRoutes from './upload.routes';
import authRoutes from './auth.routes';
// import settingsRoutes from './settings.routes';

const router = Router();

// router.use('/projects', projectRoutes);
// router.use('/blog', blogRoutes);
router.use('/contact', contactRoutes);
// router.use('/team', teamRoutes);
// router.use('/testimonials', testimonialRoutes);
// router.use('/careers', careerRoutes);
// router.use('/upload', uploadRoutes);
router.use('/auth', authRoutes);
// router.use('/settings', settingsRoutes);

export default router;