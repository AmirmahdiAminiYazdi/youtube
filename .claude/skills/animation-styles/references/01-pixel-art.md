# 01 Pixel art

Retro game look. Every shape is made of visible square pixels from a small locked palette.

## Look
- **Palette: 8 to 16 colours, locked.** Default (DB16-like, original selection): `#14101F` ink, `#3B2A5A` shadow, `#6B4C9A` purple, `#2E6FA8` blue, `#5CC8D7` cyan, `#7BC74D` green, `#F2C230` yellow, `#E8743B` orange, `#C8362B` red, `#F4EAD5` cream. Never add a colour outside the list; no gradients, no alpha blends.
- **Brand adapter:** replace 3 to 4 palette slots with the brand colours (accent -> the slot nearest in hue), keep ink and cream. Re-check contrast of text on its background (>= 4.5:1).
- **Grid:** draw at a low internal resolution and scale up by an integer. Reel 1080x1920 -> internal 180x320 (x6) or 270x480 (x4). Scale with `image-rendering: pixelated`. No half-pixel positions: `Math.round` every coordinate.

## Type
Pixel font only (bitmap, e.g. a locally bundled OFL pixel font), drawn at integer scale, 1 px outline in ink for legibility. Persian: Vazirmatn at 1:1 on the upscaled layer (not on the low-res grid), in a plain box.

## Shapes and texture
- Sprites 16x16 or 32x32, 1 px dark outline, 2 to 3 tone shading, light from top-left everywhere.
- Backgrounds: 3 parallax layers (far sky, mid, near) with big flat colour areas; ordered 4x4 Bayer dithering for sky gradients only.
- UI: 9-slice panels with 1 px highlight/shadow edge.

## Motion rules
- Animate **on twos** at 12 fps effective (hold each pose 2 frames at 24, or 3 at 30). Walk cycles 4 or 6 frames. Idle bob 2 frames.
- Movement in whole pixels per step. No easing curves; use 2 to 3 stepped speed changes instead.
- Screen shake: 2 px offsets alternating for 6 to 8 frames. Flash: one frame of cream.
- Camera pans snap to the pixel grid.

## Signature move
**Palette-swap flash:** on an impact or a win, swap the sprite to an all-cream silhouette for 1 frame, then to a bright palette variant for 4 frames, then normal. Add a 3-frame star burst.

## Engine
`hyperframes` + a canvas at the internal resolution scaled up (see `../templates/seekable-scene.html`, use `held(t, FPS, 2)`). Generate sprites in code as arrays of palette indices so frames are exact; one sprite per row of a sheet array. Optional: Python Pillow script to preview sprite sheets (draw pixels, view the render, fix, repeat).

## Sound
8-bit square/triangle blips written in code (Web Audio, rendered offline) or `sound-effects`: jump, coin, hit, win jingle (4 notes). Music: 2-bar chiptune loop, low volume.

## Build brief (paste into Claude Code)
```
Build one self-contained index.html, [W]x[H], [SECONDS]s, in locked-palette pixel art. Internal canvas [IW]x[IH] scaled by integer [S], image-rendering pixelated. Palette: [HEX LIST] only, no other colours, no gradients. Animate on twos at 24fps (hold 2 frames). All coordinates rounded to whole pixels. Sprites as palette-index arrays in code. Shots: [SHOT LIST]. Signature move: palette-swap flash on [EVENT]. Work every frame out from time alone; add window.seek(seconds); seeded rng only. Text in [PIXEL FONT] at integer scale. Nothing loaded from the internet.
After the build: capture one frame per shot and verify every colour in the frame is in the palette.
```

## QA checks
- Count distinct colours in a frame capture: must be <= palette size.
- No sub-pixel blur at edges (zoom 400%).
- Text readable at phone size (>= 44 px after scaling).
- Motion steps visibly; no smooth slide anywhere.

## Do not
Anti-aliased shapes, mixed pixel sizes in one scene, rotating sprites by arbitrary angles (rotate only in 90 degree steps or redraw frames), smooth camera zooms.
