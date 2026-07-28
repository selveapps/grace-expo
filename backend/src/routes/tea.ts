import type { FastifyInstance } from 'fastify';
import { TEAS, getTea, teaForClient } from '../lib/teaCatalog.js';
import { requireAuth } from '../middleware/auth.js';
import * as library from '../services/libraryService.js';

export async function registerTeaRoutes(app: FastifyInstance) {
  app.get('/tea', async () => ({
    tea: [...TEAS].sort((a, b) => a.order - b.order).map(teaForClient),
  }));

  app.get('/tea/saved', { preHandler: requireAuth }, async (req) => library.listSavedTea(req.userId!));

  app.get('/tea/:id', async (req, reply) => {
    const t = getTea((req.params as { id: string }).id);
    return t ? teaForClient(t) : reply.code(404).send({ error: 'Not found' });
  });

  app.post('/tea/:id/like', { preHandler: requireAuth }, async (req) =>
    library.toggleTeaLike(req.userId!, (req.params as { id: string }).id),
  );

  app.post('/tea/:id/save', { preHandler: requireAuth }, async (req) =>
    library.saveTea(req.userId!, (req.params as { id: string }).id),
  );
}
