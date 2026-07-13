import type { FastifyInstance } from 'fastify';
import { checkDatabase } from '../db.js';

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    const db = await checkDatabase();
    return { ok: db, db };
  });
}
