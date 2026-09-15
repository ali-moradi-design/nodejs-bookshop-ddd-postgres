import { describe, expect, it } from 'vitest';
import { assertTransition, canCancel } from '../../../src/domain/order/order.transitions';
import { DomainError } from '../../../src/domain/shared/DomainError';

describe('order transitions', () => {
  it('allows paid from pending_payment', () => {
    expect(() => assertTransition('pending_payment', 'paid')).not.toThrow();
  });

  it('rejects illegal jumps', () => {
    expect(() => assertTransition('pending_payment', 'shipped')).toThrow(DomainError);
  });

  it('canCancel', () => {
    expect(canCancel('paid')).toBe(true);
    expect(canCancel('shipped')).toBe(false);
  });
});
