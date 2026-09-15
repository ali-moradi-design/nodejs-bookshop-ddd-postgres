import { Request, Response } from 'express';
import { permissionService } from '../../../../infrastructure/composition';
import { asyncHandler } from '../../../../shared/asyncHandler';

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const items = await permissionService.list();
  res.json({ data: items });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const item = await permissionService.getById(String(req.params.id));
  res.json({ data: item });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const item = await permissionService.create(req.body);
  res.status(201).json({ data: item });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const item = await permissionService.update(String(req.params.id), req.body);
  res.json({ data: item });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await permissionService.remove(String(req.params.id));
  res.json({ message: 'Permission deleted' });
});
