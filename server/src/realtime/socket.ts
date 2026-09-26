import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { verifyAccessToken } from '../utils/jwt.js';

let io: Server | null = null;

export function initializeRealtime(server: HttpServer): void {
  io = new Server(server, { cors: { origin: env.CORS_ORIGIN, credentials: true } });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (typeof token !== 'string') {
      next(new Error('No autenticado'));
      return;
    }
    try {
      socket.data.userId = verifyAccessToken(token).userId;
      next();
    } catch {
      next(new Error('No autenticado'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.data.userId as number}`);
  });
}

export function notifyNewMessage(userId: number, conversationId: number, message: unknown): void {
  io?.to(`user:${userId}`).emit('message:new', { conversationId, message });
}
