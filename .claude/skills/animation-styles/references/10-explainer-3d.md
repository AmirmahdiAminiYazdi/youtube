# 10 Explainer 3D

Soft, rounded 3D characters and objects in bright studio light with narration. The friendly 3D explainer: "how X works" in 30 to 90 seconds.

## Look
- **Forms:** chunky and rounded: spheres, capsules, rounded boxes (`RoundedBoxGeometry`), bevel radius >= 8% of the smallest side. No sharp edges.
- **Materials:** matte "soft clay": `MeshStandardMaterial` roughness 0.65 to 0.8, no metalness, subtle subsurface feel by adding a rim light. Optional toon ramp for a cel look (`threejs-materials`).
- **Palette:** bright pastels with one strong accent. Default: background `#DDE7F7`, clay blue `#6C8CF0`, coral `#FF8A7A`, mint `#7FD6B5`, sun `#FFD166`, ink `#1E2540`. Brand adapter: brand colour = the main character/object; others from tints; keep the background lighter than every object.
- **Lighting:** large soft key (area-like, from 3 lights or an HDR studio), gentle fill, rim in accent; soft contact shadows. Background: flat colour or a very soft ramp.
- **Grade:** low contrast, slight bloom, 1% grain.

## Type
Rounded bold sans (bundled OFL), 90 to 130 px, in ink or white on a pill plate; label callouts attached to objects with thin curved leader lines. Persian: Vazirmatn 800 in pill plates, RTL. All text is a 2D overlay.

## Characters
Simple rigs: body capsule, head sphere, two dot eyes, 2 arm capsules, 2 leg capsules. 5 poses: idle, point, wave, think, celebrate. Facial expression through eyes scale + one eyebrow arc. No mouth sync required; use a 2-shape mouth open/close when narration plays.

## Motion rules
- Easing always: `power3.out`, `back.out(1.3)`, `power2.inOut`. 8 to 12% squash and stretch on landings and pops.
- Anticipation 3 to 4 frames before big moves; follow-through on arms and antennae (delay 2 to 3 frames).
- Camera: slow dolly or orbit 5 to 12 degrees per shot, one rack-focus per scene at most; cut every 3 to 5 s with a matching shape wipe.
- Objects enter with stagger 0.08 to 0.12 s; max 5 movers at once.

## Signature move
**Zoom-through transition:** the camera pushes into a prop (a screen, a doorway, a bubble) until it fills the frame, and the next scene begins inside it.

## Engine
Three.js seekable scene + GSAP timelines (`threejs-animation`, `gsap-timeline`, `threejs-lighting`, `threejs-materials`) following `title-sequence-3d`; or Remotion with `@remotion/three` when the project already uses it (company license, see `sources.md`). Narration: `text-to-speech` (ElevenLabs) or user voice; captions from `speech-to-text`; then `reel-export`. Long films (> 60 s): build one shot file per scene and concatenate with ffmpeg.

## Sound
Warm bouncy pad + light pizzicato, soft pops for entries, whoosh for zoom-through, gentle "ding" on key facts; music ducked 14 dB under the voice, final mix -14 LUFS for social.

## Build brief (paste into Claude Code)
```
Build one self-contained index.html, [W]x[H], [SECONDS]s, soft 3D explainer with Three.js pinned local copy. Rounded forms only (bevel >= 8%), matte clay MeshStandardMaterial roughness 0.7, palette [HEX LIST], background [HEX]. Large soft key light + fill + accent rim, soft contact shadows. Characters from capsules/spheres with 5 poses [LIST]. Motion: power3.out / back.out(1.3), 8-12% squash-stretch, anticipation 3-4 frames, stagger 0.08-0.12s, max 5 movers. Signature: zoom-through transition between scenes. Labels as 2D pill overlays: [LABELS]. Narration script (one line per shot): [SCRIPT]. Persian text: Vazirmatn RTL. Facts typed exactly. window.seek(seconds); seeded rng; no network.
After the build: capture one frame per shot; check label legibility, no sharp edges, camera moves are smooth, and every fact matches the list.
```

## QA checks
- Every object has rounded edges; no harsh specular.
- Labels never overlap characters' faces.
- Narration timing: each shot lasts at least the spoken line + 0.3 s.
- Audio mix measured at about -14 LUFS.

## Do not
Photoreal materials, hard shadows, text on 3D surfaces, more than five moving objects at once, unlicensed character models.
