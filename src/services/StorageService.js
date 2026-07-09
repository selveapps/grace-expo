// Central storage abstraction — the ONE place AsyncStorage is touched.
// Screens/services never call AsyncStorage directly; they go through here.
// Swap this implementation for a server/SecureStore later without touching callers.

import AsyncStorage from '@react-native-async-storage/async-storage';

const NS = 'grace.';

export const StorageService = {
  async get(key, fallback = null) {
    try {
      const raw = await AsyncStorage.getItem(NS + key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch { return fallback; }
  },
  async set(key, value) {
    try { await AsyncStorage.setItem(NS + key, JSON.stringify(value)); return true; } catch { return false; }
  },
  async remove(key) {
    try { await AsyncStorage.removeItem(NS + key); return true; } catch { return false; }
  },
  // Wipe only Grace keys (sign-out / delete-account). Never clears other apps' data.
  async clearUserData() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys.filter((k) => k.startsWith(NS)));
      return true;
    } catch { return false; }
  },
};

export const KEYS = {
  profile: 'profile.v1',
  savedVerses: 'savedVerses',
  reflections: 'reflections',
  readingProgress: 'readingProgress',
  storyProgress: 'storyProgress',
  reminders: 'reminders',
  subscription: 'subscription',
  auth: 'auth',
};
