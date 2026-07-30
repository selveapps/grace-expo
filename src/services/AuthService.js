// AuthService — guest JWT auth against Grace API. Session persists via StorageService.
//
// Sign in with Apple is real: the app hands the identityToken (plus a hashed
// nonce) to POST /auth/apple, which verifies it against Apple's JWKS and
// migrates the guest library onto the account. It requires a dev/production
// build; in Expo Go `isAppleAvailable()` is false and the UI falls back to the
// email link path.
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { api } from '../api/client';
import { getDeviceId, getSession, setSession, clearSession } from '../api/session';
import { StorageService, KEYS } from './StorageService';

export const AuthService = {
  async getSession() {
    return getSession();
  },

  async ensureGuest() {
    let session = await getSession();
    if (session?.accessToken) return session;

    const deviceId = await getDeviceId();
    const res = await api.post('/auth/guest', { deviceId }, { auth: false });
    session = {
      accessToken: res.data.session.accessToken,
      refreshToken: res.data.session.refreshToken,
      expiresIn: res.data.session.expiresIn,
      userId: res.data.user.id,
    };
    await setSession(session);
    await StorageService.set(KEYS.auth, res.data.user);
    return session;
  },

  async getCurrentUser() {
    await this.ensureGuest();
    const res = await api.get('/me');
    return res.data.user;
  },

  async isAppleAvailable() {
    try { return await AppleAuthentication.isAvailableAsync(); } catch { return false; }
  },

  // Real Sign in with Apple. Needs a dev/production build; unavailable in Expo Go.
  async signInWithApple() {
    if (!(await this.isAppleAvailable())) {
      // This used to fall back to linking a hardcoded 'you@icloud.com' to the
      // guest account and report success, so Expo Go looked signed in while no
      // authentication had happened and a fabricated address sat on the profile.
      // Say what is true instead; the email path still works everywhere.
      return { ok: false, error: 'apple_unavailable' };
    }

    // Nonce guards against replay: the raw value goes to Apple, its SHA-256 to us.
    const rawNonce = Crypto.randomUUID();
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce,
    );

    let credential;
    try {
      credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: rawNonce,
      });
    } catch (e) {
      if (e?.code === 'ERR_REQUEST_CANCELED') return { ok: false, cancelled: true };
      return { ok: false, error: 'apple_failed' };
    }

    try {
      // Send the current guest session along: the server reads the guest id from
      // the bearer token and migrates that library onto the Apple account.
      await this.ensureGuest().catch(() => {});
      const res = await api.post('/auth/apple', {
        identityToken: credential.identityToken,
        nonce: hashedNonce,
        fullName: credential.fullName,   // present only on first authorization
      });
      await setSession({
        accessToken: res.data.session.accessToken,
        refreshToken: res.data.session.refreshToken,
        expiresIn: res.data.session.expiresIn,
        userId: res.data.user.id,
      });
      await StorageService.set(KEYS.auth, res.data.user);
      return { ok: true, user: res.data.user };
    } catch {
      return { ok: false, error: 'server_verification_failed' };
    }
  },

  // Guideline 5.1.1(v) — deletion must be reachable in the app, and must actually
  // delete server rows. Local storage is only cleared once the server confirms.
  async deleteAccount() {
    try {
      await api.delete('/me');
    } catch {
      return { ok: false, error: 'delete_failed' };
    }
    await clearSession();
    await StorageService.clearUserData?.();
    await StorageService.remove(KEYS.auth);
    return { ok: true };
  },

  // NO GOOGLE SIGN-IN.
  //
  // `signInWithGoogle` used to exist here and did not sign anyone in to Google:
  // it PATCHed a hardcoded 'you@gmail.com' onto the guest account and returned
  // success, while the UI showed a Google mark and "Continue with Google". Real
  // OAuth needs three things this project does not have yet: iOS + web OAuth
  // client IDs from Google Cloud, a native module (so a new build, not Expo Go),
  // and a server route that verifies the Google ID token against Google's JWKS
  // the way /auth/apple already does. Until those exist there is no honest
  // Google button to show, so there is no method here to call.

  /**
   * Saves the address she typed against her account so her library follows her.
   * This is NOT a verified identity: nothing is sent to that inbox and nothing
   * is checked. The UI must describe it as remembering an email, never as
   * signing in or authenticating.
   */
  async signInWithEmail(email) {
    const clean = String(email || '').trim();
    // No hardcoded placeholder address: an empty field is a failure, not a
    // silent 'you@email.com' written onto the profile.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return { ok: false, error: 'invalid_email' };
    return this._linkProvider('email', clean);
  },

  /**
   * NOT an onboarding path. This only ensures a guest token exists for API
   * calls; it is not evidence that anyone signed in, and it must never be wired
   * to a control that advances onboarding. The sign-in step used to call it
   * behind a "Skip for now" CTA, which let people past the gate. `ensureGuest`
   * already runs at boot, so nothing needs this today.
   */
  async continueAsGuest() {
    await this.ensureGuest().catch(() => {});
    return { ok: true };
  },

  async _linkProvider(provider, email) {
    try {
      await this.ensureGuest();
      await api.patch('/me', { email });
      const me = await api.get('/me');
      const user = { ...me.data.user, authProvider: provider };
      await StorageService.set(KEYS.auth, user);
      return { ok: true, user };
    } catch {
      return { ok: false };
    }
  },

  async linkGuestAccount() {
    return this.signInWithApple();
  },

  async signOut() {
    await clearSession();
    await StorageService.remove(KEYS.auth);
    return true;
  },
};
