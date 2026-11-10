#!/usr/bin/env python3
"""Creates the HyperFrames project for one "Built Step by Step" Short from the skill template.

Usage (from anywhere inside the repo):
  python3 .claude/skills/step-by-step-short/scripts/scaffold_short.py channel/scripts/NN-slug.beats.json [--force]

Reads the approved beats.json, creates channel/motion/NN-slug/ with the template (world.js engine, scripts, fonts, brand
mark), copies beats.json into it, runs `build_timeline.py --estimate` for a silent preview timeline when there is no
voiceover yet, and prints the next commands. Never touches channel/voiceover or channel/published.
"""
import datetime
import json
import os
import re
import shutil
import subprocess
import sys

SKILL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE = os.path.join(SKILL, "assets", "template")


def repo_root(start):
    p = os.path.abspath(start)
    while p != "/" and not os.path.exists(os.path.join(p, "CLAUDE.md")):
        p = os.path.dirname(p)
    if p == "/":
        sys.exit("run this inside the youtube repo (CLAUDE.md not found)")
    return p


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    src = os.path.abspath(sys.argv[1])
    force = "--force" in sys.argv
    root = repo_root(os.getcwd())
    d = json.load(open(src))
    slug = d["slug"]
    if not re.fullmatch(r"\d{2}-[a-z0-9]+(-[a-z0-9]+)*", slug) and not slug.startswith("special-"):
        sys.exit(f"slug '{slug}' must be NN-slug (idea number from channel/ideas/first-12-ideas.md) or special-slug")
    out = os.path.join(root, "channel", "motion", slug)
    if os.path.exists(out) and not force:
        sys.exit(f"{out} exists. Use --force to overwrite the template files (beats.json is kept unless it changed).")
    os.makedirs(out, exist_ok=True)
    for sub in ("assets/fonts", "assets/brand", "assets/audio", "compositions", "scripts/tmpl", "renders"):
        os.makedirs(os.path.join(out, sub), exist_ok=True)

    def cp(a, b):
        shutil.copy2(a, os.path.join(out, b))

    # the engine and scripts
    cp(os.path.join(TEMPLATE, "assets", "world.js"), "assets/world.js")
    for f in os.listdir(os.path.join(TEMPLATE, "scripts")):
        p = os.path.join(TEMPLATE, "scripts", f)
        if os.path.isfile(p):
            cp(p, "scripts/" + f)
    for f in os.listdir(os.path.join(TEMPLATE, "scripts", "tmpl")):
        cp(os.path.join(TEMPLATE, "scripts", "tmpl", f), "scripts/tmpl/" + f)
    cp(os.path.join(TEMPLATE, "hyperframes.json"), "hyperframes.json")
    shutil.copy2(os.path.join(TEMPLATE, "gitignore.tmpl"), os.path.join(out, ".gitignore"))
    now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
    for tmpl, dest in (("package.json.tmpl", "package.json"), ("meta.json.tmpl", "meta.json")):
        t = open(os.path.join(TEMPLATE, tmpl)).read()
        t = t.replace("__SLUG__", slug).replace("__NAME__", slug.replace("-", " ").title()).replace("__NOW__", now)
        open(os.path.join(out, dest), "w").write(t)
    # brand: fonts and mark from the Brand Pack
    bp = os.path.join(root, "channel", "brand", "Brainmaxx-Brand-Pack")
    for f in ("Outfit-Bold.ttf", "Outfit-Regular.ttf", "Outfit-OFL.txt"):
        shutil.copy2(os.path.join(bp, "06-Fonts", f), os.path.join(out, "assets", "fonts", f))
    for f in ("mark-white.svg", "mark-color-dark.svg"):
        shutil.copy2(os.path.join(bp, "01-Vector", f), os.path.join(out, "assets", "brand", f))
    shutil.copy2(src, os.path.join(out, "beats.json"))

    # silent preview timeline
    vo = os.path.join(root, "channel", "voiceover", f"{slug}.words.json")
    mode = [] if os.path.exists(vo) else ["--estimate"]
    r = subprocess.run([sys.executable, os.path.join(out, "scripts", "build_timeline.py")] + mode, capture_output=True, text=True, cwd=out)
    print(r.stdout.strip())
    if r.returncode:
        print(r.stderr.strip())
        sys.exit(r.returncode)
    # code-made sound effects on the (estimated or real) times, so the root's audio tag resolves
    r2 = subprocess.run([sys.executable, os.path.join(out, "scripts", "make_sfx.py"), os.path.join(out, "assets", "audio", "sfx.wav")], capture_output=True, text=True, cwd=out)
    print(r2.stdout.strip() or ("sfx failed: " + r2.stderr.strip()[-300:]))
    # empty captions scene so the project loads before the voiceover exists
    cap = os.path.join(out, "compositions", "captions.html")
    if not os.path.exists(cap):
        open(cap, "w").write('<template>\n  <div id="root" data-composition-id="captions" data-width="1080" data-height="1920"></div>\n'
                             '  <script>(function () { const tl = gsap.timeline({ paused: true }); window.__timelines["captions"] = tl; })();</script>\n</template>\n')
    rel = os.path.relpath(out, root)
    print(f"""
project: {rel}
next:
  1. edit BUILDERS in {rel}/assets/world.js (and pos/size/kind/tone in {rel}/beats.json) so each part looks like the real thing
  2. bash {rel}/scripts/fetch-vendor.sh                      # three, gsap, opentype into assets/vendor (not committed)
  3. export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1 HYPERFRAMES_BROWSER_PATH=/usr/bin/google-chrome
  4. (cd {rel} && npx hyperframes@0.9.8 check) and snapshot 6-8 frames before any full render
after the owner hands over the voiceover (mp3 + words.json):
  python3 {rel}/scripts/build_timeline.py && python3 {rel}/scripts/build_captions.py && python3 {rel}/scripts/make_sfx.py {rel}/assets/audio/sfx.wav
""")


if __name__ == "__main__":
    main()
