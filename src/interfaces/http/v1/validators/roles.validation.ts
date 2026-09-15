import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(500).optional(),
  permissions: z.array(z.string().min(1)).default([]),
});

export const updateRoleSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(500).optional(),
  permissions: z.array(z.string().min(1)).optional(),
});

export const idParamSchema = z.object({ id: z.string().min(1) });
