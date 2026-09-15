import { Request, Response } from 'express';
import { dashboardService } from '../../../../infrastructure/composition';
import { asyncHandler } from '../../../../shared/asyncHandler';

export const summary = asyncHandler(async (_req: Request, res: Response) => {
  const data = await dashboardService.summary();
  res.json({ data });
});

export const recentOrders = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 10;
  const data = await dashboardService.recentOrders(limit);
  res.json({ data });
});

export const lowStock = asyncHandler(async (req: Request, res: Response) => {
  const threshold = Number(req.query.threshold) || 5;
  const data = await dashboardService.lowStock(threshold);
  res.json({ data });
});
