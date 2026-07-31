// AuthService — guest JWT auth against Grace API. Session persists via StorageService.
//
// Sign in with Apple is real: the app hands the identityToken (plus a hashed
// nonce) to POST /auth/apple, which verifies it against Apple's JWKS and
// migrates the guest library onto the account. It requires a dev/production
// build; in Expo Go `isAppleAvailable()` is false and the UI falls back to the
// email link path.
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { api } from '../api/client';
import { getDeviceId, getSession, setSession, clearSession } from '../api/session';
import { StorageService, KEYS } from './StorageService';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

const EXTRA = Constants.expoConfig?.extra ?? {};
const GOOGLE_CLIENT_ID = (Platform.OS === 'ios'
  ? EXTRA.googleIosClientId || EXTRA.googleWebClientId
  : EXTRA.googleWebClientId) || null;

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

  async signInWithApple() {
    if (!(await this.isAppleAvailable())) {
      return { ok: false, error: 'apple_unavailable' };
    }

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
      await this.ensureGuest().catch(() => {});
      const res = await api.post('/auth/apple', {
        identityToken: credential.identityToken,
        nonce: hashedNonce,
        fullName: credential.fullName,
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

  async isGoogleAvailable() {
    if (!GOOGLE_CLIENT_ID) return false;
    try {
      const res = await api.get('/auth/google/available', { auth: false });
      return !!res.data?.available;
    } catch {
      return false;
    }
  },

  async signInWithGoogle() {
    if (!GOOGLE_CLIENT_ID) return { ok: false, error: 'google_unavailable' };

    const rawNonce = Crypto.randomUUID();
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce,
    );

    const redirectUri = AuthSession.makeRedirectUri({ scheme: 'grace' });
    const request = new AuthSession.AuthRequest({
      clientId: GOOGLE_CLIENT_ID,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: 'id_token',
      extraParams: { nonce: hashedNonce },
    });

    let result;
    try {
      result = await request.promptAsync(GOOGLE_DISCOVERY);
    } catch {
      return { ok: false, error: 'google_failed' };
    }

    if (result?.type === 'dismiss' || result?.type === 'cancel') {
      return { ok: false, cancelled: true };
    }
    const idToken = result?.params?.id_token;
    if (result?.type !== 'success' || !idToken) return { ok: false, error: 'google_failed' };

    try {
      await this.ensureGuest().catch(() => {});
      const res = await api.post('/auth/google', { idToken, nonce: hashedNonce });
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

  /**
   * Remembers an email locally only. Never written to the server — unverified
   * addresses must not enable account takeover via PATCH /me.
   */
  async signInWithEmail(email) {
    const clean = String(email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return { ok: false, error: 'invalid_email' };
    return this._rememberEmailLocally(clean);
  },

  async continueAsGuest() {
    await this.ensureGuest().catch(() => {});
    return { ok: true };
  },

  async _rememberEmailLocally(email) {
    try {
      await this.ensureGuest();
      const stored = (await StorageService.get(KEYS.auth, {})) || {};
      const user = { ...stored, email, authProvider: 'email' };
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
