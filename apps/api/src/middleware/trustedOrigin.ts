import type { RequestHandler } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export const trustedOrigin: RequestHandler = (req, _res, next) => {
  const origin = req.get('origin');
  if (origin && !env.clientOrigins.includes(origin)) {
    next(
      new AppError(
        403,
        'ORIGIN_NOT_ALLOWED',
        'This origin is not allowed to use the session endpoint.',
      ),
    );
    return;
  }
  next();
};
