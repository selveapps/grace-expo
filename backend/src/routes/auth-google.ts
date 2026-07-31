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
import { ACCESS_EXPIRES_IN, signAccessToken, signRefreshToken } from '../lib/jwt.js';
import { guestIdFromAuthHeader, migrateGuestData } from './auth-apple.js';

type Body = { idToken?: string };

export async function registerGoogleAuthRoutes(app: FastifyInstance) {
  /**
   * Lets the app find out whether Google sign-in is actually available before
   * it offers the button. Without configured client ids there is no honest
   * Google button to show, and the app hides it rather than failing on tap.
   */
  app.get('/auth/google/available', async () => ({ available: isGoogleConfigured() }));

  app.post('/auth/google', async (req, reply) => {
    if (!isGoogleConfigured()) {
      return reply.code(503).send({ error: 'Google sign-in is not configured' });
    }

    const { idToken } = (req.body ?? {}) as Body;
    if (!idToken) return reply.code(400).send({ error: 'idToken required' });

    let identity;
    try {
      identity = await verifyGoogleIdToken(idToken);
    } catch (e) {
      req.log.warn({ err: String(e) }, 'google token verification failed');
      return reply.code(401).send({ error: 'Invalid Google token' });
    }

    // An unverified address must never be used to adopt an existing account.
    const linkableEmail = identity.emailVerified ? identity.email : undefined;
    const callerId = await guestIdFromAuthHeader(req.headers.authorization);

    const user = await prisma.$transaction(async (tx) => {
      let u = await tx.user.findFirst({ where: { googleSub: identity.sub } });

      // Link an account that already exists under this email (e.g. Apple first).
      if (!u && linkableEmail) {
        const byEmail = await tx.user.findFirst({ where: { email: linkableEmail } });
        if (byEmail) {
          u = await tx.user.update({
            where: { id: byEmail.id },
            data: { googleSub: identity.sub, authProvider: 'google' },
          });
        }
      }

      // The caller may be a guest we can simply promote in place.
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

      // Returning Google user signing in on a device that has a guest library.
      if (callerId && callerId !== u.id) {
        const guest = await tx.user.findFirst({ where: { id: callerId, authProvider: 'guest' } });
        if (guest) {
          if (!u.name && guest.name) {
            u = await tx.user.update({ where: { id: u.id }, data: { name: guest.name } });
          }
          await migrateGuestData(tx, guest.id, u.id);
        }
      }

      return u;
    });

    const accessToken = await signAccessToken(user.id);
    const refreshToken = await signRefreshToken(user.id);

    return {
      session: { accessToken, refreshToken, expiresIn: ACCESS_EXPIRES_IN },
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
