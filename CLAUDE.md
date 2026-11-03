# YouTube Channel Project

@channel/STATUS.md

## Session protocol

1. At the start of every session, read the status above (imported from `channel/STATUS.md`). It says where the channel stands, what is next and what is still open. Summarize it for the owner in a few lines before starting work.
2. Work from the "Current focus" section. Do not redo decisions listed under "Decisions made".
3. Before ending a session, update "Current focus", "Decisions made" and "Open questions" in `channel/STATUS.md`, run `python3 scripts/refresh_status.py`, then commit and push.
4. File naming for every video: `NN-slug` where NN is the idea number from `channel/ideas/first-12-ideas.md` (for example `01-three-lines-that-make-ai-useful`). The daily status job derives pipeline progress from these names in `channel/scripts`, `motion`, `voiceover` and `published`. A `published/NN-*.md` file with the line `status: published` marks a video as live.
5. A scheduled task refreshes the auto block of `channel/STATUS.md` every morning. Never edit text between the AUTO markers by hand.

## Channel

Channel concept: English faceless Shorts for YouTube Shorts, TikTok and Instagram Reels, made as motion graphics with Claude.
Promise: "Think better and learn faster, with AI and with your own brain."
Three fixed series: **AI in 60** (beginner AI tutorials), **Mind Hacks** (psychology), **Learn Faster** (learning and thinking techniques).
First 12 ideas and rules: `channel/ideas/first-12-ideas.md`.
The channel is new and starts from zero. First months: grow audience, monetization is a later goal.

Content rules: every video has its own visual metaphor (consistent style, varied idea), one original element (demo, example or view), no invented numbers or sources, no medical or financial advice, no photoreal AI footage presented as real.

## Fill in once (the skills read this)

- Channel name / handle: **Brainmaxx** / `@getbrainmaxx` (handle entered in YouTube Studio; confirm it was saved)
- Brand: palette navy `#0B1B33`, teal `#19C3B1`, off-white `#F4F1EA`, orange `#FF7A3D` (sparks only). Logo (half organic brain + half circuit, four orange nodes at the fissure), profile picture and banner are in `channel/brand/`. Tagline: "Think better. Learn faster."
- Video language(s): English
- Target audience: [TODO]
- Posting rhythm: one new video every working day, Monday to Friday, none on Saturday and Sunday (calendar in `channel/ideas/first-12-ideas.md`)
- Monetization goal: [TODO]

Voice profile: it lives in this repo at `channel/voice.md`. The yt-* skills say they read `~/.claude/youtube/voice.md`, but that file does not exist in a fresh environment. Whenever a skill says to read `~/.claude/youtube/voice.md`, read `channel/voice.md` instead. Do not ask for three of the owner's videos: the channel is faceless, so the voice is the narration style written down in that file. Never invent numbers, results or sources in scripts.

## Folder layout

- `channel/ideas/` video ideas and rankings
- `channel/scripts/` scripts (one file per video, slug names)
- `channel/thumbnails/` thumbnail concepts and finals
- `channel/motion/` motion graphic projects (HTML + GSAP, HyperFrames)
- `channel/voiceover/` voiceover text and audio (ElevenLabs)
- `channel/published/` final upload packages (title, description, tags, chapters)
- `channel/research/` competitor and trend research

## Installed skills (`.claude/skills/`)

| Skill | Use it for |
|---|---|
| `youtube` (`/youtube audit, seo, script, hook, thumbnail, strategy, calendar, shorts, analyze, repurpose, monetize, competitor, metadata, ideate`) | Strategy, SEO, scripts, monetization, competitors |
| `yt-plan`, `yt-script`, `yt-package`, `yt-seo`, `yt-chapters` | Idea to script to title/thumbnail/description/chapters |
| `yt-retention`, `yt-edit`, `yt-viral`, `yt-audit`, `yt-comment`, `yt-shorts` | Retention curves, dead-air cuts, viral swipe file, audits, comment replies, Shorts |
| `video-thumbnail` | 4 thumbnail concepts at once, long-form and Shorts (needs `GEMINI_API_KEY`) |
| `humanizer` | Remove AI-sounding phrasing from scripts and descriptions |
| `prompt-master` | Prompts for image, video and voice AI tools |
| `gsap-*` | Animation code for HTML-based motion graphics |
| `hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use` | HTML to MP4 renders (the default video pipeline), ready-made blocks, TTS/transcribe/music helpers |
| `brand-intake`, `motion-effects`, `motion-brief-writer`, `reel-export`, `vox-explainer`, `animated-chart`, ... (15 motion-pack skills) | Motion briefs and effects; run `brand-intake` once first; `reel-export` before every upload |
| `threejs-*` (13), `title-sequence-3d` | 3D scenes and openers |
| `text-to-speech`, `speech-to-text`, `music`, `sound-effects`, `voice-isolator`, ... (12 ElevenLabs skills) | Voiceover, captions, music, SFX (needs `ELEVENLABS_API_KEY`) |
| `canvas-design`, `algorithmic-art`, `slack-gif-creator`, `theme-factory`, `21st-ui` | Static art, generative art, GIFs, themes, UI via 21st.dev |
| `remotion-*` (13) | Only after `bash scripts/setup.sh` (fetched, not committed) |

All 28 motion tools, their versions and what was actually tested are in `TOOLS.md`. In a fresh environment run `bash scripts/setup.sh` first.

## Toolbox rules

- Never use `@latest`. HyperFrames is `npx hyperframes@0.9.8`; other versions are pinned in `tools/`.
- Run every HyperFrames command with `HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1`, and `init` with `--skip-skills` (the skills are already in this repo).
- Never run HyperFrames `publish`, `cloud`, `lambda`, `cloudrun`, `auth` or `feedback`: they upload project files or account data to third parties. The owner publishes videos by hand.
- The cloud container blocks cdn.jsdelivr.net, huggingface.co and the shadcn registries. A motion project must carry its own copy of `gsap.min.js` and fonts (no CDN `<script src>`).
- MCP servers (Blender, After Effects, 21st) stay off until the owner enables them, see `tools/mcp/README.md`.
- Third-party licenses: before committing code from another repo, check its license and update `THIRD_PARTY_NOTICES.md`. No license file means do not commit it.

## Workflow

1. `/youtube ideate` or `yt-plan` for ideas, pick one.
2. `yt-script` for hooks (scored) and the script, then `humanizer`.
3. Voiceover with ElevenLabs, motion graphics with HTML/GSAP or HyperFrames.
4. `yt-package` / `/youtube seo` for title, thumbnail, description; `video-thumbnail` for thumbnails.
5. `yt-chapters`, `/youtube metadata` for the upload package. Publishing is always done by the user.

## Optional keys (put in `.env`, never commit)

- `GEMINI_API_KEY` for thumbnail generation
- `SCRAPECREATORS_API_KEY` for thumbnail reference search
- YouTube Data API v3 key for live channel and competitor data (see `.claude/skills/youtube/README` notes)
