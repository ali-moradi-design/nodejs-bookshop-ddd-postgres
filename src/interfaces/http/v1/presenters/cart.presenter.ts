import type { Cart } from '../../../../domain/cart/cart.entity';
import { toCartDto } from '../../../../application/cart/dto/cart.mapper';

export function presentCart(cart: Cart) {
  return toCartDto(cart);
}
