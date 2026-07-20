import { prisma } from '../db.js';

const TRIAL_MS = 3 * 86_400_000;

export async function resolveSubscription(userId: string) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) return null;

  if (sub.status === 'trialing' && sub.expiresAt && sub.expiresAt < new Date()) {
    await prisma.$transaction([
      prisma.subscription.update({
        where: { userId },
        data: { status: 'expired' },
      }),
      prisma.profile.update({
        where: { userId },
        data: { subscribed: false },
      }),
    ]);
    return { ...sub, status: 'expired' };
  }

  return sub;
}

export async function redeemBetaCode(userId: string, code: string) {
  const expected = process.env.BETA_REDEEM_CODE ?? 'grace-beta';
  if (code.trim() !== expected) {
    throw new Error('Invalid redeem code');
  }

  const expiresAt = new Date(Date.now() + TRIAL_MS);

  await prisma.$transaction([
    prisma.profile.update({
      where: { userId },
      data: { subscribed: true },
    }),
    prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        platform: 'beta',
        productId: 'beta-redeem',
        status: 'trialing',
        expiresAt,
      },
      update: {
        status: 'trialing',
        expiresAt,
        platform: 'beta',
      },
    }),
  ]);

  return { subscribed: true, status: 'trialing', expiresAt };
}

export function isEntitled(profileSubscribed: boolean, sub: { status: string } | null): boolean {
  if (profileSubscribed) return true;
  if (!sub) return false;
  return sub.status === 'active' || sub.status === 'trialing';
}
