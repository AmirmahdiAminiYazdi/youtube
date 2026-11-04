# The Impossible Escape: motion-graphics pass (long version)

The owner's finished film (`the-impossible-escape-youtube.mp4`, 1920x1080, 3:40) gets an additive
motion-graphics pass. Nothing in the film is cut or reordered; the delivered file is the film plus:

| Layer | Where | What |
| --- | --- | --- |
| 3D cold open | `opener/` | 9 s three.js scene before the film: low glide over a dusk sea to the island, text "NO RESCUE." / "NO WAY OFF." / "UNLESS YOU BUILD ONE." |
| Hook | `overlays/compositions/hook.html` | Film 0:00-0:09: "ONE WOODEN CRATE. ONE BOAT ENGINE." then "CAN IT FLY?" |
| Chapter titles | `overlays/compositions/chapters.html` | PART 01-09, lower left, at each section start |
| Build log | `overlays/compositions/hud.html` | Top-left blueprint that fills in part by part (0/9 to 9/9) |
| Explanation cards | `overlays/compositions/cards.html` | Top right, 7 cards: wing cross-section, tail, fin, elevator, ailerons, flaps, dihedral |
| Recap | `overlays/compositions/recap.html` | Film 3:10-3:21: labelled blueprint "FROM CRATE TO AIRPLANE" |
| Sound | `scripts/make_sfx.py` | Sea, wind, drone, hits, riser, impact, UI whooshes and chimes, all generated in code |
| Grade | composite step | `eq` + gentle S-curve + soft vignette on the film only (graphics stay ungraded) |

All overlay times are film time in seconds, taken from the burned-in subtitles (detected per frame).
Palette is sampled from the film's own title card: cream `#F0E7DC`, copper `#E4B98D`, bars `#070B0F`.
Font: Montserrat (bundled with HyperFrames, same family as the film's title and end cards).

## Rebuild

```bash
bash scripts/fetch-vendor.sh                      # gsap 3.15.0 and three 0.187.0 into assets/vendor (not committed)
export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1 HYPERFRAMES_BROWSER_PATH=/usr/bin/google-chrome
(cd overlays && npx hyperframes@0.9.8 render --format png-sequence --fps 30 -o ../renders/overlays_png)
(cd opener   && npx hyperframes@0.9.8 render --format mp4 --quality delivery --fps 30 --workers 1 -o ../renders/opener.mp4)
python3 scripts/make_sfx.py renders/sfx.wav
```

Then composite with ffmpeg: opener, then the film (grade, overlay the PNG sequence, 0.35 s fade in),
film audio delayed by 9 s and mixed with `sfx.wav` (no normalisation), limiter at -0.6 dB, H.264
CRF 17, bt709 tags, `+faststart`. Run the two renders one at a time: two software-GL Chromes at once
ran out of memory in the cloud container.

Renders and media are not committed (`.gitignore`).
