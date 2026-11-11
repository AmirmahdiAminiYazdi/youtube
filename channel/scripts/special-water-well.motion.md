# Motion scenario: special-water-well (cinematic, timed to the voiceover)

Voiceover: take 1, ElevenLabs Eleven v4, voice "Jon - Catalyst", spoken 0.00-53.76 s (`channel/voiceover/special-water-well.words.json`, Scribe). Every time below is a word time from that file.
Owner decisions (2026-11-11): floating earth block (cutaway diorama), every problem is shown as an animation before its fix, voice take 1, the owner's cover image is held for about 1 s at the end.
Engine: the cinematic shot-based Three.js approach of `special-bicycle-brakes` v2 (`assets/cine.js`): SHOTS with camera keys, story-state keyframe tables on word times, PBR, bloom only on emissive, grain and vignette. Not the flat v1 template look the owner rejected.

## Look

- World: one block of earth (about 5.6 x 4.2 x 3.2 units) floating in the deep navy void (#071226 to #0B1B33 gradient, fog), soft teal rim light from behind, a warm-white key from the top left, slow drifting dust motes. A thin glowing teal outline runs around the cut edges of the block (signature look, reads at phone size).
- Front cut face, top to bottom: topsoil (#1A2A44, rough top edge, small teal-grey grass tufts on top), clay (#2A4466, smooth), sand (#34507A with off-white grain speckle), AQUIFER (teal #19C3B1 at about 35 %, the only layer that glows; bright pore dots drift slowly sideways = groundwater moving), bedrock (#0F1F38, cracked).
- Surface: compact drill rig (mast, cab, spinning bit), a small cutaway house at the back right with a tap and a glass.
- Materials: steel casing = brushed metal with reflections; grout = matte warm white; screen = teal metal with real slots; pump = glossy orange (the only orange object); tank = glossy warm white; water = teal, emissive in flow lines only.
- Orange only for: the pump, warning flickers, sparks from the drill bit.
- No people (the neighbour gag is the bucket alone), no photoreal footage.

## Motion graphics layer (HUD and overlays)

- FAIL METER, top band (y 196-420): five hexagon slots labelled `FAILS`, empty at first. Each problem lights its slot orange with a small x and a shake; when the fix lands the slot flips to teal with a check. At the payoff all five are teal. This is the visual answer to the hook "it fails 5 ways".
- STEP CHIP: small `STEP n / 6` next to the meter.
- PART PILL: one name pill per part, with a thin leader line drawn from the pill to the part (draw-on in 0.25 s), pill clamped inside the 80 % title-safe width.
- X-RAY SCAN: a horizontal teal scan line that sweeps down the cut face and reveals the strata names with leader lines (SOIL, CLAY, SAND, AQUIFER).
- DEPTH RULER: unlabelled tick ruler along the left edge of the block that scrolls as the camera goes down (no numbers: no invented depths).
- FLOW LINES: animated dashed teal lines that show where water moves (into the pipe, up the pipe, to the tap).
- Kinetic type: the hook number "43 MILLION" in Outfit Bold, 3D extruded with a teal edge glow.
- Captions: the existing word-by-word captions at y 1178-1328. Nothing in the bottom 400 px.

## Shots

| # | Time (s) | Words | Picture | Camera | Cause -> effect | Motion graphics |
|---|---|---|---|---|---|---|
| 1 | 0.00-3.52 | "You're building the hole 43 million Americans drink from." | Frame 0 (thumbnail, held 0.6 s, no flash): the floating block, the rig on top, the bit about to touch the ground. At 0.72 ("hole") the bit bites in, sparks and dust | slow push-in from a 3/4 high angle | bit touches -> dust and sparks | Title `43 MILLION` / `DRINK FROM IT.` is already on screen at frame 0; at 1.12 ("43") the number punches (scale 1.0 -> 1.12 -> 1.0) with a teal shock ring |
| 2 | 3.52-7.64 | "Before dinner, it fails 5 ways. How do you stop it?" | The block turns a little; on 5.36 ("5") the five FAIL slots drop in one by one, each with a tiny tick sound | fast 30 degree arc around the block, then on 6.62 ("How") a push-through into the cut face | | FAIL METER appears (0 / 5), title leaves upward |
| 3 | 7.64-14.80 | "Water hides underground in sand and rock layers called aquifers. So you drill down to one. That's the borehole." | X-ray scan line sweeps down the face, layers get their names; on 10.88 ("aquifers") the aquifer layer lights up and its pore dots start to flow; on 12.36 ("drill") the bit drills down the shaft, cuttings fly up | tracking down the cut face with the bit, depth ruler scrolls | bit goes down -> shaft opens -> reaches the glowing layer | strata labels, `BOREHOLE` pill at 14.0, STEP 1 / 6 |
| 4 | 14.80-19.76 | "But loose ground caves in. So you slide a pipe down the hole. That's the casing." | On 15.76 ("caves") chunks break off the sand and clay walls and fall, the shaft narrows; slot 1 lights orange; on 17.24 ("slide") the steel casing slides down with a heavy clang and the falling chunks stop against it | medium on the upper shaft, a short camera shake on the cave-in | loose wall -> chunks fall -> pipe holds the wall | FAIL 1 orange, then teal check on 19.12 ("casing"), `CASING` pill, STEP 2 / 6 |
| 5 | 19.76-26.40 | "Now rain seeps down the outside of the pipe. So you fill the gap with cement or clay. That's the grout seal." | Camera rises to the surface; rain streaks fall, drops hit the ground; on 20.64 ("seeps") a dark dirty trail runs down the thin gap outside the pipe toward the aquifer, and the teal of the aquifer goes slightly grey where it lands; slot 2 orange; on 23.04 ("fill") warm-white grout pours into the gap from the top and fills it like a level rising; the dirty trail is pushed out and the aquifer clears | whip tilt up to the surface, then a slow tilt down along the gap | rain -> seepage down the gap -> grout fills the gap -> seepage blocked | FAIL 2 orange -> teal at 25.44 ("grout"), `GROUT SEAL` pill, STEP 3 / 6 |
| 6 | 26.40-34.00 | "In sandy ground, water drags sand in. So a slotted pipe holds the sand back, like a strainer. That's the well screen." | Macro at the open bottom of the pipe inside the aquifer: flow lines pull water in and sand grains ride along, the pipe starts filling with sand; slot 3 orange; on 29.6 ("slotted") the teal screen section slides onto the pipe bottom; water passes through the slots, grains bounce off them; on 31.84 ("strainer") a small 2D line icon of a kitchen strainer pops beside the screen (the analogy) | macro, slight orbit, shallow depth of field on the grains | water flow -> sand in -> screen -> water in, sand out | FAIL 3 orange -> teal at 33.28 ("screen"), strainer icon, `WELL SCREEN` pill, STEP 4 / 6 |
| 7 | 34.00-40.64 | "Now the water sits far below. A pump built for underwater work pushes it up. That's the submersible pump." | Pull back: the whole long dry pipe, water level far down; a dotted vertical arrow from the water to the surface with a pulsing "?"; slot 4 orange; on 36.24 ("pump") the orange pump drops down the pipe on its cable and lands in the water with a ripple; on 37.92 ("pushes") a glowing teal water column rises up the pipe | fast pull back, then follow the pump down, then whip tilt up with the rising water | water deep -> pump goes in -> water rises to the surface | FAIL 4 orange -> teal at 39.36 ("submersible"), `SUBMERSIBLE PUMP` pill, STEP 5 / 6 |
| 8 | 40.64-47.12 | "Now the pump starts whenever you pour a glass. So a tank holds pressurized water. That's the pressure tank." | Surface by the house: the tap pours into a glass; at each pour the pump far below blinks orange (power LED) and an ON / OFF toggle graphic flicks on-off-on-off, getting faster; slot 5 orange; on 43.84 ("tank") the white tank drops in beside the house with a soft bounce, a pipe connects, a gauge needle rises (dial without numbers); the next pour does not wake the pump, the LED stays calm | medium on the house, cut down to the pump LED and back | every pour -> pump starts -> tank stores pressure -> pump rests | FAIL 5 orange -> teal at 46.16 ("pressure"), `PRESSURE TANK` pill, STEP 6 / 6 |
| 9 | 47.12-50.80 | "You built a water well. The neighbor brings a bucket." | Hero reveal: the block turns slowly, the full well in cutaway, flow lines glowing from the aquifer up through the screen, pump and pipe to the tank and the tap, the glass fills; on 49.28 ("neighbor") an empty bucket slides in from the right edge and stops next to the house with a small wobble | pull back and slow orbit to the hero 3/4 view | | all five FAIL slots teal, title `YOU BUILT A WELL.` / `ONE PROBLEM AT A TIME`; a tiny bucket pop sound |
| 10 | 50.80-54.00 | "Save this for when someone asks where well water comes from." | End card over the dimmed block (existing Brainmaxx card: mark, Subscribe, Like, Comment, Save, with Save highlighted) | static | | |
| 11 | 54.00-55.00 | (silence) | The owner's cover image, full frame 1080 x 1920, held 1.0 s with a 4 % slow zoom | static | | |
| 12 | last 0.15 s | | Frame 0 returns so the Short loops | | | |

Total about 55.2 s. Transitions: push-through into the cut face (2 -> 3), whip tilts (4 -> 5, 7 inside the shot), hard cuts on the voice beats elsewhere.

## Sound (made in code, no music bed)

Drill whir with grit (shot 1 and 3), low rumble and rock clatter (cave-in), metal clang (casing), rain hiss and drip (shot 5), thick pour (grout), sand hiss (shot 6), splash and ripple (pump lands), rising water swell, pump click on each pour (getting faster), soft thunk (tank), short teal "check" chime each time a FAIL slot flips, whoosh on whips and the push-through, a small wooden bucket knock (gag). Voice on top, loudness by `finish.sh` (-14 LUFS area).

## Checks before the full render

Snapshots at 0, 1.3, 5.6, 11.2, 14.4, 16.2, 18.6, 21.2, 24.2, 28.6, 31.9, 35.4, 38.4, 42.0, 45.0, 48.4, 49.8, 52, 54.5 s. Frame 0 readable as a thumbnail, every pill and leader line inside the frame, the FAIL meter readable, nothing in the bottom 400 px. Then render, `finish.sh`, `scripts/check_short.py` 0 FAIL.
