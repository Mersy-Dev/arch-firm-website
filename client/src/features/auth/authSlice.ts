import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/user.types';

// ─── State ─────────────────────────────────────────────────────────────────

interface AuthState {
  user:           User | null;
  token:          string | null;   // accessToken — used by baseApi prepareHeaders
  refreshToken:   string | null;   // persisted so we can get a new accessToken on reload
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user:            null,
  token:           null,
  refreshToken:    null,
  isAuthenticated: false,
};

// ─── Slice ─────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Called after a successful login OR token refresh
    setCredentials: (
      state,
      { payload }: PayloadAction<{
        user:         User;
        accessToken:  string;
        refreshToken: string;
      }>
    ) => {
      state.user            = payload.user;
      state.token           = payload.accessToken;
      state.refreshToken    = payload.refreshToken;
      state.isAuthenticated = true;
    },

    // Called after a silent token refresh (no user payload needed)
    updateTokens: (
      state,
      { payload }: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.token        = payload.accessToken;
      state.refreshToken = payload.refreshToken;
    },

    // Called on logout or 401 that can't be recovered
    clearCredentials: (state) => {
      state.user            = null;
      state.token           = null;
      state.refreshToken    = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, updateTokens, clearCredentials } = authSlice.actions;
export default authSlice.reducer;

// ─── Selectors ─────────────────────────────────────────────────────────────
import type { RootState } from '@/app/store';

export const selectCurrentUser          = (s: RootState) => s.auth.user;
export const selectIsAuthenticated      = (s: RootState) => s.auth.isAuthenticated;
export const selectAccessToken          = (s: RootState) => s.auth.token;
export const selectRefreshToken         = (s: RootState) => s.auth.refreshToken;
export const selectIsSuperAdmin         = (s: RootState) => s.auth.user?.role === 'superadmin';