import type { IPermissionRepository } from '../../domain/rbac/rbac.repository';
import type { CreatePermissionInput, UpdatePermissionInput } from '../../domain/rbac/permission.entity';
import { AppError } from '../../shared/AppError';

export class PermissionService {
  constructor(private readonly permissions: IPermissionRepository) {}

  list() {
    return this.permissions.list();
  }

  async getById(id: string) {
    const item = await this.permissions.findById(id);
    if (!item) throw new AppError('Permission not found', 404);
    return item;
  }

  create(input: CreatePermissionInput) {
    return this.permissions.create(input);
  }

  async update(id: string, input: UpdatePermissionInput) {
    const item = await this.permissions.update(id, input);
    if (!item) throw new AppError('Permission not found', 404);
    return item;
  }

  async remove(id: string) {
    const item = await this.permissions.remove(id);
    if (!item) throw new AppError('Permission not found', 404);
  }
}
