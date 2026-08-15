// Verifies a Sign in with Apple identityToken against Apple's published JWKS.
//
// The spec's reference implementation used `jsonwebtoken` plus a hand-rolled
// JWK -> PEM conversion. This backend already depends on `jose`, which does
// remote JWKS fetching, caching, rotation and RS256 verification natively, so
// there is no new dependency and no DER encoding to get wrong.

import * as jose from 'jose';

const APPLE_ISS = 'https://appleid.apple.com';
const APPLE_JWKS_URL = new URL('https://appleid.apple.com/auth/keys');

// createRemoteJWKSet caches the key set and refetches on an unknown `kid`,
// which is exactly the behaviour we want when Apple rotates signing keys.
let jwks: ReturnType<typeof jose.createRemoteJWKSet> | null = null;
function getJwks() {
  if (!jwks) {
    jwks = jose.createRemoteJWKSet(APPLE_JWKS_URL, {
      cooldownDuration: 30_000,
      cacheMaxAge: 60 * 60 * 1000,
    });
  }
  return jwks;
}

export type AppleIdentity = {
  /** Stable Apple user id — the join key. */
  sub: string;
  email?: string;
  emailVerified: boolean;
  isPrivateEmail: boolean;
};

/**
 * Verify an identityToken from expo-apple-authentication.
 * `expectedNonce` is the SHA-256 of the raw nonce the app sent to Apple.
 */
export async function verifyAppleIdentityToken(
  identityToken: string,
  expectedNonce?: string,
): Promise<AppleIdentity> {
  const audience = process.env.APPLE_BUNDLE_ID;
  if (!audience) throw new Error('APPLE_BUNDLE_ID not configured');

  const { payload } = await jose.jwtVerify(identityToken, getJwks(), {
    algorithms: ['RS256'],
    issuer: APPLE_ISS,
    audience,
  });

  if (expectedNonce && payload.nonce !== expectedNonce) throw new Error('Nonce mismatch');
  if (!payload.sub) throw new Error('Apple token missing sub');

  const emailVerified = payload.email_verified;
  const isPrivateEmail = payload.is_private_email;

  return {
    sub: String(payload.sub),
    email: payload.email ? String(payload.email) : undefined,
    emailVerified: emailVerified === true || emailVerified === 'true',
    isPrivateEmail: isPrivateEmail === true || isPrivateEmail === 'true',
  };
}

/** Test seam: drop the cached key set (used by integration tests). */
export function __resetAppleJwksCache() {
  jwks = null;
}
