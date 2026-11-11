# special-water-well (motion project)

Cinematic 3D Short, 1080x1920, 55.05 s. Scenario: `channel/scripts/special-water-well.motion.md`.

- `assets/cine.js`: the whole 3D scene (floating earth block, drill rig, casing, grout, screen, pump, tank), shot list and story keyframes on the take-1 word times.
- `compositions/hud.html`: hook title, FAILS meter, part pills, strainer badge, pump ON/OFF toggle, payoff (hand-written).
- `compositions/captions.html`: `python3 scripts/build_captions.py`; `compositions/cta.html`: end card (from `build_timeline.py`, duration patched to 2.944 s).
- `index.html`: hand-written (cover image `assets/cover.jpg` 53.9-54.9 s, loop frame 54.9-55.05 s). Do not re-run `build_timeline.py` without restoring these.
- Sound: `python3 scripts/make_sfx_well.py assets/audio/sfx.wav`.

Rebuild:
```bash
bash scripts/fetch-vendor.sh
cp ../../voiceover/special-water-well.mp3 assets/audio/vo.mp3
python3 scripts/make_sfx_well.py assets/audio/sfx.wav
export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1 HYPERFRAMES_BROWSER_PATH=/usr/bin/google-chrome
npx --yes hyperframes@0.9.8 render --format mp4 --quality delivery --fps 30 --workers 2 -o renders/raw.mp4   # about 80 min here
bash scripts/finish.sh
```
`assets/cover.jpg` is the owner's cover (`channel/thumbnails/special-water-well.cover.png`) resized to 1080x1920.
