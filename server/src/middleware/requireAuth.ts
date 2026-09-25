import type { RequestHandler } from 'express';
import { AppError } from '../utils/http.js';
import { verifyAccessToken } from '../utils/jwt.js';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    next(new AppError(401, 'No autenticado', 'unauthorized'));
    return;
  }

  try {
    const { userId } = verifyAccessToken(header.slice(7));
    req.auth = { userId };
    next();
  } catch (error) {
    next(error);
  }
};
