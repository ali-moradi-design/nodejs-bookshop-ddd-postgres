import type { IUserRepository } from '../../domain/user/user.repository';
import type { IPasswordHasher } from '../auth/ports';
import type { PublicUser } from '../../domain/user/user.entity';
import { AppError } from '../../shared/AppError';

function toPublic(user: {
  id: string;
  name: string;
  email: string;
  roles: unknown;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  rolesPopulated?: unknown;
}): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.rolesPopulated ?? user.roles,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class UserService {
  constructor(
    private readonly users: IUserRepository,
    private readonly passwords: IPasswordHasher,
  ) {}

  async list(): Promise<PublicUser[]> {
    const users = await this.users.list({ populateRoles: true });
    return users.map((u) => toPublic(u as typeof u & { rolesPopulated?: unknown }));
  }

  async getById(
    id: string,
    requester: { id: string; permissions: string[] },
  ): Promise<PublicUser> {
    const isOwn = requester.id === id;
    const canReadAll = requester.permissions.includes('users:read');
    const canReadOwn = requester.permissions.includes('users:read-own');

    if (!isOwn && !canReadAll) throw new AppError('Forbidden', 403);
    if (isOwn && !canReadOwn && !canReadAll) throw new AppError('Forbidden', 403);

    const user = await this.users.findById(id, { populateRoles: true });
    if (!user) throw new AppError('User not found', 404);
    return toPublic(user as typeof user & { rolesPopulated?: unknown });
  }

  async getMe(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId, { populateRoles: true });
    if (!user) throw new AppError('User not found', 404);
    return toPublic(user as typeof user & { rolesPopulated?: unknown });
  }

  async create(input: {
    name: string;
    email: string;
    password: string;
    roles?: string[];
    isActive?: boolean;
  }): Promise<PublicUser> {
    const passwordHash = await this.passwords.hash(input.password);
    const user = await this.users.create({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      roles: input.roles ?? [],
      isActive: input.isActive ?? true,
    });
    const full = await this.users.findById(user.id, { populateRoles: true });
    return toPublic((full ?? user) as typeof user & { rolesPopulated?: unknown });
  }

  async update(
    id: string,
    body: {
      name?: string;
      email?: string;
      password?: string;
      roles?: string[];
      isActive?: boolean;
    },
    requester: { id: string; permissions: string[] },
  ): Promise<PublicUser> {
    const isOwn = requester.id === id;
    const canUpdateAll = requester.permissions.includes('users:update');
    const canUpdateOwn = requester.permissions.includes('users:update-own');

    if (!isOwn && !canUpdateAll) throw new AppError('Forbidden', 403);
    if (isOwn && !canUpdateOwn && !canUpdateAll) throw new AppError('Forbidden', 403);

    const updates: {
      name?: string;
      email?: string;
      passwordHash?: string;
      roles?: string[];
      isActive?: boolean;
    } = {};

    if (isOwn && !canUpdateAll) {
      if (body.name !== undefined) updates.name = body.name;
      if (body.password) updates.passwordHash = await this.passwords.hash(body.password);
    } else {
      if (body.name !== undefined) updates.name = body.name;
      if (body.email !== undefined) updates.email = body.email.toLowerCase();
      if (body.roles !== undefined) updates.roles = body.roles;
      if (body.isActive !== undefined) updates.isActive = body.isActive;
      if (body.password) updates.passwordHash = await this.passwords.hash(body.password);
    }

    const user = await this.users.update(id, updates);
    if (!user) throw new AppError('User not found', 404);
    return toPublic(user as typeof user & { rolesPopulated?: unknown });
  }

  async remove(id: string): Promise<void> {
    const user = await this.users.softDelete(id);
    if (!user) throw new AppError('User not found', 404);
  }
}
