import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as { body?: unknown; query?: unknown; params?: unknown };

      req.body = result.body;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((e) => `${e.path.join(': ')}: ${e.message}`);
        res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Validation failed',
          errors: messages,
        });
      } else {
        next(error);
      }
    }
  };