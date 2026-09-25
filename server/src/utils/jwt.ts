import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './http.js';

export function signAccessToken(userId: number): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign({ sub: String(userId) }, env.JWT_SECRET, options);
}

export function verifyAccessToken(token: string): { userId: number } {
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    throw new AppError(401, 'Token invalido o expirado', 'unauthorized');
  }

  const userId = Number(decoded.sub);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new AppError(401, 'Token invalido', 'unauthorized');
  }

  return { userId };
}
