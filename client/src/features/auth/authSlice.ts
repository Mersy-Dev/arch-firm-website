import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/project.types';

interface AuthState { user: User|null; token: string|null; isAuthenticated: boolean; }

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, isAuthenticated: false } as AuthState,
  reducers: {
    setCredentials: (state, { payload }: PayloadAction<{ user: User; token: string }>) => {
      state.user = payload.user; state.token = payload.token; state.isAuthenticated = true;
    },
    logout: (state) => { state.user = null; state.token = null; state.isAuthenticated = false; },
  },
});
export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;