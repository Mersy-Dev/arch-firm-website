// import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

interface JwtPayload {
  id: string;
  email: string;
  role: 'superadmin' | 'editor';
}

export const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('No token provided');
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET!;

  const decoded = jwt.verify(token, secret) as JwtPayload;
  req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
  next();
});

export const restrictTo = (...roles: string[]) =>
  asyncHandler(async (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission');
    }
    next();
  });