// AudioService — thin interface over an audio engine. Real playback uses expo-av;
// until story audio assets exist it runs in MOCK mode (a timer advancing position),
// so every player UI state works end-to-end today. Swap `engine` for expo-av later.
import { StoryService } from './StoryService';

let state = { storyId: null, playing: false, position: 0, duration: 0, rate: 1, status: 'idle' };
let ticker = null;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l({ ...state }));

function startTick() {
  stopTick();
  ticker = setInterval(() => {
    if (!state.playing) return;
    state.position = Math.min(state.duration, state.position + state.rate);
    if (state.position >= state.duration) { state.playing = false; state.status = 'completed'; stopTick(); StoryService.saveProgress(state.storyId, state.duration, true); }
    emit();
  }, 1000);
}
function stopTick() { if (ticker) { clearInterval(ticker); ticker = null; } }

export const AudioService = {
  subscribe(fn) { listeners.add(fn); fn({ ...state }); return () => listeners.delete(fn); },
  async loadStory(storyId) {
    const story = await StoryService.getStory(storyId);
    const prog = await StoryService.getProgress(storyId);
    state = { storyId, playing: false, position: prog.seconds || 0, duration: story ? story.durationSeconds : 0, rate: 1, status: 'ready' };
    emit();
    return story;
  },
  play() { if (!state.storyId) return; state.playing = true; state.status = 'playing'; emit(); startTick(); },
  pause() { state.playing = false; state.status = 'paused'; stopTick(); if (state.storyId) StoryService.saveProgress(state.storyId, state.position); emit(); },
  seek(seconds) { state.position = Math.max(0, Math.min(state.duration, seconds)); emit(); },
  setSpeed(rate) { state.rate = rate; emit(); },
  getState() { return { ...state }; },
};
