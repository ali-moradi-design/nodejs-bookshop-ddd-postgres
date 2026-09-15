import { describe, expect, it, vi } from 'vitest';
import { AddToCartUseCase } from '../../../src/application/cart/use-cases/add-to-cart';
import { DomainError } from '../../../src/domain/shared/DomainError';
import type { Cart } from '../../../src/domain/cart/cart.entity';
import type { Book } from '../../../src/domain/book/book.entity';

describe('AddToCartUseCase', () => {
  const book: Book = {
    id: 'b1',
    title: 'Clean Code',
    author: 'Uncle Bob',
    description: 'x',
    price: 30,
    currency: 'USD',
    stock: 5,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('adds a new line when stock allows', async () => {
    const cart: Cart = {
      id: 'c1',
      userId: 'u1',
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const carts = {
      getOrCreate: vi.fn().mockResolvedValue(cart),
      save: vi.fn(async (c: Cart) => c),
    };
    const books = { findById: vi.fn().mockResolvedValue(book) };
    const uc = new AddToCartUseCase(carts as never, books as never);
    const result = await uc.execute('u1', 'b1', 2);
    expect(result.items).toEqual([{ bookId: 'b1', quantity: 2 }]);
  });

  it('fails when stock insufficient', async () => {
    const carts = {
      getOrCreate: vi.fn().mockResolvedValue({
        id: 'c1',
        userId: 'u1',
        items: [{ bookId: 'b1', quantity: 4 }],
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      save: vi.fn(),
    };
    const books = { findById: vi.fn().mockResolvedValue(book) };
    const uc = new AddToCartUseCase(carts as never, books as never);
    await expect(uc.execute('u1', 'b1', 2)).rejects.toBeInstanceOf(DomainError);
  });
});
