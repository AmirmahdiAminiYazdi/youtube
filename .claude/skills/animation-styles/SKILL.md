---
name: animation-styles
description: Build a short animation or reel in one of 10 named looks - pixel art, chalkboard, glow sketch, PS2 low-poly, comic art, flat vector, minimal line, CGI motion, Lego-style toy bricks, explainer 3D. Each look has a style sheet (palette rules, type, shapes, motion timing, signature move, engine, QA checks) and a build brief that renders frame-exact through HyperFrames or Three.js. Use when someone names one of these styles, says "make it in X style", "animation style", "استایل انیمیشن", or asks for a reel/explainer in a look instead of a brand template.
---


# Animation styles (10 looks)

One module, ten style sheets. The module does not draw anything by itself: it fixes the look, the motion rules and the build contract so the same brief gives the same result every time, then hands the build to the video modules.

**Before you start:** read `brand.md` and `MOTION.md` if they exist (for the Brainmaxx channel, also the brand line in `CLAUDE.md`: navy `#0B1B33`, teal `#19C3B1`, off-white `#F4F1EA`, orange `#FF7A3D` for sparks only, Outfit font). If not, run `brand-intake` first, or ask for hex codes, a font and a logo file. Never call a result on-brand without them. A style sheet gives a *default* palette; a real brand overrides it using the "Brand adapter" rule in that sheet.

## Step 1: Ask for five things, then wait

1. **The style.** One of the 10 below, by name or number. If they describe a job instead ("a kids' science reel", "a retro game tutorial"), suggest the two closest styles and let them pick.
2. **The script or the idea.** Real sentences, one per shot. If they only have an idea, write 6 to 10 one-line shots and wait for a yes.
3. **Facts and sources.** Every number, name or date on screen comes from the user or a source link. Samples are labelled as samples.
4. **Size and length.** 1080 x 1920 (Reel/Short), 1080 x 1350, 1080 x 1080 or 1920 x 1080. Default 20 to 30 seconds for a reel.
5. **Language and direction.** Persian/Arabic text is RTL and needs a Persian-capable font (see Rules). Brand names stay in Latin.

## The 10 styles

| # | Style | One-line look | Engine | Style sheet |
|---|---|---|---|---|
| 01 | Pixel art | Locked palette, hard pixels, sprite frames | HyperFrames, canvas at low res scaled up | `references/01-pixel-art.md` |
| 02 | Chalkboard | White and pastel chalk on slate, hand-drawn strokes, dust | HyperFrames, SVG stroke drawing | `references/02-chalkboard.md` |
| 03 | Glow sketch | Neon line art on near-black, bloom, lines that draw themselves | HyperFrames, SVG + layered blur | `references/03-glow-sketch.md` |
| 04 | PS2 low-poly | Low-res 3D, vertex wobble, dithering, fog, CRT | Three.js seekable scene (`title-sequence-3d` skill pattern) | `references/04-ps2-lowpoly.md` |
| 05 | Comic art | Halftone, thick ink, panels, speech bubbles, POW | HyperFrames, CSS + SVG | `references/05-comic-art.md` |
| 06 | Flat vector | Solid shapes, no outlines, geometric characters, clean easing | HyperFrames or Remotion | `references/06-flat-vector.md` |
| 07 | Minimal line | One stroke weight, 2 colours, lots of air | HyperFrames, SVG stroke drawing | `references/07-minimal-line.md` |
| 08 | CGI motion | Glossy 3D product/object shots, PBR light, camera moves | Three.js (`threejs-*`), optional Blender | `references/08-cgi-motion.md` |
| 09 | Lego-style toy bricks | Studded bricks, glossy plastic, stop-motion feel | Three.js instanced bricks | `references/09-lego-toy-bricks.md` |
| 10 | Explainer 3D | Soft rounded 3D characters and objects, bright studio light | Three.js + narration, or Remotion + three | `references/10-explainer-3d.md` |

Open only the one sheet you need. Do not load the other nine.

## Step 2: Script to shots

- 6 to 12 shots for a 20 to 30 second reel. One idea per shot, one sentence each. Shot 1 is the hook and must be readable in 3 seconds.
- Mark each shot with its **signature move** from the style sheet (the one motion the style is known for). Use it once or twice, not in every shot.
- Show the numbered list and wait for a yes before building.

## Step 3: Build contract (applies to every style)

Every style is built as one self-contained scene that can be rendered frame by frame.

- **Time-driven.** Work out every frame from the time alone. Expose `window.seek(seconds)` that draws exactly that moment. No `Math.random()` at render time: use the seeded `rng()` in `templates/seekable-scene.html`. Wait for seek when the URL has `?render`.
- **Fixed frame rate for stepped styles.** Pixel art, comic, chalkboard and flat vector animate "on twos" or "on threes" (hold each pose 2 or 3 frames at 24 or 30 fps). The template has `held(t, fps, hold)` for this. Smooth easing is a bug in these styles.
- **No CDN.** Carry local copies of GSAP/Three.js and fonts (see `CLAUDE.md` toolbox rules). Use the versions the matching module documents; never `@latest`.
- **Engine hand-off.** 2D styles: build and render with `hyperframes` (`hyperframes-cli` for commands). 3D styles: follow `title-sequence-3d` for the seekable Three.js scene, with `threejs-materials`, `threejs-lighting`, `threejs-postprocessing` as the style sheet names them. Audio: `media-use`, `sound-effects`, `music`, `text-to-speech`.
- **Persian text.** Use Vazirmatn (or the brand's Persian font), `direction: rtl`, `unicode-bidi: plaintext` per line, and never animate letters of a Persian word separately (it breaks the joins). Animate whole words or lines.
- **Sound is part of the style.** Each sheet lists a sound recipe. A silent reel feels unfinished.
- **Facts typed exactly.** Names, dates and numbers appear on screen character for character as given.

## Step 4: Check it like an editor

After the build, capture one frame from the middle of every shot (and frames 0, 1 and the last) and check against the style sheet's **QA checks**. Fix what is real; keep the first version if a fix makes it worse. Typical failures across all styles:

- the style drifts after shot 2 (outline weight changes, palette gets a new colour, smooth easing sneaks in)
- text smaller than 44 px on a 1080-wide reel, or inside the bottom 500 px
- a style cue used on every shot until it stops being a signature
- 3D styles: the title sits on a bright reflection and loses contrast

## Step 5: Export

Run `reel-export` before every vertical upload. For GIFs/loops use `loop-cover` rules (size under 5 MB). Prepare the upload package; the user publishes.

## Where the ideas come from

`references/sources.md` lists the public repos and packs that cover these looks, their licenses and which are safe to install next to this skill. No code from them is copied into this module; the style sheets are written for this skill. Read a third-party SKILL.md and its scripts before installing it.
