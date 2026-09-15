import { DomainError } from '../shared/DomainError';
import type { OrderStatus } from './order.entity';

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['cancelled', 'failed', 'paid'],
  paid: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['completed'],
  completed: [],
  cancelled: [],
  failed: [],
};

export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  const allowed = ALLOWED_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new DomainError(
      `Illegal status transition: ${from} → ${to}`,
      'ILLEGAL_TRANSITION',
      { from, to },
    );
  }
}

export function canCancel(status: OrderStatus): boolean {
  return ['pending_payment', 'paid', 'processing'].includes(status);
}

export function shouldRestockOnCancel(status: OrderStatus): boolean {
  return ['paid', 'processing'].includes(status);
}
