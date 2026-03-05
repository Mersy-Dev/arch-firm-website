import { baseApi } from '@/app/api';
import type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  GetMeResponse,
  ChangePasswordRequest,
  RegisterRequest,
} from '@/types/user.types';

// ─── Inject auth endpoints into the shared baseApi ─────────────────────────
// This keeps the Redux store to a single API slice (no duplicate middleware).

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    // POST /auth/login
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['Auth'],
    }),

    // POST /auth/logout
    logoutUser: build.mutation<{ success: true }, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['Auth'],
    }),

    // POST /auth/refresh
    refreshToken: build.mutation<RefreshResponse, RefreshRequest>({
      query: (body) => ({ url: '/auth/refresh', method: 'POST', body }),
    }),

    // GET /auth/me
    getMe: build.query<GetMeResponse, void>({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),

    // PATCH /auth/change-password
    changePassword: build.mutation<{ success: true; message: string }, ChangePasswordRequest>({
      query: (body) => ({ url: '/auth/change-password', method: 'PATCH', body }),
    }),

    // POST /auth/register  (superadmin only)
    registerUser: build.mutation<LoginResponse, RegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      invalidatesTags: ['Auth'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useLoginMutation,
  useLogoutUserMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
  useChangePasswordMutation,
  useRegisterUserMutation,
} = authApi;