import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'password', 'token'],
    censor: '[REDACTED]',
  },
  base: { service: 'nexo-api', environment: env.NODE_ENV },
  timestamp: pino.stdTimeFunctions.isoTime,
});
