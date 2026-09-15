import { z } from 'zod';

export const addFavoriteSchema = z.object({
  bookId: z.string().min(1),
});

export const bookIdParamSchema = z.object({ bookId: z.string().min(1) });
