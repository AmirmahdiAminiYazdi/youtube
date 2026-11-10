#!/usr/bin/env python3
"""Turns beats.json + the voiceover word times into everything the render reads.

Writes (all generated, never hand-edited):
  assets/timeline.json        segment and part times, total length (used by make_sfx.py, build_captions.py)
  assets/beats.js             the parts for assets/world.js
  compositions/hud.html       hook title, "STEP n / N" counter, problem line, payoff title
  compositions/cta.html       end card, timed to the spoken ask
  index.html                  root composition with the right length and audio tags

Usage (from the project folder):
  python3 scripts/build_timeline.py                  # uses ../../voiceover/<slug>.words.json
  python3 scripts/build_timeline.py --estimate       # no voiceover yet: ~150 wpm estimate, for the silent preview
  python3 scripts/build_timeline.py --words path.json

Segment order in beats.json: hook, beats[0..n-1], payoff, ask. Each `say` is aligned to the Scribe word list with a
sequence matcher (digits and number words are treated alike), so small wording differences in the take do not shift
anything. A beat's part pops on its `anchor` word (default: the beat's first word).
"""
import difflib, html, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
BEATS = os.path.join(ROOT, "beats.json")
CTA_SECONDS = 2.6          # the end card animation is 2.6 s long
TAIL_AFTER_VOICE = 0.95    # picture runs a little past the last word
LOOP_HOLD = 0.15           # last 0.15 s repeat frame 0 so the Short loops

NUM = {"zero": "0", "one": "1", "two": "2", "three": "3", "four": "4", "five": "5", "six": "6", "seven": "7", "eight": "8",
       "nine": "9", "ten": "10", "eleven": "11", "twelve": "12", "twenty": "20", "thirty": "30", "sixty": "60"}


def norm(w):
    w = re.sub(r"[^\w']", "", w.lower().replace("’", "'"))
    return NUM.get(w, w)


def tokens(text):
    return [t for t in (norm(x) for x in text.split()) if t]


def estimate_words(segs):
    """~150 wpm: 0.4 s per word plus a pause at sentence ends. Only for the silent preview."""
    words, t = [], 0.3
    for s in segs:
        for raw in s["say"].split():
            d = max(0.18, 0.05 * len(raw) + 0.1)
            words.append({"w": raw, "s": round(t, 3), "e": round(t + d, 3)})
            t += d + 0.03
            if raw[-1] in ".?!":
                t += 0.25
            elif raw[-1] == ",":
                t += 0.1
    return words


def main():
    args = sys.argv[1:]
    d = json.load(open(BEATS))
    slug = d["slug"]
    segs = [dict(d["hook"], seg="hook", id="hook")]
    for i, b in enumerate(d["beats"]):
        segs.append(dict(b, seg="beat", id=b.get("id", f"b{i + 1}")))
    segs.append(dict(d["payoff"], seg="payoff", id="payoff"))
    segs.append(dict(d["ask"], seg="ask", id="ask"))

    estimate = "--estimate" in args
    wpath = None
    if "--words" in args:
        wpath = args[args.index("--words") + 1]
    else:
        wpath = os.path.join(ROOT, "..", "..", "voiceover", f"{slug}.words.json")
    if estimate or not os.path.exists(wpath):
        if not estimate:
            sys.exit(f"no word timings at {wpath}. Hand over the voiceover (mp3 + Scribe words) or run with --estimate.")
        words, voice_dur, has_voice = estimate_words(segs), None, False
    else:
        wj = json.load(open(wpath))
        words, voice_dur, has_voice = wj["words"], wj.get("duration_s"), True

    # ---- align script tokens to spoken words ----
    stoks, owner = [], []
    for si, s in enumerate(segs):
        for t in tokens(s["say"]):
            stoks.append(t); owner.append(si)
    wtoks = [norm(w["w"]) for w in words]
    keep = [i for i, t in enumerate(wtoks) if t]
    wt = [wtoks[i] for i in keep]
    sm = difflib.SequenceMatcher(None, stoks, wt, autojunk=False)
    mapped = {}
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            mapped[blk.a + k] = keep[blk.b + k]
    cover = len(mapped) / max(1, len(stoks))
    if has_voice and cover < 0.85:
        print(f"WARNING: only {cover:.0%} of the script words were found in the voiceover. The take differs from beats.json; "
              f"fix the script text or re-record before trusting the times.")

    def word_idx(tok_index):
        # nearest mapped token at or after tok_index, else before it
        for j in range(tok_index, len(stoks)):
            if j in mapped:
                return mapped[j]
        for j in range(tok_index, -1, -1):
            if j in mapped:
                return mapped[j]
        return 0

    pos = 0
    for si, s in enumerate(segs):
        n = len(tokens(s["say"]))
        s["_t0_idx"], s["_n"] = pos, n
        s["_w0"] = word_idx(pos)
        s["_w1"] = word_idx(pos + n - 1) if n else s["_w0"]
        s["t"] = words[s["_w0"]]["s"]
        s["t_end"] = words[s["_w1"]]["e"]
        anchor = s.get("anchor")
        s["t_anchor"] = s["t"]
        if anchor:
            a = norm(anchor)
            for k, tk in enumerate(tokens(s["say"])):
                if tk == a:
                    s["t_anchor"] = words[word_idx(pos + k)]["s"]; break
            else:
                print(f"WARNING: anchor '{anchor}' not found in '{s['id']}' say text; using the beat start.")
        pos += n

    last_end = words[-1]["e"]
    ask = segs[-1]
    cta_start = round(ask["t"] - 0.05, 3)
    total = round(max(last_end + TAIL_AFTER_VOICE, cta_start + CTA_SECONDS + LOOP_HOLD), 3)
    loop = round(total - LOOP_HOLD, 3)
    cta_dur = round(loop - cta_start, 3)
    if cta_dur < CTA_SECONDS - 0.05:
        print(f"WARNING: end card gets only {cta_dur}s of {CTA_SECONDS}s; the ask is too close to the end.")
    payoff = segs[-2]
    payoff_t = payoff["t"]

    # ---- parts ----
    parts = []
    base = d["base"]
    parts.append(dict(base, id="base", t=0.0, base=True))
    n_beats = len(d["beats"])
    for i, s in enumerate(segs[1:1 + n_beats]):
        p = {k: s[k] for k in ("part", "label", "kind", "tone", "pos", "size", "rot", "label_side", "label_up") if k in s}
        p.update(id=s["id"], t=round(s["t_anchor"], 3), step=i + 1, base=False)
        parts.append(p)
    for p in parts:
        p.setdefault("kind", "box"); p.setdefault("tone", "white"); p.setdefault("size", [1, 1, 1])
        p.setdefault("pos", [0, 0, 0]); p.setdefault("rot", [0, 0, 0]); p.setdefault("part", p.get("label", "PART"))
        p["label"] = p.get("label") or p["part"]

    tl = {
        "slug": slug, "estimate": not has_voice, "total": total, "loop": loop, "voice_duration": voice_dur,
        "cta_start": cta_start, "cta_dur": cta_dur, "payoff_t": payoff_t,
        "segments": [{"id": s["id"], "seg": s["seg"], "t": s["t"], "t_end": s["t_end"], "t_anchor": s["t_anchor"], "say": s["say"]} for s in segs],
        "parts": [{"id": p["id"], "t": p["t"], "label": p["label"], "step": p.get("step", 0)} for p in parts],
        "emphasis": d.get("emphasis", []),
    }
    json.dump(tl, open(os.path.join(ROOT, "assets", "timeline.json"), "w"), indent=1)

    with open(os.path.join(ROOT, "assets", "beats.js"), "w") as f:
        f.write("// generated by scripts/build_timeline.py from beats.json + the voiceover word times. Do not edit.\n")
        f.write(f"export const TOTAL = {total};\nexport const LOOP = {loop};\nexport const PAYOFF_T = {payoff_t};\n")
        f.write("export const BEATS = " + json.dumps(parts, indent=1) + ";\n")

    # ---- hud ----
    hook = d["hook"]
    blocks, tweens = [], []
    first_t = segs[1]["t"] if n_beats else 3.0
    hook_end = round(first_t, 3) if first_t > 2.0 else 2.5
    blocks.append(f'    <div id="hud-hook" class="clip band" data-start="0" data-duration="{hook_end}">'
                  f'<div class="big" id="hk1">{html.escape(hook.get("title_top", ""))}</div>'
                  f'<div class="big teal" id="hk2">{html.escape(hook.get("title_bottom", ""))}</div></div>')
    tweens.append('      tl.fromTo("#hk2", { scale: 1 }, { scale: 1.08, duration: 0.16, ease: "power2.out" }, 0.9);')
    tweens.append('      tl.to("#hk2", { scale: 1, duration: 0.3, ease: "power2.inOut" }, 1.06);')
    for i, s in enumerate(segs[1:1 + n_beats]):
        nxt = segs[2 + i]["t"] if 2 + i < len(segs) else payoff_t
        st = round(s["t"], 3)
        dur = round(max(0.6, nxt - st - 0.04), 3)
        prob = s.get("problem_text", "")
        kick = f'<div class="kick" id="pk{i}">{html.escape(prob)}</div>' if prob else ""
        blocks.append(f'    <div id="hud-s{i}" class="clip band" data-start="{st}" data-duration="{dur}">'
                      f'<div class="mid" id="sn{i}"><span class="teal">STEP {i + 1}</span> / {n_beats}</div>{kick}</div>')
        tweens.append(f'      tl.fromTo("#sn{i}", {{ opacity: 0, y: 28 }}, {{ opacity: 1, y: 0, duration: 0.35, ease: "expo.out" }}, {st});')
        if prob:
            tweens.append(f'      tl.fromTo("#pk{i}", {{ opacity: 0, y: 18 }}, {{ opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }}, {round(st + 0.12, 3)});')
    pay_title = d["payoff"].get("title", "")
    pay_dur = round(max(0.8, cta_start - payoff_t - 0.05), 3)
    blocks.append(f'    <div id="hud-pay" class="clip band" data-start="{payoff_t}" data-duration="{pay_dur}">'
                  f'<div class="big teal" id="py1">{html.escape(pay_title)}</div>'
                  f'<div class="kick" id="py2">{html.escape(d["payoff"].get("subtitle", ""))}</div></div>')
    tweens.append(f'      tl.fromTo("#py1", {{ opacity: 0, scale: 0.8 }}, {{ opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }}, {payoff_t});')
    tweens.append(f'      tl.fromTo("#py2", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3 }}, {round(payoff_t + 0.25, 3)});')
    # frame 0 again at the very end so the loop is seamless
    blocks.append(f'    <div id="hud-hook2" class="clip band" data-start="{loop}" data-duration="{LOOP_HOLD}">'
                  f'<div class="big">{html.escape(hook.get("title_top", ""))}</div>'
                  f'<div class="big teal">{html.escape(hook.get("title_bottom", ""))}</div></div>')
    hud = f"""<template>
  <style>
    @font-face {{ font-family: "BrandOutfit"; src: url("assets/fonts/Outfit-Bold.ttf"); font-weight: 700; }}
    @font-face {{ font-family: "BrandOutfit"; src: url("assets/fonts/Outfit-Regular.ttf"); font-weight: 400; }}
    #root {{ position: absolute; inset: 0; font-family: "BrandOutfit", sans-serif; color: #F4F1EA; pointer-events: none; }}
    .band {{ position: absolute; left: 0; top: 196px; width: 1080px; display: flex; flex-direction: column; align-items: center; text-align: center; }}
    .big {{ font-weight: 700; font-size: 104px; line-height: 1.02; letter-spacing: 0.01em; text-shadow: 0 6px 30px rgba(3, 9, 20, 0.9); }}
    .mid {{ font-weight: 700; font-size: 76px; line-height: 1.05; text-shadow: 0 6px 30px rgba(3, 9, 20, 0.9); }}
    .kick {{ font-weight: 700; font-size: 34px; letter-spacing: 0.2em; margin-top: 16px; color: rgba(244, 241, 234, 0.85); text-shadow: 0 4px 20px rgba(3, 9, 20, 0.9); }}
    .teal {{ color: #19C3B1; }}
  </style>
  <div id="root" data-composition-id="hud" data-width="1080" data-height="1920">
{chr(10).join(blocks)}
  </div>
  <script>
    (function () {{
      const tl = gsap.timeline({{ paused: true }});
{chr(10).join(tweens)}
      window.__timelines["hud"] = tl;
    }})();
  </script>
</template>
"""
    open(os.path.join(ROOT, "compositions", "hud.html"), "w").write(hud)

    # ---- cta + index ----
    tm = os.path.join(HERE, "tmpl")
    cta = open(os.path.join(tm, "cta.html")).read().replace("__CTA_START__", str(cta_start)).replace("__CTA_DUR__", str(cta_dur))
    open(os.path.join(ROOT, "compositions", "cta.html"), "w").write(cta)
    audio = ""
    if has_voice and voice_dur:
        audio += f'<audio id="vo" class="clip" src="assets/audio/vo.mp3" data-start="0" data-duration="{voice_dur}" data-track-index="4" data-volume="1"></audio>\n      '
    audio += f'<audio id="sfx" class="clip" src="assets/audio/sfx.wav" data-start="0" data-duration="{total}" data-track-index="5" data-volume="1"></audio>'
    idx = open(os.path.join(tm, "index.html")).read()
    idx = (idx.replace("__SLUG__", slug).replace("__SERIES__", d.get("series", "")).replace("__TOTAL__", str(total)).replace("__AUDIO__", audio))
    open(os.path.join(ROOT, "index.html"), "w").write(idx)

    mode = "ESTIMATED times (no voiceover yet)" if not has_voice else f"voiceover {voice_dur}s"
    print(f"{slug}: {mode}, total {total}s, {n_beats} steps, payoff at {payoff_t:.2f}s, end card {cta_start:.2f}s")
    for p in parts:
        print(f"  {p['t']:6.2f}  {p['label']}")


if __name__ == "__main__":
    main()
