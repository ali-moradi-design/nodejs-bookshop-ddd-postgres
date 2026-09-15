import { z } from 'zod';
import { ORDER_STATUSES } from '../../../../domain/order/order.entity';

export const shippingAddressSchema = z.object({
  fullName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        book: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  shippingAddress: shippingAddressSchema,
  discountCode: z.string().min(1).max(50).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  note: z.string().max(500).optional(),
});

export const idParamSchema = z.object({ id: z.string().min(1) });
