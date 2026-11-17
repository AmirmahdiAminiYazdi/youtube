#!/usr/bin/env python3
"""Sound design for special-smart-glasses, written in code. No music; the voice stays on top.

Every event sits on a voiceover word time of take 2 (the same times as assets/cine.js and compositions/hud.html).
The synth helpers are shared with make_sfx.py (its part above the "events" marker is executed here).
Fixed seed, so the file is identical on every run.
Usage: python3 scripts/make_sfx_glasses.py assets/audio/sfx.wav
"""
import os, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, "make_sfx.py")).read().split("# ---------------- events ----------------")[0]
exec(src)  # defines SR, TOTAL, N, mix, rng, place, whoosh, tick, chime, boom, thud, riser, sand, shimmer, pop, paper, bp, lp, hp, noise, norm, db


def alert():  # problem: short low two-tone
    a = chime([330, 660], 0.22, 14); b = chime([262, 524], 0.3, 12)
    y = np.zeros(int(0.5 * SR)); y[:len(a)] += a; y[int(0.12 * SR):int(0.12 * SR) + len(b)] += b
    return norm(y)


def blip(f=1400, sec=0.09):
    t = np.arange(int(sec * SR)) / SR
    return norm(np.sin(2 * np.pi * (f + 900 * t) * t) * np.exp(-t * 40))


def shutter():
    t = np.arange(int(0.18 * SR)) / SR
    y = hp(noise(0.18), 2500) * (np.exp(-((t - 0.01) ** 2) / 0.00002) + 0.8 * np.exp(-((t - 0.09) ** 2) / 0.00002))
    return norm(y + 0.3 * np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 60))


def data(sec=1.4):
    t = np.arange(int(sec * SR)) / SR
    gate = (np.sin(2 * np.pi * 22 * t) > 0.3).astype(float)
    y = np.sin(2 * np.pi * (1800 + 600 * np.sin(2 * np.pi * 3 * t)) * t) * gate * 0.5 + bp(noise(sec), 2000, 6000) * gate * 0.3
    return norm(y * np.minimum(1, t / 0.05) * np.minimum(1, (sec - t) / 0.2))


# ---------------- events ----------------
place(boom(1.1, 85, 38, 4), 0.46, -15); place(pop(820, 0.12), 0.47, -18); place(whoosh(0.5, 300, 9000, 0.3), 0.44, -20)   # 397.5
place(boom(0.8, 70, 40, 5), 2.8, -17); place(pop(1100, 0.1), 2.81, -19)                                                     # /400
place(whoosh(0.45, 300, 6000, 0.6), 3.7, -20); place(pop(980, 0.12), 4.3, -19)                                              # confession badge
place(paper(0.5), 4.96, -24)
place(alert(), 6.95, -19); place(boom(0.9, 60, 35, 3), 7.0, -19); place(riser(0.5, 500, -1.0), 7.05, -26)                  # blame + spotlight
place(whoosh(0.7, 300, 7000, 0.7), 8.48, -16); place(tick(1300, 0.08, 60), 9.12, -19)                                       # glasses fly onto the face
place(alert(), 9.12, -19)
for i in range(10): place(blip(900 + (i % 3) * 140, 0.08), 9.1 + i * 0.27, -27)                                            # sound rings
for i in range(4): place(tick(1700 + i * 140, 0.06, 80), 11.26 + i * 0.07, -16)                                            # mics click in
place(chime([1047, 1568], 0.8, 5), 11.3, -20)
place(alert(), 12.98, -20)
place(boom(0.7, 90, 40, 5), 13.64, -18); place(pop(1200, 0.1), 13.65, -19)                                                  # 12 MP
place(tick(2400, 0.06, 90), 14.52, -16); place(chime([1109, 1661], 0.8, 5), 14.56, -20)                                     # camera pops in
place(whoosh(0.4, 600, 9000, 0.5), 15.85, -19); place(shutter(), 16.06, -14); place(blip(2200, 0.1), 16.4, -21)            # now it sees
place(whoosh(0.4, 400, 6000, 0.5), 17.15, -20)
place(tick(1500, 0.06, 80), 17.98, -17); place(tick(1700, 0.06, 80), 18.06, -17); place(chime([1175, 1760], 0.8, 5), 18.02, -20)   # speakers
for i in range(6): place(chime([660 + 110 * (i % 3)], 0.25, 18), 18.25 + i * 0.42, -25)                                     # sound arcs
place(whoosh(0.45, 300, 6000, 0.55), 20.45, -20); place(alert(), 21.16, -19)                                                # no brain
place(pop(900, 0.12), 22.68, -18); place(data(1.5), 22.75, -25)                                                             # phone + beam
place(riser(0.7, 300, 1.2), 23.2, -23); place(chime([1245, 1865], 0.9, 4.5), 23.38, -20); place(data(1.2), 23.5, -26)       # cloud
place(shimmer(0.8, 1568), 24.02, -24)
place(whoosh(0.4, 500, 8000, 0.5), 24.4, -21)
place(tick(2600, 0.06, 90), 25.2, -17); place(chime([1319, 1976], 0.8, 5), 25.24, -20); place(blip(3000, 0.12), 25.64, -18)  # LED
place(tick(900, 0.05, 90), 26.6, -20); place(tick(900, 0.05, 90), 26.75, -22)
place(whoosh(0.5, 300, 6000, 0.6), 27.35, -19)
for k, s in enumerate([27.76, 28.72, 29.92]): place(pop(800 + 200 * k, 0.12), s, -17)                                        # equation
place(boom(1.3, 70, 36, 3.0), 31.1, -15); place(shimmer(1.2, 1320), 31.15, -24)                                              # on your face
place(whoosh(0.5, 300, 6000, 0.6), 31.8, -20); place(paper(0.55), 32.45, -21)
for s in [34.22, 35.04, 35.96]: place(tick(1500, 0.07, 70), s, -17); place(chime([1047], 0.5, 8), s + 0.03, -24)             # check marks
place(riser(0.6, 400, -1.2), 32.6, -27)                                                                                      # the "?"
place(riser(0.7, 260, 1.4), 36.75, -24)                                                                                      # end card
for dt, f in ((39.56, 1200), (40.24, 1500), (40.7, 1000)): place(tick(f, 0.09, 50), dt, -16)
place(whoosh(0.5, 300, 6000, 0.6), 41.1, -20); place(pop(980, 0.12), 41.15, -19)
place(pop(1200, 0.12), 43.56, -17); place(pop(900, 0.12), 43.9, -17)                                                         # yes / no
place(whoosh(0.5, 300, 7000, 0.4), 46.3, -22); place(shimmer(1.15, 1047), 46.35, -26)                                        # cover, tail into the loop

# ---------------- master ----------------
mix = hp(mix.T, 30).T
mix *= db(-3.0) / np.max(np.abs(mix))
fade = np.ones(N); fn = int(0.012 * SR); fade[-fn:] = np.linspace(1, 0, fn)
mix *= fade[:, None]
wavfile.write(sys.argv[1] if len(sys.argv) > 1 else "sfx.wav", SR, (mix * 32767).astype(np.int16))
print("sfx (smart glasses) written", round(TOTAL, 2), "s")
