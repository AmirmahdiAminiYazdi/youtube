# 06 Flat vector

Clean corporate-friendly illustration: solid shapes, no outlines, geometric characters, smooth purposeful easing. The default look for explainers and product stories.

## Look
- **Palette:** 5 colours + neutrals. Default: navy `#16224A`, blue `#344FA2`, sky `#7CB4F2`, coral `#FF6B5E`, sun `#FFC94A`, neutrals `#F6F7FB` and `#C9CFE0`. Shadows are a darker flat tone of the same hue (a second shape), never a blur.
- **Brand adapter:** brand colour = primary; derive two tints (+30% and +60% lightness), one dark shade (-35%), and pick one complementary accent. Keep total <= 6 hues.
- **Shapes:** circles, rounded rectangles, triangles, arcs. No strokes (except UI icons at a single 4 px weight). Heads are circles or rounded squares; limbs are capsules. Characters have no faces or minimal dots for eyes.
- **Texture:** none, or a 2% paper grain over the whole frame to avoid digital banding.

## Type
Geometric sans, bold headlines (bundled OFL), 80 to 130 px, max 3 lines. Persian: Vazirmatn 800 headlines, 600 body; align right for RTL layouts.

## Layout
Grid of 8 px units, 64 px outer margins, centred compositions with one clear focal object. Icons sit inside rounded cards of equal size and gaps.

## Motion rules
- Smooth easing, **never linear**: enter `power3.out` (0.5 to 0.7 s), exit `power2.in` (0.3 s), movement between states `power2.inOut`.
- Stagger groups at 0.06 to 0.1 s. Max 4 things moving at once.
- Allowed secondary motion: 6 to 10% overshoot on pop-ins (`back.out(1.4)`), shapes morphing between icons, count-up numbers.
- Camera: 1 to 2 gentle pushes per scene, or none; use shape wipes (circle grow, bar sweep in brand colour) as transitions.

## Signature move
**Shape-morph hand-off:** the focal object morphs into the next shot's focal object (circle -> coin -> clock face) while the background colour shifts to the next palette slot. Use at 2 to 3 beats per reel.

## Engine
`hyperframes` + GSAP (`gsap-core`, `gsap-timeline`, MorphSVG-style morphs via `gsap-plugins` if licensed, else CSS/path interpolation in code) or Remotion (company license applies for commercial use; see `sources.md`). Characters and icons authored as SVG in code, grouped by body part for animation.

## Sound
Light plucks and soft clicks for pop-ins, airy swoosh on wipes, warm piano or pluck-pad bed at low volume, ending with a short resolving chime. Voiceover leads.

## Build brief (paste into Claude Code)
```
Build one self-contained index.html, [W]x[H], [SECONDS]s, flat vector style. Palette [HEX LIST] (max 6 hues), flat fills only, shadows as darker flat shapes, no outlines, no gradients, no blur. 8px grid, 64px margins. Type [FONT], headlines 80-130px. Motion: enter power3.out 0.5-0.7s, exit power2.in 0.3s, stagger 0.06-0.1s, max 4 simultaneous movers, pop-ins with back.out(1.4). Signature: focal shape morphs into next shot's focal shape with background colour shift. Shots: [SHOT LIST]. Persian text: Vazirmatn, RTL. Facts typed exactly. window.seek(seconds); local GSAP copy; seeded rng; no network.
After the build: capture one frame per shot; check equal card sizes and gaps, no gradients, no stray strokes, text >= 44px.
```

## QA checks
- Symmetry: equal card sizes and gaps.
- Hue count <= 6, no gradients/blur.
- Every shot has one focal object, not three.

## Do not
Outlines on some shapes only, mixed icon styles, drop shadows, bounce on every element.
