import { z } from 'zod';
import { ISSUE_TYPES, ISSUE_STATUSES } from '../../../../domain/report/report.entity';

export const createIssueSchema = z.object({
  type: z.enum(ISSUE_TYPES),
  targetId: z.string().optional(),
  subject: z.string().min(3).max(200),
  body: z.string().min(1).max(5000),
});

export const updateIssueSchema = z.object({
  status: z.enum(ISSUE_STATUSES).optional(),
  adminNotes: z.string().max(5000).optional(),
  subject: z.string().min(3).max(200).optional(),
  body: z.string().min(1).max(5000).optional(),
});

export const idParamSchema = z.object({ id: z.string().min(1) });

export const dateRangeQuerySchema = z.object({
  from: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  to: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});
