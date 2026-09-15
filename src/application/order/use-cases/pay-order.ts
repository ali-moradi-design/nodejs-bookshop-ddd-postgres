import type { IOrderRepository } from '../../../domain/order/order.repository';
import type { IBookRepository } from '../../../domain/book/book.repository';
import type { INotificationPort } from '../../../domain/shared/notifications.port';
import type { IUnitOfWork } from '../../shared/unit-of-work.port';
import type { Order } from '../../../domain/order/order.entity';
import { DomainError } from '../../../domain/shared/DomainError';
import { assertTransition } from '../../../domain/order/order.transitions';
import { isStockLow, DEFAULT_LOW_STOCK_THRESHOLD } from '../../../domain/book/rules/stock';
import {
  domainEvents,
  orderPaidEvent,
  stockLowEvent,
} from '../../../domain/shared/events';

export class PayOrderUseCase {
  constructor(
    private readonly orders: IOrderRepository,
    private readonly books: IBookRepository,
    private readonly uow?: IUnitOfWork,
    private readonly notifications?: INotificationPort,
    private readonly lowStockThreshold = DEFAULT_LOW_STOCK_THRESHOLD,
  ) {}

  async execute(orderId: string, userId: string, isStaff: boolean): Promise<Order> {
    const order = await this.orders.findById(orderId);
    if (!order) throw new DomainError('Order not found', 'NOT_FOUND');
    if (!isStaff && order.user !== userId) {
      throw new DomainError('Forbidden', 'FORBIDDEN');
    }
    if (order.status !== 'pending_payment') {
      throw new DomainError('Order is not awaiting payment', 'VALIDATION');
    }

    assertTransition(order.status, 'paid');

    const decremented: { bookId: string; quantity: number }[] = [];
    const run = this.uow
      ? <T>(fn: () => Promise<T>) => this.uow!.runInTransaction(async () => fn())
      : <T>(fn: () => Promise<T>) => fn();

    try {
      await run(async () => {
        for (const item of order.items) {
          const ok = await this.books.decrementStock(item.book, item.quantity);
          if (!ok) {
            throw new DomainError(
              `Insufficient stock for book ${item.title}`,
              'INSUFFICIENT_STOCK',
            );
          }
          decremented.push({ bookId: item.book, quantity: item.quantity });
        }
      });

      order.status = 'paid';
      order.payment = {
        method: 'fake',
        status: 'paid',
        paidAt: new Date(),
        transactionId: `fake_${Date.now()}`,
      };
      order.statusHistory.push({
        status: 'paid',
        at: new Date(),
        note: 'Fake payment confirmed',
      });
      const saved = await this.orders.save(order);

      await domainEvents.publish(
        orderPaidEvent({
          orderId: saved.id,
          userId: saved.user,
          totalAmount: saved.totalAmount,
        }),
      );

      if (this.notifications) {
        await this.notifications.send({
          subject: `Order ${saved.id} paid`,
          body: `Payment confirmed for order ${saved.id} (total ${saved.totalAmount})`,
          meta: { orderId: saved.id, userId: saved.user },
        });
      }

      for (const item of saved.items) {
        const book = await this.books.findById(item.book);
        if (book && isStockLow(book.stock, this.lowStockThreshold)) {
          await domainEvents.publish(
            stockLowEvent({
              bookId: book.id,
              title: book.title,
              stock: book.stock,
              threshold: this.lowStockThreshold,
            }),
          );
        }
      }

      return saved;
    } catch (err) {
      for (const d of decremented) {
        await this.books.incrementStock(d.bookId, d.quantity);
      }

      if (err instanceof DomainError && err.code === 'INSUFFICIENT_STOCK') {
        order.status = 'failed';
        order.payment.status = 'failed';
        order.statusHistory.push({
          status: 'failed',
          at: new Date(),
          note: err.message,
        });
        await this.orders.save(order);
      }
      throw err;
    }
  }
}
