import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware factory — validates req.body against a Zod schema.
 * Controller only runs if validation passes.
 * 
 * Usage: router.post('/contact', validate(contactSchema), contactController)
 */
export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
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