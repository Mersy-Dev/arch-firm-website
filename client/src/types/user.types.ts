// ─── User & Auth Types ─────────────────────────────────────────────────────

export type UserRole = 'superadmin' | 'admin' | 'editor';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API Response shapes (mirrors your backend) ───────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: true;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  success: true;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface GetMeResponse {
  success: true;
  data: { user: User };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}