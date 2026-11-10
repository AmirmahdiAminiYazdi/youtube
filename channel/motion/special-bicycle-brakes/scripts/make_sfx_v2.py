#!/usr/bin/env python3
"""Sound design for the v2 (cinematic) cut of special-bicycle-brakes, written in code. No music; the voice stays on top.

Every event sits on a voiceover word time (the same times as assets/cine.js and compositions/hud.html).
The synth helpers are shared with make_sfx.py (its part above the "events" marker is executed here).
Fixed seed, so the file is identical on every run.
Usage: python3 scripts/make_sfx_v2.py assets/audio/sfx.wav
"""
import os, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, "make_sfx.py")).read().split("# ---------------- events ----------------")[0]
exec(src)  # defines SR, TOTAL, N, mix, rng, place, whoosh, tick, chime, boom, thud, riser, sand, shimmer, pop, paper, bp, lp, hp, noise, norm, db

SPEED = [[0, 1], [17.35, 1], [19.0, 0.18], [19.75, 0.18], [21.2, 1], [25.95, 1], [26.9, 0], [27.55, 0], [28.6, 1], [29.1, 1], [30.6, 0.72],
         [32.1, 0.9], [34.4, 0.9], [35.4, 0], [36.15, 0], [36.95, 1], [37.15, 1], [38.25, 0.68], [39.2, 0.78], [43.05, 0.8], [43.9, 0], [44.75, 0],
         [45.6, 1], [46.15, 0.55], [46.4, 0.55], [47.9, 0.92], [49.2, 0.92], [50.25, 0.32], [51.3, 0.32], [56.2, 0], [61, 0]]
RAIN = [[0, 0], [27.45, 0], [27.75, 1], [33.6, 1], [34.6, 0]]
HEAT = [[0, 0], [45.5, 0], [47.1, 1], [48.3, 1], [48.7, 0], [49.3, 0], [49.75, 0.6], [49.9, 0.6], [50.8, 0.07], [53.5, 0.07], [54.1, 0.6], [54.9, 0.6], [56.4, 0]]


def keys(K, t):
    t = np.asarray(t); out = np.full(t.shape, K[-1][1], float)
    for (a, va), (b, vb) in zip(K[:-1], K[1:]):
        m = (t >= a) & (t < b); u = (t[m] - a) / (b - a); out[m] = va + (vb - va) * u * u * (3 - 2 * u)
    out[t < K[0][0]] = K[0][1]
    return out


tt = np.arange(N) / SR

# ---------------- beds ----------------
spd = keys(SPEED, tt)
road = bp(noise(TOTAL), 120, 900) * 0.8 + bp(noise(TOTAL), 900, 4000) * 0.25
hook_boost = np.where(tt < 9.46, 1.0, 0.5)
place(road * (spd ** 1.5) * hook_boost, 0, -26)
wind = hp(noise(TOTAL), 2500) * (spd ** 2) * np.where(tt < 9.46, 1.0, 0.25)
place(wind, 0, -34)
rain_env = keys(RAIN, tt)
rain = hp(noise(TOTAL), 1800) * 0.6 + hp(noise(TOTAL), 5000) * (rng.random(N) > 0.9994) * 6
place(rain * rain_env, 0, -24)
heat_env = keys(HEAT, tt)
rumble = lp(noise(TOTAL), 160) * 1.6 + hp(noise(TOTAL), 4000) * (rng.random(N) > 0.998) * 3
place(rumble * heat_env ** 1.2, 0, -20)


def rub(sec, lo=500, hi=3200, squeal=0.0, f=2300):
    t = np.arange(int(sec * SR)) / SR
    y = bp(noise(sec), lo, hi) * (0.7 + 0.3 * np.sin(2 * np.pi * 17 * t))
    if squeal: y += squeal * np.sin(2 * np.pi * (f + 40 * np.sin(2 * np.pi * 5 * t)) * t)
    e = np.minimum(1, t / 0.05) * np.minimum(1, (sec - t) / 0.2)
    return norm(y * e)


def shing(sec=0.9):
    t = np.arange(int(sec * SR)) / SR
    y = bp(noise(sec), 3000, 12000) * np.exp(-t * 6) * 0.6
    y += sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in ((2480, 4), (3710, 5.5), (5230, 7)))
    return norm(y * np.minimum(1, t / 0.004))


def zip_(sec=0.6, f0=600, f1=4000):
    t = np.arange(int(sec * SR)) / SR; u = t / sec
    y = bp(noise(sec), 400, 9000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * (60 + 140 * u) * t)))
    return norm(y * np.sin(np.pi * u) ** 0.6)


def creak(sec=1.2, f=110):
    t = np.arange(int(sec * SR)) / SR; u = t / sec
    fm = f * (1 + 0.6 * u) + 25 * np.sin(2 * np.pi * 9 * t)
    y = np.sign(np.sin(2 * np.pi * np.cumsum(fm) / SR)) * 0.3 + np.sin(2 * np.pi * np.cumsum(fm) / SR)
    return norm(lp(y, 1800) * np.sin(np.pi * u) ** 0.8)


def gurgle(sec=1.0):
    t = np.arange(int(sec * SR)) / SR
    y = lp(noise(sec), 700) * (0.5 + 0.5 * np.sin(2 * np.pi * (7 + 5 * t) * t)) + 0.3 * np.sin(2 * np.pi * (300 + 200 * t) * t) * (np.sin(2 * np.pi * 11 * t) > 0.6)
    return norm(y * np.sin(np.pi * t / sec) ** 0.7)


def pssh(sec=0.7):
    t = np.arange(int(sec * SR)) / SR; u = t / sec
    return norm(bp(noise(sec), 1200, 8000) * np.exp(-u * 3) * np.minimum(1, t / 0.01))


# ---------------- events ----------------
# hook
place(thud(0.4, 90), 0.0, -15); place(tick(1700, 0.08, 60), 0.02, -20)
place(whoosh(0.35, 400, 6000, 0.7), 1.2, -22); place(thud(0.4, 100), 1.4, -14); place(pop(820, 0.12), 1.42, -18)
place(whoosh(0.35, 400, 6000, 0.7), 3.78, -22); place(thud(0.4, 85), 3.98, -15)
place(shimmer(0.8, 990), 3.7, -30)                                 # slope line draws
place(whoosh(1.0, 250, 5000, 0.6), 5.25, -17, pan=0.3)             # camera swing to the fork
place(boom(0.7, 110, 45, 6), 6.44, -14); place(tick(700, 0.1, 30), 6.46, -18)
place(pop(600, 0.14), 7.86, -16); place(paper(0.45), 7.9, -18); place(sand(0.5), 7.95, -24)
# 560 watts
place(whoosh(0.5, 300, 5000, 0.5), 8.1, -24)
place(riser(1.6, 200, 1.8), 9.85, -22)
place(chime([1047, 1319, 1568], 1.2, 3.0), 11.44, -18); place(tick(2200, 0.07, 70), 11.46, -20)
# shoes can't: slam, scrape, fly off
place(thud(0.5, 75), 13.95, -13); place(sand(0.95), 13.98, -15); place(rub(0.9, 300, 2500), 14.0, -19)
place(whoosh(0.45, 500, 7000, 0.4), 14.85, -18, pan=-0.4)
# rim brake
place(whoosh(0.5, 500, 6500, 0.55), 15.8, -19, pan=0.3); place(pop(760, 0.14), 16.6, -15); place(thud(0.3, 110), 16.6, -18)
place(tick(2600, 0.06, 80), 17.4, -16); place(rub(1.6, 600, 3500, 0.12, 2250), 17.4, -20)
place(tick(2000, 0.07, 70), 18.62, -21)
# can't reach -> cable -> lever -> stop
place(whoosh(0.4, 600, 9000, 0.5), 19.36, -15)                     # whip pan
place(shimmer(0.6, 1500), 19.9, -30)
place(zip_(0.9), 22.62, -19); place(pop(900, 0.12), 23.64, -17); place(tick(2100, 0.07, 70), 23.98, -21)
place(tick(1500, 0.05, 90), 25.8, -15); place(zip_(0.4), 25.8, -21); place(tick(2600, 0.05, 90), 26.18, -16); place(rub(0.7, 600, 3500, 0.1, 2300), 26.2, -20)
# rain: pads slip
place(rub(1.6, 1500, 9000), 29.0, -20)
# disc brake
place(whoosh(0.4, 600, 9000, 0.5), 30.74, -15, pan=-0.3)         # whip pan
place(shing(1.0), 32.0, -17); place(thud(0.35, 95), 32.64, -15); place(tick(1300, 0.06, 80), 32.8, -19)
place(zip_(0.8), 33.0, -21)
place(tick(2800, 0.05, 90), 34.42, -14); place(rub(0.9, 900, 5000), 34.45, -22); place(tick(2100, 0.07, 70), 35.02, -21)
# cables stretch and drag
place(creak(1.2, 95), 36.95, -17); place(sand(1.0), 37.1, -22)
# hydraulic
place(shimmer(0.8, 1760), 39.0, -24)
place(chime([2637, 3951], 0.6, 7), 40.0, -18)
place(gurgle(1.1), 40.88, -18)
place(pssh(0.8), 42.3, -16); place(tick(1200, 0.06, 80), 42.3, -18)
place(thud(0.4, 80), 43.12, -13); place(tick(3000, 0.05, 90), 43.14, -15); place(tick(2100, 0.07, 70), 43.52, -21)
# heat
place(rub(2.8, 500, 3000, 0.06, 1900), 45.45, -22)
place(whoosh(0.4, 400, 6000, 0.5), 48.2, -19, pan=0.4); place(shing(1.0), 48.66, -16); place(tick(2100, 0.07, 70), 48.96, -21)
place(thud(0.35, 90), 49.3, -16); place(pssh(1.2), 49.9, -22)    # it cools
# payoff
place(whoosh(0.45, 300, 8000, 0.85), 50.95, -15)                   # push through the rotor
place(boom(1.4, 70, 36, 3.0), 51.34, -14); place(shimmer(1.1, 1320), 51.39, -26)
place(pop(700, 0.14), 52.44, -18); place(chime([784, 988, 1175], 1.5, 2.6), 52.46, -22)
place(lp(noise(1.2), 200) * np.sin(np.pi * np.arange(int(1.2 * SR)) / (1.2 * SR)), 53.6, -18)   # whoomp of heat
place(thud(0.35, 120), 55.86, -15); place(thud(0.35, 130), 55.98, -16)
place(boom(0.5, 130, 60, 8), 56.14, -15); place(tick(800, 0.08, 40), 56.15, -18)
# end card
cs = 57.39
place(riser(0.7, 260, 1.4), cs - 0.1, -24)
for dt, f in ((0.92, 1200), (1.62, 1500), (2.28, 1000)):
    place(tick(f, 0.09, 50), cs + dt, -16)

# ---------------- master ----------------
mix = hp(mix.T, 30).T
mix *= db(-3.0) / np.max(np.abs(mix))
fade = np.ones(N); fn = int(0.012 * SR); fade[-fn:] = np.linspace(1, 0, fn)
mix *= fade[:, None]
wavfile.write(sys.argv[1] if len(sys.argv) > 1 else "sfx.wav", SR, (mix * 32767).astype(np.int16))
print("sfx v2 written", round(TOTAL, 2), "s")
