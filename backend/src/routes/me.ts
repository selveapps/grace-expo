import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import * as auth from '../services/authService.js';
import * as library from '../services/libraryService.js';
import { schemas } from '../lib/schemas.js';

function meResponse(user: NonNullable<Awaited<ReturnType<typeof auth.getUserWithProfile>>>) {
  return {
    user: {
      id: user.id,
      guestDeviceId: user.guestDeviceId,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    profile: user.profile,
  };
}

export async function registerMeRoutes(app: FastifyInstance) {
  app.get('/me', { schema: schemas.getMe, preHandler: requireAuth }, async (req, reply) => {
    const user = await auth.getUserWithProfile(req.userId!);
    if (!user) return reply.code(404).send({ error: 'User not found' });
    return meResponse(user);
  });

  app.patch('/me', { schema: schemas.patchMe, preHandler: requireAuth }, async (req, reply) => {
    const body = req.body as {
      name?: string;
      carrying?: string[];
      gentleness?: string;
      rhythm?: string;
      onboarded?: boolean;
    };
    await library.patchMe(req.userId!, body);
    const user = await auth.getUserWithProfile(req.userId!);
    if (!user) return reply.code(404).send({ error: 'User not found' });
    return meResponse(user);
  });

  app.get('/saved', { schema: schemas.listSaved, preHandler: requireAuth }, async (req) => {
    return library.listSaved(req.userId!);
  });

  app.post('/saved', { schema: schemas.addSaved, preHandler: requireAuth }, async (req, reply) => {
    const body = req.body as { ref?: string; text?: string };
    if (!body?.ref || !body?.text) {
      return reply.code(400).send({ error: 'ref and text required' });
    }
    await library.addSaved(req.userId!, body.ref, body.text);
    return reply.code(201).send({ ref: body.ref, text: body.text });
  });

  app.delete('/saved/*', { schema: schemas.deleteSaved, preHandler: requireAuth }, async (req, reply) => {
    const ref = (req.params as { '*': string })['*'];
    if (!ref) return reply.code(400).send({ error: 'ref required' });
    const ok = await library.deleteSaved(req.userId!, decodeURIComponent(ref));
    if (!ok) return reply.code(404).send({ error: 'Not found' });
    return reply.code(204).send();
  });

  app.get('/reflections', { schema: schemas.listReflections, preHandler: requireAuth }, async (req) => {
    return library.listReflections(req.userId!);
  });

  app.post('/reflections', { schema: schemas.addReflection, preHandler: requireAuth }, async (req, reply) => {
    const body = req.body as { word?: string; note?: string; ref?: string };
    if (!body?.word) return reply.code(400).send({ error: 'word required' });
    const row = await library.addReflection(req.userId!, {
      word: body.word,
      note: body.note,
      ref: body.ref,
    });
    return reply.code(201).send({
      id: row.id,
      word: row.word,
      note: row.note,
      ref: row.ref,
      date: row.createdAt.toISOString().slice(0, 10),
    });
  });

  app.get('/progress', { schema: schemas.listProgress, preHandler: requireAuth }, async (req) => {
    return library.listProgress(req.userId!);
  });

  app.put('/progress', { schema: schemas.upsertProgress, preHandler: requireAuth }, async (req, reply) => {
    const body = req.body as { book?: string; chapter?: number; position?: number };
    if (!body?.book || body.chapter == null || body.position == null) {
      return reply.code(400).send({ error: 'book, chapter, position required' });
    }
    await library.upsertProgress(req.userId!, {
      book: body.book,
      chapter: body.chapter,
      position: body.position,
    });
    return reply.code(200).send({
      book: body.book,
      chapter: body.chapter,
      position: body.position,
    });
  });
}
