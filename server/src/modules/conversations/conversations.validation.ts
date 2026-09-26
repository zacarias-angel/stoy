import { z } from 'zod';

export const userIdParamSchema = z.object({ userId: z.coerce.number().int().positive() });
export const conversationIdParamSchema = z.object({ conversationId: z.coerce.number().int().positive() });
export const messagesQuerySchema = z.object({ limit: z.coerce.number().int().min(1).max(100).default(50) });
export const createConversationSchema = z.object({ userId: z.number().int().positive() }).strict();
export const sendMessageSchema = z.object({ text: z.string().trim().min(1).max(2000) }).strict();
export const reportUserSchema = z.object({
  reason: z.string().trim().min(3).max(80),
  details: z.string().trim().max(1000).nullable().optional(),
}).strict();
