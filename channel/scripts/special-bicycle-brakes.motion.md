# Motion scenario: special-bicycle-brakes (v2, cinematic)

Voiceover is fixed (59.56 s, `channel/voiceover/special-bicycle-brakes.words.json`). Every shot below is timed to its words.
Rules: one hero object per shot, filling 60-85 % of the frame width; real cause -> effect motion in every shot; glossy PBR metals,
glass, coloured fluid; heat glows (the story is "turns the hill into heat"); minimal text (3D hook numbers, one small name pill per part,
captions); orange only for sparks and heat accents; no photoreal AI footage; no people.

Look: deep navy backdrop with a soft teal rim light, a glossy dark floor with reflections, studio softboxes in the environment map, bloom only on emissive heat and sparks, shallow depth of field on macro shots, subtle grain and vignette.

| # | Time (s) | Words | Shot | Camera | Cause -> effect |
|---|---|---|---|---|---|
| 1 | 0.00-3.40 | "80 kilos. 32 kilometers per hour." | Low side-tracking shot of the bike rolling down a tilted road (lane dashes streaming past, wheels spinning, speed streaks). 3D numbers "80 KG" then "32 KM/H" extrude into space beside the front wheel | tracking dolly, low angle, slight push-in | wheels spin faster as the numbers land |
| 2 | 3.40-8.30 | "Just an 8% hill. And your bike has no brakes! Congratulations!" | Slope drawn as a glowing teal line under the road, "8%" 3D; camera swings to the empty fork where the brake should be; on "Congratulations!" a tiny spark pop | arc swing to the front wheel, then slow push to the empty brake spot | bike keeps accelerating, streaks lengthen |
| 3 | 8.30-13.20 | "Holding that speed means shedding about 560 watts." | Macro of the front wheel; a power gauge ring around the hub fills to "560 W" in teal | macro orbit, shallow DOF | gauge fills as the number is spoken |
| 4 | 13.20-19.30 | "Your shoes can't. So you press a rubber pad on the rim. That's a rim brake." | A rubber pad on a steel arm flies in and clamps the rim; wheel slows, orange sparks, the pad flexes | tight macro on rim top, then pull back | pad clamps -> wheel decelerates -> sparks |
| 5 | 19.30-27.10 | "But you can't reach the wheel... a cable runs to a lever on your handlebar. Now squeezing stops you." | Whip-pan up to the handlebar; the lever pulls, a bright pulse runs down the cable, the pad closes on the rim, the wheel stops | whip pan, then follow the pulse down the cable (tracking) | lever -> cable pulse -> pad -> wheel stops |
| 6 | 27.10-31.00 | "Then it rains and wet rims brake badly." | Rain over the wheel, water droplets on the rim; the pad slips (slow-motion), the wheel keeps turning | slow-motion macro, rack focus to droplets | wet rim -> pad slides, no stop |
| 7 | 31.00-36.00 | "So you squeeze a disc on the hub, away from the rim. That's a disc brake." | A drilled rotor slides onto the hub; the caliper swings in and the pads close on the rotor; wheel stops cleanly | macro orbit around the hub, glossy reflections | caliper closes -> rotor slows -> dry stop |
| 8 | 36.00-39.00 | "But cables stretch and drag." | The cable is stretched like elastic and sags; friction sparks inside the housing | quick push-in, handheld-like micro shake | pull -> cable stretches -> weak response |
| 9 | 39.00-44.20 | "So you swap the cable for fluid in a sealed hose, like a syringe. That's hydraulic." | Glass syringe barrel with orange fluid at the lever, plunger pushes, a fluid pulse travels along the transparent hose, the caliper piston extends, pads clamp; pill "HYDRAULIC LINE" | long macro dolly following the fluid | plunger -> fluid -> piston -> pads -> stop |
| 10 | 44.20-51.30 | "On a long descent, heat weakens the brakes. So you fit a bigger rotor, which sheds heat better." | Rotor glows orange then red (emissive + bloom), pads fade; a bigger teal-steel rotor swaps in, heat streams off its rim and the glow cools | macro on glowing rotor, then pull back as it swaps | heat builds -> fade -> bigger rotor -> cools |
| 11 | 51.30-57.40 | "You built a modern disc brake. It turns that hill into heat. Your shoes can retire." | Full bike hero reveal in studio light, slow orbit; wheel spins down and stops; title "YOU BUILT A DISC BRAKE."; small stamp "SHOES: RETIRED" | pull-back orbit to a hero 3/4 view | wheel spins down, hold |
| 12 | 57.40-60.17 | "Save this for your next big hill." | End card (existing) | static | |

Transitions: whip-pan blur between 4->5 and 6->7, push-through into the rotor holes between 10 and 11, hard cuts elsewhere on the voice beats. Sound: existing code-made SFX plus a whoosh on each whip and a low heat rumble in shot 10 (made in code).
Captions: the existing word-by-word captions, kept at y 1178-1328; the top HUD is removed except a tiny step number.

## Build notes (v2, 2026-11-10)

- Engine: `channel/motion/special-bicycle-brakes/assets/cine.js` (replaces the generic `world.js` in `index.html`; `world.js` stays as the v1 reference).
  Shot list = `SHOTS` (camera keys per shot), story state = keyframe tables (`SPEED`, `RIM`, `DISC`, `LEVER`, `HEAT_*`, `RAIN`, `WET`), all on voiceover word times.
- Look: ACES tone mapping, studio environment, unlit navy floor with a shadow catcher and a soft light pool, teal rim light, bloom only above HDR 1.6 (emissive heat, glow beads), depth of field from the main depth buffer, FXAA, grain and vignette.
- Changes against the table above: no orange sparks from rubber (rubber pads and shoes make dust and smoke, not sparks; sparks only from the hot steel pads in shot 10); the shoe gag (13.9-15.3 s) and the retired shoes land on the top tube in the hero shot (55.7 s).
- HUD (`compositions/hud.html`): "NO BRAKES." stamp, five part pills (n / 5), payoff "YOU BUILT A DISC BRAKE.", "SHOES: RETIRED" stamp. Sound: `scripts/make_sfx_v2.py`.
- Speed in this container: about 2.8 s per frame on the CPU renderer (MSAA and the BokehPass were dropped for that reason: 4.9 s per frame).
