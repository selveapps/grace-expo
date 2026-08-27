// AudioService — expo-av playback; narration audio from API TTS or story.audioUrl.
import { Audio } from 'expo-av';
import { AuthService } from './AuthService';
import { StoryService } from './StoryService';
import { getStoryAudioUri, resolveStaticAudioUrl } from '../api/audio';

let sound = null;
let saveTimer = null;

let state = {
  storyId: null,
  playing: false,
  position: 0,
  duration: 0,
  rate: 1,
  status: 'idle', // idle | loading | ready | playing | paused | completed | error
  narrative: null,
  part: 1,
  error: null,
};

// The catalog's durationSeconds for the loaded track. expo-av reports
// durationMillis as undefined for a streamed MP3 with no reliable header, so
// this is what keeps the remaining-time stamp and the skip buttons honest when
// the file itself will not say how long it is.
let metaDuration = 0;

const listeners = new Set();
const emit = () => listeners.forEach((l) => l({ ...state }));

async function unloadSound() {
  if (saveTimer) {
    clearInterval(saveTimer);
    saveTimer = null;
  }
  if (sound) {
    try {
      await sound.unloadAsync();
    } catch {
      // already unloaded
    }
    sound = null;
  }
}

function scheduleProgressSave() {
  if (saveTimer || !state.storyId) return;
  saveTimer = setInterval(() => {
    if (state.storyId && state.position > 0) {
      StoryService.saveProgress(state.storyId, Math.floor(state.position), false);
    }
  }, 8000);
}

function onPlaybackStatusUpdate(status) {
  if (!status.isLoaded) {
    if (status.error) {
      state.status = 'error';
      state.error = status.error;
      emit();
    }
    return;
  }

  // Only accept a duration the player actually knows. This used to assign
  // `(status.durationMillis ?? 0) / 1000` on every tick, so a stream that omits
  // durationMillis reset a good duration back to 0 twice a second. That is what
  // made the right-hand stamp read -0:00 forever and made seek() clamp every
  // ±15s skip to position 0, so the skip buttons appeared dead.
  const reported = status.durationMillis != null ? status.durationMillis / 1000 : 0;
  if (reported > 0) state.duration = reported;
  else if (!state.duration && metaDuration > 0) state.duration = metaDuration;
  state.position = (status.positionMillis ?? 0) / 1000;
  state.playing = status.isPlaying;

  if (status.didJustFinish) {
    state.playing = false;
    state.status = 'completed';
    state.position = state.duration;
    if (state.storyId) StoryService.saveProgress(state.storyId, Math.floor(state.duration), true);
    emit();
    return;
  }

  state.status = status.isPlaying ? 'playing' : 'paused';
  emit();
}

async function resolveAudioUri(story, part, { force = false } = {}) {
  if (story?.audioUrl) {
    const path = story.audioUrl.replace('{part}', String(part));
    // Prefer the pre-rendered static file (real .mp3, else .m4a placeholder).
    const staticUrl = await resolveStaticAudioUrl(path);
    if (staticUrl) return staticUrl;
  }
  // No static file — fall back to on-demand TTS (requires a key server-side).
  await AuthService.ensureGuest();
  return getStoryAudioUri(story.id, part, { force });
}

export const AudioService = {
  subscribe(fn) {
    listeners.add(fn);
    fn({ ...state });
    return () => listeners.delete(fn);
  },

  async loadStory(storyId, part = 1, { force = false } = {}) {
    if (!force && state.storyId === storyId && state.part === part && sound && state.status !== 'error') {
      return StoryService.getStory(storyId);
    }
    state = {
      ...state,
      storyId,
      part,
      status: 'loading',
      error: null,
      playing: false,
      position: 0,
      duration: 0,
      narrative: null,
    };
    emit();

    await unloadSound();
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true, // lock-screen playback (native build; no-op in Expo Go)
      shouldDuckAndroid: true,
    });

    const story = await StoryService.getStory(storyId);
    const prog = await StoryService.getProgress(storyId);
    // Catalog duration is the floor for everything below: it is what we fall
    // back to whenever the file will not report its own length.
    metaDuration = story?.durationSeconds ?? 0;

    // The transcript now comes from the render's own sidecar
    // (GET /stories/:id/transcript), so the old LLM narrative fetch is dead
    // weight: it fired POST /ai/stories/:id/narrative on every load and, with no
    // OPENAI_API_KEY on the server, returned a placeholder string that was never
    // shown. Removed. Duration comes from the audio file itself.
    try {
      const uri = await resolveAudioUri(story, part, { force });
      const { sound: created } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false, rate: state.rate, progressUpdateIntervalMillis: 500 },
        onPlaybackStatusUpdate,
      );
      sound = created;

      const status = await sound.getStatusAsync();
      // A loaded sound can still report no duration (streamed MP3, missing
      // header), so the catalog value backs it up rather than only covering the
      // not-loaded case.
      const reported = status.isLoaded && status.durationMillis != null
        ? status.durationMillis / 1000
        : 0;
      const durationSec = reported > 0 ? reported : metaDuration;

      const resumeAt = Math.min(prog.seconds || 0, durationSec || prog.seconds || 0);
      if (resumeAt > 0) {
        await sound.setPositionAsync(resumeAt * 1000);
      }

      state = {
        storyId,
        playing: false,
        position: resumeAt,
        duration: durationSec,
        rate: state.rate,
        status: 'ready',
        part,
        error: null,
      };
      emit();
      return story;
    } catch (e) {
      state = {
        storyId,
        playing: false,
        position: prog.seconds || 0,
        duration: story?.durationSeconds ?? 0,
        rate: state.rate,
        status: 'error',
        part,
        error: e.message || 'Could not load audio',
      };
      emit();
      throw e;
    }
  },

  async play() {
    if (!sound || state.status === 'error') return;
    await sound.playAsync();
    state.playing = true;
    state.status = 'playing';
    scheduleProgressSave();
    emit();
  },

  async pause() {
    if (!sound) return;
    await sound.pauseAsync();
    state.playing = false;
    state.status = 'paused';
    if (state.storyId) StoryService.saveProgress(state.storyId, Math.floor(state.position));
    emit();
  },

  async seek(seconds) {
    // Only clamp to the end when we actually know where the end is. Clamping
    // against a 0 duration pinned every seek to the start, which is what made
    // the ±15s buttons look broken.
    const limit = state.duration > 0 ? state.duration : metaDuration;
    const target = limit > 0
      ? Math.max(0, Math.min(limit, seconds))
      : Math.max(0, seconds);
    if (sound) await sound.setPositionAsync(target * 1000);
    state.position = target;
    emit();
  },

  async setSpeed(rate) {
    state.rate = rate;
    if (sound) await sound.setRateAsync(rate, true);
    emit();
  },

  async unload() {
    if (state.storyId && state.position > 0 && state.status !== 'completed') {
      await StoryService.saveProgress(state.storyId, Math.floor(state.position));
    }
    await unloadSound();
    metaDuration = 0;
    state = {
      storyId: null,
      playing: false,
      position: 0,
      duration: 0,
      rate: 1,
      status: 'idle',
      narrative: null,
      part: 1,
      error: null,
    };
    emit();
  },

  getState() {
    return { ...state };
  },
};
