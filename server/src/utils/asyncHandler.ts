import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

/**
 * Wraps async route handlers to automatically catch errors
 * and pass them to Express's error handling middleware.
 * 
 * Without this: every controller needs try/catch
 * With this:    errors are caught automatically
 */
export const asyncHandler = (fn: AsyncController): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};