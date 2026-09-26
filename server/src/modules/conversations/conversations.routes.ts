import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { asyncHandler } from '../../utils/http.js';
import { notifyNewMessage } from '../../realtime/socket.js';
import * as service from './conversations.service.js';
import { conversationIdParamSchema, createConversationSchema, messagesQuerySchema, reportUserSchema, sendMessageSchema, userIdParamSchema } from './conversations.validation.js';

export const conversationsRouter = Router();
conversationsRouter.use(requireAuth);
conversationsRouter.get('/', asyncHandler(async (req, res) => res.json({ conversations: await service.listConversations(req.auth!.userId) })));
conversationsRouter.post('/', asyncHandler(async (req, res) => res.status(201).json(await service.createDirectConversation(req.auth!.userId, createConversationSchema.parse(req.body).userId))));
conversationsRouter.get('/:conversationId/messages', asyncHandler(async (req, res) => { const { conversationId } = conversationIdParamSchema.parse(req.params); res.json(await service.listMessages(req.auth!.userId, conversationId, messagesQuerySchema.parse(req.query).limit)); }));
conversationsRouter.post('/:conversationId/messages', asyncHandler(async (req, res) => {
  const { conversationId } = conversationIdParamSchema.parse(req.params);
  const { recipientUserId, message } = await service.sendMessage(req.auth!.userId, conversationId, sendMessageSchema.parse(req.body).text);
  notifyNewMessage(recipientUserId, conversationId, message);
  res.status(201).json(message);
}));
export const safetyRouter = Router();
safetyRouter.use(requireAuth);
safetyRouter.post('/blocks/:userId', asyncHandler(async (req, res) => { await service.blockUser(req.auth!.userId, userIdParamSchema.parse(req.params).userId); res.status(204).end(); }));
safetyRouter.post('/reports/:userId', asyncHandler(async (req, res) => { const { reason, details } = reportUserSchema.parse(req.body); await service.reportUser(req.auth!.userId, userIdParamSchema.parse(req.params).userId, reason, details); res.status(204).end(); }));
