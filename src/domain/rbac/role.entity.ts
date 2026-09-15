export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[] | PermissionRef[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionRef {
  id: string;
  slug: string;
  name?: string;
  description?: string;
  section?: string;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permissions?: string[];
}
