// Verifies a Google ID token against Google's published JWKS.
//
// Mirrors appleAuthService: same `jose` remote key set, same RS256 verification,
// so there is no new dependency and no hand-rolled JWK handling.
//
// This replaces a stub that was not authentication at all: the old
// `signInWithGoogle` PATCHed a hardcoded 'you@gmail.com' onto the guest account
// and returned success while the UI showed a Google mark. Nothing here trusts
// the client beyond the signed token.

import * as jose from 'jose';

// Google signs with either issuer spelling; both are valid for ID tokens.
const GOOGLE_ISS = ['https://accounts.google.com', 'accounts.google.com'];
const GOOGLE_JWKS_URL = new URL('https://www.googleapis.com/oauth2/v3/certs');

let jwks: ReturnType<typeof jose.createRemoteJWKSet> | null = null;
function getJwks() {
  if (!jwks) {
    jwks = jose.createRemoteJWKSet(GOOGLE_JWKS_URL, {
      cooldownDuration: 30_000,
      cacheMaxAge: 60 * 60 * 1000,
    });
  }
  return jwks;
}

/**
 * Every OAuth client id this backend will accept a token for. An iOS app and
 * the Expo Go proxy are different clients, so the audience is a list.
 * Configured via GOOGLE_CLIENT_IDS (comma separated).
 */
export function googleAudiences(): string[] {
  return (process.env.GOOGLE_CLIENT_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isGoogleConfigured(): boolean {
  return googleAudiences().length > 0;
}

export type GoogleIdentity = {
  /** Stable Google account id — the join key. */
  sub: string;
  email?: string;
  emailVerified: boolean;
  name?: string;
};

/** Verify an ID token issued to one of our configured clients. */
export async function verifyGoogleIdToken(
  idToken: string,
  expectedNonce: string,
): Promise<GoogleIdentity> {
  const audience = googleAudiences();
  if (!audience.length) throw new Error('GOOGLE_CLIENT_IDS not configured');

  const { payload } = await jose.jwtVerify(idToken, getJwks(), {
    algorithms: ['RS256'],
    issuer: GOOGLE_ISS,
    audience,
  });

  if (!expectedNonce) throw new Error('Nonce required');
  if (payload.nonce !== expectedNonce) throw new Error('Nonce mismatch');

  if (!payload.sub) throw new Error('Google token missing sub');

  const emailVerified = payload.email_verified;
  return {
    sub: String(payload.sub),
    email: payload.email ? String(payload.email) : undefined,
    emailVerified: emailVerified === true || emailVerified === 'true',
    name: payload.name ? String(payload.name) : undefined,
  };
}

/** Test seam: drop the cached key set. */
export function __resetGoogleJwksCache() {
  jwks = null;
}
