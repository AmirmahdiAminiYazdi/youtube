#!/usr/bin/env python3
"""Writes compositions/captions.html from the Scribe word timings.

Groups of 1-3 words (high-energy Shorts style), broken at punctuation, at a pause of 200 ms or
more, or past 16 characters. One group on screen at a time; the spoken word turns teal and pops.
Usage: python3 scripts/build_captions.py
"""
import json, os, html

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
WORDS = os.path.join(ROOT, "..", "..", "voiceover", "09-stop-rereading.words.json")
OUT = os.path.join(ROOT, "compositions", "captions.html")

words = json.load(open(WORDS))["words"]
# show the hook number as a digit, the way the on-screen text writes it
for w in words:
    if w["w"] == "two":
        w["w"] = "2"
        break

groups, cur = [], []
for i, w in enumerate(words):
    cur.append(w)
    nxt = words[i + 1] if i + 1 < len(words) else None
    text = " ".join(x["w"] for x in cur)
    end_punct = w["w"][-1] in ".,?!"
    gap = (nxt["s"] - w["e"]) if nxt else 9
    nxt_len = len(text) + 1 + len(nxt["w"]) if nxt else 99
    if end_punct or gap >= 0.2 or len(cur) == 3 or nxt_len > 16:
        groups.append(cur)
        cur = []
if cur:
    groups.append(cur)

KEY = {"rereading.", "rereading,", "rereading", "2", "10", "2013,", "low.", "high.", "practice", "testing.",
       "spacing.", "memory.", "missed.", "tonight.", "save", "two?", "familiar."}

blocks, tweens = [], []
for gi, g in enumerate(groups):
    start = max(0.12, g[0]["s"] - 0.06)
    nxt_start = groups[gi + 1][0]["s"] - 0.06 if gi + 1 < len(groups) else g[-1]["e"] + 0.6
    end = min(nxt_start, g[-1]["e"] + 0.9)
    dur = round(end - start, 3)
    spans = []
    for wi, w in enumerate(g):
        cls = "cw key" if w["w"].lower() in KEY else "cw"
        spans.append(f'<span class="{cls}" id="c{gi}w{wi}">{html.escape(w["w"])}</span>')
    blocks.append(f'    <div id="cap{gi}" class="clip cap" data-start="{start:.3f}" data-duration="{dur}"><div class="line" id="cl{gi}">{" ".join(spans)}</div></div>')
    tweens.append(f'      tl.fromTo("#cl{gi}", {{ opacity: 0, y: 26, scale: 0.94 }}, {{ opacity: 1, y: 0, scale: 1, duration: 0.14, ease: "power3.out" }}, {start:.3f});')
    for wi, w in enumerate(g):
        sel = f"#c{gi}w{wi}"
        tweens.append(f'      tl.fromTo("{sel}", {{ color: "#F4F1EA", scale: 1 }}, {{ color: "#19C3B1", scale: 1.14, duration: 0.09, ease: "power2.out" }}, {max(start, w["s"] - 0.03):.3f});')
        settle = "#19C3B1" if w["w"].lower() in KEY else "#F4F1EA"
        tweens.append(f'      tl.to("{sel}", {{ color: "{settle}", scale: 1, duration: 0.14, ease: "power2.inOut" }}, {w["e"]:.3f});')
    tweens.append(f'      tl.to("#cl{gi}", {{ opacity: 0, duration: 0.08, ease: "power2.in" }}, {end - 0.08:.3f});')
    tweens.append(f'      tl.set("#cl{gi}", {{ opacity: 0, visibility: "hidden" }}, {end:.3f});')

doc = f"""<template>
  <style>
    @font-face {{ font-family: "BrandOutfit"; src: url("assets/fonts/Outfit-Bold.ttf"); font-weight: 700; }}
    #root {{ position: absolute; inset: 0; pointer-events: none; }}
    .cap {{ position: absolute; left: 0; top: 1178px; width: 1080px; height: 150px; overflow: visible; }}
    .line {{ width: 1080px; text-align: center; font-family: "BrandOutfit", sans-serif; font-weight: 700; font-size: 84px; line-height: 150px; }}
    .cw {{ display: inline-block; color: #F4F1EA; margin: 0 0.08em; -webkit-text-stroke: 14px #0B1B33; paint-order: stroke fill;
          text-shadow: 0 8px 26px rgba(3, 9, 20, 0.85); }}
  </style>
  <div id="root" data-composition-id="captions" data-width="1080" data-height="1920">
{chr(10).join(blocks)}
  </div>
  <script>
    (function () {{
      const tl = gsap.timeline({{ paused: true }});
{chr(10).join(tweens)}
      window.__timelines["captions"] = tl;
    }})();
  </script>
</template>
"""
open(OUT, "w").write(doc)
print(f"{len(groups)} caption groups -> {OUT}")
for g in groups:
    print(f'{g[0]["s"]:6.2f}  {" ".join(w["w"] for w in g)}')
