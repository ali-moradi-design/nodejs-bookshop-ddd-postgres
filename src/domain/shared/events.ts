export type DomainEventName = 'OrderPaid' | 'StockLow';

export interface DomainEvent<T = unknown> {
  name: DomainEventName;
  occurredAt: Date;
  payload: T;
}

export interface OrderPaidPayload {
  orderId: string;
  userId: string;
  totalAmount: number;
}

export interface StockLowPayload {
  bookId: string;
  title: string;
  stock: number;
  threshold: number;
}

type Handler = (event: DomainEvent) => void | Promise<void>;

/** Lightweight in-process event bus (stub — not durable). */
export class DomainEventBus {
  private handlers = new Map<DomainEventName, Set<Handler>>();

  on(name: DomainEventName, handler: Handler): () => void {
    let set = this.handlers.get(name);
    if (!set) {
      set = new Set();
      this.handlers.set(name, set);
    }
    set.add(handler);
    return () => set!.delete(handler);
  }

  async publish(event: DomainEvent): Promise<void> {
    const set = this.handlers.get(event.name);
    if (!set) return;
    for (const h of [...set]) {
      await h(event);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}

export const domainEvents = new DomainEventBus();

export function orderPaidEvent(payload: OrderPaidPayload): DomainEvent<OrderPaidPayload> {
  return { name: 'OrderPaid', occurredAt: new Date(), payload };
}

export function stockLowEvent(payload: StockLowPayload): DomainEvent<StockLowPayload> {
  return { name: 'StockLow', occurredAt: new Date(), payload };
}
