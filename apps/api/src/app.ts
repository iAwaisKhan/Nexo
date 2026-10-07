import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './config/env.js';
import { isDatabaseReady } from './db/connect.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestContext } from './middleware/requestContext.js';
import { authRoutes } from './routes/authRoutes.js';
import { noteRoutes } from './routes/noteRoutes.js';
import { publicNoteRoutes } from './routes/publicNoteRoutes.js';
import { AppError } from './utils/AppError.js';

export const app = express();

app.disable('x-powered-by');
app.set('trust proxy', env.trustProxy);
app.use(requestContext);
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.clientOrigins.includes(origin)) callback(null, true);
      else callback(new AppError(403, 'ORIGIN_NOT_ALLOWED', 'This origin is not allowed.'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 600,
  }),
);
app.use(express.json({ limit: '2mb', strict: true }));
app.use(cookieParser());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Try again shortly.',
        requestId: req.requestId,
      },
    });
  },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many authentication attempts. Try again later.',
        requestId: req.requestId,
      },
    });
  },
});

app.get('/api/v1/health/live', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/v1/health/ready', (_req, res) => {
  if (!isDatabaseReady()) {
    res.status(503).json({ status: 'not_ready', dependencies: { mongodb: 'unavailable' } });
    return;
  }
  res.json({ status: 'ready', dependencies: { mongodb: 'available' } });
});

app.use('/api/v1', apiLimiter);
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use('/api/v1/shared-notes', publicNoteRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
