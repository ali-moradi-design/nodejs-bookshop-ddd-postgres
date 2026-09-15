import { z } from 'zod';

const coverImageUrlSchema = z
  .string()
  .min(1)
  .refine((v) => v.startsWith('/') || /^https?:\/\//i.test(v), {
    message: 'coverImageUrl must be a URL or absolute path starting with /',
  });

export const createBookSchema = z.object({
  title: z.string().min(1).max(300),
  author: z.string().min(1).max(200),
  description: z.string().min(1),
  isbn: z.string().min(5).max(20).optional(),
  price: z.number().nonnegative(),
  currency: z.string().length(3).optional(),
  stock: z.number().int().nonnegative().default(0),
  coverImageUrl: coverImageUrlSchema.optional(),
  categories: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  featuredOrder: z.number().int().optional(),
});

export const updateBookSchema = createBookSchema.partial();

export const idParamSchema = z.object({ id: z.string().min(1) });

export const listBooksQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  inStock: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sort: z.enum(['price', 'title', 'createdAt']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});
