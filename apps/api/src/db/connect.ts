import mongoose from 'mongoose';
import { env } from '../config/env.js';

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
    autoIndex: env.NODE_ENV !== 'production',
  });
}

export function isDatabaseReady(): boolean {
  return mongoose.connection.readyState === 1;
}
