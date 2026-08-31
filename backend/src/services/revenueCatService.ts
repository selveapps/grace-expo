import { prisma } from '../db.js';
import type { RevenueCatWebhookEvent } from '../lib/revenuecatWebhook.js';

/** Must match RevenueCat entitlement identifier and ASC product IDs in docs/IAP_REVENUECAT_SUPERWALL.md */
export const GRACE_PLUS_ENTITLEMENT = 'grace_plus';
export const GRACE_PRODUCT_IDS = new Set(['grace.yearly', 'grace.monthly']);

const GRANT_TYPES = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'UNCANCELLATION',
  'NON_RENEWING_PURCHASE',
  'PRODUCT_CHANGE',
  'SUBSCRIPTION_EXTENDED',
  'REFUND_REVERSED',
  'TEST',
]);

const REVOKE_TYPES = new Set(['EXPIRATION']);

const CANCEL_TYPES = new Set(['CANCELLATION']);

function mapStore(store: string | null | undefined): string {
  if (store === 'APP_STORE') return 'ios';
  if (store === 'PLAY_STORE') return 'android';
  return 'ios';
}

function statusForGrant(event: RevenueCatWebhookEvent): 'trialing' | 'active' {
  return event.period_type === 'TRIAL' ? 'trialing' : 'active';
}

function expiresAtFromEvent(event: RevenueCatWebhookEvent): Date | null {
  if (event.expiration_at_ms == null) return null;
  return new Date(event.expiration_at_ms);
}

export async function applyRevenueCatWebhookEvent(event: RevenueCatWebhookEvent) {
  const userId = event.app_user_id?.trim();
  if (!userId) throw new Error('app_user_id required');

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) {
    return { ok: false, reason: 'unknown_user' as const };
  }

  const productId = event.product_id ?? 'unknown';
  const platform = mapStore(event.store);
  const expiresAt = expiresAtFromEvent(event);

  if (GRANT_TYPES.has(event.type)) {
    const status = statusForGrant(event);
    await prisma.$transaction([
      prisma.profile.update({
        where: { userId },
        data: { subscribed: true },
      }),
      prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          platform,
          productId,
          status,
          expiresAt,
          originalTxnId: event.original_transaction_id ?? null,
        },
        update: {
          platform,
          productId,
          status,
          expiresAt,
          originalTxnId: event.original_transaction_id ?? undefined,
        },
      }),
    ]);
    return { ok: true, action: 'grant' as const, status };
  }

  if (CANCEL_TYPES.has(event.type)) {
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        platform,
        productId,
        status: 'canceled',
        expiresAt,
        originalTxnId: event.original_transaction_id ?? null,
      },
      update: {
        status: 'canceled',
        expiresAt,
        productId,
        platform,
      },
    });
    return { ok: true, action: 'cancel' as const };
  }

  if (REVOKE_TYPES.has(event.type)) {
    await prisma.$transaction([
      prisma.profile.update({
        where: { userId },
        data: { subscribed: false },
      }),
      prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          platform,
          productId,
          status: 'expired',
          expiresAt,
          originalTxnId: event.original_transaction_id ?? null,
        },
        update: {
          status: 'expired',
          expiresAt,
          productId,
          platform,
        },
      }),
    ]);
    return { ok: true, action: 'revoke' as const };
  }

  // BILLING_ISSUE, TRANSFER, etc. — acknowledge without mutating entitlement.
  return { ok: true, action: 'ignored' as const, type: event.type };
}
