import type { FastifyInstance } from 'fastify';
import * as bible from '../services/bibleService.js';

export async function registerBibleRoutes(app: FastifyInstance) {
  app.get('/bible/search', async (req) => {
    const { q } = req.query as { q?: string };
    return bible.searchScripture(q ?? '');
  });

  app.get('/bible/:book/:chapter', async (req, reply) => {
    const { book, chapter } = req.params as { book: string; chapter: string };
    const ch = Number(chapter);
    const result = await bible.getChapter(book, ch);
    if (!result) return reply.code(404).send({ error: 'Chapter not found' });
    return result;
  });

  app.get('/bible/passage', async (req, reply) => {
    const { ref } = req.query as { ref?: string };
    if (!ref?.trim()) return reply.code(400).send({ error: 'ref query required' });
    const result = await bible.getPassage(ref.trim());
    if (!result) return reply.code(404).send({ error: 'Passage not found' });
    return result;
  });

  app.get('/today/verse', async () => {
    const result = await bible.getTodaysVerse();
    return result ?? { ref: 'Psalm 23:1', text: 'The Lord is my shepherd; I shall not want.' };
  });

  app.get('/verse/for-carrying', async (req) => {
    const { tags } = req.query as { tags?: string };
    const list = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    const result = await bible.getVerseForCarrying(list);
    return result ?? { ref: 'Psalm 23:1', text: 'The Lord is my shepherd; I shall not want.' };
  });
}
