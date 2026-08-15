import type { FastifyInstance, FastifyRequest } from 'fastify';
import {
  isWebhookAuthorized,
  type RevenueCatWebhookPayload,
} from '../lib/revenuecatWebhook.js';
import { applyRevenueCatWebhookEvent } from '../services/revenueCatService.js';
import { schemas } from '../lib/schemas.js';

type RevenueCatRequest = FastifyRequest & { rawBody?: string };

function webhookConfig() {
  return {
    authSecret: process.env.REVENUECAT_WEBHOOK_AUTH,
    signingSecret: process.env.REVENUECAT_WEBHOOK_SIGNING_SECRET,
  };
}

function webhookConfigured(): boolean {
  const { authSecret, signingSecret } = webhookConfig();
  return !!(authSecret?.trim() || signingSecret?.trim());
}

export async function registerRevenueCatRoutes(app: FastifyInstance) {
  app.post(
    '/webhooks/revenuecat',
    {
      schema: schemas.revenueCatWebhook,
      preParsing: async (request, _reply, payload) => {
        const chunks: Buffer[] = [];
        for await (const chunk of payload) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }
        const raw = Buffer.concat(chunks);
        (request as RevenueCatRequest).rawBody = raw.toString('utf8');
        const { Readable } = await import('node:stream');
        return Readable.from([raw]);
      },
    },
    async (req, reply) => {
      if (!webhookConfigured()) {
        return reply.code(503).send({ error: 'RevenueCat webhook not configured' });
      }

      const rawBody = (req as RevenueCatRequest).rawBody ?? '';
      const authorized = isWebhookAuthorized(
        rawBody,
        {
          authorization: req.headers.authorization,
          signature: req.headers['x-revenuecat-webhook-signature'] as string | undefined,
        },
        webhookConfig(),
      );
      if (!authorized) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const body = req.body as RevenueCatWebhookPayload;
      const event = body?.event;
      if (!event?.type) {
        return reply.code(400).send({ error: 'event.type required' });
      }

      try {
        const result = await applyRevenueCatWebhookEvent(event);
        if (!result.ok && result.reason === 'unknown_user') {
          app.log.warn({ appUserId: event.app_user_id, type: event.type }, 'RevenueCat webhook for unknown user');
          return reply.code(200).send({ received: true, ignored: 'unknown_user' });
        }
        return reply.code(200).send({ received: true, ...result });
      } catch (e) {
        app.log.error(e, 'RevenueCat webhook handler failed');
        return reply.code(500).send({ error: (e as Error).message });
      }
    },
  );
}
