import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import type { AccessTokenPayload } from '../../domain/auth/auth.types';

const MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/** Parse JWT-style TTL (`15m`, `7d`) to milliseconds. */
export function ttlToMs(ttl: string, fallbackMs: number): number {
  const match = /^(\d+)([smhd])$/.exec(ttl);
  if (!match) return fallbackMs;
  const amount = Number(match[1]);
  const unit = match[2];
  return amount * (MS[unit] ?? fallbackMs);
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

/** SHA-256 hash for high-entropy refresh tokens (allows indexed lookup). */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function refreshExpiresAt(): Date {
  return new Date(Date.now() + ttlToMs(env.REFRESH_TOKEN_TTL, 7 * 24 * 60 * 60 * 1000));
}
