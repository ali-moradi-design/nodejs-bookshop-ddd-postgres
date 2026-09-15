import type { Order, CreateOrderInput, OrderStatus, Payment } from './order.entity';

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  list(filter: { userId?: string; limit?: number }): Promise<Order[]>;
  create(input: CreateOrderInput): Promise<Order>;
  save(order: Order): Promise<Order>;
  updateStatus(
    id: string,
    status: OrderStatus,
    payment?: Partial<Payment>,
    note?: string,
  ): Promise<Order | null>;
  count(): Promise<number>;
  aggregateRevenue(match: Record<string, unknown>): Promise<{
    totalRevenue: number;
    orderCount: number;
    avgOrderValue: number;
  }>;
  aggregateByStatus(): Promise<{ status: string; count: number }[]>;
  aggregateTopBooks(
    match: Record<string, unknown>,
    limit: number,
  ): Promise<{ _id: string; title: string; quantitySold: number; revenue: number }[]>;
  aggregateSalesByDate(
    match: Record<string, unknown>,
  ): Promise<{ date: string; revenue: number; orders: number }[]>;
}
