import type { FastifyInstance } from 'fastify';
import * as auth from '../services/authService.js';
import { schemas } from '../lib/schemas.js';

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post('/auth/guest', { schema: schemas.authGuest }, async (req, reply) => {
    const body = req.body as { deviceId?: string };
    if (!body?.deviceId) return reply.code(400).send({ error: 'deviceId required' });
    try {
      return await auth.guestLogin(body.deviceId);
    } catch (e) {
      return reply.code(400).send({ error: (e as Error).message });
    }
  });

  app.post('/auth/refresh', { schema: schemas.authRefresh }, async (req, reply) => {
    const body = req.body as { refresh?: string };
    if (!body?.refresh) return reply.code(400).send({ error: 'refresh required' });
    try {
      return await auth.refreshSession(body.refresh);
    } catch {
      return reply.code(401).send({ error: 'Invalid refresh token' });
    }
  });
}
