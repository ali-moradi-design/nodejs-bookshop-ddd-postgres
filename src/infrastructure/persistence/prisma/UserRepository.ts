import type { IUserRepository } from '../../../domain/user/user.repository';
import type { User, CreateUserInput, UpdateUserInput } from '../../../domain/user/user.entity';
import { getPrisma } from './client';
import { mapUser } from './mappers';

const roleInclude = {
  roles: {
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    },
  },
} as const;

export class PrismaUserRepository implements IUserRepository {
  async findById(
    id: string,
    opts?: { withPassword?: boolean; populateRoles?: boolean },
  ): Promise<User | null> {
    const row = await getPrisma().user.findFirst({
      where: { id, deletedAt: null },
      include: opts?.populateRoles ? roleInclude : { roles: true },
    });
    if (!row) return null;
    const user = mapUser(row, { populateRoles: opts?.populateRoles });
    if (!opts?.withPassword) delete user.passwordHash;
    return user;
  }

  async findByEmail(
    email: string,
    opts?: { withPassword?: boolean },
  ): Promise<User | null> {
    const row = await getPrisma().user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
      include: { roles: true },
    });
    if (!row) return null;
    const user = mapUser(row);
    if (!opts?.withPassword) delete user.passwordHash;
    return user;
  }

  async list(opts?: { populateRoles?: boolean }): Promise<User[]> {
    const rows = await getPrisma().user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: opts?.populateRoles ? roleInclude : { roles: true },
    });
    return rows.map((r) => {
      const u = mapUser(r, { populateRoles: opts?.populateRoles });
      delete u.passwordHash;
      return u;
    });
  }

  async create(input: CreateUserInput): Promise<User> {
    const row = await getPrisma().user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        isActive: input.isActive ?? true,
        roles: input.roles?.length
          ? { create: input.roles.map((roleId) => ({ roleId })) }
          : undefined,
      },
      include: { roles: true },
    });
    const user = mapUser(row);
    delete user.passwordHash;
    return user;
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    try {
      const db = getPrisma();
      if (input.roles) {
        await db.userRole.deleteMany({ where: { userId: id } });
        if (input.roles.length) {
          await db.userRole.createMany({
            data: input.roles.map((roleId) => ({ userId: id, roleId })),
          });
        }
      }
      await db.user.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.email !== undefined ? { email: input.email.toLowerCase() } : {}),
          ...(input.passwordHash !== undefined ? { passwordHash: input.passwordHash } : {}),
          ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        },
      });
      return this.findById(id, { populateRoles: true });
    } catch {
      return null;
    }
  }

  async softDelete(id: string): Promise<User | null> {
    try {
      const row = await getPrisma().user.update({
        where: { id },
        data: { deletedAt: new Date(), isActive: false },
        include: { roles: true },
      });
      const user = mapUser(row);
      delete user.passwordHash;
      return user;
    } catch {
      return null;
    }
  }

  async count(): Promise<number> {
    return getPrisma().user.count({ where: { deletedAt: null } });
  }
}
