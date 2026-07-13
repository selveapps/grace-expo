import type { FastifyInstance } from 'fastify';
import { STORIES, STORY_COLLECTIONS, getStory } from '../lib/storyCatalog.js';
import { schemas } from '../lib/schemas.js';

export async function registerStoryRoutes(app: FastifyInstance) {
  app.get('/stories', { schema: schemas.listStories }, async () => ({
    featured: STORIES[0],
    collections: STORY_COLLECTIONS,
    stories: STORIES.map((s) => ({ ...s, audioUrl: null })),
  }));

  app.get('/stories/:id', { schema: schemas.getStory }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const story = getStory(id);
    if (!story) return reply.code(404).send({ error: 'Story not found' });
    return { ...story, audioUrl: null };
  });
}
