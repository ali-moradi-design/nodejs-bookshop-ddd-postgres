import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

dotenv.config();

const optionalBool = z
  .string()
  .optional()
  .transform((v) => {
    if (v === undefined || v.trim() === '') return undefined;
    return ['true', '1', 'yes'].includes(v.trim().toLowerCase());
  });

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(8),
  JWT_REFRESH_SECRET: z.string().min(8),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  UPLOAD_DIR: z.string().default('uploads'),
  COOKIE_SECURE: optionalBool,
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  COOKIE_DOMAIN: z
    .string()
    .optional()
    .transform((v) => {
      const trimmed = v?.trim();
      return trimmed ? trimmed : undefined;
    }),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const data = parsed.data;

/**
 * CORS with credentials cannot use `Access-Control-Allow-Origin: *`.
 * If CORS_ORIGIN is `*`, reflect the request origin in development/test.
 * Production must set an explicit origin (e.g. https://app.example.com).
 */
export function resolveCorsOrigin(): boolean | string | string[] {
  const raw = data.CORS_ORIGIN.trim();
  if (raw === '*') {
    return data.NODE_ENV === 'production' ? false : true;
  }
  const list = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (list.length === 0) return false;
  if (list.length === 1) return list[0];
  return list;
}

export const env = {
  ...data,
  COOKIE_SECURE: data.COOKIE_SECURE ?? data.NODE_ENV === 'production',
  UPLOAD_DIR_ABS: path.isAbsolute(data.UPLOAD_DIR)
    ? data.UPLOAD_DIR
    : path.resolve(process.cwd(), data.UPLOAD_DIR),
};
