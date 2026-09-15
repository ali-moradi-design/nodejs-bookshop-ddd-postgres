import { Request, Response } from 'express';
import { reportService } from '../../../../infrastructure/composition';
import { asyncHandler } from '../../../../shared/asyncHandler';

export const createIssue = asyncHandler(async (req: Request, res: Response) => {
  const issue = await reportService.createIssue({
    reporter: req.user!.id,
    type: req.body.type,
    targetId: req.body.targetId,
    subject: req.body.subject,
    body: req.body.body,
  });
  res.status(201).json({ data: issue });
});

export const listIssues = asyncHandler(async (req: Request, res: Response) => {
  const canManage = req.user!.permissions.includes('reports:manage');
  const issues = await reportService.listIssues(req.user!.id, canManage);
  res.json({ data: issues });
});

export const getIssue = asyncHandler(async (req: Request, res: Response) => {
  const canManage = req.user!.permissions.includes('reports:manage');
  const issue = await reportService.getIssue(String(req.params.id), req.user!.id, canManage);
  res.json({ data: issue });
});

export const updateIssue = asyncHandler(async (req: Request, res: Response) => {
  const canManage = req.user!.permissions.includes('reports:manage');
  const issue = await reportService.updateIssue(
    String(req.params.id),
    req.body,
    req.user!.id,
    canManage,
  );
  res.json({ data: issue });
});

export const deleteIssue = asyncHandler(async (req: Request, res: Response) => {
  const canManage = req.user!.permissions.includes('reports:manage');
  await reportService.deleteIssue(String(req.params.id), req.user!.id, canManage);
  res.json({ message: 'Issue soft-deleted' });
});

export const revenueSummary = asyncHandler(async (req: Request, res: Response) => {
  const data = await reportService.revenueSummary(
    req.query.from as string | undefined,
    req.query.to as string | undefined,
  );
  res.json({ data });
});

export const ordersByStatus = asyncHandler(async (_req: Request, res: Response) => {
  const data = await reportService.ordersByStatus();
  res.json({ data });
});

export const topBooks = asyncHandler(async (req: Request, res: Response) => {
  const data = await reportService.topBooks(
    req.query.from as string | undefined,
    req.query.to as string | undefined,
    Number(req.query.limit) || 10,
  );
  res.json({ data });
});

export const salesByDate = asyncHandler(async (req: Request, res: Response) => {
  const data = await reportService.salesByDate(
    req.query.from as string | undefined,
    req.query.to as string | undefined,
  );
  res.json({ data });
});
