import { z } from 'zod';

export const createPermissionSchema = z.object({
  slug: z.string().min(2).max(100),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  section: z.string().min(2).max(50),
});

export const updatePermissionSchema = createPermissionSchema.partial();

export const idParamSchema = z.object({
  id: z.string().min(1),
});
