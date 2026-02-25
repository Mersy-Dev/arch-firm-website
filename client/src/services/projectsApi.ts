import { baseApi } from '@/app/api';
import type { Project } from '@/types/project.types';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<ApiResponse<PaginatedResponse<Project>>, { type?: string; page?: number; limit?: number }>({
      query: (filters) => ({ url: '/projects', params: filters }),
      providesTags: (result) =>
        result ? [...result.data.data.map(({ _id }) => ({ type: 'Project' as const, id: _id })), { type: 'Project', id: 'LIST' }]
               : [{ type: 'Project', id: 'LIST' }],
    }),
    getFeaturedProjects: builder.query<ApiResponse<Project[]>, void>({
      query: () => '/projects/featured',
      providesTags: [{ type: 'Project', id: 'FEATURED' }],
    }),
    getProjectBySlug: builder.query<ApiResponse<Project>, string>({
      query: (slug) => `/projects/${slug}`,
      providesTags: (_r, _e, slug) => [{ type: 'Project', id: slug }],
    }),
    createProject: builder.mutation<ApiResponse<Project>, FormData>({
      query: (body) => ({ url: '/projects', method: 'POST', body }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),
    updateProject: builder.mutation<ApiResponse<Project>, { id: string; body: Partial<Project> }>({
      query: ({ id, body }) => ({ url: `/projects/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Project', id }, { type: 'Project', id: 'LIST' }],
    }),
    deleteProject: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/projects/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProjectsQuery, useGetFeaturedProjectsQuery, useGetProjectBySlugQuery,
  useCreateProjectMutation, useUpdateProjectMutation, useDeleteProjectMutation,
} = projectsApi;