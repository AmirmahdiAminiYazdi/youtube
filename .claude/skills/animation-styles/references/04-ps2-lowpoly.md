# 04 PS2 low-poly

Early-2000s console 3D: low polygon counts, low-resolution textures, wobbly vertices, hazy fog, CRT softness. Use for retro, nostalgia, horror-lite, lo-fi worlds.

## Look
- **Render resolution:** render the 3D scene at a small size and upscale with nearest or slight bilinear: 480x854 for a 1080x1920 reel (x2.25), or 360x640. Keep the upscale non-blurry for crispness, then add CRT after.
- **Palette:** muted and slightly desaturated with a colour cast: teal-green shadows, warm sodium-yellow lights. Default fog `#8FA3A0`, sky `#B7C4C2`, light `#FFD9A0`. Brand adapter: brand accent only on 1 to 3 hero props and the title; the rest stays muted.
- **Models:** 200 to 1500 triangles per prop, flat or Gouraud look (no normal maps, no PBR). Textures 64x64 to 128x128, nearest filtering, baked-in shading. Use `MeshLambertMaterial` / `MeshBasicMaterial` with `flatShading: true`.
- **Fog:** linear fog near 6, far 28 so far objects dissolve to the fog colour; draw distance pop-in is allowed.

## Type
Chunky pixel or early-3D menu font (bundled OFL), white with 2 px black drop shadow, or a PS2-style menu bar: translucent dark blue panel, thin light border, gentle shine. Persian: Vazirmatn in a menu panel, no distortion.

## Effects (all cheap)
- **Vertex snapping/wobble:** snap projected vertex positions to the low-res pixel grid in the vertex shader (`gl_Position.xy = floor(gl_Position.xy * res) / res`).
- **Affine texture warp** (optional): interpolate UV without perspective correction on large quads for the classic swim.
- **Dithering:** 4x4 Bayer ordered dither on the final colour with 5 bits per channel.
- **CRT pass:** scanlines (every 2nd row at 12% darker), slight horizontal bloom, 2% chromatic aberration at edges, vignette. Interlace shimmer 1 px at 25 Hz is optional.
- **Frame feel:** render at 30 fps and hold each camera/animation pose for 2 frames (15 fps look). Holding for 3 frames is too choppy for walk-around shots.

## Motion rules
- Camera: slow orbit or forward dolly, locked eye height, no handheld shake. Animated props loop at 4 to 8 key poses with linear interpolation.
- Idle animation: bob and sway with 2 to 3 sine components of different periods.
- Cuts, not dissolves, between shots; a 2-frame white flash on scene change.

## Signature move
**Boot-up memory card:** open with a black screen, a PS2-style logo-free "boot" tunnel of light columns (original design, no console logos or sounds), then cut to the scene with a 2-frame flash. Never recreate Sony logos, fonts or startup audio.

## Engine
Three.js seekable scene (follow `../title-sequence-3d/SKILL.md`; fundamentals in `threejs-fundamentals`, materials in `threejs-materials`, shader tweaks in `threejs-shaders`, post pass in `threejs-postprocessing`). Render to a small `WebGLRenderTarget`, then draw it to the full canvas with a fullscreen quad (nearest filtering) plus the CRT/dither shader. External PS1 shader repo (`threejs-psx-shader`) is a reference only; check its license before reusing code (`sources.md`). Blender low-poly route: only if a Blender MCP is available.

## Sound
Lo-fi ambient pad with tape wobble (slow pitch LFO), distant hum, menu blips (short triangle waves). Music loop 8 to 16 bars at 70 to 90 bpm, low-pass at 6 kHz.

## Build brief (paste into Claude Code)
```
Build one self-contained index.html, [W]x[H], [SECONDS]s, PS2-era low-poly 3D with Three.js from pinned local copy. Render scene to a [RW]x[RH] render target, upscale with nearest filtering. Models under 1500 tris, flatShading, 128px nearest textures drawn on canvas in code. Fog [HEX] near 6 far 28. Vertex shader snaps to the low-res grid. Final pass: 4x4 Bayer dither (5 bits/channel), scanlines, 2% chroma aberration, vignette. Animate on twos. Camera [DOLLY/ORBIT]. Shots: [SHOT LIST]. Title in menu-panel style, text [TEXT]. Original design only, no console logos, fonts or sounds. window.seek(seconds), seeded rng, no network.
After the build: capture one frame per shot; check low-res look is consistent, title is readable, nothing uses smooth high-poly shading.
```

## QA checks
- Silhouettes are chunky; no smooth curves or soft shadows.
- Texture pixels visible, nearest-filtered.
- Title/menu text sharper than the 3D layer (draw text after the upscale).
- Fog and palette stay muted; accent only where intended.

## Do not
Bloom, PBR, normal maps, soft shadows, motion blur, copyrighted console branding.
