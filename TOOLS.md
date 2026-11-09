# Toolbox: the 28 motion-graphics tools

Everything below is pinned to an exact version or commit (see `tools/pins.env`, `tools/motion-lab/package-lock.json`, `tools/python/requirements.lock`). One command installs what a fresh clone needs:

```bash
bash scripts/setup.sh            # libraries, fetched skills, UI sources
bash scripts/setup.sh --check    # only report what is installed
SETUP_MCP=1 bash scripts/setup.sh   # also fetch the Blender / After Effects MCP sources
```

Needs git, Node 22+, uv, ffmpeg and Chrome or Chromium. For manim on Linux also `libcairo2-dev libpango1.0-dev pkg-config`.

**What "installed" means here.** Skills are committed as files in `.claude/skills/` (72 of them) when the upstream license allows redistribution. Libraries are real dependencies (`npm ci`, `uv pip install`), not copied source. Code that upstream does not let us redistribute is fetched by `setup.sh` at a pinned commit and git-ignored.

## Status per tool

"Tested" means it ran in the cloud container on 2026-11-03. "Install only" means it installs at the pinned version but could not be exercised here, and the reason is given.

### Animation engines (`tools/motion-lab`)

| Tool | Version | Status |
|---|---|---|
| three.js | 0.187.0 | Tested: imports, `Scene` class exists |
| anime.js | 4.5.0 | Tested: imports, `animate` exists |
| motion | 14.9.0 | Tested: imports, `animate` exists |
| react-three-fiber (+ drei, React 19) | 9.8.2 (drei 10.7.9) | Install only: needs a browser/WebGL, version verified |
| lottie-web | 5.13.0 | Install only: needs a browser DOM, version verified |
| gsap | 3.15.0 | Tested: imports, `gsap.to` exists. Check https://gsap.com/licensing/ for your use |

### Render and video

| Tool | Version | Status |
|---|---|---|
| ffmpeg | system 6.1.1 | Tested (used by every render) |
| remotion | 4.0.540 | Tested: rendered a 1080x1920 H.264 clip with system Chrome (`npm run smoke:remotion`). Remotion's license is free for individuals and small teams and paid above that; read `/remotion-license` before monetizing |
| hyperframes | CLI `hyperframes@0.9.8`, 4 skills | Tested earlier in this project: `doctor` passes with Chrome and FFmpeg. Skills committed. See the rules in `CLAUDE.md` |
| manim | 0.22.1 | Tested: rendered a scene to MP4 (`tools/python/smoke/manim_smoke.py`) |
| motion-canvas | 3.17.2 | Install only: Vite-based, version verified, no scene rendered |
| revideo | 0.11.0 | Install only: Vite-based, version verified, no scene rendered |

### UI parts (`tools/ui-parts`)

Sources are fetched at pinned commits into `tools/ui-parts/vendor/` (git-ignored). They are copy-in components for web pages; the Shorts pipeline does not need them.

| Tool | Pinned | Status |
|---|---|---|
| shadcn/ui | CLI `shadcn@4.23.0`, source `4aaea19` | CLI installs. `shadcn add` talks to ui.shadcn.com, which the cloud container blocks, so not tested here |
| magicui | `43c0915` | Source fetched. Registry site blocked here |
| motion-primitives | `120f64f` | Source fetched. Registry site blocked here |
| react-bits | `4dc7b5b` | Source fetched. Its license (MIT + Commons Clause) forbids redistributing the components, which is why they are not committed to this public repo. Using them in your own videos and sites is allowed |
| magic-mcp (21st.dev) | hosted, needs key | Config only, see `tools/mcp/README.md` |

### Sound and captions

| Tool | Version | Status |
|---|---|---|
| whisper | faster-whisper 1.2.1 (`tools/python`) | Install only: the library imports, but its models download from huggingface.co, which the cloud container blocks. On your own computer `faster-whisper` downloads a model on first use. HyperFrames' `transcribe` is the other route (see the `media-use` skill) |
| tone.js | 15.1.22 | Install only: Web Audio, browser only |
| wavesurfer.js | 8.0.5 | Install only: browser only |
| elevenlabs/skills | 12 skills | Skills committed. Needs your ElevenLabs account and `ELEVENLABS_API_KEY` in `.env`. Not run here (it spends credits) |

### Skills and MCP

| Tool | Status |
|---|---|
| anthropics/skills | Committed: `canvas-design`, `algorithmic-art`, `slack-gif-creator`, `theme-factory` (all Apache-2.0). Not copied on purpose: `docx`, `pdf`, `pptx`, `xlsx` (Anthropic's source-available license does not allow redistribution) and skills unrelated to motion |
| gsap-skills | Committed earlier (8 skills) |
| threejs-skills | Committed: 13 skills |
| motion-graphics-skills | Committed: 15 skills (brand-intake, motion-effects, reel-export, ...). Run `brand-intake` once before using the others |
| animation-styles | Committed: 1 original skill (10 style sheets + `templates/seekable-scene.html`). The template was tested in headless Chromium (seek is deterministic, stepped time holds); the style sheets were not yet rendered into videos. Optional third-party repos are listed in `references/sources.md`, not copied |
| remotion/skills | Fetched by `setup.sh` (13 skills), not committed: upstream has no license file |
| mcp-for-blender | Config + safety notes in `tools/mcp/`. Not tested against Blender |
| after-effects-mcp | Config + safety notes in `tools/mcp/`. Server builds and answers the MCP handshake. Not tested against After Effects |

## Which tool for which job on this channel

- **Daily Shorts (default):** HyperFrames (HTML + GSAP to MP4), ElevenLabs voice, ffmpeg. Deterministic renders, works in the cloud and locally.
- **React-based scenes or data-driven batches:** Remotion.
- **Math or step-by-step diagrams (Learn Faster):** manim.
- **Named animation look (pixel, chalkboard, comic, PS2, toy bricks, ...):** the `animation-styles` skill, then the engine its style sheet names.
- **3D opener:** three.js with the `title-sequence-3d` skill.
- **Captions from a voiceover:** `faster-whisper` or HyperFrames `transcribe`, then burned-in captions.
- **Vertical export check:** the `reel-export` skill (safe zones, H.264, yuv420p, ffprobe).

## Updating a pin

Clone the upstream repo, read the diff since the old pin, then change the version or SHA, run `bash scripts/setup.sh`, and commit. Never switch to `@latest`.
