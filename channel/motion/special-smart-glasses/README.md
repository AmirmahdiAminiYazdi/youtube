# special-smart-glasses (motion project)

Cinematic 3D Short, 1080x1920, 47.5 s, in the look of the Fable 5.2 Short (the Fable and AI-lies projects are on the owner's Mac, not in this repo, so the robot and HUD were rebuilt here from screenshots of the published video). Shot list: `channel/scripts/special-smart-glasses.md`.

- `assets/cine.js`: the whole 3D scene (floating exam-hall slab, Brainmaxx robot with canvas screen faces, smart glasses built part by part: mics, camera, speakers, phone + cloud, LED), shots and story on the take-2 word times. Post: depth of field, sanitize pass (Inf/NaN), bloom, grade.
- `compositions/hud.html`: hook, badges, build meter, problem and part pills, 12 MP, viewfinder, payoff, confession card, YES/NO question (hand-written).
- `compositions/cta.html`: end card (36.9-41.15 s). `compositions/captions.html`: `python3 scripts/build_captions.py`.
- `index.html`: hand-written; cover `assets/cover.jpg` (owner's image, fit and pad) 46.35-47.35 s; frame 0 returns 47.35-47.5 s.
- Sound: `python3 scripts/make_sfx_glasses.py assets/audio/sfx.wav`.

Rebuild:
```bash
bash scripts/fetch-vendor.sh
cp ../../voiceover/special-smart-glasses.mp3 assets/audio/vo.mp3
python3 scripts/make_sfx_glasses.py assets/audio/sfx.wav
export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1 HYPERFRAMES_BROWSER_PATH=/usr/bin/google-chrome
# keep the parent process alive (render cancels when its parent exits)
setsid -f nohup bash -c 'npx --yes hyperframes@0.9.8 render --format mp4 --quality delivery --fps 30 --workers 2 -o renders/raw.mp4' > /tmp/render.log 2>&1
bash scripts/finish.sh
```
Render here: about 2.5 s per frame with 2 workers, about 1 h.
