// POST /auth/apple — verify an Apple identityToken, upsert the user, migrate the
//                    guest's library onto the account, return a Grace session.
// DELETE /me         — App Store Guideline 5.1.1(v): in-app account deletion.

import type { FastifyInstance } from 'fastify';
import { prisma } from '../db.js';
import { verifyAppleIdentityToken } from '../services/appleAuthService.js';
import { verifyToken } from '../lib/jwt.js';
import { requireAuth } from '../middleware/auth.js';
import { sessionForUser } from '../services/authService.js';
import { bumpTokenVersion, migrateGuestData } from '../services/guestMigration.js';

type Body = {
  identityToken?: string;
  /** SHA-256 of the raw nonce the app sent to Apple. */
  nonce?: string;
  fullName?: { givenName?: string | null; familyName?: string | null } | null;
};

/**
 * The guest whose library should be carried over is taken from the caller's own
 * bearer token, never from the request body. Trusting a client-supplied
 * `guestUserId` (as the spec's reference sketch did) would let anyone hand us
 * another user's id and adopt their saved verses and reflections.
 */
export async function guestIdFromAuthHeader(header?: string): Promise<string | null> {
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const { sub } = await verifyToken(header.slice(7), 'access');
    return sub;
  } catch {
    return null;
  }
}

export async function registerAppleAuthRoutes(app: FastifyInstance) {
  app.post('/auth/apple', async (req, reply) => {
    const { identityToken, nonce, fullName } = (req.body ?? {}) as Body;
    if (!identityToken) return reply.code(400).send({ error: 'identityToken required' });
    if (!nonce) return reply.code(400).send({ error: 'nonce required' });

    let identity;
    try {
      identity = await verifyAppleIdentityToken(identityToken, nonce);
    } catch (e) {
      req.log.warn({ err: String(e) }, 'apple token verification failed');
      return reply.code(401).send({ error: 'Invalid Apple token' });
    }

    const linkableEmail = identity.emailVerified ? identity.email : undefined;

    const displayName = [fullName?.givenName, fullName?.familyName]
      .filter(Boolean)
      .join(' ')
      .trim() || undefined;

    const callerId = await guestIdFromAuthHeader(req.headers.authorization);

    const user = await prisma.$transaction(async (tx) => {
      let u = await tx.user.findFirst({ where: { appleSub: identity.sub } });
      let bumped = false;

      if (!u && linkableEmail) {
        const byEmail = await tx.user.findFirst({ where: { email: linkableEmail } });
        if (byEmail) {
          u = await tx.user.update({
            where: { id: byEmail.id },
            data: { appleSub: identity.sub, authProvider: 'apple' },
          });
          await bumpTokenVersion(tx, u.id);
          bumped = true;
        }
      }

      if (!u && callerId) {
        const caller = await tx.user.findFirst({ where: { id: callerId, authProvider: 'guest' } });
        if (caller) {
          u = await tx.user.update({
            where: { id: caller.id },
            data: {
              appleSub: identity.sub,
              authProvider: 'apple',
              email: linkableEmail ?? caller.email,
              name: displayName ?? caller.name,
              guestDeviceId: null,
              tokenVersion: { increment: 1 },
            },
          });
          return u;
        }
      }

      if (!u) {
        u = await tx.user.create({
          data: {
            appleSub: identity.sub,
            email: linkableEmail ?? null,
            name: displayName ?? null,
            authProvider: 'apple',
            profile: { create: {} },
          },
        });
      } else if (displayName && !u.name) {
        u = await tx.user.update({ where: { id: u.id }, data: { name: displayName } });
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
        authProvider: 'apple',
        createdAt: user.createdAt,
      },
    };
  });

  app.delete('/me', { preHandler: requireAuth }, async (req, reply) => {
    const userId = req.userId!;
    try {
      await prisma.$transaction(async (tx) => {
        await bumpTokenVersion(tx, userId);
        await tx.user.delete({ where: { id: userId } });
      });
    } catch (e) {
      req.log.error({ err: String(e), userId }, 'account deletion failed');
      return reply.code(500).send({ error: 'Could not delete account' });
    }
    req.log.info({ userId }, 'account deleted');
    return reply.code(200).send({ deleted: true });
  });
}

// Re-export for auth-google route parity.
export { migrateGuestData } from '../services/guestMigration.js';
