import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { asyncHandler } from '../../utils/http.js';
import * as locationsService from './locations.service.js';
import { saveLocationSchema } from './locations.validation.js';

export const locationsRouter = Router();

locationsRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const location = await locationsService.getOwnLocation(req.auth!.userId);
    res.json({ location });
  })
);

locationsRouter.put(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = saveLocationSchema.parse(req.body);
    await locationsService.saveOwnLocation(req.auth!.userId, input);
    res.status(204).send();
  })
);
