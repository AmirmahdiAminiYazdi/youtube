#!/usr/bin/env python3
"""Sound design for "The Impossible Escape" (long version), written in code.

Builds one stereo 48 kHz WAV covering the whole delivered timeline:
  0.0 - 9.0 s   3D cold open (sea, wind, low drone, three text hits, riser)
  9.0 s         impact on the cut into the film
  9.0 - 229 s   quiet UI sounds under the film's own mix, placed on the overlay events
Every sound is generated from a fixed seed, so the file is identical on every run.
Times for the film section are film time + OPEN.

Usage: python3 make_sfx.py OUT.wav
"""
import sys
import numpy as np
from scipy.signal import butter, sosfilt, sosfiltfilt
from scipy.io import wavfile

SR = 48000
OPEN = 9.0
TOTAL = OPEN + 220.0
rng = np.random.default_rng(20261104)
N = int(TOTAL * SR)
mix = np.zeros((N, 2), np.float64)


def db(x):
    return 10 ** (x / 20)


def bp(x, lo, hi, order=2):
    return sosfiltfilt(butter(order, [lo, hi], "bandpass", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return sosfiltfilt(butter(order, f, "lowpass", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfiltfilt(butter(order, f, "highpass", fs=SR, output="sos"), x)


def place(sig, t, gain_db=0.0, pan=0.0):
    """Add a mono or stereo signal at time t (seconds)."""
    if sig.ndim == 1:
        l = np.sqrt(0.5 * (1 - pan)); r = np.sqrt(0.5 * (1 + pan))
        sig = np.stack([sig * l, sig * r], 1) * np.sqrt(2)
    i = int(t * SR)
    j = min(N, i + len(sig))
    if i >= N or j <= 0:
        return
    mix[i:j] += sig[: j - i] * db(gain_db)


def env_adsr(n, a, d, s_level, r):
    e = np.ones(n)
    A, D, R = int(a * SR), int(d * SR), int(r * SR)
    A = max(A, 1)
    e[:A] = np.linspace(0, 1, A)
    if D:
        e[A:A + D] = np.linspace(1, s_level, D)[: max(0, min(D, n - A))]
        e[A + D:] = s_level
    if R:
        e[-R:] *= np.linspace(1, 0, R)
    return e


def noise(sec):
    return rng.standard_normal(int(sec * SR))


# ---------- building blocks ----------
def whoosh(sec=0.7, lo=300, hi=5000, peak=0.45, rev=False):
    n = int(sec * SR); t = np.linspace(0, 1, n)
    x = noise(sec)
    # sweep a band by mixing three fixed bands with moving weights
    bands = [bp(x, lo, lo * 2.2), bp(x, lo * 2.2, hi / 2), bp(x, hi / 2, hi)]
    pos = t if not rev else 1 - t
    w = [np.clip(1 - np.abs(pos * 2 - c), 0, 1) for c in (0.0, 1.0, 2.0)]
    y = sum(b * wi for b, wi in zip(bands, w))
    e = np.where(t < peak, (t / peak) ** 2, ((1 - t) / (1 - peak)) ** 1.6)
    if rev:
        e = e[::-1]
    y = y * e
    return y / (np.max(np.abs(y)) + 1e-9)


def tick(freq=1800, sec=0.09):
    n = int(sec * SR); t = np.arange(n) / SR
    y = np.sin(2 * np.pi * freq * t) * np.exp(-t * 55) + 0.5 * np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-t * 80)
    y += 0.25 * hp(noise(sec), 4000) * np.exp(-t * 160)
    return y / np.max(np.abs(y))


def chime(freqs, sec=1.4, decay=3.2):
    n = int(sec * SR); t = np.arange(n) / SR
    y = np.zeros(n)
    for k, f in enumerate(freqs):
        y += np.sin(2 * np.pi * f * t + k) * np.exp(-t * (decay + k * 0.8)) / (1 + 0.4 * k)
    y *= np.minimum(1, t / 0.004)
    return y / np.max(np.abs(y))


def boom(sec=2.2, f0=72, f1=38):
    n = int(sec * SR); t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 6)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-t * 2.1)
    y += 0.6 * lp(noise(sec), 220) * np.exp(-t * 9)
    y += 0.12 * bp(noise(sec), 1500, 6000) * np.exp(-t * 30)
    y *= np.minimum(1, t / 0.003)
    return y / np.max(np.abs(y))


def draw_scratch(sec=0.9):
    t = np.linspace(0, 1, int(sec * SR))
    y = bp(noise(sec), 2500, 7000) * (np.sin(np.pi * t) ** 0.8) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t) ** 2)
    return y / np.max(np.abs(y))


# ---------- 1) cold open bed ----------
def opener():
    sec = OPEN + 1.5
    n = int(sec * SR); t = np.arange(n) / SR
    # sea: brown-ish noise with slow swells, stereo decorrelated
    out = np.zeros((n, 2))
    for ch, seed_off in ((0, 0.0), (1, 1.3)):
        b = np.cumsum(noise(sec)); b = hp(b, 25); b /= np.max(np.abs(b))
        surf = lp(b, 700)
        swell = 0.55 + 0.45 * np.sin(2 * np.pi * t / 4.3 + seed_off) * np.sin(2 * np.pi * t / 2.9 + 0.7 + seed_off)
        spray = hp(noise(sec), 2800) * 0.06 * np.clip(np.sin(2 * np.pi * t / 4.3 + seed_off), 0, 1) ** 3
        wind = bp(noise(sec), 350, 900) * (0.25 + 0.15 * np.sin(2 * np.pi * t / 6.7 + seed_off))
        out[:, ch] = surf * swell * 0.9 + spray + wind * 0.5
    out /= np.max(np.abs(out))
    fade = np.clip(t / 1.2, 0, 1) * np.clip((OPEN + 0.3 - t) / 0.6, 0, 1)
    out *= fade[:, None]
    place(out, 0.0, -8)
    # low drone, a fifth, swelling towards the cut
    d = (np.sin(2 * np.pi * 55 * t) + 0.55 * np.sin(2 * np.pi * 82.5 * t) + 0.25 * np.sin(2 * np.pi * 110 * t + 0.4))
    d = lp(d * (1 + 0.15 * np.sin(2 * np.pi * 0.23 * t)), 400)
    d *= np.clip(t / 2.5, 0, 1) ** 1.5 * (0.6 + 0.4 * np.clip((t - 3) / 5.5, 0, 1)) * np.clip((OPEN - t) / 0.08, 0, 1)
    d /= np.max(np.abs(d))
    place(d, 0.0, -12)
    # text hits
    for th in (0.85, 3.15, 5.75):
        place(boom(1.8, 64, 40), th, -7)
        place(whoosh(0.55, 400, 6000, 0.7), th - 0.42, -18)
    # riser into the cut
    rs = 3.0; nr = int(rs * SR); tr = np.arange(nr) / SR; u = tr / rs
    f = 140 * (2 ** (u * 3.2))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.5 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)
    air = np.concatenate([bp(noise(rs), 300 + 1500 * k / 4, 900 + 4000 * k / 4)[: nr // 4 + 1] for k in range(4)])[:nr]
    riser = (tone * 0.35 + air * 1.2) * (u ** 2.4)
    riser /= np.max(np.abs(riser))
    place(riser, OPEN - rs, -9)
    # impact on the cut
    place(boom(3.2, 80, 34), OPEN, -4)
    place(whoosh(0.9, 200, 3000, 0.15, rev=False), OPEN, -15)


# ---------- 2) film overlay events (film time) ----------
def F(t):
    return OPEN + t


def film_events():
    # hook typography
    for t in (1.0, 2.15):
        place(tick(900, 0.12), F(t + 0.05), -26)
        place(whoosh(0.5, 500, 7000, 0.6), F(t - 0.2), -29)
    place(whoosh(0.7, 300, 6000, 0.7), F(4.7), -26)
    place(boom(1.6, 58, 38), F(5.45), -20)
    place(tick(1200, 0.1), F(5.95), -27)
    # chapter titles
    for s in (16.9, 42.2, 71.1, 85.2, 100.9, 116.2, 144.2, 159.2, 172.2):
        place(whoosh(0.65, 350, 6000, 0.65), F(s - 0.25), -28, pan=-0.35)
        place(tick(700, 0.14), F(s + 0.32), -29, pan=-0.35)
    # build log
    place(whoosh(0.6, 400, 7000, 0.7), F(16.2), -29, pan=-0.6)
    notes = [523.25, 587.33, 659.25, 783.99, 880.0, 987.77, 1046.5, 1174.66, 1318.51]
    checks = (18.0, 50.6, 77.3, 90.4, 105.9, 122.3, 149.3, 162.5, 173.0)
    for k, t in enumerate(checks):
        place(draw_scratch(0.9), F(t), -36, pan=-0.6)
        place(chime([notes[k], notes[k] * 2.0, notes[k] * 3.01], 1.2, 4.5), F(t + 0.6), -27, pan=-0.6)
    # explanation cards
    for s, e in ((44.2, 52.4), (71.6, 78.0), (85.6, 92.6), (101.4, 107.6), (117.0, 124.6), (144.6, 151.0), (159.6, 169.6)):
        place(whoosh(0.75, 300, 6500, 0.75), F(s - 0.15), -27, pan=0.55)
        place(whoosh(0.55, 300, 5000, 0.3, rev=True), F(e - 0.6), -32, pan=0.55)
    # small mechanical moments inside the cards
    for t in (73.7, 87.3, 104.0, 119.2, 119.35, 147.0, 162.9):
        place(tick(420, 0.16), F(t), -29, pan=0.55)
    # recap
    place(whoosh(0.9, 250, 6000, 0.8), F(190.4), -26, pan=-0.3)
    for i in range(9):
        place(tick(notes[i] * 2, 0.1), F(191.7 + i * 0.36 + 0.45), -30, pan=-0.3)
    place(chime([523.25, 659.25, 783.99, 1046.5], 2.2, 2.2), F(195.2), -25, pan=-0.3)
    place(whoosh(0.6, 300, 5000, 0.3, rev=True), F(200.9), -31, pan=-0.3)
    # build complete
    place(chime([659.25, 987.77, 1318.51], 2.0, 2.4), F(202.7), -26, pan=-0.6)


opener()
film_events()

peak = np.max(np.abs(mix))
if peak > 0.97:
    mix *= 0.97 / peak
out = sys.argv[1] if len(sys.argv) > 1 else "sfx.wav"
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print(f"wrote {out}: {TOTAL:.1f} s, peak {20*np.log10(np.max(np.abs(mix))+1e-12):.1f} dBFS")
