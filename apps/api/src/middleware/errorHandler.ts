import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';
import { AppError } from '../utils/AppError.js';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, 'NOT_FOUND', `Route ${req.method} ${req.path} was not found.`));
};

export const errorHandler: ErrorRequestHandler = (error: unknown, req, res) => {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof ZodError) {
    appError = new AppError(
      400,
      'VALIDATION_ERROR',
      'Request data is invalid.',
      error.issues.map(({ code, path, message }) => ({ code, path, message })),
    );
  } else if (isHttpError(error, 400)) {
    appError = new AppError(400, 'MALFORMED_REQUEST', 'Request body contains invalid JSON.');
  } else if (isHttpError(error, 413)) {
    appError = new AppError(413, 'PAYLOAD_TOO_LARGE', 'Request body exceeds the 2 MB limit.');
  } else if (isMongoDuplicateKey(error)) {
    appError = new AppError(
      409,
      'RESOURCE_CONFLICT',
      'A record with these details already exists.',
    );
  } else if (isMongoValidationError(error)) {
    appError = new AppError(400, 'VALIDATION_ERROR', 'Stored record validation failed.');
  } else {
    appError = new AppError(500, 'INTERNAL_ERROR', 'An unexpected server error occurred.');
  }

  if (appError.statusCode >= 500) {
    logger.error({ err: error, requestId: req.requestId }, 'request failed');
  } else {
    logger.warn({ code: appError.code, requestId: req.requestId }, 'request rejected');
  }

  res.status(appError.statusCode).json({
    error: {
      code: appError.code,
      message: appError.message,
      requestId: req.requestId,
      ...(appError.details && appError.statusCode < 500 ? { details: appError.details } : {}),
    },
  });
};

function isMongoDuplicateKey(error: unknown): error is { code: number } {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}

function isMongoValidationError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'ValidationError'
  );
}

function isHttpError(error: unknown, status: number): boolean {
  return (
    typeof error === 'object' && error !== null && 'status' in error && error.status === status
  );
}
