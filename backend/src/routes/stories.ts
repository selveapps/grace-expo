import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { FastifyInstance } from 'fastify';
import { STORIES, STORY_COLLECTIONS, getStory, storyForClient } from '../lib/storyCatalog.js';
import { storyPartRef } from '../lib/narrationScripts.js';
import { requireAuth } from '../middleware/auth.js';
import * as library from '../services/libraryService.js';
import { schemas } from '../lib/schemas.js';

const audioDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../public/audio');

type Sidecar = {
  text?: string;
  words?: { w: string; start: number; end: number }[] | null;
  voice?: string;
  renderedAt?: number;
};

/**
 * The transcript is the render's own sidecar, never freshly generated text. If
 * there is no sidecar there is no honest transcript, so we 404 rather than show
 * words the audio does not say.
 */
async function readSidecar(storyId: string, part: number): Promise<Sidecar | null> {
  try {
    const raw = await readFile(path.join(audioDir, `${storyId}-part-${part}.json`), 'utf8');
    return JSON.parse(raw) as Sidecar;
  } catch {
    return null;
  }
}

export async function registerStoryRoutes(app: FastifyInstance) {
  app.get('/stories', { schema: schemas.listStories }, async () => ({
    featured: storyForClient(STORIES[0]),
    collections: STORY_COLLECTIONS,
    stories: STORIES.map(storyForClient),
  }));

  app.get('/stories/progress', { schema: schemas.listStoryProgress, preHandler: requireAuth }, async (req) => {
    return library.listStoryProgress(req.userId!);
  });

  app.put('/stories/progress/:storyId', { schema: schemas.upsertStoryProgress, preHandler: requireAuth }, async (req, reply) => {
    const { storyId } = req.params as { storyId: string };
    const body = req.body as { seconds?: number; completed?: boolean };
    if (!getStory(storyId)) return reply.code(404).send({ error: 'Story not found' });
    if (body?.seconds == null || body.seconds < 0) {
      return reply.code(400).send({ error: 'seconds required (>= 0)' });
    }
    const row = await library.upsertStoryProgress(req.userId!, storyId, {
      seconds: body.seconds,
      completed: body.completed,
    });
    return {
      storyId: row.storyId,
      seconds: row.seconds,
      completed: row.completed,
    };
  });

  app.get('/stories/:id/transcript', async (req, reply) => {
    const { id } = req.params as { id: string };
    if (!getStory(id)) return reply.code(404).send({ error: 'Story not found' });
    const part = Math.max(1, Number((req.query as { part?: string }).part ?? 1) || 1);
    const data = await readSidecar(id, part);
    if (!data?.text) return reply.code(404).send({ error: 'No transcript' });
    reply.header('Cache-Control', 'public, max-age=86400');
    return {
      storyId: id,
      part,
      text: data.text,
      words: data.words ?? null,
      renderedAt: data.renderedAt ?? null,
      // The passage this part is retold from, shown above the transcript.
      ref: storyPartRef(id, part),
    };
  });

  app.get('/stories/:id', { schema: schemas.getStory }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const story = getStory(id);
    if (!story) return reply.code(404).send({ error: 'Story not found' });
    return storyForClient(story);
  });
}
