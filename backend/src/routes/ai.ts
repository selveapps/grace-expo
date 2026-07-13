import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import { getStory } from '../lib/storyCatalog.js';
import * as auth from '../services/authService.js';
import {
  generateReminderMessage,
  generateStoryNarrative,
  generateSupportReply,
  type UserContext,
} from '../services/llmService.js';
import { schemas } from '../lib/schemas.js';

const narrativeCache = new Map<string, { content: string; part: number; cachedAt: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;

async function loadUserContext(userId: string): Promise<UserContext> {
  const user = await auth.getUserWithProfile(userId);
  if (!user) return {};
  return {
    name: user.name,
    carrying: user.profile?.carrying ?? [],
    gentleness: user.profile?.gentleness,
    rhythm: user.profile?.rhythm,
  };
}

export async function registerAiRoutes(app: FastifyInstance) {
  app.post('/ai/stories/:id/narrative', { schema: schemas.storyNarrative, preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = (req.body as { part?: number }) ?? {};
    const part = body.part && body.part > 0 ? Math.floor(body.part) : 1;

    const story = getStory(id);
    if (!story) return reply.code(404).send({ error: 'Story not found' });
    if (part > story.parts) return reply.code(400).send({ error: `part must be 1–${story.parts}` });

    const cacheKey = `${req.userId}:${id}:${part}`;
    const cached = narrativeCache.get(cacheKey);
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return { storyId: id, part, content: cached.content, cached: true };
    }

    const ctx = await loadUserContext(req.userId!);
    const content = await generateStoryNarrative(story, ctx, part);
    narrativeCache.set(cacheKey, { content, part, cachedAt: Date.now() });

    return { storyId: id, part, content, cached: false };
  });

  app.post('/ai/reminder', { schema: schemas.aiReminder, preHandler: requireAuth }, async (req, reply) => {
    const body = req.body as {
      type?: string;
      morningTime?: string;
      eveningTime?: string;
    };
    const type = body?.type ?? 'morning';
    if (!['morning', 'evening', 'both', 'off'].includes(type)) {
      return reply.code(400).send({ error: 'type must be morning, evening, both, or off' });
    }
    if (type === 'off') {
      return { notification: '', preview: '', type };
    }

    const ctx = await loadUserContext(req.userId!);
    const result = await generateReminderMessage(
      { type, morningTime: body.morningTime, eveningTime: body.eveningTime },
      ctx,
    );
    return { type, ...result };
  });

  app.post('/ai/support', { schema: schemas.aiSupport, preHandler: requireAuth }, async (req, reply) => {
    const body = req.body as { category?: string; message?: string; email?: string };
    if (!body?.message?.trim()) return reply.code(400).send({ error: 'message required' });
    const category = body.category?.trim() || 'Other';

    const ctx = await loadUserContext(req.userId!);
    const replyText = await generateSupportReply(category, body.message.trim(), ctx, body.email);

    req.log.info({ category, userId: req.userId, messageLen: body.message.length }, 'support ticket');

    return {
      id: `tkt_${Date.now()}`,
      category,
      reply: replyText,
    };
  });
}
