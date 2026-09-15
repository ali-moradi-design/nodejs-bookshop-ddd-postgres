import { Money } from '../../shared/Money';
import { DomainError } from '../../shared/DomainError';
import type { CartItem } from '../cart.entity';

export interface PricedLine {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
}

export function assertCartNotEmpty(items: CartItem[]): void {
  if (items.length === 0) {
    throw new DomainError('Cart is empty', 'EMPTY_CART');
  }
}

export function mergeCartItem(items: CartItem[], bookId: string, quantity: number): CartItem[] {
  const next = items.map((i) => ({ ...i }));
  const existing = next.find((i) => i.bookId === bookId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    next.push({ bookId, quantity });
  }
  return next;
}

export function setCartItemQuantity(items: CartItem[], bookId: string, quantity: number): CartItem[] {
  const next = items.map((i) => ({ ...i }));
  const item = next.find((i) => i.bookId === bookId);
  if (!item) {
    throw new DomainError('Item not in cart', 'NOT_FOUND');
  }
  item.quantity = quantity;
  return next;
}

export function removeCartItem(items: CartItem[], bookId: string): CartItem[] {
  const next = items.filter((i) => i.bookId !== bookId);
  if (next.length === items.length) {
    throw new DomainError('Item not in cart', 'NOT_FOUND');
  }
  return next;
}

export function computeSubtotal(lines: PricedLine[], currency = 'USD'): number {
  let total = Money.of(0, currency);
  for (const line of lines) {
    total = total.add(Money.of(line.price, currency).multiply(line.quantity));
  }
  return total.amount;
}

export function computeOrderTotal(subtotal: number, discountAmount: number, currency = 'USD'): number {
  return Money.of(subtotal, currency).subtract(Money.of(discountAmount, currency)).amount;
}
