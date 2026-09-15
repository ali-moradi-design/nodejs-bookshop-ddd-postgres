import { describe, expect, it } from 'vitest';
import {
  assertPositiveQuantity,
  assertSufficientStock,
  isStockLow,
} from '../../../src/domain/book/rules/stock';
import { DomainError } from '../../../src/domain/shared/DomainError';

describe('stock rules', () => {
  it('rejects non-positive quantity', () => {
    expect(() => assertPositiveQuantity(0)).toThrow(DomainError);
  });

  it('asserts sufficient stock', () => {
    expect(() => assertSufficientStock(2, 3, 'X')).toThrow(/Insufficient stock/);
    expect(() => assertSufficientStock(3, 3, 'X')).not.toThrow();
  });

  it('detects low stock', () => {
    expect(isStockLow(5, 5)).toBe(true);
    expect(isStockLow(6, 5)).toBe(false);
  });
});
