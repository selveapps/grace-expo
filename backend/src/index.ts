import Fastify from 'fastify';
import cors from '@fastify/cors';

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const app = Fastify({ logger: true });

const corsOrigins = process.env.CORS_ORIGINS?.split(',').map((s) => s.trim()) ?? true;
await app.register(cors, { origin: corsOrigins });

app.get('/health', async () => ({ ok: true }));

try {
  await app.listen({ port: PORT, host: HOST });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
