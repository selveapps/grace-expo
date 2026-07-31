import type { Prisma } from '@prisma/client';

const ACTIVE_SUB = new Set(['active', 'trialing']);

/** Invalidate outstanding JWTs after identity merge or provider link. */
export async function bumpTokenVersion(
  tx: Prisma.TransactionClient,
  userId: string,
): Promise<number> {
  const u = await tx.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
  });
  return u.tokenVersion;
}

async function mergeSubscription(
  tx: Prisma.TransactionClient,
  guestId: string,
  userId: string,
): Promise<boolean> {
  const [guestSub, userSub] = await Promise.all([
    tx.subscription.findUnique({ where: { userId: guestId } }),
    tx.subscription.findUnique({ where: { userId } }),
  ]);
  const guestActive = guestSub != null && ACTIVE_SUB.has(guestSub.status);
  const userActive = userSub != null && ACTIVE_SUB.has(userSub.status);
  if (!guestActive) return userActive || false;

  if (!userActive) {
    await tx.subscription.upsert({
      where: { userId },
      create: {
        userId,
        platform: guestSub.platform,
        productId: guestSub.productId,
        status: guestSub.status,
        expiresAt: guestSub.expiresAt,
        originalTxnId: guestSub.originalTxnId,
      },
      update: {
        platform: guestSub.platform,
        productId: guestSub.productId,
        status: guestSub.status,
        expiresAt: guestSub.expiresAt,
        originalTxnId: guestSub.originalTxnId,
      },
    });
  }
  return true;
}

/**
 * Move a guest's rows onto the real account. Several of these tables key on
 * (userId, something) so a straight updateMany can collide when the account
 * already owns that book/story/tea/verse. Keep the account's own row in that
 * case and drop the guest's.
 */
export async function migrateGuestData(
  tx: Prisma.TransactionClient,
  guestId: string,
  userId: string,
) {
  const [verses, reading, stories, teas, guestProfile, userProfile] = await Promise.all([
    tx.savedVerse.findMany({ where: { userId: guestId } }),
    tx.readingProgress.findMany({ where: { userId: guestId } }),
    tx.storyProgress.findMany({ where: { userId: guestId } }),
    tx.teaEngagement.findMany({ where: { userId: guestId } }),
    tx.profile.findUnique({ where: { userId: guestId } }),
    tx.profile.findUnique({ where: { userId } }),
  ]);

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

  const subscribedFromSub = await mergeSubscription(tx, guestId, userId);
  const subscribed =
    !!(guestProfile?.subscribed || userProfile?.subscribed || subscribedFromSub);

  if (guestProfile && (!userProfile || !userProfile.onboarded)) {
    await tx.profile.upsert({
      where: { userId },
      create: {
        userId,
        carrying: guestProfile.carrying,
        gentleness: guestProfile.gentleness,
        rhythm: guestProfile.rhythm,
        onboarded: guestProfile.onboarded,
        subscribed,
      },
      update: {
        carrying: guestProfile.carrying,
        gentleness: guestProfile.gentleness,
        rhythm: guestProfile.rhythm,
        onboarded: guestProfile.onboarded,
        subscribed,
      },
    });
  } else if (subscribed && userProfile && !userProfile.subscribed) {
    await tx.profile.update({ where: { userId }, data: { subscribed: true } });
  }

  await tx.user.delete({ where: { id: guestId } });
}
