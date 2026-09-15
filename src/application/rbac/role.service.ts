import type { IRoleRepository } from '../../domain/rbac/rbac.repository';
import type { CreateRoleInput, UpdateRoleInput } from '../../domain/rbac/role.entity';
import { AppError } from '../../shared/AppError';

export class RoleService {
  constructor(private readonly roles: IRoleRepository) {}

  list() {
    return this.roles.list(true);
  }

  async getById(id: string) {
    const item = await this.roles.findById(id, true);
    if (!item) throw new AppError('Role not found', 404);
    return item;
  }

  create(input: CreateRoleInput) {
    return this.roles.create(input);
  }

  async update(id: string, input: UpdateRoleInput) {
    const item = await this.roles.update(id, input);
    if (!item) throw new AppError('Role not found', 404);
    return item;
  }

  async remove(id: string) {
    const item = await this.roles.remove(id);
    if (!item) throw new AppError('Role not found', 404);
  }
}
