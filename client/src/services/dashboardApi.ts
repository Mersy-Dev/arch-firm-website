import { baseApi } from '@/app/api';

// ─── Types ─────────────────────────────────────────────────────────────────
// Fields marked optional (?) are commented out in the backend right now.
// Make them required again as each backend section comes online.

export interface DashboardStats {
  services:   { total: number; active: number };
  projects?:  { total: number; published: number; draft: number };
  enquiries?: { total: number; unread: number; thisMonth: number };
  blogPosts?: { total: number; published: number; draft: number };
  teamMembers?:{ total: number };
}

export interface RecentEnquiry {
  _id:       string;
  name:      string;
  email:     string;
  subject:   string;
  status:    'unread' | 'read' | 'replied';
  createdAt: string;
}

export interface RecentProject {
  _id:         string;
  title:       string;
  slug:        string;
  category:    string;
  status:      'published' | 'draft';
  coverImage?: string;
  createdAt:   string;
}

export interface DashboardOverview {
  stats:           DashboardStats;
  recentEnquiries: RecentEnquiry[];
  recentProjects:  RecentProject[];
}

// ─── Endpoint ──────────────────────────────────────────────────────────────

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboardOverview: build.query<{ success: true; data: DashboardOverview }, void>({
      query: () => '/dashboard/overview',
      providesTags: ['Project', 'Contact'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetDashboardOverviewQuery } = dashboardApi;