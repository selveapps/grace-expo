import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import { getTodayPayload } from '../services/todayService.js';
import { schemas } from '../lib/schemas.js';

export async function registerTodayRoutes(app: FastifyInstance) {
  app.get('/today', { schema: schemas.getToday, preHandler: requireAuth }, async (req) => {
    return getTodayPayload(req.userId!);
  });
}
