export const ISSUE_TYPES = ['book', 'order', 'review', 'other'] as const;
export const ISSUE_STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const;

export type IssueType = (typeof ISSUE_TYPES)[number];
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export interface IssueReport {
  id: string;
  reporter: string;
  type: IssueType;
  targetId?: string;
  subject: string;
  body: string;
  status: IssueStatus;
  adminNotes?: string;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  populated?: {
    reporter?: { name: string; email: string };
  };
}

export interface CreateIssueInput {
  reporter: string;
  type: IssueType;
  targetId?: string;
  subject: string;
  body: string;
}

export interface UpdateIssueInput {
  status?: IssueStatus;
  adminNotes?: string;
  subject?: string;
  body?: string;
}
