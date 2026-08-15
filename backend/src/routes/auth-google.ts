// POST /auth/google — verify a Google ID token, upsert the user, migrate the
//                     guest's library onto the account, return a Grace session.
//
// Deliberately the same shape as /auth/apple, and it reuses that route's
// guest-migration and caller-identification helpers so the two providers cannot
// drift apart in how they adopt a guest's saved verses and progress.

import type { FastifyInstance } from 'fastify';
import { prisma } from '../db.js';
import {
  verifyGoogleIdToken,
  isGoogleConfigured,
} from '../services/googleAuthService.js';
import { sessionForUser } from '../services/authService.js';
import { bumpTokenVersion, migrateGuestData } from '../services/guestMigration.js';
import { guestIdFromAuthHeader } from './auth-apple.js';

type Body = { idToken?: string; nonce?: string };

export async function registerGoogleAuthRoutes(app: FastifyInstance) {
  app.get('/auth/google/available', async () => ({ available: isGoogleConfigured() }));

  app.post('/auth/google', async (req, reply) => {
    if (!isGoogleConfigured()) {
      return reply.code(503).send({ error: 'Google sign-in is not configured' });
    }

    const { idToken, nonce } = (req.body ?? {}) as Body;
    if (!idToken) return reply.code(400).send({ error: 'idToken required' });
    if (!nonce) return reply.code(400).send({ error: 'nonce required' });

    let identity;
    try {
      identity = await verifyGoogleIdToken(idToken, nonce);
    } catch (e) {
      req.log.warn({ err: String(e) }, 'google token verification failed');
      return reply.code(401).send({ error: 'Invalid Google token' });
    }

    const linkableEmail = identity.emailVerified ? identity.email : undefined;
    const callerId = await guestIdFromAuthHeader(req.headers.authorization);

    const user = await prisma.$transaction(async (tx) => {
      let u = await tx.user.findFirst({ where: { googleSub: identity.sub } });
      let bumped = false;

      if (!u && linkableEmail) {
        const byEmail = await tx.user.findFirst({ where: { email: linkableEmail } });
        if (byEmail) {
          u = await tx.user.update({
            where: { id: byEmail.id },
            data: { googleSub: identity.sub, authProvider: 'google' },
          });
          await bumpTokenVersion(tx, u.id);
          bumped = true;
        }
      }

      if (!u && callerId) {
        const caller = await tx.user.findFirst({ where: { id: callerId, authProvider: 'guest' } });
        if (caller) {
          return tx.user.update({
            where: { id: caller.id },
            data: {
              googleSub: identity.sub,
              authProvider: 'google',
              email: linkableEmail ?? caller.email,
              name: identity.name ?? caller.name,
              guestDeviceId: null,
              tokenVersion: { increment: 1 },
            },
          });
        }
      }

      if (!u) {
        u = await tx.user.create({
          data: {
            googleSub: identity.sub,
            email: linkableEmail ?? null,
            name: identity.name ?? null,
            authProvider: 'google',
            profile: { create: {} },
          },
        });
      } else if (identity.name && !u.name) {
        u = await tx.user.update({ where: { id: u.id }, data: { name: identity.name } });
      }

      if (callerId && callerId !== u.id) {
        const guest = await tx.user.findFirst({ where: { id: callerId, authProvider: 'guest' } });
        if (guest) {
          if (!u.name && guest.name) {
            u = await tx.user.update({ where: { id: u.id }, data: { name: guest.name } });
          }
          await migrateGuestData(tx, guest.id, u.id);
          if (!bumped) {
            u = await tx.user.update({
              where: { id: u.id },
              data: { tokenVersion: { increment: 1 } },
            });
          }
        }
      }

      return u;
    });

    const session = await sessionForUser(user);

    return {
      session,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        authProvider: 'google',
        createdAt: user.createdAt,
      },
    };
  });
}
