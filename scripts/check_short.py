#!/usr/bin/env python3
"""Pre-upload gate for a vertical Short (Brainmaxx).

Usage:  python3 scripts/check_short.py path/to/video.mp4

Checks what can be measured without watching the video:
  format      1080x1920, H.264, yuv420p, limited range, bt709, AAC audio, 30 fps
  length      25-60 s (channel plan: 45-60 s; shorter is a warning, not a failure)
  loudness    integrated -17..-13 LUFS, true peak <= -1 dBFS
  silent tail the last 0.5 s must not be silent (breaks the Shorts loop)
  first frames  no hard cut in the first 1.5 s (a leftover scene flashing at 0:00)
  renderer    warns when the file was not rendered with the pinned HyperFrames

It does NOT judge brand, captions, safe zone or facts; look at the contact sheet
printed at the end for those (see channel/research/*adaptive-headlights-review.fa.md).
Exit code 0 = no FAIL, 1 = at least one FAIL.
"""
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

PINNED_HYPERFRAMES = "0.9.8"
results = []


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def report(level, name, msg):
    results.append(level)
    print(f"  [{level:4}] {name}: {msg}")


def main(path):
    p = Path(path)
    if not p.is_file():
        sys.exit(f"not a file: {path}")

    probe = run(["ffprobe", "-v", "error", "-print_format", "json", "-show_format",
                 "-show_streams", str(p)])
    info = json.loads(probe.stdout)
    video = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
    audio = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    duration = float(info["format"]["duration"])
    tags = info["format"].get("tags", {})

    print(f"{p.name}  ({duration:.1f} s)")

    # format
    if not video:
        report("FAIL", "format", "no video stream")
        return
    want = {"codec_name": "h264", "width": 1080, "height": 1920, "pix_fmt": "yuv420p",
            "color_range": "tv", "color_space": "bt709"}
    bad = [f"{k}={video.get(k)} (want {v})" for k, v in want.items() if video.get(k) != v]
    num, den = video.get("avg_frame_rate", "0/1").split("/")
    fps = float(num) / float(den or 1)
    if abs(fps - 30) > 0.5:
        bad.append(f"fps={fps:.2f} (want 30)")
    if not audio or audio.get("codec_name") != "aac":
        bad.append("no AAC audio stream")
    report("FAIL" if bad else "ok", "format", "; ".join(bad) if bad else "1080x1920 h264 yuv420p tv bt709 30fps aac")

    # length
    if duration > 60.5:
        report("WARN", "length", f"{duration:.1f} s is over 60 s")
    elif duration < 25:
        report("WARN", "length", f"{duration:.1f} s is under 25 s")
    elif duration < 45:
        report("note", "length", f"{duration:.1f} s is shorter than the 45-60 s plan (fine if it holds attention)")
    else:
        report("ok", "length", f"{duration:.1f} s")

    # loudness
    if audio:
        r = run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(p), "-af", "ebur128=peak=true",
                 "-f", "null", "-"])
        txt = r.stderr
        i = re.search(r"I:\s+(-?[\d.]+) LUFS", txt.split("Summary:")[-1])
        tp = re.search(r"Peak:\s+(-?[\d.]+) dBFS", txt.split("Summary:")[-1])
        if i and tp:
            lufs, peak = float(i.group(1)), float(tp.group(1))
            level = "ok" if -17 <= lufs <= -13 and peak <= -1 else "WARN"
            report(level, "loudness", f"{lufs} LUFS, true peak {peak} dBFS (target -17..-13, peak <= -1)")

        # silent tail
        r = run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(p), "-af",
                 "silencedetect=noise=-45dB:d=0.3", "-f", "null", "-"])
        starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
        ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
        # only a silence that is still running at the end of the file is a silent tail;
        # a pause that ends before the last 0.1 s is just a pause between lines
        tail = [s for k, s in enumerate(starts)
                if duration - s >= 0.5 and (k >= len(ends) or ends[k] >= duration - 0.1)]
        if tail:
            report("WARN", "silent tail", f"silence from {tail[-1]:.1f} s to the end ({duration - tail[-1]:.1f} s): breaks the loop, cut it or fill it")
        else:
            report("ok", "silent tail", "audio runs to the end")

    # hard cuts in the first 1.5 s (a leftover scene flashing before the real first frame)
    r = run(["ffmpeg", "-hide_banner", "-nostats", "-t", "1.5", "-i", str(p), "-vf",
             "select='gt(scene,0.18)',showinfo", "-an", "-f", "null", "-"])
    cuts = [float(x) for x in re.findall(r"pts_time:([\d.]+)", r.stderr)]
    cuts = [c for c in cuts if c > 0]
    if cuts:
        report("FAIL", "first frames", f"hard cut at {cuts[0]:.2f} s: frame 0 is a different scene from the hook (flash frame). Check scene visibility at t=0")
    else:
        report("ok", "first frames", "no hard cut in the first 1.5 s")

    # renderer
    ver = tags.get("hyperframes_version")
    if ver and ver != PINNED_HYPERFRAMES:
        report("WARN", "renderer", f"rendered with hyperframes {ver}, repo pins {PINNED_HYPERFRAMES}: the project may not have used our template/brand rules")
    elif ver:
        report("ok", "renderer", f"hyperframes {ver}")
    else:
        report("note", "renderer", "no hyperframes tag in the file")

    # contact sheet for a human look
    sheet = Path(tempfile.gettempdir()) / f"{p.stem}-contact.jpg"
    run(["ffmpeg", "-v", "error", "-i", str(p), "-vf",
         "fps=1/2,scale=270:-1,tile=8x3", "-frames:v", "1", "-y", str(sheet)])
    print(f"\n  contact sheet (look at it at phone size): {sheet}")
    print(f"  {results.count('FAIL')} FAIL, {results.count('WARN')} WARN")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
    sys.exit(1 if "FAIL" in results else 0)
