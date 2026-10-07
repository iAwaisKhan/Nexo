import { Router, type Response } from 'express';
import { loginInputSchema, registerInputSchema } from '@nexo/contracts';
import { env } from '../config/env.js';
import { authenticate } from '../middleware/authenticate.js';
import { trustedOrigin } from '../middleware/trustedOrigin.js';
import { validateBody } from '../middleware/validate.js';
import {
  getCurrentUser,
  login,
  register,
  revokeRefreshToken,
  rotateRefreshToken,
} from '../services/authService.js';
import { AppError } from '../utils/AppError.js';

export const authRoutes = Router();
const refreshCookieName = 'nexo_refresh';
const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production' || env.COOKIE_SAME_SITE === 'none',
  sameSite: env.COOKIE_SAME_SITE,
  path: '/api/v1/auth',
} as const;

function setRefreshCookie(res: Response, token: string) {
  res.cookie(refreshCookieName, token, {
    ...cookieOptions,
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(refreshCookieName, cookieOptions);
}

authRoutes.post('/register', validateBody(registerInputSchema), async (req, res) => {
  const pair = await register(req.body);
  setRefreshCookie(res, pair.refreshToken);
  res
    .status(201)
    .json({ accessToken: pair.accessToken, expiresIn: pair.expiresIn, user: pair.user });
});

authRoutes.post('/login', validateBody(loginInputSchema), async (req, res) => {
  const pair = await login(req.body);
  setRefreshCookie(res, pair.refreshToken);
  res.json({ accessToken: pair.accessToken, expiresIn: pair.expiresIn, user: pair.user });
});

authRoutes.post('/refresh', trustedOrigin, async (req, res) => {
  const refreshToken = req.cookies?.[refreshCookieName];
  if (typeof refreshToken !== 'string' || !refreshToken) {
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Your session has expired. Sign in again.');
  }
  const pair = await rotateRefreshToken(refreshToken);
  setRefreshCookie(res, pair.refreshToken);
  res.json({ accessToken: pair.accessToken, expiresIn: pair.expiresIn, user: pair.user });
});

authRoutes.post('/logout', trustedOrigin, async (req, res) => {
  const refreshToken = req.cookies?.[refreshCookieName];
  if (typeof refreshToken === 'string' && refreshToken) await revokeRefreshToken(refreshToken);
  clearRefreshCookie(res);
  res.status(204).end();
});

authRoutes.get('/me', authenticate, async (req, res) => {
  res.json({ user: await getCurrentUser(req.auth!.userId) });
});
