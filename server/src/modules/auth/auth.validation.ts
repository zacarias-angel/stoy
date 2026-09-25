import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email invalido'),
  password: z
    .string()
    .min(8, 'La contrasena debe tener al menos 8 caracteres')
    .max(100, 'La contrasena es demasiado larga'),
  name: z.string().trim().min(2, 'El nombre es muy corto').max(80),
  headline: z.string().trim().max(120).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email invalido'),
  password: z.string().min(1, 'Ingresa tu contrasena'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
