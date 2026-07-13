import type { FastifyReply, FastifyRequest } from 'fastify';
import { verifyAccessToken } from '../services/authService.js';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
  try {
    const userId = await verifyAccessToken(header.slice(7));
    request.userId = userId;
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
}
