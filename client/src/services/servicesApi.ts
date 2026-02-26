import { baseApi } from '@/app/api';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface Service {
  _id: string;
  number: string;
  title: string;
  tagline: string;
  shortDesc: string;
  description: string;
  features: string[];
  deliverables: string[];
  image: string;
  slug: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface CreateServicePayload {
  number: string;
  title: string;
  tagline: string;
  shortDesc: string;
  description: string;
  features: string[];
  deliverables: string[];
  image: string;
  isActive?: boolean;
  order?: number;
}

export type UpdateServicePayload = Partial<CreateServicePayload>;

// ─── Inject into baseApi (no separate store registration needed) ─────────────
const servicesApi = baseApi.injectEndpoints({
  endpoints: builder => ({

    // ── Public: all active services ──────────────────────────────────────
    getAllServices: builder.query<ApiResponse<Service[]>, void>({
      query: () => '/services',
      providesTags: ['Service'],
    }),

    // ── Admin: all services (incl. inactive) ─────────────────────────────
    getAdminServices: builder.query<ApiResponse<Service[]>, void>({
      query: () => '/services/admin/all',
      providesTags: ['Service'],
    }),

    // ── Admin: single service by ID ──────────────────────────────────────
    getServiceById: builder.query<ApiResponse<Service>, string>({
      query: id => `/services/admin/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Service' as const, id }],
    }),

    // ── Admin: create ────────────────────────────────────────────────────
    createService: builder.mutation<ApiResponse<Service>, CreateServicePayload>({
      query: body => ({
        url: '/services',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Service'],
    }),

    // ── Admin: update ────────────────────────────────────────────────────
    updateService: builder.mutation<ApiResponse<Service>, { id: string; data: UpdateServicePayload }>({
      query: ({ id, data }) => ({
        url: `/services/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Service'],
    }),

    // ── Admin: toggle active status ──────────────────────────────────────
    toggleServiceStatus: builder.mutation<ApiResponse<Service>, string>({
      query: id => ({
        url: `/services/${id}/toggle`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Service'],
    }),

    // ── Admin: reorder ───────────────────────────────────────────────────
    reorderServices: builder.mutation<ApiResponse<null>, { id: string; order: number }[]>({
      query: order => ({
        url: '/services/reorder',
        method: 'PATCH',
        body: { order },
      }),
      invalidatesTags: ['Service'],
    }),

    // ── Admin: delete ────────────────────────────────────────────────────
    deleteService: builder.mutation<ApiResponse<null>, string>({
      query: id => ({
        url: `/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Service'],
    }),
  }),
});

export const {
  useGetAllServicesQuery,
  useGetAdminServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useToggleServiceStatusMutation,
  useReorderServicesMutation,
  useDeleteServiceMutation,
} = servicesApi;