# 09 Lego-style toy bricks

Stop-motion style scenes built from studded plastic bricks. This is a *toy-brick* look: original brick shapes and colours, not LEGO-branded content.

## Trademark note
"LEGO" is a trademark. Build with generic studded bricks. Do not draw the LEGO logo, official minifigure designs or branded sets, and do not use the LEGO name in the video, titles or captions. Say "toy bricks" in published text unless the user has rights to use the name.

## Look
- **Palette:** saturated primaries on a neutral baseplate. Default: red `#D7261E`, blue `#1F5BC4`, yellow `#F9C915`, green `#2E9B4B`, white `#F2F2EE`, dark `#2B2B2E`, baseplate `#9AA3A8`. Brand adapter: map the brand colour to the most-used brick colour; use at most 5 brick colours in a scene.
- **Geometry:** bricks on a 1 : 1 : 1.2 grid (width : depth : height), cylinder studs (radius 0.3, height 0.17) on top, 0.02 bevel on edges, tiny gap (0.004) between bricks. Instance bricks (`InstancedMesh`) for performance.
- **Material:** glossy ABS plastic: `MeshPhysicalMaterial`, roughness 0.28, clearcoat 0.6, no metalness. Add a faint fingerprint/roughness noise texture (64x64) for realism.
- **Scene:** shallow depth of field (tilt-shift look), warm key light + cool fill, soft contact shadows on a baseplate; background a seamless paper-coloured table `#E9E3D6` or a bright gradient-free colour.

## Type
Text built from bricks (5x7 brick-letter grid in code) for the headline; supporting text as a 2D overlay in a chunky rounded sans (bundled OFL). Persian: overlay only, Vazirmatn 800; brick-letter Persian is not supported.

## Motion rules
- **Stop-motion:** render on **twos at 12 fps feel** with 1 to 2 frames of irregular hold (seeded) so it feels hand-moved. Pieces teleport in small steps (6 to 10 steps per move), not smooth glide.
- Build-up: bricks pop in from above in a stagger of 0.08 to 0.15 s, each dropping 0.8 units and snapping to its stud with a 2-frame squash (scaleY 0.94).
- Characters: simple brick figures (cylinder torso, sphere-ish head with printed dot face) with 3 poses (idle, walk 2-step, wave).
- Camera: small dolly or tilt, moved in steps like a tripod nudge, never smooth.

## Signature move
**Brick build-up and tear-down:** the scene assembles brick by brick (bottom to top, left to right) to reveal the object, and at the end a hand-sized "explode" reverses it into a pile before the end card.

## Engine
Three.js with `InstancedMesh` for bricks (`threejs-geometry`, `threejs-performance`, `threejs-materials`, `threejs-lighting`, `threejs-postprocessing` for tilt-shift/DOF) following the seekable-scene contract. Brick placement is data (a list of `[x, y, z, w, d, colour, appearAtSeconds]`), so each shot is deterministic. Model-stylisation via image/3D generators (e.g. Tripo) is outside this module; see `sources.md`.

## Sound
Plastic click per brick snap (short noise burst + 1.8 kHz resonance), light wooden-table taps for moves, cheerful ukulele/marimba bed, a rising "ta-da" at completion.

## Build brief (paste into Claude Code)
```
Build one self-contained index.html, [W]x[H], [SECONDS]s, toy-brick stop-motion style, Three.js pinned local copy. Bricks: InstancedMesh, grid 1:1:1.2, studs r0.3 h0.17, bevel 0.02, gap 0.004, MeshPhysicalMaterial roughness 0.28 clearcoat 0.6. Palette [HEX LIST] (max 5 brick colours) on baseplate [HEX]. Scene data: list of [x,y,z,w,d,colour,appearAt]. Bricks drop in with 0.08-0.15s stagger and a 2-frame squash. Render on twos with seeded irregular holds. Tilt-shift DOF, warm key + cool fill, contact shadows. Headline in brick letters, other text 2D overlay. No brand names or logos of toy companies. Shots: [SHOT LIST]. window.seek(seconds); seeded rng; no network.
After the build: capture one frame per shot; check studs align on the grid, no floating bricks, colours within the palette, text readable.
```

## QA checks
- No brick off-grid or intersecting (assert in code).
- Max 5 colours; plastic sheen visible but not blown out.
- Motion looks stepped, not smooth.
- No trademarked names/logos in frames or captions.

## Do not
Use official sets/minifig designs, smooth glides, metal materials, more than ~4000 visible bricks without instancing.
