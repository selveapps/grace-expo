// AuthService — guest-first auth. Onboarding runs as a guest; account is secured
// later (post-paywall). Apple/Google/email are mocked in Expo Go (real providers are
// native modules → dev build). Session persists via StorageService.
import { StorageService, KEYS } from './StorageService';

function guestUser() {
  return { id: 'guest_' + Date.now(), name: '', email: null, authProvider: 'guest', createdAt: Date.now() };
}

export const AuthService = {
  async getCurrentUser() {
    return StorageService.get(KEYS.auth, null);
  },

  async ensureGuest() {
    let u = await StorageService.get(KEYS.auth, null);
    if (!u) { u = guestUser(); await StorageService.set(KEYS.auth, u); }
    return u;
  },

  // Mocked provider sign-in. In a dev build: expo-apple-authentication /
  // @react-native-google-signin, POST the token to your backend (see BACKEND.md).
  async signInWithApple() { return this._mockSignIn('apple', 'you@icloud.com'); },
  async signInWithGoogle() { return this._mockSignIn('google', 'you@gmail.com'); },
  async signInWithEmail(email) { return this._mockSignIn('email', email); },

  async _mockSignIn(provider, email) {
    await new Promise((r) => setTimeout(r, 700));
    const prev = await StorageService.get(KEYS.auth, null);
    const user = { id: (prev && prev.id) || 'user_' + Date.now(), name: (prev && prev.name) || '', email, authProvider: provider, createdAt: (prev && prev.createdAt) || Date.now() };
    await StorageService.set(KEYS.auth, user);
    return { ok: true, user };
  },

  // Upgrade the current guest to a real account, keeping their id (so saved data carries over).
  async linkGuestAccount(provider) {
    return provider === 'google' ? this.signInWithGoogle() : this.signInWithApple();
  },

  async signOut() { await StorageService.set(KEYS.auth, guestUser()); return true; },
};
