# Project status

Read this file first at the start of every session. The block between the AUTO markers is rewritten every day by `scripts/refresh_status.py` (scheduled task, early morning Europe/Berlin). Everything outside the markers is maintained by hand and by Claude during work sessions, and the daily job never touches it.

<!-- AUTO:START -->
_Auto-refreshed: 2026-11-09 06:11 (Europe/Berlin)._

### Snapshot

- Today: Mon 2026-11-09 (work day); next work day: Tue 2026-11-10
- Stage: pre-launch, nothing published yet
- Next in the pipeline: #1 "3 Lines That Make AI Useful": next stage is Voiceover
- Skills installed: 72 committed in `.claude/skills/`
- Files: ideas 2, scripts 2, thumbnails 0, motion 37, voiceover 2, published 5, research 2

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
| 9 | Learn Faster | Stop Rereading | yes | yes | yes | yes | - |
| 10 | Learn Faster | When to Review | - | - | - | - | - |
| 11 | Learn Faster | The 10-Year-Old Test | - | - | - | - | - |
| 12 | Learn Faster | Learning Styles Are a Myth | - | - | - | - | - |

### Last 10 commits

- 2026-11-06  Raise #9 package: verify paper claims, disclose AI voice, simplify pinned comment
- 2026-11-06  Update #9 package: current date and playlist text
- 2026-11-05  Revise #9 upload package with live YouTube search data, add English SRT
- 2026-11-05  Add upload package for #9 Stop Rereading, update status
- 2026-11-05  Re-check headlights package with the full yt skills, add SRT
- 2026-11-05  Fix yt-seo query test and verify claims in headlights package
- 2026-11-04  Finish #9 master, fix silent-tail false positive in check_short.py
- 2026-11-04  Add 3D motion project for #9 "Stop Rereading"
- 2026-11-04  Add upload package for the adaptive-headlights Short, update status
- 2026-11-04  Review adaptive-headlights Short draft, add check_short.py gate
<!-- AUTO:END -->

## Current focus (update at the end of every work session)

- Next: video #1 "3 Lines That Make AI Useful", target post date Tuesday 2026-11-03. Script drafted in `channel/scripts/`, waiting for the owner's approval before the voiceover is generated.
- By Friday 2026-11-13: write the next batch of ideas (the first 12 end on Wednesday 2026-11-18).
- Rendering is confirmed: Remotion (1080x1920 H.264) and manim rendered real clips in the cloud container with system Chrome and ffmpeg. HyperFrames `doctor` passes. Still to do: the channel template in `channel/motion/_template` (1080x1920, vendored gsap.min.js and fonts, navy/teal/off-white palette, safe zones) and one test render with HyperFrames before video #1 goes to motion.
- Toolbox from the 28-tool list is installed (see `TOOLS.md`). Run `bash scripts/setup.sh` in any fresh environment.
- Research (2026-11-04): a first YouTube search snapshot for the three series is in `channel/research/2026-11-04-youtube-search-snapshot.md`. Learn Faster and Mind Hacks showed the clearest demand in it; AI-for-beginners Shorts were weak in that sample (small sample, relevance-ordered, not a velocity ranking). Suggestion for the next Short: #9 "Stop Rereading" (calendar Thu 2026-11-05). Its script is drafted in `channel/scripts/09-stop-rereading.md` (hook scored 83, about 45 s) and the owner generated the voiceover with ElevenLabs on 2026-11-04 (`channel/voiceover/09-stop-rereading.mp3`, 42.0 s, word timings in `09-stop-rereading.words.json`). Visual plan agreed: mostly 3D (card wall, hook), voice plus short code-made sound effects only, word-by-word teal captions, water-cycle recall example. Motion done (2026-11-04): 3D HyperFrames project in `channel/motion/09-stop-rereading/` (rebuild steps in its README); master `renders/09-stop-rereading.mp4` (43 s, -14.7 LUFS, passes `scripts/check_short.py`) delivered to the owner, not committed. Upload package ready (2026-11-05, `channel/published/09-stop-rereading.md`: title "Stop Rereading: Try Active Recall" (rewritten after a live YouTube search check: the exact "Stop Rereading Your Notes" already exists on several Shorts; "stop rereading" has no autocomplete, "active recall study method" and "how to study for exams" do), description with the APS source line and 4 hashtags (51 chars), manual English SRT `channel/published/09-stop-rereading.en.srt`, 14 tags, pinned comment, Studio settings with "altered content: Yes" (corrected 2026-11-06: YouTube's own example for disclosure is a generated voice narrating a video; the narration is an ElevenLabs voice, so the description says "Narration is an AI-generated voice."), cover frame at 0:00, TikTok and Reels captions, post-publish test criteria). The owner uploads it as a test; if Viewed vs Swiped Away and replays look good after 48-96 h the 3D format continues, otherwise the hook and first seconds change first. #3 stays in the plan.
- Brand assets are done (2026-11-03): the full Brand Pack is in `channel/brand/Brainmaxx-Brand-Pack/`. Next for the owner: upload them in YouTube Studio, then create the same handle on TikTok and Instagram. Use the same palette in `channel/motion/_template`.
- Long video "The Impossible Escape" (2026-11-04): the owner's own 16:9 film (3:40). Motion-graphics pass delivered as a 3:49 MP4: 9 s 3D cold open, hook type, 9 chapter titles, build-log blueprint, 7 explanation cards, recap, sound written in code, light grade. Nothing in the film was cut. Source and rebuild steps: `channel/motion/special-the-impossible-escape/README.md`. Upload package is ready in `channel/published/special-the-impossible-escape.md` (title "9 Parts That Turn a Crate Into a Plane", description with 12 chapters, tags, pinned comment, Studio settings) and the thumbnail was delivered as a 276 KB JPG. Published by the owner on 2026-11-04 (title, description with chapters, tags, thumbnail set; checks passed with no copyright issues). Still to do after publishing: pin the comment, reply to comments in the first hours, add the End screen (Subscribe + a video element) once the channel has a second video, post the 95 s vertical version as a Short linked to this video, and after 48 h read the retention graph with `yt-retention`.
- Adaptive-headlights Short (2026-11-04): the owner made a finished 36.5 s vertical video, `brainmaxx-adaptive-headlights`, in ChatGPT (file says hyperframes 0.8.212; outside our template) and decided to upload it as is, as the second video. Review: `channel/research/2026-11-04-adaptive-headlights-review.fa.md` (known issues left in: a wrong scene flashes in the first 0.47 s, narration ends with "Like and subscribe" against voice.md, silent last 1 s with a thumbnail-style card, fonts and colours are not Outfit / brand palette, captions sit below y 1420). Upload package is ready in `channel/published/special-adaptive-headlights.md` (title "How Adaptive Headlights Work", description, 12 tags, pinned comment, Studio settings, TikTok and Reels captions); not published yet, the owner publishes. New gate for later Shorts: `python3 scripts/check_short.py video.mp4` after every render. After publishing: pin the comment, add this video or a playlist to the End screen of "The Impossible Escape", read Viewed vs Swiped Away after 48 h. Re-checked 2026-11-05 with the full yt skills (metadata and shorts sub-skills, seo-playbook, algorithm-guide, monetization-guide): hashtags cut to 4 (50 chars, the old 5 were 62 against the playbook's 60 for Shorts), description lines 1-2 rewritten so the yt-seo query test passes, three title types written (search recommended), claims verified with two sources, audio measured (no music bed). Optional extras: a fixed video that holds the settled hook frame for the first 0.6 s (no flash frame, `check_short.py` 0 FAIL; sent in chat, not committed) and an exact English SRT built by OCR of the burned-in captions (`channel/published/special-adaptive-headlights.en.srt`). The first review overstated two things and was corrected: caption gaps at sentence ends are normal, and the narration is 110 words in about 35.4 s (about 186 wpm), with short pauses.

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
- 2026-11-04: on the owner's request, #9 ends with a visual end card (Brainmaxx mark, Subscribe, Like, Comment, Save) during the spoken "Save this" line; no extra spoken ask. This overrides the one-ask rule in `channel/voice.md` for the end card only.
- 2026-11-09: added the `animation-styles` skill (10 named looks, PR #1): pixel art, chalkboard, glow sketch, PS2 low-poly, comic, flat vector, minimal line, CGI motion, toy bricks, explainer 3D. Use it when a video should follow one of these looks; run `brand-intake` first and `reel-export` last. Only the seekable template was tested; no style has been rendered into a video yet, so test one on the next motion job.
- Motion on finished footage: render the overlays transparent with HyperFrames (`--format png-sequence`) and composite with ffmpeg, grading the footage only. In the cloud container set `HYPERFRAMES_BROWSER_PATH=/usr/bin/google-chrome` and run one render at a time.

## Open questions

- #9 "Stop Rereading" (voiceover done, motion build next, calendar Thu 2026-11-05) is now the third video, since the headlights Short goes up first as the second. Confirm the calendar still holds.
- Headlights is outside the three series; its end says "EVERYDAY THINGS. EXPLAINED." The owner uploads it anyway. Open: make "Everyday Things Explained" an official fourth series (then record it in first-12-ideas.md and give it an idea number; the package file is named `special-` for now) or keep it a one-off.
- The headlights video uses photoreal-looking stills made in ChatGPT (headlight macro, mirror, mountain road); channel rule says no photoreal AI footage presented as real. The package recommends answering "Yes" to Studio's altered or synthetic content question and the description says some scenes use AI-generated imagery. Owner decides.
- ElevenLabs files cannot be downloaded into the cloud container (the proxy blocks elevenlabsusercontent.com). One 3 s sea ambience was generated on 2026-11-04 and stays in the owner's ElevenLabs flow; the long video's sound was written in code instead. For future voiceovers, download on the owner's computer or put `ELEVENLABS_API_KEY` in `.env` and test whether the API host is reachable.
- End screen for "The Impossible Escape": Studio refuses to save a Subscribe element alone ("at least one element must be a video or playlist"). Add it later from Studio, Content, the video, Editor, End screen, once there is a second video.
- Custom thumbnails for the channel are blocked until the owner verifies the YouTube account with a phone number (needs a new SIM). "The Impossible Escape" went live without its cover (`the-impossible-escape-thumbnail.jpg`); upload it as soon as the channel is verified, since it can be swapped at any time. Views in the first days may be lower until then.
- "The Impossible Escape": the explanation cards simplify the physics (lift, stability, controls). Read them once before publishing.

- Confirm that the handle `@getbrainmaxx` was actually saved in YouTube Studio, and that the same handle is free on TikTok and Instagram.
- Daily time the owner can spend on review, approval and uploading to three platforms.
- `channel/voice.md` now holds defaults taken from the channel decisions; the owner still needs to fill the lines marked OWNER TO FILL (viewer picture, narrator style, own phrases).
- Video #1 was targeted for Tue 2026-11-03 but the script is not approved yet, so the calendar slips by one working day unless it is approved today.
- Hooks for ideas #4 and #12 should be rewritten before recording. For #9 the recommended hook (83, STRONG) and the script are in `channel/scripts/09-stop-rereading.md`; the owner has not approved them yet, and the "10 study methods" source (Dunlosky et al., 2013) was re-checked on 2026-11-06 against the APS page and the paper's abstract (ratings confirmed: practice testing and distributed practice high; rereading, highlighting, summarization low). The full text on sagepub is not reachable from the cloud container, so the narrated line "words look familiar" is still unverified.
- Real YouTube trend data is not reachable from the cloud container (YouTube is blocked for shell and WebFetch). Claude in Chrome worked on 2026-11-04 once the extension was signed in to the same Claude account; vidIQ connector and a YouTube Data API key (`YOUTUBE_API_KEY` / `YT_API_KEY`, run on the owner's Mac) are the other options. The nikhilbhansali/youtube-data-skills trend scanner has not been vetted or installed.
- Scientific sources listed in `channel/ideas/first-12-ideas.md` are to be verified before publishing.
- Not testable in the cloud container, so unverified: Blender and After Effects MCP against the real apps, 21st MCP (needs a key), faster-whisper transcription (model download from huggingface.co is blocked here), shadcn/magicui/motion-primitives registries, motion-canvas and revideo scene renders. Test them on the owner's computer.
- Remotion license: free for individuals and small teams, paid for larger companies. Read `/remotion-license` before using Remotion in anything monetized.
- Does the owner have an ElevenLabs account and API key (`ELEVENLABS_API_KEY` in `.env`)? Needed for the voiceover step.
