import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import User from '../models/User.model';
import { CONSTANTS } from '../config/constants';

// ─── Token Helpers ────────────────────────────────────────────────────────────

const generateAccessToken = (payload: { _id: string; email: string; role: string }) =>
  jwt.sign(payload, CONSTANTS.JWT_ACCESS_SECRET, {
    expiresIn: CONSTANTS.JWT_EXPIRES_IN,      // ✅ was JWT_ACCESS_EXPIRES
  });

const generateRefreshToken = (payload: { _id: string }) =>
  jwt.sign(payload, CONSTANTS.JWT_REFRESH_SECRET, {
    expiresIn: CONSTANTS.REFRESH_EXPIRES_IN,  // ✅ was JWT_REFRESH_EXPIRES
  });
// ─── Controllers ──────────────────────────────────────────────────────────────

// POST /api/auth/register  (superadmin only — creates new admin accounts)
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email already in use');

  const user = await User.create({ email, password, role });

  res
    .status(201)
    .json(new ApiResponse(201, { email: user.email, role: user.role }, 'User created'));
});

// POST /api/auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Explicitly select password and refreshToken (select: false on schema)
  const user = await User.findOne({ email }).select('+password +refreshToken');

  if (!user || !user.isActive) throw new ApiError(401, 'Invalid credentials');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials');

  // ✅ fix
  const accessToken = generateAccessToken({
    _id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({ _id: user._id.toString() });

  // Persist hashed refresh token
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  // Send refresh token as HttpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json(
    new ApiResponse(
      200,
      {
        accessToken,
        user: { email: user.email, role: user.role },
      },
      'Login successful',
    ),
  );
});

// POST /api/auth/refresh
export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  // Accept token from cookie or body
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) throw new ApiError(401, 'Refresh token missing');

  let decoded: { _id: string };
  try {
    decoded = jwt.verify(token, CONSTANTS.JWT_REFRESH_SECRET) as {
      _id: string;
    };
  } catch {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const user = await User.findById(decoded._id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, 'Refresh token revoked');
  }

  const accessToken = generateAccessToken({
    _id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  res.json(new ApiResponse(200, { accessToken }, 'Token refreshed'));
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?._id).select('+refreshToken');
  if (user) {
    user.refreshToken = undefined;
    await user.save();
  }

  res.clearCookie('refreshToken');
  res.json(new ApiResponse(200, null, 'Logged out successfully'));
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?._id);
  if (!user) throw new ApiError(404, 'User not found');

  res.json(new ApiResponse(200, user, 'User fetched'));
});

// PATCH /api/auth/change-password
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new ApiError(400, 'Current password is incorrect');

  user.password = newPassword; // pre-save hook will re-hash
  await user.save();

  res.json(new ApiResponse(200, null, 'Password changed successfully'));
});
