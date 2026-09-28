import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { asyncHandler } from '../../utils/http.js';
import { getMembership } from './memberships.service.js';

export const membershipsRouter = Router();

membershipsRouter.get('/me', requireAuth, asyncHandler(async (req, res) => {
  res.json(await getMembership(req.auth!.userId));
}));
