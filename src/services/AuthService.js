// AuthService — guest JWT auth against Grace API. Session persists via StorageService.
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

  // Provider sign-in for Expo Go — links email to guest account on server until native OAuth (M11).
  async signInWithApple() { return this._linkProvider('apple', 'you@icloud.com'); },
  async signInWithGoogle() { return this._linkProvider('google', 'you@gmail.com'); },
  async signInWithEmail(email) { return this._linkProvider('email', email || 'you@email.com'); },

  async _linkProvider(provider, email) {
    await this.ensureGuest();
    await api.patch('/me', { email });
    const me = await api.get('/me');
    const user = {
      ...me.data.user,
      authProvider: provider,
    };
    await StorageService.set(KEYS.auth, user);
    return { ok: true, user };
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
