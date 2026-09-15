export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  roles: string[];
  isActive: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  roles: unknown;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  roles?: string[];
  isActive?: boolean;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  passwordHash?: string;
  roles?: string[];
  isActive?: boolean;
}
