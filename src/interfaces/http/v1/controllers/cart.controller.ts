import { Request, Response } from 'express';
import { cartService } from '../../../../infrastructure/composition';
import { asyncHandler } from '../../../../shared/asyncHandler';
import { presentCart } from '../presenters/cart.presenter';
import { presentOrder } from '../presenters/order.presenter';

export const get = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.get(req.user!.id);
  res.json({ data: presentCart(cart) });
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.addItem(req.user!.id, req.body.bookId, req.body.quantity);
  res.status(201).json({ data: presentCart(cart) });
});

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.updateItem(
    req.user!.id,
    String(req.params.bookId),
    req.body.quantity,
  );
  res.json({ data: presentCart(cart) });
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.removeItem(req.user!.id, String(req.params.bookId));
  res.json({ data: presentCart(cart) });
});

export const clear = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.clear(req.user!.id);
  res.json({ data: presentCart(cart) });
});

export const checkout = asyncHandler(async (req: Request, res: Response) => {
  const order = await cartService.checkout(
    req.user!.id,
    req.body.shippingAddress,
    req.body.discountCode,
  );
  res.status(201).json({ data: presentOrder(order) });
});
