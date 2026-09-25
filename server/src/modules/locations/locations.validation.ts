import { z } from 'zod';

export const saveLocationSchema = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracyMeters: z.number().positive().max(100_000).optional(),
  })
  .strict();

export const nearbyQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export type SaveLocationBody = z.infer<typeof saveLocationSchema>;
