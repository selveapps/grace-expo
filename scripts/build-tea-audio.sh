#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Build the 30 Tea narration files from the raw voice recordings.
#
# Replaces the ElevenLabs TTS renders in backend/public/audio/tea-<id>.mp3
# with the human narration. Encodes straight from the source recordings, so
# nothing is transcoded twice.
#
# Source of truth for what to build is tea-audio-sources.tsv (per-clip trim
# and tempo). Originals are only ever read.
# ---------------------------------------------------------------------------
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/.." && pwd)"
TSV="$HERE/tea-audio-sources.tsv"
OUT="$REPO/backend/public/audio"

# ---- tunables -------------------------------------------------------------
HIGHPASS=80        # Hz, handling rumble
LUFS=-16           # mobile spoken-word target
TP=-2.0            # loudnorm ceiling; lossy encode overshoots, see loop below
LRA=11
TP_CEILING=-1.2    # required true peak of the DECODED file
LUFS_TOL=0.3
RATE=44100
FORMAT=mp3         # app requests .mp3 first (src/api/audio.js), .m4a as fallback

# 96k, not the 64k used for the AAC masters. MP3 is a much weaker codec than
# AAC at low bitrate: at 64k mono it overshoots true peak by ~2.7 dB (vs ~0.5 dB
# at 96k), which forces the loudness loop to over-limit, and it audibly hurts
# sibilance on speech. 96k MP3 lands about where 64k AAC does. ~700 KB a clip,
# ~21 MB for all 30, served from the backend rather than bundled.
BITRATE=96k
# ---------------------------------------------------------------------------

case "$FORMAT" in
  mp3) CODEC=libmp3lame ;;
  m4a) CODEC=aac_at ;;
  *) echo "unknown FORMAT $FORMAT" >&2; exit 1 ;;
esac
ffmpeg -hide_banner -encoders 2>/dev/null | grep -q " ${CODEC} " || {
  echo "note: $CODEC unavailable, falling back to aac" >&2; CODEC=aac; }

[[ -f "$TSV" ]] || { echo "missing $TSV" >&2; exit 1; }
mkdir -p "$OUT"

echo "building 30 Tea clips -> $OUT (${FORMAT}, ${BITRATE}, mono ${RATE})"
echo

n=0
while IFS=$'\t' read -r srcdir srcfile clip trim tempo denoise; do
  [[ "$srcdir" == "source_dir" ]] && continue
  [[ -z "${srcdir// }" ]] && continue
  in="$srcdir/$srcfile"
  out="$OUT/tea-${clip}.${FORMAT}"
  [[ -f "$in" ]] || { echo "!! missing source: $in" >&2; continue; }

  # Left channel only: the first batch is near out-of-phase and a normal L+R
  # downmix cancels up to 7 dB. Harmless on the in-phase revised takes.
  BASE="pan=mono|c0=c0,highpass=f=${HIGHPASS}"
  [[ "$denoise" != "-" && -n "$denoise" ]] && BASE="${BASE},${denoise}"
  BASE="${BASE},atempo=${tempo}"

  i_aim="$LUFS"; tp_aim="$TP"; got_i=""; got_tp=""; tries=0
  best_score=""; tmp="$OUT/.${clip}.tmp.${FORMAT}"

  for attempt in 1 2 3 4 5; do
    tries=$attempt
    # -ss before -i: as an output option it seeks the post-atempo timeline and
    # silently eats trim*(tempo-1) seconds off the front of the script.
    meas=$(ffmpeg -nostdin -hide_banner -nostats -ss "$trim" -i "$in" -map 0:a:0 \
        -af "${BASE},loudnorm=I=${i_aim}:TP=${tp_aim}:LRA=${LRA}:print_format=json" \
        -f null - 2>&1 | awk '/^{/,/^}/')
    get() { sed -n "s/.*\"$1\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p" <<<"$meas"; }
    mi=$(get input_i)
    [[ -z "$mi" || "$mi" == "-inf" ]] && { echo "!! measure failed: $clip" >&2; break; }

    ffmpeg -nostdin -hide_banner -loglevel error -y -ss "$trim" -i "$in" -map 0:a:0 \
      -af "${BASE},loudnorm=I=${i_aim}:TP=${tp_aim}:LRA=${LRA}:measured_I=${mi}:measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" \
      -ac 1 -ar "$RATE" -c:a "$CODEC" -b:a "$BITRATE" "$tmp"

    v=$(ffmpeg -nostdin -hide_banner -nostats -i "$tmp" -af ebur128=peak=true -f null - 2>&1)
    v=${v##*Integrated loudness}
    got_i=$(awk '/I:/{print $2; exit}' <<<"$v")
    got_tp=$(awk '/Peak:/{print $2; exit}' <<<"$v")

    read -r ok score new_i new_tp < <(awk -v gi="$got_i" -v gtp="$got_tp" -v ia="$i_aim" \
      -v ta="$tp_aim" -v want="$LUFS" -v ceil="$TP_CEILING" -v tol="$LUFS_TOL" 'BEGIN{
        ni=ia; nt=ta; ok=1; s=0
        over = gtp - ceil
        if (over > 0) { nt = ta - over - 0.2; if (nt < -4) nt = -4; ok=0; s += over }
        d = want - gi; ad = (d<0 ? -d : d)
        if (ad > tol) { ni = ia + d; ok=0; s += 2*(ad - tol) }
        printf "%d %.4f %.2f %.2f\n", ok, s, ni, nt }')

    if [[ -z "$best_score" ]] || awk -v a="$score" -v b="$best_score" 'BEGIN{exit !(a<b)}'; then
      best_score="$score"; mv -f "$tmp" "$out"
    else rm -f "$tmp"; fi
    [[ "$ok" == "1" ]] && break
    i_aim="$new_i"; tp_aim="$new_tp"
  done
  rm -f "$tmp"

  n=$((n+1))
  printf 'tea-%-20s %sx  trim %5ss  %sLUFS %sdBTP  (%d)\n' \
    "${clip}.${FORMAT}" "$tempo" "$trim" "$got_i" "$got_tp" "$tries"
done < "$TSV"

echo
echo "built $n clips"
