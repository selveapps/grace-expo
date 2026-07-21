// AudioService — expo-av playback; narration audio from API TTS or story.audioUrl.
import { Audio } from 'expo-av';
import { AuthService } from './AuthService';
import { StoryService } from './StoryService';
import { getStoryAudioUri } from '../api/audio';
import { getApiBase } from '../api/client';

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

  state.duration = (status.durationMillis ?? 0) / 1000;
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

async function resolveAudioUri(story, part) {
  if (story?.audioUrl) {
    const path = story.audioUrl.replace('{part}', String(part));
    const url = path.startsWith('http') ? path : `${getApiBase()}${path}`;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok) return url;
    } catch {
      // fall through to TTS
    }
  }
  await AuthService.ensureGuest();
  return getStoryAudioUri(story.id, part);
}

export const AudioService = {
  subscribe(fn) {
    listeners.add(fn);
    fn({ ...state });
    return () => listeners.delete(fn);
  },

  async loadStory(storyId, part = 1) {
    if (state.storyId === storyId && state.part === part && sound && state.status !== 'error') {
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
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    const story = await StoryService.getStory(storyId);
    const prog = await StoryService.getProgress(storyId);

    let narrative = null;
    try {
      const res = await StoryService.getNarrative(storyId, part);
      narrative = res.content;
    } catch {
      narrative = null;
    }

    try {
      const uri = await resolveAudioUri(story, part);
      const { sound: created } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false, rate: state.rate, progressUpdateIntervalMillis: 500 },
        onPlaybackStatusUpdate,
      );
      sound = created;

      const status = await sound.getStatusAsync();
      const durationSec = status.isLoaded
        ? (status.durationMillis ?? 0) / 1000
        : (story?.durationSeconds ?? 0);

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
        narrative,
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
        duration: narrative
          ? StoryService.estimateDurationFromText(narrative, story?.durationSeconds ?? 300)
          : (story?.durationSeconds ?? 0),
        rate: state.rate,
        status: 'error',
        narrative,
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
    const target = Math.max(0, Math.min(state.duration, seconds));
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
