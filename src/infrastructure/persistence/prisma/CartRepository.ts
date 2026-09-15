import type { ICartRepository } from '../../../domain/cart/cart.repository';
import type { Cart, CartItem } from '../../../domain/cart/cart.entity';
import { getPrisma } from './client';
import { mapCart } from './mappers';

const itemsInclude = { items: true } as const;

export class PrismaCartRepository implements ICartRepository {
  async findByUserId(userId: string): Promise<Cart | null> {
    const row = await getPrisma().cart.findUnique({
      where: { userId },
      include: itemsInclude,
    });
    return row ? mapCart(row) : null;
  }

  async getOrCreate(userId: string): Promise<Cart> {
    const existing = await this.findByUserId(userId);
    if (existing) return existing;
    const row = await getPrisma().cart.create({
      data: { userId },
      include: itemsInclude,
    });
    return mapCart(row);
  }

  async save(cart: Cart): Promise<Cart> {
    const db = getPrisma();
    await db.cartItem.deleteMany({ where: { cartId: cart.id } });
    if (cart.items.length) {
      await db.cartItem.createMany({
        data: cart.items.map((i) => ({
          cartId: cart.id,
          bookId: i.bookId,
          quantity: i.quantity,
        })),
      });
    }
    const row = await db.cart.findUniqueOrThrow({
      where: { id: cart.id },
      include: itemsInclude,
    });
    return mapCart(row);
  }

  async setItems(userId: string, items: CartItem[]): Promise<Cart> {
    const cart = await this.getOrCreate(userId);
    cart.items = items;
    return this.save(cart);
  }

  async clear(userId: string): Promise<Cart | null> {
    const cart = await getPrisma().cart.findUnique({ where: { userId } });
    if (!cart) return null;
    await getPrisma().cartItem.deleteMany({ where: { cartId: cart.id } });
    const row = await getPrisma().cart.findUniqueOrThrow({
      where: { id: cart.id },
      include: itemsInclude,
    });
    return mapCart(row);
  }
}
