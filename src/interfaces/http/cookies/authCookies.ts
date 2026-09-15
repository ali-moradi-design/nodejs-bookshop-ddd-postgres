import type { CookieOptions, Request, Response } from 'express';
import { env } from '../../../infrastructure/config/env';
import { ttlToMs } from '../../../infrastructure/security/tokens';

export const ACCESS_TOKEN_COOKIE = 'accessToken';
export const REFRESH_TOKEN_COOKIE = 'refreshToken';

const ACCESS_MAX_AGE_MS = () => ttlToMs(env.ACCESS_TOKEN_TTL, 15 * 60 * 1000);
const REFRESH_MAX_AGE_MS = () => ttlToMs(env.REFRESH_TOKEN_TTL, 7 * 24 * 60 * 60 * 1000);

function baseCookieOptions(): CookieOptions {
  const options: CookieOptions = {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: '/',
  };
  if (env.COOKIE_DOMAIN) {
    options.domain = env.COOKIE_DOMAIN;
  }
  return options;
}

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
): void {
  const base = baseCookieOptions();
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...base,
    maxAge: ACCESS_MAX_AGE_MS(),
  });
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...base,
    maxAge: REFRESH_MAX_AGE_MS(),
  });
}

export function clearAuthCookies(res: Response): void {
  const base = baseCookieOptions();
  res.clearCookie(ACCESS_TOKEN_COOKIE, base);
  res.clearCookie(REFRESH_TOKEN_COOKIE, base);
}

export function readCookie(req: Request, name: string): string | undefined {
  const value = req.cookies?.[name];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function resolveRefreshToken(req: Request): string | undefined {
  const fromBody = req.body?.refreshToken;
  if (typeof fromBody === 'string' && fromBody.length > 0) {
    return fromBody;
  }
  return readCookie(req, REFRESH_TOKEN_COOKIE);
}
