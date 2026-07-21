import type { FastifyInstance } from 'fastify';
import { STORIES, STORY_COLLECTIONS, getStory, storyForClient } from '../lib/storyCatalog.js';
import { requireAuth } from '../middleware/auth.js';
import * as library from '../services/libraryService.js';
import { schemas } from '../lib/schemas.js';

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

  app.get('/stories/:id', { schema: schemas.getStory }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const story = getStory(id);
    if (!story) return reply.code(404).send({ error: 'Story not found' });
    return storyForClient(story);
  });
}
