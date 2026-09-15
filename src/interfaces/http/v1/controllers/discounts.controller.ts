import { Request, Response } from 'express';
import { discountService } from '../../../../infrastructure/composition';
import { asyncHandler } from '../../../../shared/asyncHandler';

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const data = await discountService.list();
  res.json({ data });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const data = await discountService.getById(String(req.params.id));
  res.json({ data });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = await discountService.create(req.body);
  res.status(201).json({ data });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const data = await discountService.update(String(req.params.id), req.body);
  res.json({ data });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await discountService.remove(String(req.params.id));
  res.json({ message: 'Discount soft-deleted' });
});
