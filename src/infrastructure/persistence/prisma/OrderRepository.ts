import type { IOrderRepository } from '../../../domain/order/order.repository';
import type {
  Order,
  CreateOrderInput,
  OrderStatus,
  Payment,
  StatusHistory,
} from '../../../domain/order/order.entity';
import type { OrderStatus as PrismaOrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { Prisma as PrismaNS } from '@prisma/client';
import { getPrisma } from './client';
import { mapOrder } from './mappers';

const itemsInclude = { items: true } as const;

/** Convert legacy Mongo-style match objects used by report/dashboard services. */
function toOrderWhere(match: Record<string, unknown>): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {};

  if (match.deletedAt === null) where.deletedAt = null;
  else if (match.deletedAt !== undefined) where.deletedAt = match.deletedAt as Date | null;

  const paymentStatus = match['payment.status'];
  if (typeof paymentStatus === 'string') {
    where.paymentStatus = paymentStatus as PaymentStatus;
  }

  const paidAt = match['payment.paidAt'] as { $gte?: Date; $lte?: Date } | undefined;
  if (paidAt && typeof paidAt === 'object') {
    where.paidAt = {};
    if (paidAt.$gte) where.paidAt.gte = paidAt.$gte;
    if (paidAt.$lte) where.paidAt.lte = paidAt.$lte;
  }

  const status = match.status as { $in?: string[] } | string | undefined;
  if (status && typeof status === 'object' && Array.isArray(status.$in)) {
    where.status = { in: status.$in as PrismaOrderStatus[] };
  } else if (typeof status === 'string') {
    where.status = status as PrismaOrderStatus;
  }

  return where;
}

export class PrismaOrderRepository implements IOrderRepository {
  async findById(id: string): Promise<Order | null> {
    const row = await getPrisma().order.findFirst({
      where: { id, deletedAt: null },
      include: itemsInclude,
    });
    return row ? mapOrder(row) : null;
  }

  async list(filter: { userId?: string; limit?: number }): Promise<Order[]> {
    const rows = await getPrisma().order.findMany({
      where: {
        deletedAt: null,
        ...(filter.userId ? { userId: filter.userId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: filter.limit,
      include: itemsInclude,
    });
    return rows.map(mapOrder);
  }

  async create(input: CreateOrderInput): Promise<Order> {
    const discountAmount = input.discountAmount ?? 0;
    const history: StatusHistory[] = [
      { status: 'pending_payment', at: new Date(), note: 'Order created' },
    ];
    const row = await getPrisma().order.create({
      data: {
        userId: input.userId,
        subtotalAmount: input.subtotalAmount,
        discountCode: input.discountCode,
        discountAmount,
        totalAmount: input.totalAmount,
        status: 'pending_payment',
        paymentMethod: 'fake',
        paymentStatus: 'pending',
        shippingFullName: input.shippingAddress.fullName,
        shippingLine1: input.shippingAddress.line1,
        shippingLine2: input.shippingAddress.line2,
        shippingCity: input.shippingAddress.city,
        shippingState: input.shippingAddress.state,
        shippingPostalCode: input.shippingAddress.postalCode,
        shippingCountry: input.shippingAddress.country,
        statusHistory: history as unknown as PrismaNS.InputJsonValue,
        items: {
          create: input.items.map((i) => ({
            bookId: i.book,
            title: i.title,
            price: i.price,
            quantity: i.quantity,
          })),
        },
      },
      include: itemsInclude,
    });
    return mapOrder(row);
  }

  async save(order: Order): Promise<Order> {
    const row = await getPrisma().order.update({
      where: { id: order.id },
      data: {
        status: order.status,
        paymentStatus: order.payment.status,
        paidAt: order.payment.paidAt ?? null,
        transactionId: order.payment.transactionId ?? null,
        statusHistory: order.statusHistory as unknown as PrismaNS.InputJsonValue,
        subtotalAmount: order.subtotalAmount,
        discountCode: order.discountCode,
        discountAmount: order.discountAmount,
        totalAmount: order.totalAmount,
      },
      include: itemsInclude,
    });
    return mapOrder(row);
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    payment?: Partial<Payment>,
    note?: string,
  ): Promise<Order | null> {
    const existing = await getPrisma().order.findFirst({
      where: { id, deletedAt: null },
      include: itemsInclude,
    });
    if (!existing) return null;

    const history = (Array.isArray(existing.statusHistory) ? existing.statusHistory : []) as unknown as StatusHistory[];
    history.push({ status, at: new Date(), note });

    const row = await getPrisma().order.update({
      where: { id },
      data: {
        status,
        ...(payment?.status ? { paymentStatus: payment.status } : {}),
        ...(payment?.paidAt !== undefined ? { paidAt: payment.paidAt ?? null } : {}),
        ...(payment?.transactionId !== undefined
          ? { transactionId: payment.transactionId ?? null }
          : {}),
        statusHistory: history as unknown as PrismaNS.InputJsonValue,
      },
      include: itemsInclude,
    });
    return mapOrder(row);
  }

  async count(): Promise<number> {
    return getPrisma().order.count({ where: { deletedAt: null } });
  }

  async aggregateRevenue(match: Record<string, unknown>) {
    const where = toOrderWhere(match);
    const agg = await getPrisma().order.aggregate({
      where,
      _sum: { totalAmount: true },
      _count: { _all: true },
      _avg: { totalAmount: true },
    });
    return {
      totalRevenue: agg._sum.totalAmount ?? 0,
      orderCount: agg._count._all,
      avgOrderValue: agg._avg.totalAmount ?? 0,
    };
  }

  async aggregateByStatus() {
    const groups = await getPrisma().order.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { _all: true },
    });
    return groups.map((g) => ({ status: g.status, count: g._count._all }));
  }

  async aggregateTopBooks(match: Record<string, unknown>, limit: number) {
    const where = toOrderWhere(match);
    const orders = await getPrisma().order.findMany({
      where,
      select: { items: true },
    });
    const map = new Map<string, { _id: string; title: string; quantitySold: number; revenue: number }>();
    for (const order of orders) {
      for (const item of order.items) {
        const cur = map.get(item.bookId) ?? {
          _id: item.bookId,
          title: item.title,
          quantitySold: 0,
          revenue: 0,
        };
        cur.quantitySold += item.quantity;
        cur.revenue += item.price * item.quantity;
        map.set(item.bookId, cur);
      }
    }
    return [...map.values()]
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, limit);
  }

  async aggregateSalesByDate(match: Record<string, unknown>) {
    const where = toOrderWhere(match);
    const orders = await getPrisma().order.findMany({
      where,
      select: { paidAt: true, totalAmount: true },
    });
    const map = new Map<string, { date: string; revenue: number; orders: number }>();
    for (const order of orders) {
      if (!order.paidAt) continue;
      const date = order.paidAt.toISOString().slice(0, 10);
      const cur = map.get(date) ?? { date, revenue: 0, orders: 0 };
      cur.revenue += order.totalAmount;
      cur.orders += 1;
      map.set(date, cur);
    }
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  }
}
