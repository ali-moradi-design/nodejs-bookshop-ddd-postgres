import { Request, Response } from 'express';
import { userService } from '../../../../infrastructure/composition';
import { asyncHandler } from '../../../../shared/asyncHandler';

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const users = await userService.list();
  res.json({ data: users });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getById(String(req.params.id), {
    id: req.user!.id,
    permissions: req.user!.permissions,
  });
  res.json({ data: user });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getMe(req.user!.id);
  res.json({ data: user });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.create(req.body);
  res.status(201).json({ data: user });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.update(String(req.params.id), req.body, {
    id: req.user!.id,
    permissions: req.user!.permissions,
  });
  res.json({ data: user });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await userService.remove(String(req.params.id));
  res.json({ message: 'User soft-deleted' });
});
