import { z } from 'zod';

export const recentOrdersQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
});

export const lowStockQuerySchema = z.object({
  threshold: z.coerce.number().int().nonnegative().optional().default(5),
});
