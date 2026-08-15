import { createHmac, timingSafeEqual } from 'node:crypto';

const SIGNATURE_TOLERANCE_MS = 5 * 60 * 1000;

export type RevenueCatWebhookEvent = {
  type: string;
  app_user_id?: string;
  product_id?: string;
  expiration_at_ms?: number | null;
  original_transaction_id?: string | null;
  period_type?: string | null;
  store?: string | null;
  environment?: string | null;
};

export type RevenueCatWebhookPayload = {
  api_version?: string;
  event?: RevenueCatWebhookEvent;
};

export function verifyRevenueCatAuthorization(
  header: string | undefined,
  expected: string | undefined,
): boolean {
  if (!expected?.trim()) return false;
  if (!header?.trim()) return false;
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : header.trim();
  const secret = expected.startsWith('Bearer ') ? expected.slice(7).trim() : expected.trim();
  if (token.length !== secret.length) return false;
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(secret));
  } catch {
    return false;
  }
}

/** HMAC header format: `t=<unix_ms>,v1=<hex>` over `${t}.${rawBody}`. */
export function verifyRevenueCatWebhookSignature(
  rawBody: string,
  signatureHeader: string | undefined,
  signingSecret: string | undefined,
): boolean {
  if (!signingSecret?.trim() || !signatureHeader?.trim()) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((part) => {
      const [key, ...rest] = part.split('=');
      return [key.trim(), rest.join('=').trim()];
    }),
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(Date.now() - ts) > SIGNATURE_TOLERANCE_MS) return false;

  const expected = createHmac('sha256', signingSecret.trim())
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');

  if (expected.length !== signature.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export function isWebhookAuthorized(
  rawBody: string,
  headers: { authorization?: string; signature?: string },
  config: { authSecret?: string; signingSecret?: string },
): boolean {
  if (config.signingSecret?.trim()) {
    return verifyRevenueCatWebhookSignature(rawBody, headers.signature, config.signingSecret);
  }
  return verifyRevenueCatAuthorization(headers.authorization, config.authSecret);
}
