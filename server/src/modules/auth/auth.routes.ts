import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { asyncHandler } from '../../utils/http.js';
import * as authService from './auth.service.js';
import { loginSchema, registerSchema } from './auth.validation.js';

export const authRouter = Router();

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const session = await authService.registerUser(input);
    res.status(201).json(session);
  })
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const session = await authService.loginUser(input);
    res.json(session);
  })
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const profile = await authService.getMe(req.auth!.userId);
    res.json(profile);
  })
);
