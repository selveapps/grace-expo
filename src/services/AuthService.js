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
      // Expo Go / non-iOS — keep the old link-by-email behaviour so the flow works.
      return this._linkProvider('apple', 'you@icloud.com');
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

  // Google sign-in still links email to the guest account on the server until
  // native Google OAuth lands (M11).
  async signInWithGoogle() { return this._linkProvider('google', 'you@gmail.com'); },
  async signInWithEmail(email) { return this._linkProvider('email', email || 'you@email.com'); },

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

  async linkGuestAccount(provider) {
    return provider === 'google' ? this.signInWithGoogle() : this.signInWithApple();
  },

  async signOut() {
    await clearSession();
    await StorageService.remove(KEYS.auth);
    return true;
  },
};
