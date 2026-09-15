import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import type { AccessTokenPayload } from '../../domain/auth/auth.types';

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
  const ttl = env.REFRESH_TOKEN_TTL;
  const match = /^(\d+)([smhd])$/.exec(ttl);
  const now = Date.now();
  if (!match) {
    return new Date(now + 7 * 24 * 60 * 60 * 1000);
  }
  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return new Date(now + amount * (multipliers[unit] ?? multipliers.d));
}
