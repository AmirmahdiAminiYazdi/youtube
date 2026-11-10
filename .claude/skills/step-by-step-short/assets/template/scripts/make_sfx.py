#!/usr/bin/env python3
"""Sound design for a step-by-step Short, written in code (no music, voice stays on top).

One stereo 48 kHz WAV as long as the picture; every event sits on a time from assets/timeline.json.
Fixed seed, so the file is identical on every run.
Usage: python3 scripts/make_sfx.py assets/audio/sfx.wav
"""
import sys, os, json
import numpy as np
from scipy.signal import butter, sosfiltfilt
from scipy.io import wavfile

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, "assets", "timeline.json")))
TOTAL = TL["total"]
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
# hook: soft riser into the first beat, tick on the base object
place(tick(1400, 0.1, 55), 0.02, -14)
first = TL["parts"][1]["t"] if len(TL["parts"]) > 1 else 2.5
place(riser(min(1.1, max(0.5, first - 0.3)), 220, 1.6), max(0.0, first - 1.1), -26)

# every new part: whoosh in, pop on landing, tick for its label; pitch walks up a little with each step
for i, p in enumerate(TL["parts"][1:]):
    t = p["t"]
    place(whoosh(0.4, 500, 6500, 0.55), max(0.0, t - 0.12), -20, pan=0.25 * (1 if i % 2 else -1))
    place(pop(780 + 40 * i, 0.14), t + 0.18, -13, pan=0.15 * (1 if i % 2 else -1))
    place(thud(0.35, 90 + 4 * i), t + 0.16, -17)
    place(tick(2000 + 90 * i, 0.07, 70), t + 0.14, -22)

# payoff: boom + shimmer, then a short riser into the end card
pt = TL["payoff_t"]
place(boom(1.4, 70, 36, 3.0), pt, -14)
place(shimmer(1.1, 1320), pt + 0.05, -26)
place(chime([784, 988, 1175], 1.5, 2.6), pt + 0.1, -22)
cs = TL["cta_start"]
place(riser(0.7, 260, 1.4), max(0.0, cs - 0.1), -24)
# end card taps (the card taps Subscribe at +0.9, Like at +1.6, Comment at +2.2)
for dt, f in ((0.92, 1200), (1.62, 1500), (2.28, 1000)):
    place(tick(f, 0.09, 50), cs + dt, -16)

# ---------------- master ----------------
mix = hp(mix.T, 30).T
peak = np.max(np.abs(mix))
mix *= db(-3.0) / peak
fade = np.ones(N); fn = int(0.012 * SR); fade[-fn:] = np.linspace(1, 0, fn)
mix *= fade[:, None]
wavfile.write(sys.argv[1] if len(sys.argv) > 1 else "sfx.wav", SR, (mix * 32767).astype(np.int16))
print("sfx written", round(TOTAL, 2), "s,", len(TL["parts"]) - 1, "steps")
