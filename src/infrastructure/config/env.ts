import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

dotenv.config();

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
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const data = parsed.data;

export const env = {
  ...data,
  UPLOAD_DIR_ABS: path.isAbsolute(data.UPLOAD_DIR)
    ? data.UPLOAD_DIR
    : path.resolve(process.cwd(), data.UPLOAD_DIR),
};
