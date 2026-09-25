import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { asyncHandler } from '../../utils/http.js';
import { nearbyQuerySchema } from '../locations/locations.validation.js';
import * as discoveryService from './discovery.service.js';

export const discoveryRouter = Router();

discoveryRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { limit } = nearbyQuerySchema.parse(req.query);
    const nearby = await discoveryService.findNearby(req.auth!.userId, limit);
    res.json(nearby);
  })
);
