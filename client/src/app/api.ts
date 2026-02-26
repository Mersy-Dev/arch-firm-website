import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { updateTokens, clearCredentials } from '@/features/auth/authSlice';
import type { RootState } from './store';
import type { RefreshResponse } from '@/types/user.types';

// ─── 1. Raw base query (no retry logic) ────────────────────────────────────

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// ─── 2. Wrapper that silently refreshes the access token on 401 ────────────

let isRefreshing = false;

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && !isRefreshing) {
    isRefreshing = true;

    const refreshToken = (api.getState() as RootState).auth.refreshToken;

    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const { data } = refreshResult.data as RefreshResponse;
        api.dispatch(updateTokens(data));
        // Retry the original request with the new token
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        // Refresh failed → force logout
        api.dispatch(clearCredentials());
      }
    } else {
      api.dispatch(clearCredentials());
    }

    isRefreshing = false;
  }

  return result;
};

// ─── 3. Base API — all feature APIs inject their endpoints into this ────────

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Project', 'Blog', 'Contact', 'Team', 'Testimonial', 'Settings', 'Auth'],
  endpoints: () => ({}),
});