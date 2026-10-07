import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import type { Types } from 'mongoose';
import type { LoginInput, RegisterInput } from '@nexo/contracts';
import { env } from '../config/env.js';
import { RefreshSessionModel } from '../models/RefreshSession.js';
import { UserModel } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

const jwtKey = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const jwtIssuer = 'nexo-api';
const jwtAudience = 'nexo-client';

type UserDocument = {
  _id: Types.ObjectId;
  email: string;
  displayName: string;
  avatarUrl: string;
};

function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function toPublicUser(user: UserDocument) {
  return {
    id: user._id.toString(),
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  };
}

async function createTokenPair(user: UserDocument) {
  const accessToken = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuer(jwtIssuer)
    .setAudience(jwtAudience)
    .setSubject(user._id.toString())
    .setIssuedAt()
    .setExpirationTime(`${env.ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(jwtKey);

  const refreshToken = randomBytes(32).toString('base64url');
  await RefreshSessionModel.create({
    userId: user._id,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: env.ACCESS_TOKEN_TTL_SECONDS,
    user: toPublicUser(user),
  };
}

export async function register(input: RegisterInput) {
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await UserModel.create({
    email: input.email,
    passwordHash,
    displayName: input.displayName ?? '',
  });

  try {
    return await createTokenPair(user);
  } catch (error) {
    await UserModel.deleteOne({ _id: user._id });
    throw error;
  }
}

export async function login(input: LoginInput) {
  const user = await UserModel.findOne({ email: input.email }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  }
  return createTokenPair(user);
}

export async function rotateRefreshToken(refreshToken: string) {
  const tokenHash = hashRefreshToken(refreshToken);
  const session = await RefreshSessionModel.findOne({ tokenHash }).select('+tokenHash');
  if (!session)
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Your session has expired. Sign in again.');

  const now = new Date();
  if (session.revokedAt || session.expiresAt <= now) {
    if (session.revokedAt) {
      await RefreshSessionModel.updateMany(
        { userId: session.userId, revokedAt: null },
        { revokedAt: now },
      );
    }
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Your session has expired. Sign in again.');
  }

  const revoked = await RefreshSessionModel.findOneAndUpdate(
    { _id: session._id, revokedAt: null, expiresAt: { $gt: now } },
    { $set: { revokedAt: now } },
  );
  if (!revoked)
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Your session has expired. Sign in again.');

  const user = await UserModel.findById(session.userId);
  if (!user)
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Your session has expired. Sign in again.');
  return createTokenPair(user);
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  await RefreshSessionModel.updateOne(
    { tokenHash: hashRefreshToken(refreshToken), revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
}

export async function verifyAccessToken(token: string): Promise<{ userId: string }> {
  try {
    const { payload } = await jwtVerify(token, jwtKey, {
      issuer: jwtIssuer,
      audience: jwtAudience,
    });
    if (!payload.sub) throw new Error('JWT subject missing');
    return { userId: payload.sub };
  } catch {
    throw new AppError(401, 'UNAUTHORIZED', 'Sign in to continue.');
  }
}

export async function getCurrentUser(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(401, 'UNAUTHORIZED', 'Sign in to continue.');
  return toPublicUser(user);
}
