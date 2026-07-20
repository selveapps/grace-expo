import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';
import { AuthService } from '../services/AuthService';
import { ReadingService } from '../services/ReadingService';
import { StoryService } from '../services/StoryService';

const KEY = 'grace.profile.v1';

const DEFAULT = {
  name: '',
  carrying: [],
  gentleness: 'Steadily',
  rhythm: 'morning',
  subscribed: false,
  savedVerses: [],
  reflections: [],
  onboarded: false,
  readingTheme: 'sepia',
  fontScale: 1,
  audioSpeed: 1,
  reducedMotion: false,
  email: '',
};

const ProfileContext = createContext(null);

function mapReflection(r) {
  return {
    id: r.id || Date.now(),
    word: r.word,
    note: r.note || '',
    ref: r.ref || '',
    date: r.date || 'Today',
  };
}

export function ProfileProvider({ children, booted = true }) {
  const [profile, setProfileState] = useState(DEFAULT);
  const [hydrated, setHydrated] = useState(false);
  const [synced, setSynced] = useState(false);
  const syncTimer = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setProfileState({ ...DEFAULT, ...JSON.parse(raw) });
      } catch {
        // corrupt storage — start fresh
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const persist = useCallback((next) => {
    setProfileState(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const patchServer = useCallback((fields) => {
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      api.patch('/me', fields).catch(() => {});
    }, 400);
  }, []);

  useEffect(() => {
    if (!hydrated || !booted || synced) return;
    (async () => {
      try {
        await AuthService.ensureGuest();
        await StoryService.hydrateProgress();
        const me = await api.get('/me');
        const saved = await ReadingService.getSavedVerses();
        let reflections = [];
        try {
          const r = await api.get('/reflections');
          reflections = (r.data || []).map(mapReflection);
        } catch { /* offline */ }

        const { user, profile: p } = me.data;
        setProfileState((prev) => {
          const next = {
            ...prev,
            name: user.name ?? prev.name,
            email: user.email ?? prev.email,
            carrying: p?.carrying?.length ? p.carrying : prev.carrying,
            gentleness: p?.gentleness ?? prev.gentleness,
            rhythm: p?.rhythm ?? prev.rhythm,
            onboarded: prev.onboarded || !!p?.onboarded,
            subscribed: prev.subscribed || !!p?.subscribed,
            savedVerses: saved.length ? saved : prev.savedVerses,
            reflections: reflections.length ? reflections : prev.reflections,
          };
          AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
          return next;
        });
      } catch {
        // offline — local profile only
      } finally {
        setSynced(true);
      }
    })();
  }, [hydrated, booted, synced]);

  const setProfile = useCallback((updater) => {
    setProfileState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});

      const serverFields = {};
      if ('name' in next && next.name !== prev.name) serverFields.name = next.name;
      if ('carrying' in next) serverFields.carrying = next.carrying;
      if ('gentleness' in next) serverFields.gentleness = next.gentleness;
      if ('rhythm' in next) serverFields.rhythm = next.rhythm;
      if ('onboarded' in next) serverFields.onboarded = next.onboarded;
      if (Object.keys(serverFields).length) patchServer(serverFields);

      return next;
    });
  }, [patchServer]);

  const saveVerse = useCallback((v) => {
    ReadingService.saveVerse(v).catch(() => {});
    setProfile((p) => (
      p.savedVerses.some((x) => x.ref === v.ref)
        ? p
        : { ...p, savedVerses: [v, ...p.savedVerses] }
    ));
  }, [setProfile]);

  const removeVerse = useCallback((ref) => {
    ReadingService.unsaveVerse(ref).catch(() => {});
    setProfile((p) => ({ ...p, savedVerses: p.savedVerses.filter((x) => x.ref !== ref) }));
  }, [setProfile]);

  const isSaved = useCallback((ref) => profile.savedVerses.some((x) => x.ref === ref), [profile.savedVerses]);

  const addReflection = useCallback((r) => {
    api.post('/reflections', { word: r.word, note: r.note, ref: r.ref }).catch(() => {});
    setProfile((p) => (
      { ...p, reflections: [{ id: Date.now(), date: 'Today', ...r }, ...p.reflections] }
    ));
  }, [setProfile]);

  const resetProfile = useCallback(() => persist(DEFAULT), [persist]);

  const ready = hydrated && booted;

  return (
    <ProfileContext.Provider value={{ profile, hydrated: ready, synced, setProfile, saveVerse, removeVerse, isSaved, addReflection, resetProfile }}>
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
