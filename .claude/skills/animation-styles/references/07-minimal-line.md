# 07 Minimal line

One stroke weight, two colours, lots of empty space. Calm, premium, editorial.

## Look
- **Palette:** paper `#F7F5F0` and ink `#111111`, optionally one accent for a single element per shot (default `#E8553D`). Dark variant: ink ground `#0E0E10`, line `#F2F0EA`.
- **Brand adapter:** accent = brand colour, used for at most one stroke or word per shot. Logo drawn as a single-weight line mark.
- **Stroke:** one weight for the whole video (3 px on a 1080 reel, 4 px for 1920x1080), round caps and joins, no fills, no shadows. Negative space is at least 55% of the frame.

## Type
One light/regular sans (bundled OFL) in ink, 56 to 96 px, sentence case, generous tracking. One typographic size ratio per video (e.g. 1 : 2.2). Persian: Vazirmatn 400 to 600, no tracking changes (it breaks joins).

## Shapes
Single continuous contours of objects (a hand, a plant, a phone), circles, simple diagrams. Max 3 objects per frame. Connecting lines are straight or one smooth curve.

## Motion rules
- Draw-on with `stroke-dashoffset`, ease `power2.inOut`, 1.0 to 2.0 s per shape; slow and deliberate. Text fades in 0.6 s or draws via a mask.
- Transition = **line continues**: the end of one drawing extends into the start of the next (a path that becomes the next shape). No cuts to fills.
- Hold final composition 0.8 s before leaving.
- Camera: none, or one 4% drift. Max 2 elements moving at once.

## Signature move
**The unbroken line:** the whole reel is one continuous line that draws, bends and turns into each shot's object. Keep a visible pen position (small dot) only at the transitions.

## Engine
`hyperframes` + inline SVG + GSAP timelines. For long continuous paths, build path data in code and animate `stroke-dasharray`/`dashoffset` on one `<path>` per segment, chaining segments with matching endpoints. Alternative output: Lottie for web/app use (see `sources.md`: `diffusionstudio/lottie`).

## Sound
Near silence: soft room tone, a quiet pen-scratch at 15% volume under the draw, one low piano or sine note per shot change. Voiceover with generous pauses.

## Build brief (paste into Claude Code)
```
Build one self-contained index.html, [W]x[H], [SECONDS]s, minimal line style. Paper [HEX], ink [HEX], one accent [HEX] used on at most one element per shot. One stroke weight [PX]px for everything, round caps/joins, no fills, no shadows, no gradients. At least 55% empty space. Shapes are continuous contours; the line continues from one shot's drawing into the next. Draw-on power2.inOut 1-2s per shape. Type [FONT] regular, [SIZE]px. Shots: [SHOT LIST]. Persian: Vazirmatn, RTL, no letter-spacing. window.seek(seconds); local GSAP; no network.
After the build: capture one frame per shot; verify a single stroke width (zoom 300%), negative space, and one accent max.
```

## QA checks
- Stroke width identical everywhere.
- No second accent colour; no element crowds the edges.
- Transitions are line-continuations, not fades.

## Do not
Filled icons, texture, glow, more than 3 objects, fast cuts.
