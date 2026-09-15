import { describe, expect, it } from 'vitest';
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
} from '../../../src/domain/rbac/rules/hasPermission';

describe('rbac hasPermission', () => {
  const perms = ['books:read', 'orders:create'];

  it('checks single / all / any', () => {
    expect(hasPermission(perms, 'books:read')).toBe(true);
    expect(hasAllPermissions(perms, ['books:read', 'orders:create'])).toBe(true);
    expect(hasAllPermissions(perms, ['books:read', 'admin:dashboard'])).toBe(false);
    expect(hasAnyPermission(perms, ['admin:dashboard', 'orders:create'])).toBe(true);
  });
});
