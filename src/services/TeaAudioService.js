// TeaAudioService — one Tea clip, owned above the screen.
//
// Tea playback used to live inside TeaDetailScreen: the Audio.Sound sat in a
// ref and useFocusEffect unloaded it on blur, so leaving the screen silently
// killed whatever was playing. That is fine for a screen you only ever look at,
// and wrong for something people listen to while they browse.
//
// Ownership now sits here so a clip survives navigation, and the mini player
// (see components/TeaMiniPlayer) gives her a way to stop it from anywhere.
import { Audio } from 'expo-av';
import { resolveStaticAudioUrl } from '../api/audio';

let sound = null;

let state = {
  tea: null,        // the Tea record currently loaded
  status: 'idle',   // idle | loading | playing | paused | error
  position: 0,
  duration: 0,
  /** True while Tea Detail for THIS clip is on screen, so the bar can hide. */
  detailVisible: false,
};

const listeners = new Set();
const emit = () => {
  const snapshot = { ...state };
  listeners.forEach((l) => l(snapshot));
};

function onStatus(s) {
  if (!s.isLoaded) {
    if (s.error) { state.status = 'error'; emit(); }
    return;
  }
  state.position = (s.positionMillis ?? 0) / 1000;
  // Same guard as AudioService: a stream that omits durationMillis must not
  // reset a duration we already know.
  const reported = s.durationMillis != null ? s.durationMillis / 1000 : 0;
  if (reported > 0) state.duration = reported;
  else if (!state.duration && state.tea?.durationSeconds) state.duration = state.tea.durationSeconds;

  if (s.didJustFinish) {
    state.status = 'idle';
    state.position = 0;
    emit();
    return;
  }
  state.status = s.isPlaying ? 'playing' : 'paused';
  emit();
}

async function unload() {
  const snd = sound;
  sound = null;
  if (snd) await snd.unloadAsync().catch(() => {});
}

export const TeaAudioService = {
  subscribe(fn) {
    listeners.add(fn);
    fn({ ...state });
    return () => listeners.delete(fn);
  },

  getState() {
    return { ...state };
  },

  /** Tea Detail tells us when it is on screen so the bar does not double up. */
  setDetailVisible(tea, visible) {
    state.detailVisible = visible && !!tea && state.tea?.id === tea.id;
    emit();
  },

  /** Load and play a tea. Re-playing the loaded tea just resumes. */
  async play(tea) {
    if (!tea) return;

    if (sound && state.tea?.id === tea.id) {
      const st = await sound.getStatusAsync().catch(() => null);
      if (st?.isLoaded) {
        await sound.playAsync().catch(() => {});
        state.status = 'playing';
        emit();
        return;
      }
    }

    await unload();
    state = {
      ...state, tea, status: 'loading', position: 0, duration: tea.durationSeconds ?? 0,
    };
    emit();

    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true });
      const uri = await resolveStaticAudioUrl(tea.audioUrl || `/audio/tea-${tea.id}.mp3`);
      if (!uri) { state.status = 'error'; emit(); return; }
      const { sound: created } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, progressUpdateIntervalMillis: 60 }, // tight for caption sync
        onStatus,
      );
      sound = created;
      state.status = 'playing';
      emit();
    } catch {
      state.status = 'error';
      emit();
    }
  },

  async pause() {
    if (!sound) return;
    await sound.pauseAsync().catch(() => {});
    state.status = 'paused';
    emit();
  },

  async toggle(tea) {
    if (state.status === 'playing' && (!tea || state.tea?.id === tea.id)) return this.pause();
    return this.play(tea ?? state.tea);
  },

  async restart() {
    if (!sound) return this.play(state.tea);
    await sound.setPositionAsync(0).catch(() => {});
    await sound.playAsync().catch(() => {});
    state.position = 0;
    state.status = 'playing';
    emit();
  },

  /** Full stop: unload and clear, which also dismisses the mini player. */
  async stop() {
    await unload();
    state = { tea: null, status: 'idle', position: 0, duration: 0, detailVisible: false };
    emit();
  },
};
