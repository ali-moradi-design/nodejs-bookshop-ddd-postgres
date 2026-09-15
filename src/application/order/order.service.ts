import type { IOrderRepository } from '../../domain/order/order.repository';
import type { IBookRepository } from '../../domain/book/book.repository';
import type {
  Order,
  OrderStatus,
  ShippingAddress,
} from '../../domain/order/order.entity';
import type { DiscountService } from '../discount/discount.service';
import type { IUnitOfWork } from '../shared/unit-of-work.port';
import type { INotificationPort } from '../../domain/shared/notifications.port';
import {
  assertTransition,
  canCancel,
  shouldRestockOnCancel,
} from '../../domain/order/order.transitions';
import { DomainError } from '../../domain/shared/DomainError';
import { assertSufficientStock } from '../../domain/book/rules/stock';
import { computeSubtotal, computeOrderTotal } from '../../domain/cart/rules/cart.totals';
import { PayOrderUseCase } from './use-cases/pay-order';

export class OrderService {
  private readonly payOrder: PayOrderUseCase;

  constructor(
    private readonly orders: IOrderRepository,
    private readonly books: IBookRepository,
    private readonly discounts?: DiscountService,
    uow?: IUnitOfWork,
    notifications?: INotificationPort,
  ) {
    this.payOrder = new PayOrderUseCase(orders, books, uow, notifications);
  }

  async create(
    userId: string,
    items: { book: string; quantity: number }[],
    shippingAddress: ShippingAddress,
    discountCode?: string,
  ): Promise<Order> {
    const bookIds = items.map((i) => i.book);
    const books = await this.books.findByIds(bookIds);
    if (books.length !== new Set(bookIds).size) {
      throw new DomainError('One or more books not found', 'NOT_FOUND');
    }

    const bookMap = new Map(books.map((b) => [b.id, b]));
    const orderItems = items.map((item) => {
      const book = bookMap.get(item.book)!;
      assertSufficientStock(book.stock, item.quantity, book.title);
      return {
        book: book.id,
        title: book.title,
        price: book.price,
        quantity: item.quantity,
      };
    });

    const subtotalAmount = computeSubtotal(
      orderItems.map((i) => ({
        bookId: i.book,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
      })),
    );

    let discountAmount = 0;
    let appliedCode: string | undefined;
    let discountId: string | undefined;

    if (this.discounts) {
      const result = await this.discounts.computeDiscount(discountCode, subtotalAmount);
      discountAmount = result.discountAmount;
      appliedCode = result.discount?.code;
      discountId = result.discount?.id;
    } else if (discountCode) {
      throw new DomainError('Discount codes are not available', 'INVALID_DISCOUNT');
    }

    const totalAmount = computeOrderTotal(subtotalAmount, discountAmount);

    const order = await this.orders.create({
      userId,
      items: orderItems,
      subtotalAmount,
      discountCode: appliedCode,
      discountAmount,
      totalAmount,
      shippingAddress,
    });

    if (discountId && this.discounts) {
      await this.discounts.recordUse(discountId);
    }

    return order;
  }

  pay(orderId: string, userId: string, isStaff: boolean): Promise<Order> {
    return this.payOrder.execute(orderId, userId, isStaff);
  }

  async list(userId: string, canReadAll: boolean): Promise<Order[]> {
    return this.orders.list(canReadAll ? {} : { userId });
  }

  async getById(orderId: string, userId: string, canReadAll: boolean): Promise<Order> {
    const order = await this.orders.findById(orderId);
    if (!order) throw new DomainError('Order not found', 'NOT_FOUND');
    if (!canReadAll && order.user !== userId) {
      throw new DomainError('Forbidden', 'FORBIDDEN');
    }
    return order;
  }

  async updateStatus(orderId: string, nextStatus: OrderStatus, note?: string): Promise<Order> {
    const order = await this.orders.findById(orderId);
    if (!order) throw new DomainError('Order not found', 'NOT_FOUND');

    assertTransition(order.status, nextStatus);

    if (nextStatus === 'cancelled' && !canCancel(order.status)) {
      throw new DomainError('Cannot cancel order in current status', 'VALIDATION');
    }

    if (nextStatus === 'cancelled' && shouldRestockOnCancel(order.status)) {
      for (const item of order.items) {
        await this.books.incrementStock(item.book, item.quantity);
      }
    }

    order.status = nextStatus;
    order.statusHistory.push({ status: nextStatus, at: new Date(), note });
    return this.orders.save(order);
  }
}
