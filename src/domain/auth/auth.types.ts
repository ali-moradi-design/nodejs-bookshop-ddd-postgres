export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export interface AuthUserContext {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date | null;
  replacedByHash?: string | null;
}
