import { baseApi } from '@/app/api';

// ─── Types ───────────────────────────────────────────────────────────────────
export type BlogStatus = 'draft' | 'published' | 'archived';

export interface BlogAuthor {
  _id: string;
  name: string;
  avatar?: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: BlogAuthor;
  tags: string[];
  category: string;
  status: BlogStatus;
  isFeatured: boolean;
  readTime: number;
  views: number;
  publishedAt: string | null;
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
  updatedAt: string;
}

// List view — content field is excluded by the server
export type BlogPostSummary = Omit<BlogPost, 'content'>;

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

interface PaginatedResponse<T> {
  posts: T[];
  pagination: Pagination;
}

// ─── Query params ────────────────────────────────────────────────────────────
export interface GetPostsParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  featured?: boolean;
  search?: string;
}

export interface GetAdminPostsParams {
  page?: number;
  limit?: number;
  status?: BlogStatus;
  category?: string;
}

// ─── Mutation payloads ───────────────────────────────────────────────────────
export interface CreateBlogPayload {
  title: string;
  excerpt: string;
  content: string;
  coverImage: File | string;
  category: string;
  tags?: string[];
  status?: BlogStatus;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export type UpdateBlogPayload = Partial<CreateBlogPayload>;

// ─── Helper: build FormData for multipart uploads ────────────────────────────
function toBlogFormData(payload: CreateBlogPayload | UpdateBlogPayload): FormData {
  const fd = new FormData();
  Object.entries(payload).forEach(([key, val]) => {
    if (val === undefined || val === null) return;
    if (key === 'tags' && Array.isArray(val)) {
      fd.append(key, JSON.stringify(val));
    } else if (val instanceof File) {
      fd.append(key, val);
    } else {
      fd.append(key, String(val));
    }
  });
  return fd;
}

// ─── Inject endpoints ────────────────────────────────────────────────────────
const blogApi = baseApi.injectEndpoints({
  endpoints: builder => ({

    // ── Public: paginated published posts ─────────────────────────────────
    getAllPosts: builder.query<
      ApiResponse<PaginatedResponse<BlogPostSummary>>,
      GetPostsParams | void
    >({
      query: (params = {}) => ({
        url: '/blog',
        params,
      }),
      providesTags: ['Blog'],
    }),

    // ── Public: featured posts ────────────────────────────────────────────
    getFeaturedPosts: builder.query<ApiResponse<BlogPostSummary[]>, void>({
      query: () => '/blog/featured',
      providesTags: ['Blog'],
    }),

    // ── Public: category list ─────────────────────────────────────────────
    getBlogCategories: builder.query<ApiResponse<string[]>, void>({
      query: () => '/blog/categories',
      providesTags: ['Blog'],
    }),

    // ── Public: tags list ─────────────────────────────────────────────────
    getBlogTags: builder.query<ApiResponse<string[]>, void>({
      query: () => '/blog/tags',
      providesTags: ['Blog'],
    }),

    // ── Public: single post by slug (full content) ────────────────────────
    getPostBySlug: builder.query<ApiResponse<BlogPost>, string>({
      query: slug => `/blog/${slug}`,
      providesTags: (_res, _err, slug) => [{ type: 'Blog' as const, id: slug }],
    }),

    // ── Admin: all posts (any status) ─────────────────────────────────────
    getAdminPosts: builder.query<
      ApiResponse<PaginatedResponse<BlogPostSummary>>,
      GetAdminPostsParams | void
    >({
      query: (params = {}) => ({
        url: '/blog/admin/all',
        params,
      }),
      providesTags: ['Blog'],
    }),

    // ── Admin: single post by ID ──────────────────────────────────────────
    getPostById: builder.query<ApiResponse<BlogPost>, string>({
      query: id => `/blog/admin/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Blog' as const, id }],
    }),

    // ── Admin: create post (multipart) ────────────────────────────────────
    createPost: builder.mutation<ApiResponse<BlogPost>, CreateBlogPayload>({
      query: payload => ({
        url: '/blog',
        method: 'POST',
        body: toBlogFormData(payload),
      }),
      invalidatesTags: ['Blog'],
    }),

    // ── Admin: update post (multipart) ────────────────────────────────────
    updatePost: builder.mutation<ApiResponse<BlogPost>, { id: string; data: UpdateBlogPayload }>({
      query: ({ id, data }) => ({
        url: `/blog/${id}`,
        method: 'PUT',
        body: toBlogFormData(data),
      }),
      invalidatesTags: ['Blog'],
    }),

    // ── Admin: update status ──────────────────────────────────────────────
    updatePostStatus: builder.mutation<ApiResponse<BlogPost>, { id: string; status: BlogStatus }>({
      query: ({ id, status }) => ({
        url: `/blog/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Blog'],
    }),

    // ── Admin: toggle featured ────────────────────────────────────────────
    toggleFeatured: builder.mutation<ApiResponse<BlogPost>, string>({
      query: id => ({
        url: `/blog/${id}/feature`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Blog'],
    }),

    // ── Admin: delete ─────────────────────────────────────────────────────
    deletePost: builder.mutation<ApiResponse<null>, string>({
      query: id => ({
        url: `/blog/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Blog'],
    }),
  }),
});

export const {
  useGetAllPostsQuery,
  useGetFeaturedPostsQuery,
  useGetBlogCategoriesQuery,
  useGetBlogTagsQuery,
  useGetPostBySlugQuery,
  useGetAdminPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useUpdatePostStatusMutation,
  useToggleFeaturedMutation,
  useDeletePostMutation,
} = blogApi;