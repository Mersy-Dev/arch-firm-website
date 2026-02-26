import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import Service from '../models/Service.model';
// import Project    from '../models/Project.model';    // uncomment when ready
// import Contact    from '../models/Contact.model';    // uncomment when ready
// import BlogPost   from '../models/BlogPost.model';   // uncomment when ready
// import TeamMember from '../models/TeamMember.model'; // uncomment when ready

// ─── GET /api/v1/dashboard/overview ────────────────────────────────────────
// Protected: admin / superadmin only

export const getDashboardOverview = asyncHandler(
  async (_req: Request, res: Response) => {

    // Only querying models that have data right now.
    // Uncomment each section as you seed / build that module.
    const [
      totalServices,
      activeServices,
    ] = await Promise.all([
      Service.countDocuments(),
      Service.countDocuments({ isActive: true }),
    ]);

    const data = {
      stats: {
        services: {
          total:  totalServices,
          active: activeServices,
        },

        // ── Uncomment when Project model has data ──
        // projects: {
        //   total:     totalProjects,
        //   published: publishedProjects,
        //   draft:     draftProjects,
        // },

        // ── Uncomment when Contact model has data ──
        // enquiries: {
        //   total:     totalEnquiries,
        //   unread:    unreadEnquiries,
        //   thisMonth: thisMonthEnquiries,
        // },

        // ── Uncomment when BlogPost model has data ──
        // blogPosts: {
        //   total:     totalBlogPosts,
        //   published: publishedBlogPosts,
        //   draft:     draftBlogPosts,
        // },

        // ── Uncomment when TeamMember model has data ──
        // teamMembers: {
        //   total: totalTeamMembers,
        // },
      },

      // Empty until Contact / Project models are active
      recentEnquiries: [],
      recentProjects:  [],
    };

    res
      .status(200)
      .json(new ApiResponse(200, data, 'Dashboard overview fetched'));
  }
);