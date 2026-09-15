import { DomainError } from './DomainError';

/** Loose ISBN-10 / ISBN-13 style check (digits and hyphens; length after strip). */
export function normalizeIsbn(raw: string): string {
  const cleaned = raw.replace(/[\s-]/g, '').toUpperCase();
  if (!/^\d{9}[\dX]$|^\d{13}$/.test(cleaned)) {
    throw new DomainError('Invalid ISBN format', 'VALIDATION');
  }
  return cleaned;
}

export function isValidIsbn(raw: string): boolean {
  try {
    normalizeIsbn(raw);
    return true;
  } catch {
    return false;
  }
}
