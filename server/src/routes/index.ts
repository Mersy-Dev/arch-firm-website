import { Router } from 'express';
// import projectRoutes     from './project.routes';
// import blogRoutes        from './blog.routes';
import contactRoutes     from './contact.routes';
// import teamRoutes        from './team.routes';
// import testimonialRoutes from './testimonial.routes';
// import careerRoutes      from './career.routes';
// import uploadRoutes      from './upload.routes';
import authRoutes        from './auth.routes';
import serviceRoutes     from './service.routes';
// import settingsRoutes    from './settings.routes';
import dashboardRoutes   from './dashboard.routes';

const router = Router();

// ── Public / auth ──────────────────────────────────────────────────────────
router.use('/auth',      authRoutes);
router.use('/contact',   contactRoutes);
router.use('/services',  serviceRoutes);

// ── Admin ──────────────────────────────────────────────────────────────────
router.use('/dashboard', dashboardRoutes);

// ── Uncomment as you build each section ────────────────────────────────────
// router.use('/projects',     projectRoutes);
// router.use('/blog',         blogRoutes);
// router.use('/team',         teamRoutes);
// router.use('/testimonials', testimonialRoutes);
// router.use('/careers',      careerRoutes);
// router.use('/upload',       uploadRoutes);
// router.use('/settings',     settingsRoutes);

export default router;