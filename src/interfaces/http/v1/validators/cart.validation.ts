import { z } from 'zod';
import { shippingAddressSchema } from './orders.validation';

export const addCartItemSchema = z.object({
  bookId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
});

export const bookIdParamSchema = z.object({ bookId: z.string().min(1) });

export const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
  discountCode: z.string().min(1).max(50).optional(),
});
