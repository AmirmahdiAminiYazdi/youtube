# 09 Stop Rereading: motion graphic (Short, 1080x1920, 43 s)

Voice: `channel/voiceover/09-stop-rereading.mp3` (owner's ElevenLabs take, 42.0 s). Every visual and
sound event is placed on a word time from `09-stop-rereading.words.json` (ElevenLabs Scribe).

| Time (s) | Spoken | Picture |
| --- | --- | --- |
| 0-2.5 | "Before your test, stop rereading." | Frame 0 is the hook and thumbnail: notes page, 3D "STOP / REREADING", "ONLY 2 OF 10 STUDY METHODS RATED HIGH". Punch on "stop", strike line on "rereading". |
| 2.5-6.4 | "Only two of 10 study methods rated high. Which two?" | Camera rises, ten 3D cards land face-down ("?"), ripple on "Which two?". |
| 6.9-10.8 | "In 2013, researchers reviewed 10 popular ways to study." | Source line (Dunlosky et al., 2013). Eight cards flip; the two high ones stay hidden. |
| 11.2-14.5 | "Rereading, highlighting, and summarizing all rated low." | Each low card is stamped and falls on its word; two more low cards, then three moderate ones; odometer 10 to 2, "ONLY 2 LEFT". |
| 15-21.4 | "Rereading feels easy... pull it from memory." | Back to the notes: highlights glow on "familiar", the page dissolves with a teal edge, blank page and cursor. |
| 21.8-24.2 | "The first high method is practice testing." | Two hidden cards; the first flips on "practice". "1 / 2". |
| 24.6-30.6 | "Close your notes... check what you missed." | Example (water cycle): notebook closes, recall card typed from memory, notebook reopens, three ticks, "Collection" marked missed. |
| 31-32.4 | "The second is spacing." | Second card flips. "2 / 2". |
| 32.9-38 | "Study the same topic on different days instead of all at once. It gets its own video soon." | Calendar: one tall "all at once" block, three spaced blocks on Mon, Wed, Fri, the tall block sinks. |
| 38.4-39.5 | "Try the first one tonight." | Practice-testing card in the centre. |
| 40.3-42.85 | "Save this for your next test." | Card turns into a 3D bookmark; end card with the Brainmaxx mark, Subscribe (tapped), Like, Comment, Save. |
| 42.85-43 | | Frame 0 again, so the loop back to the start is seamless. |

Files: `index.html` (root, canvas + hosts + audio), `assets/world.js` (three.js world, pure function of
time), `compositions/hud.html` (top band), `compositions/captions.html` (generated), `compositions/cta.html`
(end card). Card ratings checked against the APS abstract of Dunlosky et al. 2013.

## Rebuild

```bash
bash scripts/fetch-vendor.sh                     # gsap 3.15.0, three 0.187.0, opentype.js 1.3.4 (not committed)
cp ../../voiceover/09-stop-rereading.mp3 assets/audio/vo.mp3
python3 scripts/build_captions.py                # captions from the word timings
python3 scripts/make_sfx.py assets/audio/sfx.wav  # sound effects, fixed seed
export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1 HYPERFRAMES_BROWSER_PATH=/usr/bin/google-chrome
npx hyperframes@0.9.8 render --format mp4 --quality delivery --fps 30 --workers 1 -o renders/raw.mp4
bash scripts/finish.sh                           # mix, -14 LUFS, H.264 yuv420p bt709, faststart
```

In the cloud container start the render with `setsid nohup ... &`; a plain background job is cancelled
when the shell exits. Software GL renders about one frame per second.
