import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

// Reel-style captions for Tea. Driven entirely by the render's own word timings
// (the sidecar), never by a timer, so seeking and replay stay in sync for free.
//
// Words are grouped into short phrases rather than shown one at a time or as a
// wall of text: a phrase is the unit the eye can catch at a glance on a phone,
// which is what makes this read as social captioning rather than a transcript.

const MAX_WORDS_PER_PHRASE = 6;
const MAX_CHARS_PER_PHRASE = 42;
/**
 * A pause this long implies a phrase boundary. Tuned against the hot render:
 * ordinary word gaps sit under 0.15s and the deliberate reveal beats land at
 * ~0.41s, so 0.24 catches the intentional pauses without splitting on breath.
 */
const PAUSE_BREAK_SECONDS = 0.24;
/**
 * A gap at least this long is a *held* beat. The caption sits still through it
 * rather than jumping to the next phrase, so the pause reads as intentional on
 * a recording instead of looking like a dropped frame.
 */
const HELD_BEAT_SECONDS = 0.3;

/** Group timed words into phrases, breaking on punctuation, pauses and length. */
export function toPhrases(words) {
  if (!words?.length) return [];
  const phrases = [];
  let cur = [];
  const flush = (gapAfter = 0) => {
    if (!cur.length) return;
    phrases.push({
      text: cur.map((w) => w.w).join(' '),
      start: cur[0].start,
      end: cur[cur.length - 1].end,
      words: cur,
      // How long the screen holds on this phrase after its last word.
      holdAfter: gapAfter,
    });
    cur = [];
  };
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    cur.push(w);
    const next = words[i + 1];
    const chars = cur.reduce((n, x) => n + x.w.length + 1, 0);
    const endsClause = /[.!?,;:]$/.test(w.w);
    const bigPause = next ? next.start - w.end >= PAUSE_BREAK_SECONDS : true;
    const gap = next ? next.start - w.end : 0;
    if (
      !next
      || (endsClause && cur.length >= 2)
      || bigPause
      || cur.length >= MAX_WORDS_PER_PHRASE
      || chars >= MAX_CHARS_PER_PHRASE
    ) flush(gap);
  }
  flush();
  return phrases;
}

/** Index of the phrase covering `position`, or the last one already spoken. */
export function activePhraseIndex(phrases, position) {
  if (!phrases.length) return -1;
  for (let i = 0; i < phrases.length; i++) {
    const p = phrases[i];
    // Stay on this phrase through a held beat, so a deliberate pause before a
    // reveal reads as tension rather than an empty gap.
    const holdUntil = p.end + Math.min(p.holdAfter ?? 0, 0.9);
    if (position < holdUntil) return position >= p.start - 0.15 ? i : Math.max(0, i - 1);
  }
  return phrases.length - 1;
}

/**
 * `words` are the sidecar timings. When they are absent we render nothing rather
 * than faking a sync, and the caller shows the static body copy instead.
 */
export default function LiveCaptions({ words, position, playing, style, tone = 'onDark' }) {
  const phrases = useMemo(() => toPhrases(words), [words]);
  if (!phrases.length) return null;

  const idx = activePhraseIndex(phrases, position);
  const active = phrases[idx];
  const next = phrases[idx + 1];
  // A phrase arriving out of a held beat is a reveal; give it slightly more air.
  const isReveal = idx > 0 && (phrases[idx - 1].holdAfter ?? 0) >= HELD_BEAT_SECONDS;
  const onDark = tone === 'onDark';
  const ink = onDark ? colors.onDark : colors.ink;
  const ghost = onDark ? 'rgba(247,243,236,0.38)' : 'rgba(58,44,34,0.32)';
  // Gold reads as an accent on espresso but nearly vanishes on ivory, so the
  // phrase timer switches to brass on a light surface.
  const track = onDark ? 'rgba(230,207,148,0.25)' : 'rgba(181,138,63,0.22)';
  const fill = onDark ? colors.gold : colors.brass;

  // Before playback starts, show the opening phrase so the frame is never empty
  // on a recording that begins with a beat of silence.
  const showActive = active?.text ?? phrases[0].text;

  return (
    <View style={[styles.wrap, style]} pointerEvents="none" accessibilityElementsHidden>
      <Text
        style={[styles.active, isReveal && styles.reveal, { color: ink }]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {showActive}
      </Text>
      {next ? (
        <Text style={[styles.next, { color: ghost }]} numberOfLines={1}>
          {next.text}
        </Text>
      ) : null}
      {!playing ? null : (
        <View style={[styles.progressTrack, { backgroundColor: track }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: fill },
              { width: `${Math.max(0, Math.min(1, (position - active.start) / Math.max(0.2, active.end - active.start))) * 100}%` },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { minHeight: 118, justifyContent: 'flex-end' },
  active: { fontFamily: fonts.sansBold, fontSize: 30, lineHeight: 37, letterSpacing: -0.3 },
  reveal: { fontSize: 33, lineHeight: 40, letterSpacing: -0.5 },
  next: { fontFamily: fonts.sansMed, fontSize: 17, lineHeight: 24, marginTop: 8 },
  progressTrack: { height: 2, borderRadius: 2, marginTop: 14, overflow: 'hidden' },
  progressFill: { height: 2, borderRadius: 2 },
});
