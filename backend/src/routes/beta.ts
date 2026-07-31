import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import * as sub from '../services/subscriptionService.js';
import { schemas } from '../lib/schemas.js';

function betaRedeemDisabled(): boolean {
  return process.env.NODE_ENV === 'production' && process.env.BETA_REDEEM_DISABLED === 'true';
}

export async function registerBetaRoutes(app: FastifyInstance) {
  app.post('/beta/redeem', { schema: schemas.betaRedeem, preHandler: requireAuth }, async (req, reply) => {
    if (betaRedeemDisabled()) {
      return reply.code(403).send({ error: 'Beta redeem is disabled in production' });
    }
    const body = req.body as { code?: string };
    if (!body?.code) return reply.code(400).send({ error: 'code required' });
    try {
      const result = await sub.redeemBetaCode(req.userId!, body.code);
      return result;
    } catch (e) {
      return reply.code(400).send({ error: (e as Error).message });
    }
  });
}
