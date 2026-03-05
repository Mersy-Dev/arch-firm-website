import { Router } from 'express';
import authRoutes      from './auth.routes';
import contactRoutes   from './contact.routes';
import serviceRoutes   from './service.routes';
import dashboardRoutes from './dashboard.routes';
import projectRoutes   from './project.routes';
import blogRoutes        from './blog.routes';
// import teamRoutes        from './team.routes';
// import testimonialRoutes from './testimonial.routes';
// import careerRoutes      from './career.routes';
// import uploadRoutes      from './upload.routes';
// import settingsRoutes    from './settings.routes';

const router = Router();

// ── Auth & public ──────────────────────────────────────────────────────────
router.use('/auth',      authRoutes);
router.use('/contact',   contactRoutes);
router.use('/services',  serviceRoutes);

// ── Projects ───────────────────────────────────────────────────────────────
router.use('/projects',  projectRoutes);

// ── Admin ──────────────────────────────────────────────────────────────────
router.use('/dashboard', dashboardRoutes);

// ── Uncomment as you build each section ────────────────────────────────────
router.use('/blog',         blogRoutes);
// router.use('/team',         teamRoutes);
// router.use('/testimonials', testimonialRoutes);
// router.use('/careers',      careerRoutes);
// router.use('/upload',       uploadRoutes);
// router.use('/settings',     settingsRoutes);

export default router;