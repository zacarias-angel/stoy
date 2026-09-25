import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2, 'El nombre es muy corto').max(80).optional(),
    avatarUrl: z.string().trim().url('URL de avatar invalida').max(512).nullable().optional(),
    headline: z.string().trim().max(120).nullable().optional(),
    bio: z.string().trim().max(500).nullable().optional(),
    isVisible: z.boolean().optional(),
    primarySkillId: z.number().int().positive().nullable().optional(),
  })
  .strict();

export const userIdParamSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
