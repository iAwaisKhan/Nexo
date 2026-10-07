import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../utils/AppError.js';

export function validateBody<T>(schema: ZodType<T>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(
        new AppError(
          400,
          'VALIDATION_ERROR',
          'Request body is invalid.',
          result.error.issues.map(({ code, path, message }) => ({ code, path, message })),
        ),
      );
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodType<T>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(
        new AppError(
          400,
          'VALIDATION_ERROR',
          'Query parameters are invalid.',
          result.error.issues.map(({ code, path, message }) => ({ code, path, message })),
        ),
      );
      return;
    }
    resAssignQuery(req, result.data);
    next();
  };
}

function resAssignQuery<T>(req: Parameters<RequestHandler>[0], data: T): void {
  Object.defineProperty(req, 'validatedQuery', { configurable: true, value: data });
}
