import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { CONSTANTS } from '../config/constants';

interface JwtPayload {
  _id: string;
  email: string;
  role: 'admin' | 'superadmin';
}

// Verify access token on protected routes
export const protect = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(
        token,
        CONSTANTS.JWT_ACCESS_SECRET
      ) as JwtPayload;

      req.user = {
        _id: decoded._id,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      throw new ApiError(401, 'Invalid or expired token');
    }
  }
);

// Restrict to specific roles
export const restrictTo = (...roles: Array<'admin' | 'superadmin'>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action');
    }
    next();
  };
};