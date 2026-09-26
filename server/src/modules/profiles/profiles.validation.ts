import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2, 'El nombre es muy corto').max(80).optional(),
    avatarUrl: z.string().trim().url('URL de avatar invalida').max(512).nullable().optional(),
    headline: z.string().trim().max(120).nullable().optional(),
    bio: z.string().trim().max(500).nullable().optional(),
    isVisible: z.boolean().optional(),
    primarySkillId: z.number().int().positive().nullable().optional(),
    skillIds: z.array(z.number().int().positive()).min(1).max(5).optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.skillIds && value.primarySkillId && !value.skillIds.includes(value.primarySkillId)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['primarySkillId'], message: 'La habilidad principal debe estar entre las habilidades elegidas' });
    }
  });

export const userIdParamSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
