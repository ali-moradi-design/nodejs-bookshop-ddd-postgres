import { describe, expect, it, vi } from 'vitest';
import { PayOrderUseCase } from '../../../src/application/order/use-cases/pay-order';
import { DomainError } from '../../../src/domain/shared/DomainError';
import type { Order } from '../../../src/domain/order/order.entity';

function pendingOrder(): Order {
  return {
    id: 'o1',
    user: 'u1',
    items: [{ book: 'b1', title: 'T', price: 10, quantity: 1 }],
    subtotalAmount: 10,
    discountAmount: 0,
    totalAmount: 10,
    status: 'pending_payment',
    payment: { method: 'fake', status: 'pending' },
    shippingAddress: {
      fullName: 'A',
      line1: '1',
      city: 'C',
      postalCode: '1',
      country: 'IR',
    },
    statusHistory: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('PayOrderUseCase', () => {
  it('marks order paid and decrements stock', async () => {
    const order = pendingOrder();
    const orders = {
      findById: vi.fn().mockResolvedValue(order),
      save: vi.fn(async (o: Order) => o),
    };
    const books = {
      decrementStock: vi.fn().mockResolvedValue(true),
      incrementStock: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: 'b1',
        title: 'T',
        stock: 10,
      }),
    };
    const uc = new PayOrderUseCase(orders as never, books as never);
    const paid = await uc.execute('o1', 'u1', false);
    expect(paid.status).toBe('paid');
    expect(books.decrementStock).toHaveBeenCalledWith('b1', 1);
  });

  it('forbids other users', async () => {
    const orders = { findById: vi.fn().mockResolvedValue(pendingOrder()), save: vi.fn() };
    const books = { decrementStock: vi.fn(), incrementStock: vi.fn(), findById: vi.fn() };
    const uc = new PayOrderUseCase(orders as never, books as never);
    await expect(uc.execute('o1', 'other', false)).rejects.toBeInstanceOf(DomainError);
  });
});
