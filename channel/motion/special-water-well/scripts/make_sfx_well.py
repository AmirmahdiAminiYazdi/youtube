#!/usr/bin/env python3
"""Sound design for special-water-well, written in code. No music; the voice stays on top.

Every event sits on a voiceover word time of take 1 (the same times as assets/cine.js and compositions/hud.html).
The synth helpers are shared with make_sfx.py (its part above the "events" marker is executed here).
Fixed seed, so the file is identical on every run.
Usage: python3 scripts/make_sfx_well.py assets/audio/sfx.wav
"""
import os, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, "make_sfx.py")).read().split("# ---------------- events ----------------")[0]
exec(src)  # defines SR, TOTAL, N, mix, rng, place, whoosh, tick, chime, boom, thud, riser, sand, shimmer, pop, paper, bp, lp, hp, noise, norm, db


def keys(K, t):
    t = np.asarray(t); out = np.full(t.shape, K[-1][1], float)
    for (a, va), (b, vb) in zip(K[:-1], K[1:]):
        m = (t >= a) & (t < b); u = (t[m] - a) / (b - a); out[m] = va + (vb - va) * u * u * (3 - 2 * u)
    out[t < K[0][0]] = K[0][1]
    return out


tt = np.arange(N) / SR

# ---------------- beds ----------------
RPM = [[0, 0], [0.55, 0], [0.75, 1], [1.8, 1], [2.3, 0.12], [12.1, 0.12], [12.36, 1], [13.6, 1], [14.3, 0.15], [14.9, 0]]
rpm = keys(RPM, tt)
motor = np.sin(2 * np.pi * np.cumsum(55 + 35 * rpm) / SR) * 0.5 + np.sin(2 * np.pi * np.cumsum(110 + 70 * rpm) / SR) * 0.25
grind = bp(noise(TOTAL), 180, 1800) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * tt))
place((motor * 0.6 + grind) * rpm ** 1.3, 0, -22)
rain_env = keys([[0, 0], [19.84, 0], [20.1, 1], [22.6, 1], [23.4, 0]], tt)
rain = hp(noise(TOTAL), 1500) * 0.6 + hp(noise(TOTAL), 4500) * (rng.random(N) > 0.9993) * 6
place(rain * rain_env, 0, -24)
hum_env = keys([[0, 0], [37.85, 0], [38.0, 1], [39.3, 1], [39.6, 0]], tt)
for a, b in [[41.28, 41.52], [41.72, 41.92], [42.12, 42.3], [42.48, 42.62], [42.8, 42.92], [43.08, 43.18]]:
    hum_env = np.maximum(hum_env, ((tt >= a) & (tt < b)).astype(float))
hum = np.sin(2 * np.pi * 120 * tt) * 0.5 + np.sin(2 * np.pi * 240 * tt) * 0.3 + bp(noise(TOTAL), 300, 1200) * 0.3
place(lp(hum * hum_env, 1500), 0, -23)


def clang(sec=1.4, base=420):
    t = np.arange(int(sec * SR)) / SR
    y = sum(np.sin(2 * np.pi * base * r * t + r) * np.exp(-t * (4 + k * 2.5)) / (1 + k * 0.6) for k, r in enumerate((1, 2.76, 5.4, 8.93)))
    return norm(y * np.minimum(1, t / 0.001) + 0.3 * hp(noise(sec), 2500) * np.exp(-t * 60))


def clatter(sec=1.4, n=26, seed=1):
    r = np.random.default_rng(seed); y = np.zeros(int(sec * SR))
    for _ in range(n):
        i = int(r.random() * (len(y) - 4000)); f = 300 + r.random() * 900
        tt_ = np.arange(3000) / SR; y[i:i + 3000] += np.sin(2 * np.pi * f * tt_) * np.exp(-tt_ * 70) * (0.4 + r.random() * 0.6)
    return norm(y + 0.4 * lp(noise(sec), 300) * np.sin(np.pi * np.linspace(0, 1, len(y))))


def trickle(sec=0.9):
    t = np.arange(int(sec * SR)) / SR
    y = bp(noise(sec), 700, 4000) * (0.6 + 0.4 * np.sin(2 * np.pi * 13 * t)) + 0.5 * np.sin(2 * np.pi * (900 + 300 * np.sin(2 * np.pi * 7 * t)) * t) * (rng.random(len(t)) > 0.7)
    return norm(y * np.minimum(1, t / 0.05) * np.minimum(1, (sec - t) / 0.1))


def splash(sec=0.7):
    t = np.arange(int(sec * SR)) / SR
    return norm(bp(noise(sec), 400, 6000) * np.exp(-t * 7) + 0.6 * np.sin(2 * np.pi * (180 - 120 * t) * t) * np.exp(-t * 9))


def alert():  # problem: short low two-tone
    a = chime([330, 660], 0.22, 14); b = chime([262, 524], 0.3, 12)
    y = np.zeros(int(0.5 * SR)); y[:len(a)] += a; y[int(0.12 * SR):int(0.12 * SR) + len(b)] += b
    return norm(y)


# ---------------- events ----------------
place(boom(1.2, 90, 40, 3.5), 0.72, -16); place(tick(1100, 0.06, 70), 0.72, -18)        # bit bites
place(boom(0.9, 70, 38, 5), 1.12, -15); place(pop(820, 0.12), 1.13, -18)                # "43"
for i in range(5): place(tick(1600 + i * 120, 0.06, 80), 5.36 + i * 0.08, -16)          # 5 slots
place(whoosh(0.7, 300, 8000, 0.8), 6.75, -15)                                            # push-through
place(riser(2.9, 260, 1.2), 8.0, -28); place(chime([1568, 2349], 1.2, 3.5), 10.88, -20)   # scan, aquifer
place(whoosh(0.4, 400, 6000, 0.5), 12.2, -20)
place(thud(0.5, 70), 13.45, -14)                                                         # reaches the aquifer
PILLS = [14.0, 19.12, 25.44, 33.08, 39.36, 46.16]
for t0 in PILLS: place(pop(980, 0.12), t0, -18)
FAILS = [15.76, 20.64, 28.0, 35.04, 41.28]
FIXES = [19.12, 25.44, 33.08, 39.36, 46.16]
for t0 in FAILS: place(alert(), t0, -19)
for k, t0 in enumerate(FIXES): place(chime([1047 * 2 ** (k / 12), 1568 * 2 ** (k / 12)], 0.8, 5), t0 + 0.05, -19)
place(clatter(1.5, 30, 3), 15.76, -16); place(boom(1.0, 60, 30, 3), 15.8, -18)           # cave-in
place(whoosh(0.6, 500, 7000, 0.85), 17.24, -18); place(clang(1.6, 380), 17.85, -15); place(thud(0.4, 85), 17.86, -14)   # casing
place(whoosh(0.4, 300, 6000, 0.5), 19.6, -18)
place(lp(noise(1.6), 500) * np.sin(np.pi * np.linspace(0, 1, int(1.6 * SR))), 23.04, -16)   # grout pour
place(sand(1.0), 23.1, -24)
place(sand(1.8), 27.95, -18)                                                              # sand in
place(whoosh(0.5, 900, 9000, 0.8), 29.6, -20); place(clang(0.8, 700), 30.18, -21)         # screen slides in
place(pop(1200, 0.12), 31.84, -19)                                                        # strainer badge
place(whoosh(0.45, 300, 6000, 0.6), 33.9, -18)                                            # pull back
place(riser(0.6, 400, -1.2), 35.0, -26)                                                   # the "?"
place(whoosh(0.7, 300, 5000, 0.9), 36.24, -17); place(splash(0.8), 36.9, -14); place(thud(0.4, 75), 36.92, -16)   # pump lands
place(riser(1.0, 160, 1.6), 37.92, -20); place(whoosh(0.5, 400, 8000, 0.5), 38.15, -19)    # water rises
for a in [41.28, 41.72, 42.12, 42.48, 42.8, 43.08]: place(tick(2600, 0.05, 90), a, -17)   # pump clicks on
place(trickle(0.9), 42.32, -18); place(trickle(0.7), 45.0, -19)
place(whoosh(0.6, 300, 5000, 0.85), 43.84, -18); place(thud(0.45, 90), 44.45, -13); place(clang(0.6, 900), 44.46, -24)   # tank lands
place(shimmer(0.6, 1760), 46.45, -24)
place(boom(1.4, 70, 36, 3.0), 47.12, -15); place(shimmer(1.2, 1320), 47.15, -25); place(pop(700, 0.14), 47.85, -18)
place(paper(0.55), 49.28, -20); place(tick(620, 0.12, 25), 49.85, -16); place(clang(0.5, 1100), 49.86, -24)   # bucket
cs = 50.956                                                                               # end card
place(riser(0.7, 260, 1.4), cs - 0.1, -24)
for dt, f in ((0.92, 1200), (1.62, 1500), (2.28, 1000)): place(tick(f, 0.09, 50), cs + dt, -16)
place(whoosh(0.5, 300, 7000, 0.4), 53.82, -22); place(shimmer(1.25, 1047), 53.85, -26)    # cover, keeps the tail alive into the loop

# ---------------- master ----------------
mix = hp(mix.T, 30).T
mix *= db(-3.0) / np.max(np.abs(mix))
fade = np.ones(N); fn = int(0.012 * SR); fade[-fn:] = np.linspace(1, 0, fn)
mix *= fade[:, None]
wavfile.write(sys.argv[1] if len(sys.argv) > 1 else "sfx.wav", SR, (mix * 32767).astype(np.int16))
print("sfx (water well) written", round(TOTAL, 2), "s")
