import { baseApi } from "@/app/api";
import type {
  Project,
  ProjectListResponse,
  ProjectResponse,
  ProjectListParams,
} from "@/types/project.types";

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // GET /projects
    getProjects: build.query<ProjectListResponse, ProjectListParams>({
      query: (params = {}) => ({
        url: "/projects",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.projects.map(({ _id }) => ({
                type: "Project" as const,
                id: _id,
              })),
              { type: "Project", id: "LIST" },
            ]
          : [{ type: "Project", id: "LIST" }],
    }),

    // GET /projects/:id
    getProjectById: build.query<ProjectResponse, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Project", id }],
    }),

    // GET /projects/slug/:slug
    getProjectBySlug: build.query<ProjectResponse, string>({
      query: (slug) => `/projects/slug/${slug}`,
      providesTags: (_r, _e, slug) => [{ type: "Project", id: slug }],
    }),

    // POST /projects  (multipart/form-data)
    createProject: build.mutation<ProjectResponse, FormData>({
      query: (formData) => ({
        url: "/projects",
        method: "POST",
        body: formData,
        // Don't set Content-Type — browser sets multipart boundary automatically
      }),
      invalidatesTags: [{ type: "Project", id: "LIST" }],
    }),

    // PATCH /projects/:id  (multipart/form-data)
    updateProject: build.mutation<
      ProjectResponse,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/projects/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Project", id },
        { type: "Project", id: "LIST" },
      ],
    }),

    // DELETE /projects/:id
    deleteProject: build.mutation<
      { success: true; data: { id: string } },
      string
    >({
      query: (id) => ({ url: `/projects/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Project", id },
        { type: "Project", id: "LIST" },
      ],
    }),

    // PATCH /projects/:id/toggle-publish
    togglePublish: build.mutation<ProjectResponse, string>({
      query: (id) => ({
        url: `/projects/${id}/toggle-publish`,
        method: "PATCH",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Project", id },
        { type: "Project", id: "LIST" },
      ],
    }),

    // DELETE /projects/:id/images/:publicId
    deleteProjectImage: build.mutation<
      ProjectResponse,
      { id: string; publicId: string }
    >({
      query: ({ id, publicId }) => ({
        url: `/projects/${id}/images/${encodeURIComponent(publicId)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Project", id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useGetProjectBySlugQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useTogglePublishMutation,
  useDeleteProjectImageMutation,
} = projectsApi;

// Re-export type for use in components
export type { Project };