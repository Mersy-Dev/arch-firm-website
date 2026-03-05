import { lazy, Suspense } from 'react';
import type { ReactElement } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PageWrapper    from '@/components/layout/PageWrapper';
import AdminLayout    from '@/components/layout/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import Spinner        from '@/components/ui/Spinner';

// ─── Public pages ──────────────────────────────────────────────────────────
const HomePage      = lazy(() => import('@/pages/HomePage'));
const ServicesPage  = lazy(() => import('@/pages/ServicesPage'));
const AboutPage     = lazy(() => import('@/pages/AboutPage'));
const PortfolioPage = lazy(() => import('@/pages/PortfolioPage'));
const ProjectDetail = lazy(() => import('@/pages/ProjectDetailPage'));
const ContactPage   = lazy(() => import('@/pages/ContactPage'));
const BlogPage      = lazy(() => import('@/pages/BlogPage'));
const BlogPostPage  = lazy(() => import('@/pages/BlogPostPage'));
// const ProcessPage   = lazy(() => import('@/pages/ProcessPage'));
// const TeamPage      = lazy(() => import('@/pages/TeamPage'));
// const CareersPage   = lazy(() => import('@/pages/CareersPage'));
// const FAQPage       = lazy(() => import('@/pages/FAQPage'));
// const NotFoundPage  = lazy(() => import('@/pages/NotFoundPage'));

// ─── Admin pages ───────────────────────────────────────────────────────────
const AdminLogin    = lazy(() => import('@/pages/admin/AdminLoginPage'));
const AdminDash     = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminServices = lazy(() => import('@/pages/admin/AdminServices'));
const AdminProjects = lazy(() => import('@/pages/admin/AdminProjects'));
const AdminProjForm = lazy(() => import('@/pages/admin/AdminProjectForm'));
const AdminBlog     = lazy(() => import('@/pages/admin/AdminBlog'));
// const AdminEnqs     = lazy(() => import('@/pages/admin/AdminEnquiries'));
// const AdminTeam     = lazy(() => import('@/pages/admin/AdminTeam'));
// const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));

// ─── Suspense wrapper ──────────────────────────────────────────────────────
const w = (el: ReactElement) => (
  <Suspense fallback={<Spinner fullScreen />}>{el}</Suspense>
);

// ─── Router ────────────────────────────────────────────────────────────────
const router = createBrowserRouter([

  // ── Public site ──
  {
    path: '/',
    element: <PageWrapper />,
    // errorElement: w(<NotFoundPage />),
    children: [
      { index: true,             element: w(<HomePage />)     },
      { path: 'services',        element: w(<ServicesPage />) },
      { path: 'about',           element: w(<AboutPage />)    },
      { path: 'contact',         element: w(<ContactPage />)  },
      { path: 'portfolio',       element: w(<PortfolioPage />)},
      { path: 'portfolio/:slug', element: w(<ProjectDetail />)},
      { path: 'blog',            element: w(<BlogPage />)     },
      { path: 'blog/:slug',      element: w(<BlogPostPage />) },
      // { path: 'process',         element: w(<ProcessPage />) },
      // { path: 'team',            element: w(<TeamPage />) },
      // { path: 'careers',         element: w(<CareersPage />) },
      // { path: 'faq',             element: w(<FAQPage />) },
    ],
  },

  // ── Admin login (public) ──
  { path: 'admin/login', element: w(<AdminLogin />) },

  // ── Protected admin area ──
  {
    path: 'admin',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true,               element: w(<AdminDash />)     },
          { path: 'services',          element: w(<AdminServices />) },
          { path: 'projects',          element: w(<AdminProjects />) },
          { path: 'projects/new',      element: w(<AdminProjForm />) },
          { path: 'projects/:id/edit', element: w(<AdminProjForm />) },
          { path: 'blog',              element: w(<AdminBlog />)     },
          // { path: 'enquiries',         element: w(<AdminEnqs />)     },
          // { path: 'team',              element: w(<AdminTeam />)     },
          // { path: 'settings',          element: w(<AdminSettings />) },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}