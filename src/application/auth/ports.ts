import type { AccessTokenPayload } from '../../domain/auth/auth.types';

export interface ITokenService {
  signAccessToken(payload: AccessTokenPayload): string;
  verifyAccessToken(token: string): AccessTokenPayload;
  generateRefreshToken(): string;
  hashToken(token: string): string;
  refreshExpiresAt(): Date;
}

export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}
