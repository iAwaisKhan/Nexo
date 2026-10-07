import mongoose from 'mongoose';
import { logger } from '../config/logger.js';
import { connectDatabase } from '../db/connect.js';
import { NoteModel } from '../models/Note.js';
import { RefreshSessionModel } from '../models/RefreshSession.js';
import { UserModel } from '../models/User.js';

try {
  await connectDatabase();
  await Promise.all([
    UserModel.createIndexes(),
    RefreshSessionModel.createIndexes(),
    NoteModel.createIndexes(),
  ]);
  logger.info('MongoDB indexes are ready');
} catch (error) {
  logger.fatal({ err: error }, 'Failed to create MongoDB indexes');
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
