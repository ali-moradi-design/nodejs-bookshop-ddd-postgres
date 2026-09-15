import { DomainError } from './DomainError';

export function normalizeDiscountCode(raw: string): string {
  const code = raw.trim().toUpperCase();
  if (!code || code.length > 50) {
    throw new DomainError('Invalid discount code', 'INVALID_DISCOUNT');
  }
  if (!/^[A-Z0-9_-]+$/.test(code)) {
    throw new DomainError('Discount code contains invalid characters', 'INVALID_DISCOUNT');
  }
  return code;
}
