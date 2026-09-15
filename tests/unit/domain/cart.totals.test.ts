import { describe, expect, it } from 'vitest';
import {
  computeSubtotal,
  computeOrderTotal,
  mergeCartItem,
  assertCartNotEmpty,
} from '../../../src/domain/cart/rules/cart.totals';
import { DomainError } from '../../../src/domain/shared/DomainError';

describe('cart totals', () => {
  it('merges items and computes totals', () => {
    const items = mergeCartItem([], 'a', 2);
    const merged = mergeCartItem(items, 'a', 1);
    expect(merged[0].quantity).toBe(3);

    const sub = computeSubtotal([
      { bookId: 'a', title: 'A', price: 10.5, quantity: 2 },
    ]);
    expect(sub).toBe(21);
    expect(computeOrderTotal(21, 5)).toBe(16);
  });

  it('rejects empty cart', () => {
    expect(() => assertCartNotEmpty([])).toThrow(DomainError);
  });
});
