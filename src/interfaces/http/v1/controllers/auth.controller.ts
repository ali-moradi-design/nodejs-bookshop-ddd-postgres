import { Request, Response } from 'express';
import { authService } from '../../../../infrastructure/composition';
import { asyncHandler } from '../../../../shared/asyncHandler';
import { AppError } from '../../../../shared/AppError';
import {
  setAuthCookies,
  clearAuthCookies,
  resolveRefreshToken,
} from '../../cookies/authCookies';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  setAuthCookies(res, result);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  setAuthCookies(res, result);
  res.status(200).json(result);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = resolveRefreshToken(req);
  if (!refreshToken) {
    throw new AppError('Refresh token required', 401);
  }
  const result = await authService.refresh(refreshToken);
  setAuthCookies(res, result);
  res.status(200).json(result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = resolveRefreshToken(req);
  if (refreshToken) {
    await authService.logout(refreshToken);
  }
  clearAuthCookies(res);
  res.status(200).json({ message: 'Logged out' });
});
