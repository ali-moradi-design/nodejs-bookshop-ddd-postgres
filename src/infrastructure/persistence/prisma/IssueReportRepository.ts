import type { IIssueReportRepository } from '../../../domain/report/report.repository';
import type {
  IssueReport,
  CreateIssueInput,
  UpdateIssueInput,
} from '../../../domain/report/report.entity';
import { getPrisma } from './client';
import { mapIssue } from './mappers';

const reporterInclude = {
  reporter: { select: { name: true, email: true } },
} as const;

export class PrismaIssueReportRepository implements IIssueReportRepository {
  async findById(id: string, populate = false): Promise<IssueReport | null> {
    const row = await getPrisma().issueReport.findFirst({
      where: { id, deletedAt: null },
      include: populate ? reporterInclude : undefined,
    });
    return row ? mapIssue(row) : null;
  }

  async list(
    filter: { reporterId?: string },
    populate = false,
  ): Promise<IssueReport[]> {
    const rows = await getPrisma().issueReport.findMany({
      where: {
        deletedAt: null,
        ...(filter.reporterId ? { reporterId: filter.reporterId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: populate ? reporterInclude : undefined,
    });
    return rows.map(mapIssue);
  }

  async create(input: CreateIssueInput): Promise<IssueReport> {
    const row = await getPrisma().issueReport.create({
      data: {
        reporterId: input.reporter,
        type: input.type,
        targetId: input.targetId,
        subject: input.subject,
        body: input.body,
        status: 'open',
      },
    });
    return mapIssue(row);
  }

  async update(id: string, input: UpdateIssueInput): Promise<IssueReport | null> {
    try {
      const row = await getPrisma().issueReport.update({
        where: { id },
        data: {
          ...(input.status !== undefined ? { status: input.status } : {}),
          ...(input.adminNotes !== undefined ? { adminNotes: input.adminNotes } : {}),
          ...(input.subject !== undefined ? { subject: input.subject } : {}),
          ...(input.body !== undefined ? { body: input.body } : {}),
        },
      });
      if (row.deletedAt) return null;
      return mapIssue(row);
    } catch {
      return null;
    }
  }

  async softDelete(id: string): Promise<IssueReport | null> {
    try {
      const row = await getPrisma().issueReport.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return mapIssue(row);
    } catch {
      return null;
    }
  }

  async countOpen(): Promise<number> {
    return getPrisma().issueReport.count({ where: { status: 'open', deletedAt: null } });
  }
}
