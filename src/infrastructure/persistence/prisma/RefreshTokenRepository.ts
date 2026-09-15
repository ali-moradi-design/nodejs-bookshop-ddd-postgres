import type { IRefreshTokenRepository } from '../../../domain/auth/refresh-token.repository';
import type { RefreshTokenRecord } from '../../../domain/auth/auth.types';
import { getPrisma } from './client';
import { mapRefreshToken } from './mappers';

export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  async create(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<RefreshTokenRecord> {
    const row = await getPrisma().refreshToken.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      },
    });
    return mapRefreshToken(row);
  }

  async findValidByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const row = await getPrisma().refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    return row ? mapRefreshToken(row) : null;
  }

  async revoke(tokenHash: string, replacedByHash?: string): Promise<void> {
    await getPrisma().refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: {
        revokedAt: new Date(),
        ...(replacedByHash ? { replacedByHash } : {}),
      },
    });
  }
}
