import type { ICartRepository } from '../../domain/cart/cart.repository';
import type { IBookRepository } from '../../domain/book/book.repository';
import type { IOrderRepository } from '../../domain/order/order.repository';
import type { Cart } from '../../domain/cart/cart.entity';
import type { Order, ShippingAddress } from '../../domain/order/order.entity';
import type { DiscountService } from '../discount/discount.service';
import { DomainError } from '../../domain/shared/DomainError';
import { assertPositiveQuantity, assertSufficientStock } from '../../domain/book/rules/stock';
import { setCartItemQuantity, removeCartItem } from '../../domain/cart/rules/cart.totals';
import { AddToCartUseCase } from './use-cases/add-to-cart';
import { CheckoutCartUseCase } from './use-cases/checkout-cart';

export class CartService {
  private readonly addToCart: AddToCartUseCase;
  private readonly checkoutCart: CheckoutCartUseCase;

  constructor(
    private readonly carts: ICartRepository,
    private readonly books: IBookRepository,
    orders: IOrderRepository,
    discounts: DiscountService,
  ) {
    this.addToCart = new AddToCartUseCase(carts, books);
    this.checkoutCart = new CheckoutCartUseCase(carts, books, orders, discounts);
  }

  async get(userId: string): Promise<Cart> {
    return this.carts.getOrCreate(userId);
  }

  addItem(userId: string, bookId: string, quantity: number): Promise<Cart> {
    return this.addToCart.execute(userId, bookId, quantity);
  }

  async updateItem(userId: string, bookId: string, quantity: number): Promise<Cart> {
    assertPositiveQuantity(quantity);
    const book = await this.books.findById(bookId);
    if (!book) throw new DomainError('Book not found', 'NOT_FOUND');
    assertSufficientStock(book.stock, quantity, book.title);

    const cart = await this.carts.getOrCreate(userId);
    cart.items = setCartItemQuantity(cart.items, bookId, quantity);
    return this.carts.save(cart);
  }

  async removeItem(userId: string, bookId: string): Promise<Cart> {
    const cart = await this.carts.getOrCreate(userId);
    cart.items = removeCartItem(cart.items, bookId);
    return this.carts.save(cart);
  }

  async clear(userId: string): Promise<Cart> {
    const cart = await this.carts.clear(userId);
    if (!cart) return this.carts.getOrCreate(userId);
    return cart;
  }

  checkout(
    userId: string,
    shippingAddress: ShippingAddress,
    discountCode?: string,
  ): Promise<Order> {
    return this.checkoutCart.execute(userId, shippingAddress, discountCode);
  }
}
