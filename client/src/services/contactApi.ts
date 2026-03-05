import { baseApi } from '@/app/api';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

// ─── Inject endpoints ────────────────────────────────────────────────────────
const contactApi = baseApi.injectEndpoints({
  endpoints: builder => ({

    // ── Public: submit contact form ───────────────────────────────────────
    submitContact: builder.mutation<ApiResponse<null>, ContactPayload>({
      query: payload => ({
        url: '/contact',
        method: 'POST',
        body: payload,
      }),
    }),
  }),
});

export const { useSubmitContactMutation } = contactApi;