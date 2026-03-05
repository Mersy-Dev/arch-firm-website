import { configureStore, type Reducer } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import {
  persistStore,
  persistReducer,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '@/features/auth/authSlice';
import uiReducer   from '@/features/ui/uiSlice';
import { baseApi }  from './api';
import type { AuthState } from '@/features/auth/authSlice';

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'refreshToken', 'user', 'isAuthenticated'],
};

const persistedAuthReducer = persistReducer(
  authPersistConfig,
  authReducer
) as unknown as Reducer<AuthState & { _persist: { version: number; rehydrated: boolean } }>;

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    ui:   uiReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);
export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;