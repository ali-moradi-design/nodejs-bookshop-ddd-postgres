import type { IUserRepository } from '../../domain/user/user.repository';
import type { IRoleRepository } from '../../domain/rbac/rbac.repository';
import type { IRefreshTokenRepository } from '../../domain/auth/refresh-token.repository';
import type { ITokenService, IPasswordHasher } from './ports';
import { AppError } from '../../shared/AppError';

function sanitizeUser(user: {
  id: string;
  name: string;
  email: string;
  roles: unknown;
  isActive: boolean;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles,
    isActive: user.isActive,
  };
}

export class AuthService {
  constructor(
    private readonly users: IUserRepository,
    private readonly roles: IRoleRepository,
    private readonly refreshTokens: IRefreshTokenRepository,
    private readonly tokens: ITokenService,
    private readonly passwords: IPasswordHasher,
  ) {}

  private async issueTokenPair(userId: string, email: string) {
    const accessToken = this.tokens.signAccessToken({ sub: userId, email });
    const refreshToken = this.tokens.generateRefreshToken();
    const tokenHash = this.tokens.hashToken(refreshToken);
    await this.refreshTokens.create({
      userId,
      tokenHash,
      expiresAt: this.tokens.refreshExpiresAt(),
    });
    return { accessToken, refreshToken };
  }

  async register(input: { name: string; email: string; password: string }) {
    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const customerRole = await this.roles.findByName('customer');
    if (!customerRole) {
      throw new AppError('Default customer role missing; run seed first', 500);
    }

    const passwordHash = await this.passwords.hash(input.password);
    const user = await this.users.create({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      roles: [customerRole.id],
    });

    const tokens = await this.issueTokenPair(user.id, user.email);
    return { user: sanitizeUser(user), ...tokens };
  }

  async login(input: { email: string; password: string }) {
    const user = await this.users.findByEmail(input.email, { withPassword: true });
    if (!user || !user.isActive || !user.passwordHash) {
      throw new AppError('Invalid credentials', 401);
    }
    const ok = await this.passwords.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new AppError('Invalid credentials', 401);
    }
    const tokens = await this.issueTokenPair(user.id, user.email);
    return { user: sanitizeUser(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.tokens.hashToken(refreshToken);
    const matched = await this.refreshTokens.findValidByHash(tokenHash);
    if (!matched) {
      throw new AppError('Invalid refresh token', 401);
    }

    const user = await this.users.findById(matched.userId);
    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    const newRefresh = this.tokens.generateRefreshToken();
    const newHash = this.tokens.hashToken(newRefresh);

    await this.refreshTokens.revoke(tokenHash, newHash);
    await this.refreshTokens.create({
      userId: user.id,
      tokenHash: newHash,
      expiresAt: this.tokens.refreshExpiresAt(),
    });

    const accessToken = this.tokens.signAccessToken({ sub: user.id, email: user.email });
    return { accessToken, refreshToken: newRefresh };
  }

  async logout(refreshToken: string) {
    const tokenHash = this.tokens.hashToken(refreshToken);
    await this.refreshTokens.revoke(tokenHash);
  }
}
