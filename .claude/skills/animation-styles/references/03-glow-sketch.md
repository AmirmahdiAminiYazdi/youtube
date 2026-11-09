# 03 Glow sketch

Neon line art on a near-black ground. Lines are drawn live, glow, then settle. Good for tech, night, premium and "blueprint of an idea" reels.

## Look
- **Palette:** ground `#06070D` (never pure black), line colours: electric cyan `#35F2FF`, magenta `#FF3DA8`, amber `#FFC247`; max 2 line colours per shot, one dominant. Text `#F4F1EA` at 90%.
- **Brand adapter:** the brand accent becomes the dominant line colour (raise saturation and lightness so it glows on dark: HSL L 60 to 70%). Add a neutral white-hot core to every line so any hue reads as a glowing tube.
- **Glow recipe (three layers per path):** wide blur (stdDeviation 14, opacity .25), mid blur (5, .55), crisp core (stroke 3 to 4 px, white-tinted `mix(color, #fff, .55)`). Composite additively (`mix-blend-mode: screen` or `lighter`).
- Faint background: slow grain at 3% and a very soft radial vignette. No grid unless the shot is a "blueprint".

## Type
Thin geometric sans (light/regular, e.g. a bundled OFL face) in the neon colour with the same 3-layer glow, or outlined letters drawn as strokes. Headline 90 to 130 px. Persian: Vazirmatn 500 with a lighter glow (stdDeviation 8) so joins stay readable.

## Shapes
Outline-only: no fills except 6 to 10% tinted fills inside closed shapes. Rounded joins, consistent width per scene (3 to 4 px core). Objects are single-line contours (device, brain, city skyline) drawn as one or few paths.

## Motion rules
- **Draw-on** with `stroke-dashoffset`; ease-in-out, 0.8 to 1.6 s per shape; a bright "pen head" dot (r 7, white, strong glow) leads the stroke.
- After drawing: **flicker settle** - 3 quick brightness steps (100% -> 60% -> 100% -> 80% -> 100%) over 0.25 s, seeded.
- Camera: slow push-in 3 to 6% scale over the shot. Parallax of 2 layers max.
- Transitions: the current drawing "unplugs" (reverse draw-off at 2x speed) while the next begins.

## Signature move
**Scan-ignite:** a vertical or diagonal scan line passes over the finished drawing; lines brighten as it crosses (glow stdDeviation +30% for 0.2 s) and leave a short afterglow.

## Engine
`hyperframes` + inline SVG with filters, or canvas with `globalCompositeOperation = 'lighter'`. SVG filters are expensive at 1080x1920: pre-render each glow as stacked strokes with different widths and opacities instead of per-frame `feGaussianBlur` when a render is slow. Optional `threejs-postprocessing` (UnrealBloomPass) for 3D wireframes. Note: the public "blueprint-animation" skill is CC BY-NC; do not copy it into commercial work (see `sources.md`).

## Sound
Low sine/sub hum bed, electric buzz tick on each flicker, rising synth sweep on scan-ignite, soft chime on the final lock. `sound-effects` or code-synthesised.

## Build brief (paste into Claude Code)
```
Build one self-contained index.html, [W]x[H], [SECONDS]s, glow sketch style. Ground [HEX] with 3% grain and soft vignette. Line colour [DOMINANT HEX] (+ optional [SECOND HEX]); every path drawn as three stacked strokes: wide faint (blur 14), mid (blur 5), crisp white-tinted core 3-4px, additive blend. Draw-on with stroke-dashoffset, ease-in-out, 0.8-1.6s, white pen-head dot leads. After each drawing, a 0.25s seeded flicker settle. Signature: scan line ignites the finished drawing. Slow 3-6% push-in. Outline-only shapes, rounded joins, one core width per scene. Persian text: Vazirmatn, lighter glow. Shots: [SHOT LIST]. Work from time alone; window.seek(seconds); seeded rng; no network.
After the build: capture mid-draw and post-settle frames per shot; check the glow does not wash out text and the dark ground stays visible.
```

## QA checks
- Text contrast >= 4.5:1 against the ground even with glow.
- Only one dominant colour per shot.
- Render time per frame is acceptable; if not, switch glow to pre-stacked strokes.

## Do not
Pure #000 ground, rainbow gradients on every line, fills that kill the neon look, blur on body text.
