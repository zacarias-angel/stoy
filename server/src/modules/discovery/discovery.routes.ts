import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { asyncHandler } from '../../utils/http.js';
import { z } from 'zod';
import * as discoveryService from './discovery.service.js';

export const discoveryRouter = Router();
const nearbyQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
  q: z.string().trim().max(80).optional(),
  skillId: z.coerce.number().int().positive().optional(),
});

discoveryRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const query = nearbyQuerySchema.parse(req.query);
    const nearby = await discoveryService.findNearby(req.auth!.userId, query);
    res.json(nearby);
  })
);
