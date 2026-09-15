import type { User, CreateUserInput, UpdateUserInput } from './user.entity';

export interface IUserRepository {
  findById(id: string, opts?: { withPassword?: boolean; populateRoles?: boolean }): Promise<User | null>;
  findByEmail(email: string, opts?: { withPassword?: boolean }): Promise<User | null>;
  list(opts?: { populateRoles?: boolean }): Promise<User[]>;
  create(input: CreateUserInput): Promise<User>;
  update(id: string, input: UpdateUserInput): Promise<User | null>;
  softDelete(id: string): Promise<User | null>;
  count(): Promise<number>;
}
