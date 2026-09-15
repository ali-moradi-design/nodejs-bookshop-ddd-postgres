import type { IUserRepository } from '../../domain/user/user.repository';
import type { IRoleRepository } from '../../domain/rbac/rbac.repository';
import type { ITokenService } from '../auth/ports';
import type { AuthUserContext } from '../../domain/auth/auth.types';
import { AppError } from '../../shared/AppError';

export class AuthContextService {
  constructor(
    private readonly users: IUserRepository,
    private readonly roles: IRoleRepository,
    private readonly tokens: ITokenService,
  ) {}

  async fromAccessToken(token: string): Promise<AuthUserContext> {
    let payload;
    try {
      payload = this.tokens.verifyAccessToken(token);
    } catch {
      throw new AppError('Invalid or expired access token', 401);
    }

    const user = await this.users.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    const roles = await this.roles.findByIds(user.roles, true);
    const permissionSlugs = new Set<string>();
    for (const role of roles) {
      for (const perm of role.permissions) {
        if (typeof perm === 'object' && perm !== null && 'slug' in perm) {
          permissionSlugs.add(perm.slug);
        }
      }
    }

    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      permissions: Array.from(permissionSlugs),
    };
  }
}
