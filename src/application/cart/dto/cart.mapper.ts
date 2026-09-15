import type { Cart } from '../../../domain/cart/cart.entity';

export interface CartDto {
  id: string;
  userId: string;
  items: { bookId: string; quantity: number }[];
  updatedAt: Date;
  createdAt: Date;
}

export function toCartDto(cart: Cart): CartDto {
  return {
    id: cart.id,
    userId: cart.userId,
    items: cart.items.map((i) => ({ bookId: i.bookId, quantity: i.quantity })),
    updatedAt: cart.updatedAt,
    createdAt: cart.createdAt,
  };
}
