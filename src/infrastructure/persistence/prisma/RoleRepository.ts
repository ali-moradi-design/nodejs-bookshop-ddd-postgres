import type { IRoleRepository } from '../../../domain/rbac/rbac.repository';
import type { Role, CreateRoleInput, UpdateRoleInput } from '../../../domain/rbac/role.entity';
import { getPrisma } from './client';
import { mapRole } from './mappers';

const permInclude = {
  permissions: { include: { permission: true } },
} as const;

export class PrismaRoleRepository implements IRoleRepository {
  async findById(id: string, populate = false): Promise<Role | null> {
    const row = await getPrisma().role.findUnique({
      where: { id },
      include: populate ? permInclude : { permissions: true },
    });
    return row ? mapRole(row, populate) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const row = await getPrisma().role.findUnique({
      where: { name },
      include: { permissions: true },
    });
    return row ? mapRole(row) : null;
  }

  async findByIds(ids: string[], populate = false): Promise<Role[]> {
    const rows = await getPrisma().role.findMany({
      where: { id: { in: ids } },
      include: populate ? permInclude : { permissions: true },
    });
    return rows.map((r) => mapRole(r, populate));
  }

  async list(populate = false): Promise<Role[]> {
    const rows = await getPrisma().role.findMany({
      orderBy: { name: 'asc' },
      include: populate ? permInclude : { permissions: true },
    });
    return rows.map((r) => mapRole(r, populate));
  }

  async create(input: CreateRoleInput): Promise<Role> {
    const row = await getPrisma().role.create({
      data: {
        name: input.name,
        description: input.description,
        permissions: input.permissions?.length
          ? { create: input.permissions.map((permissionId) => ({ permissionId })) }
          : undefined,
      },
      include: permInclude,
    });
    return mapRole(row, true);
  }

  async update(id: string, input: UpdateRoleInput): Promise<Role | null> {
    try {
      const db = getPrisma();
      if (input.permissions) {
        await db.rolePermission.deleteMany({ where: { roleId: id } });
        if (input.permissions.length) {
          await db.rolePermission.createMany({
            data: input.permissions.map((permissionId) => ({ roleId: id, permissionId })),
          });
        }
      }
      await db.role.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
        },
      });
      return this.findById(id, true);
    } catch {
      return null;
    }
  }

  async remove(id: string): Promise<Role | null> {
    try {
      const existing = await this.findById(id);
      if (!existing) return null;
      await getPrisma().role.delete({ where: { id } });
      return existing;
    } catch {
      return null;
    }
  }

  async upsertByName(name: string, input: CreateRoleInput): Promise<Role> {
    const existing = await getPrisma().role.findUnique({ where: { name } });
    if (existing) {
      await getPrisma().rolePermission.deleteMany({ where: { roleId: existing.id } });
      if (input.permissions?.length) {
        await getPrisma().rolePermission.createMany({
          data: input.permissions.map((permissionId) => ({
            roleId: existing.id,
            permissionId,
          })),
        });
      }
      const row = await getPrisma().role.update({
        where: { id: existing.id },
        data: { description: input.description },
        include: { permissions: true },
      });
      return mapRole(row);
    }
    return this.create({ ...input, name });
  }
}
