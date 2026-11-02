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

- Channel name / handle: [TODO]
- Video language(s): English
- Target audience: [TODO]
- Posting rhythm: one new video every working day, Monday to Friday, none on Saturday and Sunday (calendar in `channel/ideas/first-12-ideas.md`)
- Monetization goal: [TODO]

Voice profile: fill in `channel/voice.md`, then copy it to `~/.claude/youtube/voice.md`
(the yt-* skills read it from there). Never invent numbers, results or sources in scripts.

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
