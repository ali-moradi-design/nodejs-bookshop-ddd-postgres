import { DomainError } from './DomainError';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(raw: string): string {
  const email = raw.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    throw new DomainError('Invalid email address', 'VALIDATION');
  }
  return email;
}

export function assertEmail(raw: string): string {
  return normalizeEmail(raw);
}
