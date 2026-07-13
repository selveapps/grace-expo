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

  // Mocked provider sign-in — upgrades local user record; backend Apple/Google = dev build.
  async signInWithApple() { return this._mockSignIn('apple', 'you@icloud.com'); },
  async signInWithGoogle() { return this._mockSignIn('google', 'you@gmail.com'); },
  async signInWithEmail(email) { return this._mockSignIn('email', email); },

  async _mockSignIn(provider, email) {
    await new Promise((r) => setTimeout(r, 700));
    const prev = await StorageService.get(KEYS.auth, null);
    const user = {
      id: (prev && prev.id) || 'user_' + Date.now(),
      name: (prev && prev.name) || '',
      email,
      authProvider: provider,
      createdAt: (prev && prev.createdAt) || Date.now(),
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
