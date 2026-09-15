import type { IPasswordHasher } from '../../application/auth/ports';
import { hashPassword, comparePassword } from './password';

export class BcryptPasswordHasher implements IPasswordHasher {
  hash(password: string): Promise<string> {
    return hashPassword(password);
  }
  compare(password: string, hash: string): Promise<boolean> {
    return comparePassword(password, hash);
  }
}
