---
name: step-by-step-short
description: Make a Brainmaxx "Built Step by Step" Short (45-60 s, 9:16, faceless, 3D) from one topic. Use whenever the owner gives a topic, thing or object and wants it explained by building it part by part, or says "airplane-style Short", "step by step Short", "build it from scratch video", "do the airplane format", "make a Short about how X works". Runs fact sheet, scored script, approval gate, voiceover hand-off, HyperFrames 3D build, QA gate and upload package.
---

# Built Step by Step (Brainmaxx Shorts)

Input: a topic. Output: a finished 1080x1920 Short in `channel/motion/NN-slug/renders/`, its script, and an upload package in `channel/published/`. The owner publishes by hand.

## Why this format (and how sure we are)

The airplane Short ("You're stranded on an island. You bolt a boat engine onto a wooden crate...") had the best average view duration of the channel's first four Shorts (70.5 %, about 67 s per view, roughly 1,560 watch-minutes), while views were flat (about 1.3-1.5k each). That is **one video on a new channel**: retention evidence, not a proven growth formula. Treat the first 5-8 Shorts made with this skill as a test and read Viewed vs Swiped Away, average % viewed and replays before calling it the channel style. Details and the formula: `references/formula.md`.

## The formula in six lines

1. **Hook = a "you" scenario in the first sentence**, with a concrete object and a small joke ("Congratulations!"), on screen at frame 0 as two big lines.
2. **A base object that is obviously wrong** for the job (a crate with an engine).
3. **A chain**: every new part fixes the exact problem the previous part created. The viewer hears the problem first, then the part, then its real name.
4. **A callout pill with the real name** pops on the part ("VERTICAL STABILIZER"); an everyday analogy at the hardest part ("like the feathers on an arrow").
5. **Payoff** where the finished thing is named ("You built an airplane."), plus one small gag.
6. **One ask** at the very end ("Save this for the next time someone asks...") with the end card. Frame 0 returns in the last 0.15 s so the Short loops.

## Fit test (do this first, 2 minutes)

The topic fits if it can be **built from 5-9 named parts where each part solves a problem the last one created**: an airplane, a bicycle brake, a lock, a toilet cistern, a heat pump, a camera, a bridge, a coffee machine. It does **not** fit: opinion topics, psychology effects, pure how-to software steps, anything where the "parts" are not physical or modelable, medical or financial advice. For those, say so in one line and route to the right skill (`yt-script` for Mind Hacks and Learn Faster, a screen demo for AI in 60). Do not force a topic into the chain.

## Stages and gates

Never skip a gate. Work from `channel/STATUS.md` "Current focus", and read `channel/voice.md` (the yt-* skills' `~/.claude/youtube/voice.md` is this file). Idea number: take the next free `NN` from `channel/ideas/first-12-ideas.md`; a topic outside the three series is `special-slug` until the owner decides on a fourth series (open question in STATUS.md). Details and commands for every stage: `references/pipeline.md`.

| # | Stage | Output | Gate |
|---|---|---|---|
| 0 | Fit test, slug, series | one line to the owner | none |
| 1 | **Fact sheet**: WebSearch two independent sources per claim; the chain of parts must be true, simplifications named | `channel/research/NN-slug.facts.md` | claims with no two sources are cut or softened |
| 2 | **Script**: `beats.json` + readable `channel/scripts/NN-slug.md`; 3 hook variants scored with `yt-script/hookscore.py`; `humanizer` on the narration; `scripts/script_budget.py` | script files | `script_budget.py` 0 FAIL |
| 3 | **GATE A: owner approves the script** (and the 3D look in words: base object, 6-8 parts, colours) | approval in chat | owner says yes |
| 4 | **Voiceover hand-off**: owner generates the mp3 in ElevenLabs with the approved text and sends mp3 + word timings (Scribe) into `channel/voiceover/NN-slug.*`. Until then build with `--estimate` | `NN-slug.mp3`, `NN-slug.words.json` | files exist |
| 5 | **Scaffold and design the parts**: `scripts/scaffold_short.py`, then write real `BUILDERS` in `assets/world.js`; snapshot and LOOK at 6-8 frames | project in `channel/motion/NN-slug/` | every part readable at phone size, labels inside the safe area |
| 6 | **Align and render**: `build_timeline.py`, `build_captions.py`, `make_sfx.py`, `npx hyperframes@0.9.8 check`, snapshot review, full render (about 1 frame per second in this container), `finish.sh` | `renders/NN-slug.mp4` | `scripts/check_short.py` 0 FAIL |
| 7 | **GATE B: owner watches the master** and approves or lists fixes | approval | owner says yes |
| 8 | **Upload package** (`yt-package`, `yt-seo`, `yt-chapters` not needed for Shorts): title, description, tags, pinned comment, SRT, Studio settings incl. "altered content: Yes" for an AI voice, TikTok and Reels captions | `channel/published/NN-slug.md` | claims match the fact sheet |
| 9 | Status: update `channel/STATUS.md` (Current focus, Decisions, Open questions), `python3 scripts/refresh_status.py`, commit, push | commit | none |

Between gates keep the owner's attention for decisions only. If the owner is away, finish the stage, write the decision they must make at the top of your message, and stop at the gate.

## How to write the script (stage 2)

Use `references/beats-schema.md` for the exact fields. Rules that matter most:

- **Words**: 130-150 words total for 45-60 s (the channel measures about 160 wpm including pauses). Hook <= 22 words. Each step 8-24 words: problem sentence, then the part and its name. Exactly one ask, last.
- **Problem before part**: the narration of step *n* names the problem the part of step *n-1* created, then the new part. `creates` and `solves` in beats.json must chain; `script_budget.py` checks it.
- **Anchor word**: `anchor` is the word on which the part pops (usually its name). Put the part name late in the sentence, so the problem is heard first.
- **Analogy**: one everyday comparison at the hardest part. Plain words, no jargon without its name given right after.
- **Original element** (channel rule): the build itself counts only if the chain is the point of view; say it in `original_element` in one sentence.
- **No invented numbers or sources.** Any digit in the narration needs an entry in `sources` and the fact sheet. "Six parts" is a count, not a claim. No medical or financial advice. Voice: second person, calm, short sentences, no "guys", "unlock", "game-changer", no "like and subscribe", no intro.
- **Honest simplification**: if a step simplifies the real mechanism, say "roughly" in the narration or list it in the package description. Never state something you could not verify with two sources.
- Run `humanizer` on the narration. Keep every claim intact when it rewrites.

Hook choices: write three, one per type (scenario, stakes, curiosity), score all with `hookscore.py`, and tell the owner the scores are a rough heuristic (target 55+, 72+ strong; the airplane hook's own scenario style scores low on that tool, so judge scenario hooks by reading them, not by the number alone).

## How to build the picture (stages 5-6)

The template (`assets/template/`) is a tested starter, not a finished look: a generic chain engine in `assets/world.js` that pops each part on its anchor word, frames the camera on what is built so far, draws a name pill clamped inside the safe area, a bloom/vignette/grain grade, a hook title, a "STEP n / N" counter with a "PROBLEM: ..." line, a payoff title, and the Brainmaxx end card. What you must do per topic:

1. **Blueprint first**: on paper (in the script file) list each part with name, kind, rough size, position relative to the base, rotation, tone. Place parts where they attach in the real thing; the base object sits at the origin; the whole build must fit about 6 x 3 units.
2. **Replace the primitive stand-ins**: edit `BUILDERS` in `assets/world.js` so a wing looks like a wing (a rounded plate with a rounded tip, not a flat box), a tank like a tank. Use `RoundedBoxGeometry`, `ExtrudeGeometry`, `LatheGeometry`, `CylinderGeometry`, `TorusGeometry`. 3D skills: `threejs-geometry`, `threejs-materials`, `threejs-lighting`.
3. **Safe zones** (1080x1920): HUD band y 196-420, the build y 560-1100, captions y 1178-1328 (built by `build_captions.py`), keep the bottom 400 px quiet (platform buttons). Pills are clamped to the 80 % title-safe width automatically.
4. **Look at frames before rendering**: `npx hyperframes@0.9.8 snapshot --at <t1,t2,...> -o <scratchpad dir> --timeout 120000` and read the contact sheet. Draw at least frame 0 (it is the thumbnail), each part's landing, the payoff and the end card. Fix, then render once.
5. Full render only after stage 6's `check` and snapshots. Run with `setsid nohup ... &` and `--workers 1`, one render at a time (software GL, about 1 frame/s; 58 s is about 30 minutes). Commands: `references/pipeline.md`.

## Hard rules (from CLAUDE.md, repeated because they bite)

- `npx hyperframes@0.9.8` only, never `@latest`; telemetry off; never `publish`, `cloud`, `lambda`, `cloudrun`, `auth`, `feedback`.
- No CDN scripts. `scripts/fetch-vendor.sh` copies gsap, three, opentype into `assets/vendor` (not committed). Fonts are Outfit from the Brand Pack.
- Palette navy `#0B1B33`, teal `#19C3B1`, off-white `#F4F1EA`; orange `#FF7A3D` only for sparks and accent parts. Never stretch or rotate the logo mark.
- Renders, vendor and `.hyperframes` are git-ignored. Do not commit an mp3 you did not create or video files.
- No photoreal AI footage; the 3D scene is clearly animation. The narration is an AI voice: disclose it (description line and Studio "altered content: Yes", as in `channel/published/09-stop-rereading.md`).
- ElevenLabs files cannot be downloaded into this container (proxy blocks elevenlabsusercontent.com). Do not retry; ask the owner for the mp3 and words. If `ELEVENLABS_API_KEY` is in `.env`, test the API host once before relying on it.
- YouTube is blocked for shell and WebFetch; Claude in Chrome works for live checks.

## What to tell the owner (Persian speaker, channel is English)

Write to the owner in the language they write in (Persian, right-to-left, no jargon). Keep the English script text in code blocks they can copy. After stage 3 say plainly what you need from them (approval, then the mp3). At the end report: what was made, the check results, what is untested, and one next step. Never claim the Short will perform; the format is a hypothesis with one data point.

## Files in this skill

- `references/formula.md` evidence and the beat-by-beat formula; `references/pipeline.md` commands per stage; `references/beats-schema.md` the beats.json fields; `references/example-airplane.beats.json` a worked example (6 steps, passes the budget gate).
- `scripts/script_budget.py` script gate; `scripts/scaffold_short.py` creates the project; `assets/template/` the project template (engine, `build_timeline.py`, `build_captions.py`, `make_sfx.py`, `finish.sh`, end card).
