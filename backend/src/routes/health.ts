import type { FastifyInstance } from 'fastify';
import { checkDatabase } from '../db.js';
import { schemas } from '../lib/schemas.js';

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get('/health', { schema: schemas.health }, async () => {
    const db = await checkDatabase();
    return { ok: db, db };
  });
}
