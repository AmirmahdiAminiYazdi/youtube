# 05 Comic art

Print comic energy: halftone, ink lines, panels, speech bubbles and sound effects. Good for stories, before/after, hype and humour.

## Look
- **Palette:** paper `#FBF3E0`, ink `#14121A`, and a 4-colour print set: red `#E5322D`, yellow `#FFD23F`, cyan `#2FB6E8`, magenta `#E0409A` (used flat, slightly offset from the black key plate by 2 to 3 px for misregistration). Max 3 spot colours per panel.
- **Brand adapter:** brand accent replaces one of the spot colours; keep ink and paper. Logos are inked: 6 px black outline plus flat fill.
- **Texture:** halftone dot screens (radial dot grid 8 to 14 px pitch, 45 degree angle) for shadows and gradients, paper grain at 3%, slightly rough ink edges (displacement filter scale 1.5).

## Type
Comic lettering face (bundled OFL, all caps) for speech, bold italic impact face for sound effects (POW, ZAP), 56 to 72 px minimum on a 1080 reel. Bubbles: white fill, 5 px ink outline, tail pointing at the speaker. Persian: Vazirmatn 800 inside bubbles, RTL, bubble tail on the matching side.

## Layout
Panel grid with 24 to 36 px gutters (paper colour), 6 px ink borders, one panel breaks the grid per scene (a "splash"). Reel format: 2 to 3 stacked panels or one full-bleed panel per shot.

## Motion rules
- Animate on **threes** at 8 fps feel for characters, but panels slide/stamp on twos. Hold-then-snap, no smooth easing.
- **Panel reveal:** each panel slams in from outside the gutter, 4 frames, overshoot 6% then settle in 2 frames.
- Speech bubbles pop with a 3-frame scale (80% -> 110% -> 100%). Text appears whole, never typewriter.
- Camera inside a panel: slow zoom 1.00 -> 1.06 over the hold, stepped on twos.
- Speed lines and impact bursts last 3 to 5 frames then disappear.

## Signature move
**Panel smash:** on the key beat, the panel border cracks outward, the sound-effect word scales in at an angle (-6 to -10 degrees) with a halftone burst behind it, the whole frame shakes 4 px for 6 frames.

## Engine
`hyperframes` with HTML/CSS/SVG (CSS `radial-gradient` for halftone, SVG for bursts and bubble tails). Character art as inked SVG shapes built in code; for photos, apply a posterize + halftone filter (canvas) so they join the style. Optional reference: the public "comic-motion" skill (HTML/CSS/Motion) for a review panel (see `sources.md`).

## Sound
Paper slap per panel, whoosh on slides, one punchy impact per smash (low thump + noise tick), page-turn on transitions. No music or a light brass sting.

## Build brief (paste into Claude Code)
```
Build one self-contained index.html, [W]x[H], [SECONDS]s, comic book style. Paper [HEX], ink [HEX], spot colours [HEX LIST] flat with 2-3px offset misregistration. Halftone screens (dots 8-14px at 45 deg) for shadows. Panels with 6px ink borders and 24-36px gutters. Speech bubbles white with 5px ink outline and tails; lettering in [COMIC FONT], all caps, >= 56px. Motion on twos/threes, hold-then-snap, panel slam-in with 6% overshoot over 4 frames. Signature: panel smash with angled sound-effect word and 6-frame shake. No typewriter text. Persian bubbles: Vazirmatn, RTL. Shots: [SHOT LIST]. window.seek(seconds), seeded rng, no network.
After the build: capture one frame per shot; check bubble tails point to speakers, text is not clipped by borders, and halftone reads at phone size.
```

## QA checks
- Every bubble has a clear speaker and reading order (RTL pages read right to left).
- Halftone dots visible but not noisy at phone size.
- Ink weight consistent across panels.

## Do not
Smooth gradients, photoreal shading, drop shadows, more than 3 spot colours per panel, reproducing any publisher's characters or logos.
