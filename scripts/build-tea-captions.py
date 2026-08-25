#!/usr/bin/env python3
"""
Regenerate backend/public/audio/tea-<id>.json caption tracks from the human
narration.

The previous tracks were emitted by the TTS renderer, which knew its own word
timings. A human read does not come with timings, so we transcribe the finished
clip with word-level timestamps and align that transcript to the written script.
Captions therefore show the *written* line while tracking the *spoken* one.

Where she paraphrases (numerals read aloud, a dropped filler), the alignment
falls into a gap and those words get times interpolated across the gap, which
keeps the caption moving at the right pace instead of stalling.

Requires faster-whisper:  pip install faster-whisper
Usage:  python3 scripts/build-tea-captions.py [--model small.en]
"""
import argparse, json, os, re, sys, unicodedata
from difflib import SequenceMatcher

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
AUDIO = os.path.join(REPO, "backend/public/audio")
SCRIPTS = os.path.join(HERE, "tea-scripts.json")

NUM = {
    "zero":"0","one":"1","two":"2","three":"3","four":"4","five":"5","six":"6",
    "seven":"7","eight":"8","nine":"9","ten":"10","eleven":"11","twelve":"12",
    "thirteen":"13","fourteen":"14","fifteen":"15","sixteen":"16",
    "seventeen":"17","eighteen":"18","nineteen":"19","twenty":"20",
    "thirty":"30","forty":"40","fifty":"50","sixty":"60","seventy":"70",
    "eighty":"80","ninety":"90","hundred":"100","thousand":"1000",
}
CONTRACT = {"gonna":"going to","wanna":"want to","cant":"can not","dont":"do not"}

def norm(tok: str) -> str:
    """Fold a token to a comparable key: no case, no punctuation, numerals unified."""
    t = unicodedata.normalize("NFKD", tok).lower()
    t = t.replace("’", "'").replace("‘", "'")
    t = re.sub(r"[^a-z0-9']", "", t)
    t = t.strip("'")
    t = CONTRACT.get(t, t)
    return NUM.get(t, t)

def keys(tokens):
    """Normalised keys, splitting any token that expands to two words."""
    out = []
    for i, t in enumerate(tokens):
        for part in norm(t).split():
            out.append((part, i))
    return out

def align(script_tokens, heard):
    """
    Map each script token to a (start, end). `heard` is [(word, start, end)].
    Direct matches take the spoken time; gaps interpolate.
    """
    a, b = keys(script_tokens), keys([h[0] for h in heard])
    sm = SequenceMatcher(None, [k for k, _ in a], [k for k, _ in b], autojunk=False)

    anchors = {}  # script token index -> (start, end)
    matched = 0
    for i, j, n in sm.get_matching_blocks():
        for k in range(n):
            si, hj = a[i + k][1], b[j + k][1]
            st, en = heard[hj][1], heard[hj][2]
            if si in anchors:
                anchors[si] = (min(anchors[si][0], st), max(anchors[si][1], en))
            else:
                anchors[si] = (st, en)
            matched += 1

    total = len(script_tokens)
    dur = heard[-1][2] if heard else 0.0
    known = sorted(anchors)
    words = []
    for i in range(total):
        if i in anchors:
            s, e = anchors[i]
        else:
            # interpolate between the nearest anchored neighbours
            prev = max((k for k in known if k < i), default=None)
            nxt = min((k for k in known if k > i), default=None)
            if prev is None and nxt is None:
                s = dur * i / max(total, 1); e = dur * (i + 1) / max(total, 1)
            elif prev is None:
                s0, e0 = 0.0, anchors[nxt][0]
                span = max(nxt, 1)
                s = s0 + (e0 - s0) * i / span; e = s0 + (e0 - s0) * (i + 1) / span
            elif nxt is None:
                s0 = anchors[prev][1]
                span = max(total - prev, 1)
                s = s0 + (dur - s0) * (i - prev) / span
                e = s0 + (dur - s0) * (i - prev + 1) / span
            else:
                s0, e0 = anchors[prev][1], anchors[nxt][0]
                span = nxt - prev
                s = s0 + (e0 - s0) * (i - prev) / span
                e = s0 + (e0 - s0) * (i - prev + 1) / span
        words.append({"w": script_tokens[i], "start": round(max(0.0, s), 2),
                      "end": round(max(0.0, e), 2)})

    # enforce monotonic, non-inverted timings
    for i in range(1, len(words)):
        if words[i]["start"] < words[i-1]["start"]:
            words[i]["start"] = words[i-1]["start"]
        if words[i]["end"] < words[i]["start"]:
            words[i]["end"] = words[i]["start"]
    return words, (matched / max(len(a), 1))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="small.en")
    ap.add_argument("--only", default=None, help="comma-separated clip ids")
    args = ap.parse_args()

    from faster_whisper import WhisperModel
    scripts = {s["id"]: s for s in json.load(open(SCRIPTS))}
    only = set(args.only.split(",")) if args.only else None
    model = WhisperModel(args.model, device="cpu", compute_type="int8")

    report = []
    for cid, s in scripts.items():
        if only and cid not in only:
            continue
        mp3 = os.path.join(AUDIO, f"tea-{cid}.mp3")
        if not os.path.exists(mp3):
            print(f"!! missing audio {mp3}", file=sys.stderr); continue

        segs, _ = model.transcribe(mp3, word_timestamps=True, language="en",
                                   vad_filter=False, beam_size=5)
        heard = [(w.word.strip(), w.start, w.end)
                 for sg in segs for w in (sg.words or []) if w.word.strip()]

        text = f'{s["hook"]} {s["tea"]}'.strip()
        toks = text.split()
        words, cov = align(toks, heard)

        path = os.path.join(AUDIO, f"tea-{cid}.json")
        prev = json.load(open(path)) if os.path.exists(path) else {}
        out = {
            "kind": "tea",
            "teaId": cid,
            "mood": prev.get("mood", "dark"),
            "heat": prev.get("heat", 2),
            "text": text,
            "voice": "human",
            "words": words,
            "renderedAt": prev.get("renderedAt", 0),
        }
        json.dump(out, open(path, "w"), ensure_ascii=False, indent=1)
        report.append((cid, len(toks), len(heard), cov, words[-1]["end"]))
        print(f"{cid:19} script {len(toks):4}w  heard {len(heard):4}w  "
              f"aligned {cov*100:5.1f}%  ends {words[-1]['end']:6.2f}s")

    low = [r for r in report if r[3] < 0.80]
    print(f"\n{len(report)} caption tracks written")
    if low:
        print("LOW ALIGNMENT (check these):")
        for cid, n, h, cov, _ in low:
            print(f"  {cid}: {cov*100:.1f}% ({n} script words vs {h} heard)")

if __name__ == "__main__":
    main()
