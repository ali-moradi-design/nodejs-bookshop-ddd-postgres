import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  roles: z.array(z.string().min(1)).default([]),
  isActive: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).max(128).optional(),
  roles: z.array(z.string().min(1)).optional(),
  isActive: z.boolean().optional(),
});

export const updateOwnSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  password: z.string().min(8).max(128).optional(),
});

export const idParamSchema = z.object({ id: z.string().min(1) });
