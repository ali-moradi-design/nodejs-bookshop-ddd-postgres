import type { Discount } from '../discount.entity';
import { DomainError } from '../../shared/DomainError';
import { Money } from '../../shared/Money';
import { normalizeDiscountCode } from '../../shared/DiscountCode';

export function assertDiscountApplicable(discount: Discount, subtotal: number, now = new Date()): void {
  if (!discount.isActive) {
    throw new DomainError('Discount code is inactive', 'INVALID_DISCOUNT');
  }
  if (discount.startsAt && now < discount.startsAt) {
    throw new DomainError('Discount code is not yet active', 'INVALID_DISCOUNT');
  }
  if (discount.endsAt && now > discount.endsAt) {
    throw new DomainError('Discount code has expired', 'INVALID_DISCOUNT');
  }
  if (discount.maxUses !== undefined && discount.usedCount >= discount.maxUses) {
    throw new DomainError('Discount code has reached maximum uses', 'INVALID_DISCOUNT');
  }
  if (discount.minOrderAmount !== undefined && subtotal < discount.minOrderAmount) {
    throw new DomainError(
      `Order subtotal must be at least ${discount.minOrderAmount} to use this code`,
      'INVALID_DISCOUNT',
    );
  }
}

export function calculateDiscountAmount(discount: Discount, subtotal: number): number {
  const raw =
    discount.type === 'percent'
      ? Money.round((subtotal * discount.value) / 100)
      : discount.value;
  return Math.max(0, Money.round(Math.min(raw, subtotal)));
}

export function assertPercentValue(value: number): void {
  if (value < 0 || value > 100) {
    throw new DomainError('Percent discount must be between 0 and 100', 'VALIDATION');
  }
}

export { normalizeDiscountCode };
