# Project status

Read this file first at the start of every session. The block between the AUTO markers is rewritten every day by `scripts/refresh_status.py` (scheduled task, early morning Europe/Berlin). Everything outside the markers is maintained by hand and by Claude during work sessions, and the daily job never touches it.

<!-- AUTO:START -->
_Auto-refreshed: 2026-11-02 18:32 (Europe/Berlin)._

### Snapshot

- Today: Mon 2026-11-02 (work day); next work day: Tue 2026-11-03
- Stage: pre-launch, nothing published yet
- Next in the pipeline: #1 "3 Lines That Make AI Useful": next stage is Voiceover
- Skills installed: 23 (`.claude/skills/`)
- Files: ideas 2, scripts 1, thumbnails 0, motion 0, voiceover 0, published 0, research 0

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

- 2026-11-02  Set up YouTube channel workspace with skills, plan and daily status
- 2026-11-02  Initial commit
<!-- AUTO:END -->

## Current focus (update at the end of every work session)

- Next: video #1 "3 Lines That Make AI Useful", target post date Tuesday 2026-11-03. Script drafted in `channel/scripts/`, waiting for the owner's approval before the voiceover is generated.
- By Friday 2026-11-13: write the next batch of ideas (the first 12 end on Wednesday 2026-11-18).
- Check how video files will be rendered (headless browser and ffmpeg available or not) before promising daily motion-graphic exports.

## Decisions made

- Videos are in English, faceless, vertical Shorts; posted to YouTube Shorts, TikTok and Instagram Reels.
- Motion graphics are built with Claude (HTML + GSAP, or HyperFrames), voiceover with ElevenLabs.
- One channel with three fixed series: AI in 60 (beginner AI tutorials), Mind Hacks (psychology), Learn Faster (learning and thinking techniques).
- Posting rhythm: one new video every working day, Monday to Friday. No work on Saturday and Sunday. Calendar is in `channel/ideas/first-12-ideas.md`.
- First months: grow the audience; monetization is a later goal.
- Every video has its own visual metaphor and one original element; no invented numbers or sources.

## Open questions

- Channel name and handle.
- Daily time the owner can spend on review, approval and uploading to three platforms.
- Voice profile in `channel/voice.md` is still the empty template.
- Hooks for ideas #4, #9 and #12 should be rewritten before recording.
- Scientific sources listed in `channel/ideas/first-12-ideas.md` are to be verified before publishing.
