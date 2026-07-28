import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import * as library from '../services/libraryService.js';
import { generateReminderMessage, generateSupportReply, type UserContext } from '../services/llmService.js';
import { getStoryNarrative, getStoryAudioMp3 } from '../services/storyContentService.js';
import { getStory, resolveStoryAudioUrl } from '../lib/storyCatalog.js';
import * as auth from '../services/authService.js';
import { schemas } from '../lib/schemas.js';

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

    try {
      const result = await getStoryNarrative(req.userId!, id, part);
      if (!result) return reply.code(404).send({ error: 'Story not found' });
      return { storyId: id, part, content: result.content, cached: result.cached };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid part';
      return reply.code(400).send({ error: msg });
    }
  });

  app.get('/ai/stories/:id/audio', { schema: schemas.storyAudio, preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const { part: partQ } = req.query as { part?: string };
    const part = partQ && Number(partQ) > 0 ? Math.floor(Number(partQ)) : 1;

    try {
      const buffer = await getStoryAudioMp3(req.userId!, id, part);
      if (!buffer) return reply.code(404).send({ error: 'Story not found' });
      return reply
        .header('Content-Type', 'audio/mpeg')
        .header('Cache-Control', 'private, max-age=86400')
        .send(buffer);
    } catch (e) {
      // Live TTS failed (e.g. no key in production). Fall back to the pre-rendered
      // static MP3 if one exists instead of surfacing a raw 503 as "broken".
      const story = getStory(id);
      const staticUrl = story ? resolveStoryAudioUrl(story, part) : null;
      if (staticUrl) return reply.redirect(staticUrl, 302);
      const msg = e instanceof Error ? e.message : 'Audio generation failed';
      req.log.error({ err: msg, storyId: id, part }, 'story audio failed');
      return reply.code(503).send({ error: 'Audio temporarily unavailable', retryable: true });
    }
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

    const ticket = await library.createSupportTicket(req.userId!, {
      category,
      message: body.message.trim(),
      email: body.email?.trim() || undefined,
      reply: replyText,
    });

    req.log.info({ ticketId: ticket.id, category, userId: req.userId }, 'support ticket');

    return {
      id: ticket.id,
      category,
      reply: replyText,
    };
  });
}
