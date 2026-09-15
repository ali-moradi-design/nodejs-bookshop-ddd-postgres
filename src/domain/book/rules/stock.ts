import { DomainError } from '../../shared/DomainError';

export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export function assertPositiveQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new DomainError('Quantity must be a positive integer', 'VALIDATION');
  }
}

export function assertSufficientStock(
  available: number,
  requested: number,
  title?: string,
): void {
  if (available < requested) {
    const label = title ? `"${title}"` : 'book';
    throw new DomainError(
      `Insufficient stock for ${label} (available: ${available})`,
      'INSUFFICIENT_STOCK',
      { available, requested },
    );
  }
}

export function isStockLow(stock: number, threshold = DEFAULT_LOW_STOCK_THRESHOLD): boolean {
  return stock <= threshold;
}
