import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { conversationsRouter, safetyRouter } from './modules/conversations/conversations.routes.js';
import { discoveryRouter } from './modules/discovery/discovery.routes.js';
import { locationsRouter } from './modules/locations/locations.routes.js';
import { membershipsRouter } from './modules/memberships/memberships.routes.js';
import { profilesRouter } from './modules/profiles/profiles.routes.js';
import { skillsRouter } from './modules/skills/skills.routes.js';

export function createApp(): express.Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  app.use(
    '/api',
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', environment: env.NODE_ENV });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/profiles', profilesRouter);
  app.use('/api/skills', skillsRouter);
  app.use('/api/locations', locationsRouter);
  app.use('/api/nearby', discoveryRouter);
  app.use('/api/memberships', membershipsRouter);
  app.use('/api/conversations', conversationsRouter);
  app.use('/api', safetyRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'not_found', message: 'Recurso no encontrado' } });
  });

  app.use(errorHandler);

  return app;
}
