# 08 CGI motion

Glossy product/object animation: physically based materials, studio lighting, controlled camera moves. For product reveals, abstract tech visuals and premium title shots.

## Look
- **Materials:** PBR (`MeshPhysicalMaterial`): brushed metal, glass (transmission), glossy plastic, matte rubber. Roughness 0.15 to 0.45 for hero surfaces; clearcoat 1 on paint.
- **Lighting:** HDR environment for reflections (local `.hdr`, bundled), one key light (soft, 45 degrees), one rim light (accent colour), low fill. Contact shadows or a shadow-catcher plane.
- **Palette:** dark studio `#0B0D12` to `#181C26` ground, objects in desaturated hero colour, one accent from the brand in the rim light. Brand adapter: tint the rim light and one material with the brand colour; keep the rest neutral.
- **Grade:** ACES filmic tone mapping, slight bloom (threshold high), soft vignette, 1 to 2% film grain, subtle depth of field on macro shots.

## Type
Large clean sans, 3D-extruded or flat overlay in screen space, 90 to 140 px. Keep text out of reflections: render title as a 2D overlay after the 3D pass. Persian: 2D overlay only (Vazirmatn 800); never extrude Persian text.

## Motion rules
- Camera on a spline or turntable, `power2.inOut` speed ramps, 1 to 2 hero moves per shot (dolly, orbit, rack focus). No handheld shake.
- Objects: slow rotation 10 to 20 degrees/s, assemble/explode with staggered ease-out, parts settle with 4% overshoot.
- Cut rhythm: 1.5 to 3 s shots, match-cut on shape or motion direction.
- Render at 30 or 60 fps with true motion (no steps); optional motion blur through multi-sample accumulation (4 to 8 sub-frames per frame, offline only).

## Signature move
**Light sweep reveal:** the object starts as a dark silhouette; a rim/key light travels across it, revealing materials, then the title resolves in 2D over the final hold.

## Engine
Three.js seekable scene (`title-sequence-3d` pattern + `threejs-materials`, `threejs-lighting`, `threejs-postprocessing`, `threejs-animation`, `threejs-loaders`; optimize assets with `threejs-asset-pipeline`). Render frame by frame in headless Chrome and encode with ffmpeg. Blender (Cycles/EEVEE) route only when a Blender MCP is available; otherwise Three.js. AI video models (Higgsfield/Kling/Seedance) are possible for shots that need photoreal motion; label AI footage and do not pass it off as real (toolbox rules in `CLAUDE.md`).

## Sound
Deep sub hit on the reveal, glassy risers, subtle mechanical foley (clicks, servo), clean airy bed. `sound-effects` + `music`.

## Build brief (paste into Claude Code)
```
Build one self-contained index.html, [W]x[H], [SECONDS]s, CGI product-style 3D with Three.js (pinned local copy). Scene: [OBJECT, built from primitives or the attached glTF]. MeshPhysicalMaterial: [MATERIALS]. Local HDR environment, key light 45deg soft, rim light [ACCENT HEX], low fill, contact shadow. ACES tone mapping, subtle bloom (high threshold), vignette, 1-2% grain. Camera: [MOVES] with power2.inOut speed ramps. Signature: light-sweep reveal from silhouette. Title as 2D overlay after the 3D pass: [TEXT]. Shots: [SHOT LIST]. Work from time alone; window.seek(seconds); seeded rng; wait for seek with ?render; no network.
After the build: capture frames at 0s, mid of each shot, last second; check reflections never sit behind the title, edges are clean, nothing clips.
```

## QA checks
- Title contrast >= 4.5:1; no bright reflection behind text.
- Highlights not blown out (histogram check).
- Camera speed changes smoothly; no pops between shots.

## Do not
Flat default materials, pure black ground, extruded Persian text, uncredited third-party models (check each asset's license).
