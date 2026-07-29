// POST /auth/apple — verify an Apple identityToken, upsert the user, migrate the
//                    guest's library onto the account, return a Grace session.
// DELETE /me         — App Store Guideline 5.1.1(v): in-app account deletion.

import type { FastifyInstance } from 'fastify';
import type { Prisma } from '@prisma/client';
import { prisma } from '../db.js';
import { verifyAppleIdentityToken } from '../services/appleAuthService.js';
import { ACCESS_EXPIRES_IN, signAccessToken, signRefreshToken, verifyToken } from '../lib/jwt.js';
import { requireAuth } from '../middleware/auth.js';

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
async function guestIdFromAuthHeader(header?: string): Promise<string | null> {
  if (!header?.startsWith('Bearer ')) return null;
  try {
    return await verifyToken(header.slice(7), 'access');
  } catch {
    return null;
  }
}

/**
 * Move a guest's rows onto the real account. Several of these tables key on
 * (userId, something) so a straight updateMany can collide when the account
 * already owns that book/story/tea/verse. Keep the account's own row in that
 * case and drop the guest's.
 */
async function migrateGuestData(tx: Prisma.TransactionClient, guestId: string, userId: string) {
  const [verses, reading, stories, teas] = await Promise.all([
    tx.savedVerse.findMany({ where: { userId: guestId } }),
    tx.readingProgress.findMany({ where: { userId: guestId } }),
    tx.storyProgress.findMany({ where: { userId: guestId } }),
    tx.teaEngagement.findMany({ where: { userId: guestId } }),
  ]);

  // Reflections, tickets and review prompts have their own ids, so no collisions.
  await tx.reflection.updateMany({ where: { userId: guestId }, data: { userId } });
  await tx.supportTicket.updateMany({ where: { userId: guestId }, data: { userId } });
  await tx.reviewPrompt.updateMany({ where: { userId: guestId }, data: { userId } });

  for (const v of verses) {
    const exists = await tx.savedVerse.findFirst({ where: { userId, ref: v.ref } });
    if (!exists) await tx.savedVerse.update({ where: { id: v.id }, data: { userId } });
  }
  for (const r of reading) {
    const exists = await tx.readingProgress.findUnique({
      where: { userId_book: { userId, book: r.book } },
    });
    if (!exists) {
      await tx.readingProgress.create({
        data: { userId, book: r.book, chapter: r.chapter, position: r.position },
      });
    }
  }
  for (const s of stories) {
    const exists = await tx.storyProgress.findUnique({
      where: { userId_storyId: { userId, storyId: s.storyId } },
    });
    if (!exists) {
      await tx.storyProgress.create({
        data: { userId, storyId: s.storyId, seconds: s.seconds, completed: s.completed },
      });
    }
  }
  for (const t of teas) {
    const exists = await tx.teaEngagement.findUnique({
      where: { userId_teaId: { userId, teaId: t.teaId } },
    });
    if (!exists) {
      await tx.teaEngagement.create({
        data: { userId, teaId: t.teaId, liked: t.liked, saved: t.saved },
      });
    }
  }

  // Carry onboarding answers across if the account has none of its own yet.
  const guestProfile = await tx.profile.findUnique({ where: { userId: guestId } });
  const userProfile = await tx.profile.findUnique({ where: { userId } });
  if (guestProfile && (!userProfile || !userProfile.onboarded)) {
    await tx.profile.upsert({
      where: { userId },
      create: {
        userId,
        carrying: guestProfile.carrying,
        gentleness: guestProfile.gentleness,
        rhythm: guestProfile.rhythm,
        onboarded: guestProfile.onboarded,
        subscribed: guestProfile.subscribed || userProfile?.subscribed || false,
      },
      update: {
        carrying: guestProfile.carrying,
        gentleness: guestProfile.gentleness,
        rhythm: guestProfile.rhythm,
        onboarded: guestProfile.onboarded,
        subscribed: guestProfile.subscribed || userProfile?.subscribed || false,
      },
    });
  }

  // Everything left on the guest cascades away with the row.
  await tx.user.delete({ where: { id: guestId } });
}

export async function registerAppleAuthRoutes(app: FastifyInstance) {
  app.post('/auth/apple', async (req, reply) => {
    const { identityToken, nonce, fullName } = (req.body ?? {}) as Body;
    if (!identityToken) return reply.code(400).send({ error: 'identityToken required' });

    let identity;
    try {
      identity = await verifyAppleIdentityToken(identityToken, nonce);
    } catch (e) {
      req.log.warn({ err: String(e) }, 'apple token verification failed');
      return reply.code(401).send({ error: 'Invalid Apple token' });
    }

    // Apple sends the name only on the FIRST authorization — persist it now or lose it.
    const displayName = [fullName?.givenName, fullName?.familyName]
      .filter(Boolean)
      .join(' ')
      .trim() || undefined;

    const callerId = await guestIdFromAuthHeader(req.headers.authorization);

    const user = await prisma.$transaction(async (tx) => {
      let u = await tx.user.findFirst({ where: { appleSub: identity.sub } });

      // Link an account that already exists under this email (e.g. Google first).
      if (!u && identity.email) {
        const byEmail = await tx.user.findFirst({ where: { email: identity.email } });
        if (byEmail) {
          u = await tx.user.update({
            where: { id: byEmail.id },
            data: { appleSub: identity.sub, authProvider: 'apple' },
          });
        }
      }

      // The caller may be a guest we can simply promote in place.
      if (!u && callerId) {
        const caller = await tx.user.findFirst({ where: { id: callerId, authProvider: 'guest' } });
        if (caller) {
          u = await tx.user.update({
            where: { id: caller.id },
            data: {
              appleSub: identity.sub,
              authProvider: 'apple',
              email: identity.email ?? caller.email,
              name: displayName ?? caller.name,
              guestDeviceId: null,
            },
          });
          return u;
        }
      }

      if (!u) {
        u = await tx.user.create({
          data: {
            appleSub: identity.sub,
            email: identity.email ?? null,
            name: displayName ?? null,
            authProvider: 'apple',
            profile: { create: {} },
          },
        });
      } else if (displayName && !u.name) {
        u = await tx.user.update({ where: { id: u.id }, data: { name: displayName } });
      }

      // Returning Apple user signing in on a device that has a guest library.
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
        authProvider: 'apple',
        createdAt: user.createdAt,
      },
    };
  });

  // Guideline 5.1.1(v): deletion must be reachable in the app and must actually
  // delete. Every owned table has ON DELETE CASCADE, so removing the user row
  // removes saved verses, reflections, reading/story progress, Tea engagement,
  // review prompts, support tickets, the profile and the subscription with it.
  app.delete('/me', { preHandler: requireAuth }, async (req, reply) => {
    const userId = req.userId!;
    try {
      await prisma.user.delete({ where: { id: userId } });
    } catch (e) {
      req.log.error({ err: String(e), userId }, 'account deletion failed');
      return reply.code(500).send({ error: 'Could not delete account' });
    }
    req.log.info({ userId }, 'account deleted');
    return reply.code(200).send({ deleted: true });
  });
}
