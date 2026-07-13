import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerHealthRoutes } from './routes/health.js';
import { registerBibleRoutes } from './routes/bible.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerMeRoutes } from './routes/me.js';
import { registerBetaRoutes } from './routes/beta.js';

export async function buildApp(options: { logger?: boolean } = {}) {
  const app = Fastify({ logger: options.logger ?? false });

  const corsOrigins = process.env.CORS_ORIGINS?.split(',').map((s) => s.trim()) ?? true;
  await app.register(cors, { origin: corsOrigins });

  await registerHealthRoutes(app);
  await registerBibleRoutes(app);
  await registerAuthRoutes(app);
  await registerMeRoutes(app);
  await registerBetaRoutes(app);

  return app;
}
