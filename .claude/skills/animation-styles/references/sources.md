# Sources and optional installs

The ten style sheets in this module are original to this skill. No upstream code is copied. The repos below cover the same looks; they were found by reading their README/pages on 2026-11-09 and were **not executed**. Star counts and licenses can change: re-check the repo before installing, and read its SKILL.md and scripts first.

## Broad packs (several styles each)

| Source | Covers | License (as listed) | Notes |
|---|---|---|---|
| withhammad.com "Claude Animation Styles" (zip, ~82 KB) | The same 10 looks (its #9 is "Toy bricks", #10 is "Soft clay 3D") plus a Remotion paper-plane reel | Not verified; check the page | Not a git repo. Needs Remotion, Node 20+, ffmpeg. |
| github.com/lemomo-ai/lemo-opuscar | 66 film styles incl. chalkboard, brick toy, 16-bit pixel RPG, halftone dossier, one-line drawing, low-poly isometric | MIT | Tuned for Opus-class models; each film is slow and token-heavy. Copy `plugin/skills/lemo-opuscar/` into a skills folder to use it. |
| github.com/alexgreensh/anidoodle | 32 hand-drawn code styles incl. chalkboard, pixel art, flat vector, marker comic, toy brick, low-poly 3D, single-line | Apache-2.0 | Works with Claude Code and Codex. Each style also yields a "draw-on" video. |

## Per-style references

| Style | Source | License / caution |
|---|---|---|
| 01 Pixel art | Gamezxz/pixel-art-studio, crsolver/claude-pxl, m4bwav/pixelwright, aldegad/sprite-gen, tachikomared/character-animation-creator-skill | Check each; the last two target Codex / GPT agents |
| 02 Chalkboard | nicglazkov/Chalkboard (Manim pipeline), ratava/videoexpress-scripting-skill (prompts for video models) | Check each |
| 03 Glow sketch | No dedicated repo found. moguzbulbul/blueprint-animation (scan-line blueprint) | **CC BY-NC**: non-commercial only; do not copy into commercial work |
| 04 PS2 low-poly | lferreira457/threejs-psx-shader (PS1 shader reference), arjun988/blender-skills (Blender low-poly styles) | Check license before reusing shader code |
| 05 Comic art | chafamaster2000/comic-motion (HTML/CSS/Motion + review panel) | Check license |
| 06 Flat vector | gooseworks-ai/goose-skills (`render-flat-vector-explainer`, Remotion), skindhu/skind-skills, bangtutorial/bang-motion | Remotion needs a company license for commercial use; some steps use paid APIs |
| 07 Minimal line | artemnovitckii/claude-animation-skills (`/minimalistic-graphics`, `/graph`), iart-ai/web-animation-skills (`svg-animation`), diffusionstudio/lottie | Check each |
| 08 CGI motion | cumalibilgic/cinematic-3d-video (Three.js + ffmpeg, optional Blender), DisturbedMediaGroup/claude-animation-skill, RobLe3/cc-blender-skill, mromidev/claude-blender-skills | Blender routes need a Blender MCP |
| 09 Toy bricks | lemo-opuscar "Brick Toy", anidoodle "Toy brick", majidmanzarpour/threejs-game-skills (voxel/brick stylisation via Tripo API) | No dedicated toy-brick video skill found; Tripo is a paid API |
| 10 Explainer 3D | arthurkatcher/explainer-video-3d (Remotion + three.js, TTS, Claude Code and Codex), `/zach-d-films` in claude-animation-skills, fblissjr/fb-claude-skills (explainer-video) | Check each |

## How to use them next to this module

1. Prefer the style sheets here for the look and the build contract; they keep brand colours, Persian handling and the seek contract consistent.
2. Use an upstream repo when you want its extras (sprite sheets, Manim maths, Blender rigs) and accept its license.
3. Anything installed from outside is third-party code: read it, pin a commit, keep secrets out of it, and do not run publish/upload steps without the user asking (toolbox rules in `CLAUDE.md`).
4. Remotion-based sources need the Remotion company license for commercial use; this skill does not bundle Remotion skills.
