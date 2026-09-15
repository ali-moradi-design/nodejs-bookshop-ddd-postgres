import type { IPermissionRepository } from '../../../domain/rbac/rbac.repository';
import type {
  Permission,
  CreatePermissionInput,
  UpdatePermissionInput,
} from '../../../domain/rbac/permission.entity';
import { getPrisma } from './client';
import { mapPermission } from './mappers';

export class PrismaPermissionRepository implements IPermissionRepository {
  async findById(id: string): Promise<Permission | null> {
    const row = await getPrisma().permission.findUnique({ where: { id } });
    return row ? mapPermission(row) : null;
  }

  async findByIds(ids: string[]): Promise<Permission[]> {
    const rows = await getPrisma().permission.findMany({ where: { id: { in: ids } } });
    return rows.map(mapPermission);
  }

  async list(): Promise<Permission[]> {
    const rows = await getPrisma().permission.findMany({
      orderBy: [{ section: 'asc' }, { slug: 'asc' }],
    });
    return rows.map(mapPermission);
  }

  async create(input: CreatePermissionInput): Promise<Permission> {
    const row = await getPrisma().permission.create({ data: input });
    return mapPermission(row);
  }

  async update(id: string, input: UpdatePermissionInput): Promise<Permission | null> {
    try {
      const row = await getPrisma().permission.update({ where: { id }, data: input });
      return mapPermission(row);
    } catch {
      return null;
    }
  }

  async remove(id: string): Promise<Permission | null> {
    try {
      const row = await getPrisma().permission.delete({ where: { id } });
      return mapPermission(row);
    } catch {
      return null;
    }
  }

  async upsertBySlug(slug: string, input: CreatePermissionInput): Promise<Permission> {
    const row = await getPrisma().permission.upsert({
      where: { slug },
      create: input,
      update: {
        name: input.name,
        description: input.description,
        section: input.section,
      },
    });
    return mapPermission(row);
  }
}
