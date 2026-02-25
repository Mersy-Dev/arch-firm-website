export type ProjectType = 'residential'|'commercial'|'hospitality'|'mixed'|'renovation';

export interface ProjectImage { url: string; publicId: string; caption?: string; }

export interface Project {
  _id: string; title: string; slug: string;
  type: ProjectType; description: string; clientBrief?: string;
  location: string; area?: number; completedAt: string;
  coverImage: ProjectImage; images: ProjectImage[];
  materials: string[]; services: string[];
  featured: boolean; published: boolean;
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: string; };
  createdAt: string; updatedAt: string;
}
export interface User       { id: string; name: string; email: string; role: 'superadmin'|'editor'; }
export interface TeamMember { _id: string; name: string; role: string; bio?: string; photo: { url: string }; qualifications: string[]; displayOrder: number; }
export interface Testimonial{ _id: string; clientName: string; quote: string; rating: number; photo?: { url: string }; }
export interface BlogPost   { _id: string; title: string; slug: string; excerpt: string; body: string; coverImage: { url: string }; tags: string[]; readTime: number; publishedAt: string; }