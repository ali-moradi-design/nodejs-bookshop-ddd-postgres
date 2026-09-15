import { Request, Response } from 'express';
import { roleService } from '../../../../infrastructure/composition';
import { asyncHandler } from '../../../../shared/asyncHandler';

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const items = await roleService.list();
  res.json({ data: items });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const item = await roleService.getById(String(req.params.id));
  res.json({ data: item });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const item = await roleService.create({
    name: req.body.name,
    description: req.body.description,
    permissions: req.body.permissions ?? [],
  });
  res.status(201).json({ data: item });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const item = await roleService.update(String(req.params.id), req.body);
  res.json({ data: item });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await roleService.remove(String(req.params.id));
  res.json({ message: 'Role deleted' });
});
