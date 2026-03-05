import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';

// Generic AsyncController — P extends ParamsDictionary so it accepts
// plain Request, Request<{ id: string }>, Request<{ id: string; publicId: string }>
// and any other typed params without complaint.
type AsyncController<
  P extends ParamsDictionary = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery extends ParsedQs = ParsedQs,
> = (
  req:  Request<P, ResBody, ReqBody, ReqQuery>,
  res:  Response<ResBody>,
  next: NextFunction
) => Promise<void>;

/**
 * Wraps async route handlers to automatically catch errors
 * and pass them to Express's error handling middleware.
 *
 * Without this: every controller needs try/catch
 * With this:    errors are caught automatically
 *
 * Now generic — accepts typed Request<P> params (e.g. { id: string })
 * in addition to plain Request, so all controllers type-check correctly.
 */
export const asyncHandler = <
  P extends ParamsDictionary = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery extends ParsedQs = ParsedQs,
>(
  fn: AsyncController<P, ResBody, ReqBody, ReqQuery>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};