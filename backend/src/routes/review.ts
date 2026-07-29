import type { FastifyInstance } from 'fastify';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const SURFACES = new Set(['onboarding', 'post-story', 'day7']);
const ACTIONS = new Set(['prompted', 'declined', 'completed']);

/** Apple caps the native prompt at 3/year — never ask twice inside 90 days. */
const ASK_COOLDOWN_DAYS = 90;

export async function registerReviewRoutes(app: FastifyInstance) {
  app.post('/review/event', { preHandler: requireAuth }, async (req, reply) => {
    const { surface, action } = (req.body ?? {}) as { surface?: string; action?: string };
    if (!surface || !SURFACES.has(surface)) return reply.code(400).send({ error: 'Invalid surface' });
    if (!action || !ACTIONS.has(action)) return reply.code(400).send({ error: 'Invalid action' });
    await prisma.reviewPrompt.create({ data: { userId: req.userId!, surface, action } });
    return { ok: true };
  });

  app.get('/review/should-ask', { preHandler: requireAuth }, async (req) => {
    const last = await prisma.reviewPrompt.findFirst({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
    });
    if (!last) return { ask: true };
    if (last.action === 'completed') return { ask: false };
    const days = (Date.now() - last.createdAt.getTime()) / 86_400_000;
    return { ask: days > ASK_COOLDOWN_DAYS };
  });
}
