import type { Permission, CreatePermissionInput, UpdatePermissionInput } from './permission.entity';
import type { Role, CreateRoleInput, UpdateRoleInput } from './role.entity';

export interface IPermissionRepository {
  findById(id: string): Promise<Permission | null>;
  findByIds(ids: string[]): Promise<Permission[]>;
  list(): Promise<Permission[]>;
  create(input: CreatePermissionInput): Promise<Permission>;
  update(id: string, input: UpdatePermissionInput): Promise<Permission | null>;
  remove(id: string): Promise<Permission | null>;
  upsertBySlug(slug: string, input: CreatePermissionInput): Promise<Permission>;
}

export interface IRoleRepository {
  findById(id: string, populate?: boolean): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findByIds(ids: string[], populate?: boolean): Promise<Role[]>;
  list(populate?: boolean): Promise<Role[]>;
  create(input: CreateRoleInput): Promise<Role>;
  update(id: string, input: UpdateRoleInput): Promise<Role | null>;
  remove(id: string): Promise<Role | null>;
  upsertByName(name: string, input: CreateRoleInput): Promise<Role>;
}
