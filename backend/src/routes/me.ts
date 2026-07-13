import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import * as auth from '../services/authService.js';

export async function registerMeRoutes(app: FastifyInstance) {
  app.get('/me', { preHandler: requireAuth }, async (req, reply) => {
    const user = await auth.getUserWithProfile(req.userId!);
    if (!user) return reply.code(404).send({ error: 'User not found' });
    return {
      user: {
        id: user.id,
        guestDeviceId: user.guestDeviceId,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      profile: user.profile,
    };
  });
}
