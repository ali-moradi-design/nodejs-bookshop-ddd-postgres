import type { Order } from '../../../../domain/order/order.entity';
import { toOrderDto } from '../../../../application/order/dto/order.mapper';

export function presentOrder(order: Order) {
  return toOrderDto(order);
}

export function presentOrders(orders: Order[]) {
  return orders.map(presentOrder);
}
