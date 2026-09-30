import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { asyncHandler } from '../../utils/http.js';
import * as profilesService from './profiles.service.js';
import * as reviewsService from './reviews.service.js';
import { reviewSchema, updateProfileSchema, userIdParamSchema } from './profiles.validation.js';

export const profilesRouter = Router();

profilesRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const profile = await profilesService.getOwnProfile(req.auth!.userId);
    res.json(profile);
  })
);

profilesRouter.put(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = updateProfileSchema.parse(req.body);
    const profile = await profilesService.updateOwnProfile(req.auth!.userId, input);
    res.json(profile);
  })
);

profilesRouter.get(
  '/:userId/reviews',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId } = userIdParamSchema.parse(req.params);
    res.json(await reviewsService.getReviews(userId, req.auth!.userId));
  })
);

profilesRouter.post(
  '/:userId/reviews',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId } = userIdParamSchema.parse(req.params);
    res.status(201).json(await reviewsService.saveReview(req.auth!.userId, userId, reviewSchema.parse(req.body)));
  })
);

profilesRouter.get(
  '/:userId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId } = userIdParamSchema.parse(req.params);
    const profile = await profilesService.getPublicProfile(userId);
    res.json(profile);
  })
);
