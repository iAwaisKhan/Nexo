import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../services/authService.js';
import { AppError } from '../utils/AppError.js';

export const authenticate: RequestHandler = async (req, _res, next) => {
  const authorization = req.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    next(new AppError(401, 'UNAUTHORIZED', 'Sign in to continue.'));
    return;
  }

  req.auth = await verifyAccessToken(authorization.slice('Bearer '.length).trim());
  next();
};
