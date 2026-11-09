# 02 Chalkboard

Teacher's blackboard: ideas appear as if drawn live in chalk. Best for explainers, steps, formulas, comparisons.

## Look
- **Palette:** slate `#1F2A2E` to `#26343A` board, chalk white `#F2F0E6`, plus 3 pastels: yellow `#F3DC7A`, blue `#8EC9E8`, pink `#F2A7B8` (and one green `#A8D8A0` if needed). Max 3 chalk colours per shot.
- **Brand adapter:** keep the slate board; lighten the brand accent to a chalk pastel (mix 35% with white) so it reads as chalk. Logo is redrawn as a single-colour chalk outline, never pasted as a photo.
- **Board texture:** subtle cloud noise (2 to 4% brightness), faint eraser smudges (large soft blobs at 5% white), a chalk tray line at the bottom edge outside the safe zone.

## Type
Hand-written chalk font (locally bundled, OFL) for labels; headline 96 to 140 px. Keep line length <= 22 characters. Persian: Vazirmatn at weight 700 with a rough-edge SVG filter (`feTurbulence` + `feDisplacementMap`, scale 2 to 3) to look chalky. Animate Persian by whole word (wipe reveal), not by letter.

## Shapes and texture
- Every line is a stroke with round caps, width 6 to 9 px, `stroke-linecap: round`, plus a displacement filter (scale 2) and a second thin stroke offset by 1 px at 40% opacity for grain.
- Underlines, arrows and circles are slightly imperfect: add 1 to 2 px seeded wobble to path control points.
- Fills are hatching (diagonal parallel strokes), not solid.

## Motion rules
- **Draw-on:** animate `stroke-dashoffset` from path length to 0; duration = path length / 900 px per second, ease linear with a tiny ease-out at the end. Text: reveal left to right (RTL: right to left) with a mask that follows a chalk-tip dot.
- Hold each finished element at least 0.6 s before the next draws. Max 3 elements drawing at once.
- Erase: a soft white-ish smear wipe (mask with a wide feathered brush path) over 0.5 s, then leave a faint ghost at 6% opacity.
- Easing otherwise: none. No bouncing, no scale pops.

## Signature move
**The chalk hand-off:** a chalk dot (tiny capsule with a 6 px dust trail) travels to the start of the next stroke, pauses 0.1 s, then draws it. Add 6 to 10 dust particles falling from the tip (seeded).

## Engine
`hyperframes` with inline SVG paths; use `gsap` timelines (`gsap-timeline`) driven by seek. Path data from code (for shapes) or hand-written; `getTotalLength()` for dash animation. For formulas or plots, Manim's chalkboard theme is an option if Python is available; otherwise build in SVG.

## Sound
Soft chalk scratch while drawing (noise burst filtered 2 to 6 kHz, volume follows stroke speed), a tap on each full stop, a quiet low room tone. Voiceover on top: keep SFX 12 dB below the voice.

## Build brief (paste into Claude Code)
```
Build one self-contained index.html, [W]x[H], [SECONDS]s, chalkboard style. Board [SLATE HEX] with soft noise and faint eraser smudges. Chalk colours: white + [PASTELS]. All strokes round-capped, 6-9px, with a displacement filter and a 1px offset grain stroke. Drawing is stroke-dashoffset animation, speed 900px/s; text reveals by mask following a chalk tip. Hold each element 0.6s before the next. Signature: chalk dot hands off to the next stroke with seeded dust. No bounce, no scale pops. Persian text: Vazirmatn, RTL, reveal by whole words. Shots: [SHOT LIST]. Facts typed exactly as given. Work from time alone; add window.seek(seconds); seeded rng. No network.
After the build: capture one frame mid-draw per shot; check strokes are not perfectly straight, no text under the safe zone, and every number matches the list.
```

## QA checks
- Strokes look hand-made (zoom: slight wobble, uneven width) but text stays legible.
- <= 3 chalk colours visible at once; board not pure black.
- Draw order follows the sentence order.

## Do not
Pure vector-clean lines, gradients, drop shadows, fast whooshes, letter-by-letter Persian.
