import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** Body is optional: refreshToken may come from the httpOnly cookie instead. */
export const optionalRefreshTokenSchema = z.preprocess(
  (v) => (v == null ? {} : v),
  z.object({
    refreshToken: z.string().min(1).optional(),
  }),
);

export const refreshSchema = optionalRefreshTokenSchema;
export const logoutSchema = optionalRefreshTokenSchema;
