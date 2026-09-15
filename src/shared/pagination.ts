export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages?: number;
}

export function paginate(page = 1, limit = 20): { page: number; limit: number; skip: number } {
  const p = Math.max(1, page);
  const l = Math.min(100, Math.max(1, limit));
  return { page: p, limit: l, skip: (p - 1) * l };
}
