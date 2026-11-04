#!/usr/bin/env python3
"""Sound design for #9 "Stop Rereading", written in code (no music, voice stays on top).

One stereo 48 kHz WAV, 43 s, every event placed on a word time from the Scribe timings.
Fixed seed, so the file is identical on every run.
Usage: python3 scripts/make_sfx.py assets/audio/sfx.wav
"""
import sys
import numpy as np
from scipy.signal import butter, sosfiltfilt
from scipy.io import wavfile

SR = 48000
TOTAL = 43.0
rng = np.random.default_rng(909)
N = int(TOTAL * SR)
mix = np.zeros((N, 2))


def db(x): return 10 ** (x / 20)
def bp(x, lo, hi, o=2): return sosfiltfilt(butter(o, [lo, hi], "bandpass", fs=SR, output="sos"), x)
def lp(x, f, o=2): return sosfiltfilt(butter(o, f, "lowpass", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfiltfilt(butter(o, f, "highpass", fs=SR, output="sos"), x)
def noise(sec): return rng.standard_normal(int(sec * SR))
def norm(y): return y / (np.max(np.abs(y)) + 1e-9)


def place(sig, t, gain_db=0.0, pan=0.0):
    if sig.ndim == 1:
        l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
        sig = np.stack([sig * l, sig * r], 1) * np.sqrt(2)
    i = int(t * SR); j = min(N, i + len(sig))
    if i < N and j > 0:
        mix[max(i, 0):j] += sig[max(0, -i): j - i] * db(gain_db)


def whoosh(sec=0.6, lo=300, hi=6000, peak=0.6, rev=False):
    n = int(sec * SR); t = np.linspace(0, 1, n); x = noise(sec)
    bands = [bp(x, lo, lo * 2.2), bp(x, lo * 2.2, hi / 2), bp(x, hi / 2, min(hi, 20000))]
    pos = t if not rev else 1 - t
    w = [np.clip(1 - np.abs(pos * 2 - c), 0, 1) for c in (0.0, 1.0, 2.0)]
    y = sum(b * wi for b, wi in zip(bands, w))
    e = np.where(t < peak, (t / peak) ** 2, ((1 - t) / (1 - peak)) ** 1.6)
    return norm(y * (e[::-1] if rev else e))


def tick(freq=1800, sec=0.08, dec=60):
    t = np.arange(int(sec * SR)) / SR
    y = np.sin(2 * np.pi * freq * t) * np.exp(-t * dec) + 0.4 * np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-t * dec * 1.5)
    y += 0.25 * hp(noise(sec), 4000) * np.exp(-t * 170)
    return norm(y)


def chime(freqs, sec=1.6, decay=3.0):
    t = np.arange(int(sec * SR)) / SR
    y = sum(np.sin(2 * np.pi * f * t + k) * np.exp(-t * (decay + k * 0.7)) / (1 + 0.45 * k) for k, f in enumerate(freqs))
    return norm(y * np.minimum(1, t / 0.003))


def boom(sec=1.8, f0=80, f1=38, dec=2.4):
    t = np.arange(int(sec * SR)) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 7)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * dec)
    y += 0.5 * lp(noise(sec), 240) * np.exp(-t * 10) + 0.12 * bp(noise(sec), 1500, 7000) * np.exp(-t * 35)
    return norm(y * np.minimum(1, t / 0.002))


def thud(sec=0.5, f=95):
    t = np.arange(int(sec * SR)) / SR
    y = np.sin(2 * np.pi * (f * t - 18 * t * t)) * np.exp(-t * 12) + 0.35 * lp(noise(sec), 500) * np.exp(-t * 30)
    return norm(y)


def riser(sec=1.4, f0=180, oct=2.2):
    t = np.arange(int(sec * SR)) / SR; u = t / sec
    f = f0 * 2 ** (u * oct)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.4 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)
    air = bp(noise(sec), 800, 9000) * u ** 1.5
    return norm((tone * 0.35 + air) * u ** 2.2)


def sand(sec=0.9):
    t = np.linspace(0, 1, int(sec * SR))
    grains = hp(noise(sec), 3000) * (rng.random(len(t)) > 0.985) * 3.0
    y = bp(noise(sec), 1500, 9000) * 0.5 + grains
    return norm(y * np.sin(np.pi * t) ** 0.7)


def shimmer(sec=1.2, base=1320):
    t = np.arange(int(sec * SR)) / SR
    y = sum(np.sin(2 * np.pi * base * r * t + r) * (0.5 + 0.5 * np.sin(2 * np.pi * (6 + k) * t)) for k, r in enumerate((1, 1.5, 2, 2.5)))
    return norm(y * np.sin(np.pi * t / sec) ** 2)


def pop(freq=900, sec=0.12):
    t = np.arange(int(sec * SR)) / SR
    f = freq * (1 + 1.2 * np.exp(-t * 60))
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 38))


def paper(sec=0.35):
    t = np.linspace(0, 1, int(sec * SR))
    return norm(bp(noise(sec), 900, 7000) * (np.sin(np.pi * t) ** 0.5) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t) ** 2))


# ---------------- events ----------------
# hook
place(boom(1.6, 74, 40), 1.40, -7)                      # "stop"
place(whoosh(0.45, 600, 9000, 0.8), 1.80, -20)          # strike line
place(whoosh(0.8, 250, 7000, 0.55), 2.35, -14)          # page drops, camera rises
for i in range(10):                                     # cards land
    place(tick(1400 + 90 * i, 0.07, 70), 3.25 + i * 0.05 + (i % 3) * 0.02, -27, pan=(-0.4 if i % 2 == 0 else 0.4))
place(shimmer(0.7, 990), 5.9, -24)                      # "which two?"
place(pop(620), 6.02, -22); place(pop(880), 6.24, -22)
# source + flips
place(tick(2200, 0.06), 7.2, -28)
for k in range(8):
    place(paper(0.22), 8.15 + 0.3 * k, -25, pan=(-0.35 if k % 2 == 0 else 0.35))
    place(tick(1700, 0.05, 90), 8.3 + 0.3 * k, -30)
# eliminations
for j, (t, p) in enumerate([(11.22, -0.4), (12.0, -0.4), (12.64, 0.4), (13.56, -0.4), (13.75, 0.4)]):
    place(tick(520 - 30 * j, 0.1, 40), t, -22, pan=p)
    place(whoosh(0.9, 150, 3000, 0.25, rev=True), t + 0.12, -24, pan=p)
    place(thud(0.45, 90 - 6 * j), t + 0.95, -24, pan=p)
place(whoosh(0.6, 200, 3000, 0.4, rev=True), 13.95, -24)      # moderates sink back
place(boom(1.4, 60, 36, 3.0), 14.38, -15)                      # "2 left"
place(chime([659.25, 987.77], 1.2, 4.0), 14.4, -27)
place(whoosh(0.55, 300, 7000, 0.6), 14.68, -17)                # whip down to the page
# rereading page
place(shimmer(1.0, 1100), 16.95, -28)                         # familiar words glow
place(thud(0.6, 70), 18.1, -20)                               # test day
place(sand(1.0), 19.0, -19)                                   # page dissolves
place(shimmer(1.2, 660), 20.35, -30)                          # ghost memory
for k in range(4):
    place(tick(2600, 0.03, 120), 20.0 + k * 0.33, -34)        # cursor
place(whoosh(0.55, 300, 7000, 0.6), 21.25, -17)               # back up to the wall
# reveal 1
place(riser(1.45, 160, 2.4), 21.9, -16)
place(boom(2.0, 86, 40), 23.4, -8)
place(chime([523.25, 783.99, 1046.5, 1567.98], 2.0, 2.4), 23.42, -16)
place(whoosh(0.5, 300, 7000, 0.6), 24.3, -18, pan=0.5)        # whip right
# recall demo
place(thud(0.5, 110), 25.15, -18)                              # notebook closes
place(paper(0.3), 24.7, -24)
place(whoosh(0.45, 400, 7000, 0.6), 25.3, -24, pan=0.4)       # card slides in
for i, (s, n) in enumerate([(26.30, 11), (26.84, 12), (27.34, 13)]):
    for c in range(n):
        place(tick(3200 + 120 * ((c * 7) % 5), 0.025, 160), s + c * (0.46 if i == 0 else 0.48 if i == 1 else 0.56) / n, -32)
place(paper(0.4), 28.8, -22)                                   # notebook opens
for k, t in enumerate([29.84, 30.02, 30.18]):
    place(pop(780 + 160 * k), t, -19)
place(boom(0.9, 120, 60, 5.0), 30.3, -19)                      # missed
place(tick(4200, 0.05, 80), 30.32, -25)
place(whoosh(0.5, 300, 7000, 0.6), 30.62, -18, pan=-0.5)      # whip left
# reveal 2
place(riser(0.9, 200, 1.8), 31.1, -17)
place(boom(2.0, 82, 40), 32.06, -8)
place(chime([587.33, 880.0, 1174.66, 1760.0], 2.0, 2.4), 32.08, -16)
place(whoosh(0.5, 300, 7000, 0.6), 32.5, -18, pan=-0.5)
# calendar
place(thud(0.6, 70), 33.2, -14)                                # tall block lands
for k, t in enumerate([34.58, 34.84, 35.11]):
    place(pop(700 + 120 * k), t, -20); place(thud(0.3, 140), t, -26)
place(chime([987.77, 1318.51], 1.0, 4.0), 35.05, -26)
place(whoosh(0.7, 150, 2500, 0.3, rev=True), 35.72, -22)      # all-at-once block sinks
place(tick(2400, 0.06), 36.7, -27)                             # "soon"
place(whoosh(0.5, 300, 7000, 0.6), 38.05, -18, pan=0.4)       # back to the wall
# save + end card
place(whoosh(0.5, 400, 8000, 0.5, rev=True), 40.1, -22)
place(pop(520), 40.62, -16); place(chime([783.99, 1174.66, 1567.98], 1.4, 3.2), 40.66, -21)
place(whoosh(0.5, 300, 6000, 0.7), 40.3, -24)
for k in range(3):
    place(pop(900 + 140 * k, 0.09), 40.7 + k * 0.08, -27)
place(tick(2000, 0.05), 41.38, -18); place(chime([1046.5, 1567.98, 2093.0], 0.9, 4.5), 41.44, -22)   # subscribe
place(pop(1100), 42.05, -20)                                   # like
place(tick(2400, 0.04), 42.5, -24)                             # comment
for k in range(3):
    place(tick(2600, 0.03, 120), 42.56 + k * 0.08, -30)        # typing dots
place(whoosh(0.75, 300, 9000, 0.92), 42.25, -15)              # rises into the loop cut back to frame 0
place(riser(0.7, 260, 1.4), 42.3, -24)

# ---------------- master ----------------
mix = hp(mix.T, 30).T
peak = np.max(np.abs(mix))
mix *= db(-3.0) / peak
fade = np.ones(N); fn = int(0.012 * SR); fade[-fn:] = np.linspace(1, 0, fn)
mix *= fade[:, None]
wavfile.write(sys.argv[1] if len(sys.argv) > 1 else "sfx.wav", SR, (mix * 32767).astype(np.int16))
print("sfx written", round(TOTAL, 2), "s")
