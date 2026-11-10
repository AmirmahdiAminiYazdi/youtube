# Pipeline commands, stage by stage

All paths from the repo root (`/home/claude/youtube` in the cloud container). `S=.claude/skills/step-by-step-short`.

## 0-1. Fit test, slug, fact sheet

- Next free idea number: `channel/ideas/first-12-ideas.md` (and `ls channel/scripts channel/motion`). Outside the three series: `special-<slug>`.
- Facts: WebSearch (standard first, extended if thin). Two independent sources per claim (textbook or university or standards body, not content farms). Write `channel/research/NN-slug.facts.md`: one line per claim, the sources with URL and date checked, and a "simplified in the video" list. A claim without two sources is cut or softened ("roughly", "usually").
- If the claim touches health, money, law or safety-critical advice: stop, tell the owner, do not make the Short.

## 2. Script

```bash
cp $S/references/example-airplane.beats.json channel/scripts/NN-slug.beats.json   # start from the example, rewrite everything
python3 $S/scripts/script_budget.py channel/scripts/NN-slug.beats.json
python3 .claude/skills/yt-script/hookscore.py --hook "<one hook per call>"
```

Write `channel/scripts/NN-slug.md` (readable version: hook table with the three variants and scores, beat table: time estimate, narration, on-screen, part name; original element; claims check; upload notes). Model: `channel/scripts/09-stop-rereading.md`. Run `humanizer` on narration only, then re-run the budget gate.

## 3. Gate A (owner)

Show: final narration text (code block), the beat list (problem -> part -> name), the one analogy, the hook options with scores, and the look in words. Ask only for approval or edits. Then: "generate the voiceover in ElevenLabs with exactly this text and send me the mp3 and the word timing file".

## 4. Voiceover hand-off

Owner puts `NN-slug.mp3` and `NN-slug.words.json` in `channel/voiceover/` (format of `09-stop-rereading.words.json`: `{"duration_s": ..., "words":[{"w","s","e"}]}`; ElevenLabs Scribe export). Check: `ffprobe` duration 40-60 s, word count within 10 % of the script. Different wording in the take: update beats.json to match the take, not the other way around, unless a claim changed.

## 5. Scaffold and design

```bash
python3 $S/scripts/scaffold_short.py channel/scripts/NN-slug.beats.json
bash channel/motion/NN-slug/scripts/fetch-vendor.sh
```

The scaffold copies the template, fonts and marks from the Brand Pack, writes `beats.js`, `hud.html`, `cta.html`, `index.html`, and (without a voiceover) a silent estimated timeline. Then edit `BUILDERS` and the part data. Snapshots:

```bash
export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1 HYPERFRAMES_BROWSER_PATH=/usr/bin/google-chrome
cd channel/motion/NN-slug
python3 scripts/make_sfx.py assets/audio/sfx.wav          # the root references it, check fails without it
npx --yes hyperframes@0.9.8 snapshot --at 0,<each part t + 1>,<payoff t + 1>,<cta + 1.5> --no-end -o <scratchpad>/snap --timeout 120000
```

Read `<scratchpad>/snap/contact-sheet.jpg` with Read. Check: frame 0 is a usable thumbnail (hook text readable, base object clear), every pill inside the frame and readable, no part hidden by another, the build not cropped, nothing in the bottom 400 px. Note: the full `npx hyperframes check` takes more than 8 minutes here (459 craft frames) and prints progress lines; run it in the background with `setsid nohup ... > /tmp/check.log &` or rely on `lint` plus snapshots, and say which one you did.

## 6. Align, render, finish

```bash
cd channel/motion/NN-slug
cp ../../voiceover/NN-slug.mp3 assets/audio/vo.mp3
python3 scripts/build_timeline.py          # reads ../../voiceover/NN-slug.words.json; warns if < 85 % of the script is found
python3 scripts/build_captions.py
python3 scripts/make_sfx.py assets/audio/sfx.wav
export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1 HYPERFRAMES_BROWSER_PATH=/usr/bin/google-chrome
setsid nohup npx --yes hyperframes@0.9.8 render --format mp4 --quality delivery --fps 30 --workers 1 -o renders/raw.mp4 > renders/render.log 2>&1 &
# wait; progress in renders/render.log. About 1 frame per second: 58 s = about 30 min.
bash scripts/finish.sh
cd ../../.. && python3 scripts/check_short.py channel/motion/NN-slug/renders/NN-slug.mp4
```

`check_short.py` must show 0 FAIL (format, length, loudness -17..-13 LUFS, silent tail, flash frame in the first 1.5 s, renderer tag). Open its contact sheet. Send the master with `SendUserFile` (it is not committed).

## 8. Package

Model: `channel/published/09-stop-rereading.md` (Persian explanation, English text in code blocks). Contents: search check (Claude in Chrome: autocomplete and Shorts results for the main query), title with `yt-package/title.py` (three types: search, curiosity, combined), description (first line has the main phrase; source lines; "Narration is an AI-generated voice. The animation was made by Brainmaxx."; 3-4 hashtags <= 60 chars), tags, pinned comment (one question), SRT from `assets/timeline.json` words, Studio settings (not for kids; **altered content: Yes** because of the AI voice; Education), cover frame at 0:00, TikTok and Reels captions, post-publish test criteria (48-96 h: Viewed vs Swiped Away, average % viewed, replays, saves). `status: ready (not published)` on the first lines; the owner changes it to `status: published`.

## 9. Close the session

Update `channel/STATUS.md` (Current focus: what was made, where, what is open; Decisions made; Open questions), `python3 scripts/refresh_status.py`, `git add` (no renders, no vendor, no mp3 from third parties), commit with the session trailers, push. Never edit between the AUTO markers.

## When something fails

- `build_timeline.py` says the take differs: fix text, do not shift times by hand.
- A part is invisible or off-screen: check `pos` and `size` units; the base sits at the origin; look at the snapshot, not the numbers.
- Render hangs or Chrome runs out of memory: one render at a time, `--workers 1`, no other Chrome process.
- `check_short.py` FAIL: fix the cause (flash frame: hold frame 0 for the first 0.6 s; loudness: `finish.sh` loudnorm line), render again.
- Can't download the mp3: ask the owner; do not retry the blocked host.
