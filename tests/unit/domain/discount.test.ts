import { describe, expect, it } from 'vitest';
import {
  assertDiscountApplicable,
  calculateDiscountAmount,
  normalizeDiscountCode,
} from '../../../src/domain/discount/rules/calculate';
import type { Discount } from '../../../src/domain/discount/discount.entity';
import { DomainError } from '../../../src/domain/shared/DomainError';

function base(over: Partial<Discount> = {}): Discount {
  return {
    id: '1',
    code: 'SAVE10',
    type: 'percent',
    value: 10,
    usedCount: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...over,
  };
}

describe('discount rules', () => {
  it('normalizes codes', () => {
    expect(normalizeDiscountCode(' welcome10 ')).toBe('WELCOME10');
  });

  it('calculates percent and fixed', () => {
    expect(calculateDiscountAmount(base(), 100)).toBe(10);
    expect(calculateDiscountAmount(base({ type: 'fixed', value: 7 }), 100)).toBe(7);
    expect(calculateDiscountAmount(base({ type: 'fixed', value: 150 }), 100)).toBe(100);
  });

  it('rejects inactive / below minimum', () => {
    expect(() => assertDiscountApplicable(base({ isActive: false }), 50)).toThrow(DomainError);
    expect(() =>
      assertDiscountApplicable(base({ minOrderAmount: 80 }), 50),
    ).toThrow(/at least/);
  });
});
