export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: string[];
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    errors: string[] = [],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  // Convenience factory methods
  static notFound(resource = 'Resource') {
    return new ApiError(404, `${resource} not found`);
  }

  static unauthorized(msg = 'Unauthorised') {
    return new ApiError(401, msg);
  }

  static forbidden(msg = 'Forbidden') {
    return new ApiError(403, msg);
  }

  static badRequest(msg: string, errors: string[] = []) {
    return new ApiError(400, msg, errors);
  }
}