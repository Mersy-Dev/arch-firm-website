// export type ProjectType = 'residential'|'commercial'|'hospitality'|'mixed'|'renovation';

// export interface ProjectImage { url: string; publicId: string; caption?: string; }

// export interface Project {
//   _id: string; title: string; slug: string;
//   type: ProjectType; description: string; clientBrief?: string;
//   location: string; area?: number; completedAt: string;
//   coverImage: ProjectImage; images: ProjectImage[];
//   materials: string[]; services: string[];
//   featured: boolean; published: boolean;
//   seo?: { metaTitle?: string; metaDescription?: string; ogImage?: string; };
//   createdAt: string; updatedAt: string;
// }
// export interface User       { id: string; name: string; email: string; role: 'superadmin'|'editor'; }
// export interface TeamMember { _id: string; name: string; role: string; bio?: string; photo: { url: string }; qualifications: string[]; displayOrder: number; }
// export interface Testimonial{ _id: string; clientName: string; quote: string; rating: number; photo?: { url: string }; }
// export interface BlogPost   { _id: string; title: string; slug: string; excerpt: string; body: string; coverImage: { url: string }; tags: string[]; readTime: number; publishedAt: string; }


// ─── Mirrors IProject from Project.model.ts ───────────────────────────────

export const PROJECT_TYPES = [
  'residential',
  'commercial',
  'hospitality',
  'mixed',
  'renovation',
] as const;

export type ProjectType = typeof PROJECT_TYPES[number];

export interface ProjectImage {
  url:       string;
  publicId:  string;
  caption?:  string;
}

export interface ProjectSeo {
  metaTitle?:       string;
  metaDescription?: string;
  ogImage?:         string;
}

export interface Project {
  _id:         string;  
  title:       string;
  slug:        string;
  type:        ProjectType;
  description: string;
  clientBrief?: string;
  approach?:    string;
  location:    string;
  area?:       number;
  completedAt: string;
  coverImage:  ProjectImage;
  images:      ProjectImage[];
  materials:   string[];
  services:    string[];
  featured:    boolean;
  published:   boolean;
  sortOrder:   number;
  seo:         ProjectSeo;
  createdAt:   string;
  updatedAt:   string;
}

// ─── API payloads ──────────────────────────────────────────────────────────

export interface ProjectListResponse {
  success: true;
  data: {
    projects:   Project[];
    pagination: {
      page:       number;
      limit:      number;
      total:      number;
      totalPages: number;
      hasNext:    boolean;
      hasPrev:    boolean;
    };
  };
}

export interface ProjectResponse {
  success: true;
  data: { project: Project };
}

export interface ProjectListParams {
  page?:      number;
  limit?:     number;
  type?:      ProjectType;
  published?: boolean;
  featured?:  boolean;
  search?:    string;
  sortBy?:    'createdAt' | 'completedAt' | 'sortOrder' | 'title';
  order?:     'asc' | 'desc';
}