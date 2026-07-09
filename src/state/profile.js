import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Persistent profile + library store. Everything here survives app restarts
// via AsyncStorage — the user's name, selections, saved verses and reflections
// are real data, not placeholders.

const KEY = 'grace.profile.v1';

const DEFAULT = {
  name: '',
  carrying: [],        // selected intentions, e.g. ['Worry','Hope']
  gentleness: 'Steadily',
  rhythm: 'morning',
  subscribed: false,
  savedVerses: [],     // [{ ref, text }]
  reflections: [],     // [{ id, word, note, ref, date }]
  onboarded: false,
  // preferences (Settings → Experience)
  readingTheme: 'sepia', // 'light' | 'sepia' | 'night'
  fontScale: 1,          // 0.9 | 1 | 1.15 | 1.3
  audioSpeed: 1,         // 0.75 | 1 | 1.25 | 1.5
  reducedMotion: false,
};

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfileState] = useState(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  // Load once on boot.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setProfileState({ ...DEFAULT, ...JSON.parse(raw) });
      } catch (e) {
        // ignore corrupt storage; start fresh
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  // Persist on every change (after hydration).
  const persist = useCallback((next) => {
    setProfileState(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const setProfile = useCallback((updater) => {
    setProfileState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const saveVerse = useCallback((v) => setProfile((p) => (
    p.savedVerses.some((x) => x.ref === v.ref)
      ? p
      : { ...p, savedVerses: [v, ...p.savedVerses] }
  )), [setProfile]);

  const removeVerse = useCallback((ref) => setProfile((p) => (
    { ...p, savedVerses: p.savedVerses.filter((x) => x.ref !== ref) }
  )), [setProfile]);

  const isSaved = useCallback((ref) => profile.savedVerses.some((x) => x.ref === ref), [profile.savedVerses]);

  const addReflection = useCallback((r) => setProfile((p) => (
    { ...p, reflections: [{ id: Date.now(), date: 'Today', ...r }, ...p.reflections] }
  )), [setProfile]);

  const resetProfile = useCallback(() => persist(DEFAULT), [persist]);

  return (
    <ProfileContext.Provider value={{ profile, hydrated, setProfile, saveVerse, removeVerse, isSaved, addReflection, resetProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    return {
      profile: DEFAULT, hydrated: true, setProfile: () => {},
      saveVerse: () => {}, removeVerse: () => {}, isSaved: () => false, addReflection: () => {}, resetProfile: () => {},
    };
  }
  return ctx;
}
