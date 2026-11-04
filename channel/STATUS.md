# Project status

Read this file first at the start of every session. The block between the AUTO markers is rewritten every day by `scripts/refresh_status.py` (scheduled task, early morning Europe/Berlin). Everything outside the markers is maintained by hand and by Claude during work sessions, and the daily job never touches it.

<!-- AUTO:START -->
_Auto-refreshed: 2026-11-04 14:01 (Europe/Berlin)._

### Snapshot

- Today: Wed 2026-11-04 (work day); next work day: Thu 2026-11-05
- Stage: pre-launch, nothing published yet
- Next in the pipeline: #1 "3 Lines That Make AI Useful": next stage is Voiceover
- Skills installed: 72 committed in `.claude/skills/`
- Files: ideas 2, scripts 1, thumbnails 0, motion 114, voiceover 0, published 1, research 0

### Pipeline (from `channel/ideas/first-12-ideas.md`)

| # | Series | Working title | Script | Voiceover | Motion | Package | Published |
|---|---|---|---|---|---|---|---|
| 1 | AI in 60 | 3 Lines That Make AI Useful | yes | - | - | - | - |
| 2 | AI in 60 | Make AI Quiz You | - | - | - | - | - |
| 3 | AI in 60 | Catch AI Lying in 10 Seconds | - | - | - | - | - |
| 4 | AI in 60 | Voice Note to Plan | - | - | - | - | - |
| 5 | Mind Hacks | The If-Then Trick | - | - | - | - | - |
| 6 | Mind Hacks | Why You're Always Late | - | - | - | - | - |
| 7 | Mind Hacks | The Spotlight Effect | - | - | - | - | - |
| 8 | Mind Hacks | Your Brain Is a Lawyer | - | - | - | - | - |
| 9 | Learn Faster | Stop Rereading | - | - | - | - | - |
| 10 | Learn Faster | When to Review | - | - | - | - | - |
| 11 | Learn Faster | The 10-Year-Old Test | - | - | - | - | - |
| 12 | Learn Faster | Learning Styles Are a Myth | - | - | - | - | - |

### Last 10 commits

- 2026-11-04  Mark The Impossible Escape as published, note End screen requirement
- 2026-11-04  Add upload package for "The Impossible Escape" (long version)
- 2026-11-04  Add motion-graphics pass for the long video "The Impossible Escape"
- 2026-11-03  Restore brand files as the full Brainmaxx Brand Pack v1.0, add Outfit license notice
- 2026-11-03  Add Brainmaxx Brand Pack v1.0 (SVG, PNG, digital, fonts, color) and Outfit license
- 2026-11-03  Add Brainmaxx brand guide PDF and overview, record font and usage rules
- 2026-11-03  Add Brainmaxx brand assets (logo, profile, banner) and record channel name and palette
- 2026-11-03  Add pinned motion toolbox, setup script, MCP configs and docs
- 2026-11-03  Add 49 vetted skills: threejs, motion pack, ElevenLabs, HyperFrames, design
- 2026-11-03  Verify yt-* skills against upstream, move voice profile into the repo
<!-- AUTO:END -->

## Current focus (update at the end of every work session)

- Next: video #1 "3 Lines That Make AI Useful", target post date Tuesday 2026-11-03. Script drafted in `channel/scripts/`, waiting for the owner's approval before the voiceover is generated.
- By Friday 2026-11-13: write the next batch of ideas (the first 12 end on Wednesday 2026-11-18).
- Rendering is confirmed: Remotion (1080x1920 H.264) and manim rendered real clips in the cloud container with system Chrome and ffmpeg. HyperFrames `doctor` passes. Still to do: the channel template in `channel/motion/_template` (1080x1920, vendored gsap.min.js and fonts, navy/teal/off-white palette, safe zones) and one test render with HyperFrames before video #1 goes to motion.
- Toolbox from the 28-tool list is installed (see `TOOLS.md`). Run `bash scripts/setup.sh` in any fresh environment.
- Brand assets are done (2026-11-03): the full Brand Pack is in `channel/brand/Brainmaxx-Brand-Pack/`. Next for the owner: upload them in YouTube Studio, then create the same handle on TikTok and Instagram. Use the same palette in `channel/motion/_template`.
- Long video "The Impossible Escape" (2026-11-04): the owner's own 16:9 film (3:40). Motion-graphics pass delivered as a 3:49 MP4: 9 s 3D cold open, hook type, 9 chapter titles, build-log blueprint, 7 explanation cards, recap, sound written in code, light grade. Nothing in the film was cut. Source and rebuild steps: `channel/motion/special-the-impossible-escape/README.md`. Upload package is ready in `channel/published/special-the-impossible-escape.md` (title "9 Parts That Turn a Crate Into a Plane", description with 12 chapters, tags, pinned comment, Studio settings) and the thumbnail was delivered as a 276 KB JPG. Published by the owner on 2026-11-04 (title, description with chapters, tags, thumbnail set; checks passed with no copyright issues). Still to do after publishing: pin the comment, reply to comments in the first hours, add the End screen (Subscribe + a video element) once the channel has a second video, post the 95 s vertical version as a Short linked to this video, and after 48 h read the retention graph with `yt-retention`.

## Decisions made

- Videos are in English, faceless, vertical Shorts; posted to YouTube Shorts, TikTok and Instagram Reels.
- Motion graphics are built with Claude (HTML + GSAP, or HyperFrames), voiceover with ElevenLabs.
- One channel with three fixed series: AI in 60 (beginner AI tutorials), Mind Hacks (psychology), Learn Faster (learning and thinking techniques).
- Posting rhythm: one new video every working day, Monday to Friday. No work on Saturday and Sunday. Calendar is in `channel/ideas/first-12-ideas.md`.
- The most popular YouTube skill found (Jakeschincariol/youtube-agent-skill, about 3k stars) is installed unmodified as the `yt-*` skills. The voice profile is read from `channel/voice.md` in this repo, not from `~/.claude`.
- First months: grow the audience; monetization is a later goal.
- Every video has its own visual metaphor and one original element; no invented numbers or sources.
- Toolbox (2026-11-03): the 28 tools are pinned (`tools/pins.env`, lock files). Skills with a redistributable license are committed (72); Remotion skills and UI component sources are fetched by `scripts/setup.sh` because upstream has no license file (Remotion) or forbids redistribution (react-bits). Default video pipeline is HyperFrames + ElevenLabs + ffmpeg; Remotion and manim are for special cases.
- HyperFrames rules: pinned `hyperframes@0.9.8`, telemetry off (project `.claude/settings.json`), never `publish`/`cloud`/`lambda`/`cloudrun`/`auth`/`feedback`, no CDN scripts (vendor gsap and fonts).
- MCP servers (Blender, After Effects, 21st) are configs only and stay off until the owner enables them (`tools/mcp/README.md`).
- Brand guide v1.0 (Nov 2026) is saved as `channel/brand/Brainmaxx-Brand-Pack/04-Brand-Guide/`; the full Brand Pack v1.0 (15 SVGs, transparent PNGs, YouTube banner 2560x1440, profiles, icons, watermark, color files, Outfit fonts) is in `channel/brand/Brainmaxx-Brand-Pack/`. Palette names: Deep Navy `#0B1B33`, Signal Teal `#19C3B1`, Warm White `#F4F1EA`, Spark Orange `#FF7A3D`. Font: Outfit Bold + Outfit Regular. Use these in motion, thumbnails and captions; the motion template must vendor Outfit locally (no CDN).
- Channel name is **Brainmaxx**, handle `@getbrainmaxx` (2026-11-03). Logo: half organic brain, half circuit brain, four orange nodes at the center (generated by the owner in ChatGPT from our concept). Banner uses the logo, wordmark, tagline "Think better. Learn faster." and the three series, all inside the 1546x423 safe area. Upload files: `channel/brand/Brainmaxx-Brand-Pack/03-Digital/youtube-banner-2560x1440.png` and `profile-800.png` (native 2560x1440, no upscaling).

- 2026-11-04: besides the daily Shorts, the owner also posts long 16:9 videos. For "The Impossible Escape" the owner chose to keep the whole film, including its "DM to create yours" end card; edits are additive only.
- Motion on finished footage: render the overlays transparent with HyperFrames (`--format png-sequence`) and composite with ffmpeg, grading the footage only. In the cloud container set `HYPERFRAMES_BROWSER_PATH=/usr/bin/google-chrome` and run one render at a time.

## Open questions

- ElevenLabs files cannot be downloaded into the cloud container (the proxy blocks elevenlabsusercontent.com). One 3 s sea ambience was generated on 2026-11-04 and stays in the owner's ElevenLabs flow; the long video's sound was written in code instead. For future voiceovers, download on the owner's computer or put `ELEVENLABS_API_KEY` in `.env` and test whether the API host is reachable.
- End screen for "The Impossible Escape": Studio refuses to save a Subscribe element alone ("at least one element must be a video or playlist"). Add it later from Studio, Content, the video, Editor, End screen, once there is a second video.
- Custom thumbnails for the channel are blocked until the owner verifies the YouTube account with a phone number (needs a new SIM). "The Impossible Escape" went live without its cover (`the-impossible-escape-thumbnail.jpg`); upload it as soon as the channel is verified, since it can be swapped at any time. Views in the first days may be lower until then.
- "The Impossible Escape": the explanation cards simplify the physics (lift, stability, controls). Read them once before publishing.

- Confirm that the handle `@getbrainmaxx` was actually saved in YouTube Studio, and that the same handle is free on TikTok and Instagram.
- Daily time the owner can spend on review, approval and uploading to three platforms.
- `channel/voice.md` now holds defaults taken from the channel decisions; the owner still needs to fill the lines marked OWNER TO FILL (viewer picture, narrator style, own phrases).
- Video #1 was targeted for Tue 2026-11-03 but the script is not approved yet, so the calendar slips by one working day unless it is approved today.
- Hooks for ideas #4, #9 and #12 should be rewritten before recording.
- Scientific sources listed in `channel/ideas/first-12-ideas.md` are to be verified before publishing.
- Not testable in the cloud container, so unverified: Blender and After Effects MCP against the real apps, 21st MCP (needs a key), faster-whisper transcription (model download from huggingface.co is blocked here), shadcn/magicui/motion-primitives registries, motion-canvas and revideo scene renders. Test them on the owner's computer.
- Remotion license: free for individuals and small teams, paid for larger companies. Read `/remotion-license` before using Remotion in anything monetized.
- Does the owner have an ElevenLabs account and API key (`ELEVENLABS_API_KEY` in `.env`)? Needed for the voiceover step.
