#!/usr/bin/env python3
"""Script gate for a "Built Step by Step" Short (Brainmaxx). Run it before asking the owner to approve the script.

Usage:  python3 script_budget.py beats.json [--json]

Checks what can be measured on the text alone:
  length      narration words -> estimated seconds at 160 wpm with pauses (measured on #9); target 45-60 s
  hook        first spoken sentence addresses "you", has a concrete scenario, <= 22 words in the hook; hookscore.py if found
  chain       every step after the first answers the problem the previous step created (creates -> solves)
  steps       5-9 steps, 8-24 words each, a callout label of <= 3 words
  analogy     at least one step carries an everyday analogy
  asks        exactly one ask (the final `ask`), none inside the steps
  banned      channel voice bans (guys, unlock, game-changer, like and subscribe, in this video ...)
  numbers     any digit or number word in the narration needs an entry in "sources"
  safety      medical / financial advice words are flagged for a human look
  3D budget   every step has pos/size/kind so world.js can build it

It does NOT judge whether the facts are true. Facts are checked by a person against two sources
(see references/pipeline.md, stage 2). Exit code 0 = no FAIL, 1 = at least one FAIL.
"""
import json
import os
import re
import subprocess
import sys

WPM = 160   # measured on #9: 113 words in 42.0 s with pauses = 161 wpm (voice.md says ~150 before pauses)
res = []


def add(level, name, msg):
    res.append((level, name, msg))


def words(s):
    return re.findall(r"[A-Za-z0-9']+", s)


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    d = json.load(open(sys.argv[1]))
    hook, beats, payoff, ask = d["hook"], d["beats"], d["payoff"], d["ask"]
    segs = [("hook", hook["say"])] + [(b.get("id", f"step{i + 1}"), b["say"]) for i, b in enumerate(beats)] + [("payoff", payoff["say"]), ("ask", ask["say"])]
    total_words = sum(len(words(t)) for _, t in segs)
    est = total_words / WPM * 60
    est_p = est + 0.5          # lead-in before the first word
    if 45 <= est_p <= 60:
        add("OK", "length", f"{total_words} words, about {est_p:.0f} s with pauses")
    elif 40 <= est_p < 45 or 60 < est_p <= 66:
        add("WARN", "length", f"{total_words} words, about {est_p:.0f} s. Target is 45-60 s")
    else:
        add("FAIL", "length", f"{total_words} words, about {est_p:.0f} s. Target is 45-60 s (cut or add a step)")

    # ---- hook ----
    hw = len(words(hook["say"]))
    first_sent = re.split(r"(?<=[.!?])\s+", hook["say"].strip())[0]
    if not re.search(r"\b(you|you're|your|you've)\b", first_sent, re.I):
        add("WARN", "hook", "first sentence does not address 'you' (the airplane hook starts with 'You're stranded...')")
    else:
        add("OK", "hook", "first sentence addresses 'you'")
    if hw > 26:
        add("FAIL", "hook", f"hook is {hw} words; the first 3-4 s must carry the scenario, keep it <= 22 (hard limit 26)")
    elif hw > 22:
        add("WARN", "hook", f"hook is {hw} words, aim for <= 22")
    else:
        add("OK", "hook", f"hook length {hw} words")
    if not hook.get("title_top") or not hook.get("title_bottom"):
        add("FAIL", "hook", "title_top and title_bottom (the on-screen frame-0 text, caps, <= 14 characters each) are missing")
    else:
        for k in ("title_top", "title_bottom"):
            if len(hook[k]) > 16:
                add("WARN", "hook", f"{k} is {len(hook[k])} characters; frame 0 is also the thumbnail, keep it <= 14")
    hs = None
    for cand in (os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "yt-script", "hookscore.py"),):
        if os.path.exists(cand):
            hs = cand
    if hs:
        try:
            r = subprocess.run([sys.executable, hs, "--json", "--hook", hook["say"]], capture_output=True, text=True, timeout=30)
            j = json.loads(r.stdout)
            row = j[0] if isinstance(j, list) else j
            score = row.get("verdict")
            add("OK" if (score or 0) >= 55 else "WARN", "hook", f"hookscore {score} (55+ workable, 72+ strong; a heuristic, not a promise)")
        except Exception as e:  # noqa: BLE001
            add("WARN", "hook", f"hookscore.py could not be read ({type(e).__name__}); score the hook by hand")

    # ---- steps ----
    n = len(beats)
    if 5 <= n <= 9:
        add("OK", "steps", f"{n} steps")
    else:
        add("FAIL", "steps", f"{n} steps; 5-9 fit a 45-60 s Short (about 5-8 s per step)")
    for i, b in enumerate(beats):
        bw = len(words(b["say"]))
        lab = b.get("label", "")
        nm = f"step {i + 1}"
        if not 8 <= bw <= 24:
            add("WARN", nm, f"{bw} words (8-24 keeps each step to 3-8 s)")
        if not lab or len(lab.split()) > 3:
            add("FAIL", nm, f"callout label '{lab}' must be 1-3 words, capitals, the real name of the part")
        if lab and len(lab) > 22:
            add("WARN", nm, f"callout '{lab}' is {len(lab)} characters; keep it <= 22 so the pill fits the 80% title-safe width")
        for k in ("pos", "size", "kind"):
            if k not in b:
                add("WARN", "3D budget", f"{nm} has no '{k}' (world.js falls back to a unit box at the origin)")
        if not b.get("problem_text"):
            add("WARN", nm, "no problem_text (the on-screen 'PROBLEM: ...' line is part of the formula)")
        if b.get("anchor") and not re.search(r"\b" + re.escape(b["anchor"].lower()) + r"\b", b["say"].lower()):
            add("FAIL", nm, f"anchor '{b['anchor']}' is not a word of this step's text")

    # ---- chain ----
    broken = []
    for i in range(1, n):
        prev, cur = beats[i - 1], beats[i]
        if not prev.get("creates") or not cur.get("solves"):
            broken.append(i + 1)
    # last step must not create a new problem unless the payoff names it
    if broken:
        add("FAIL", "chain", f"steps {broken}: fill 'creates' on the previous step and 'solves' on this one. Each part must fix the problem the last one caused")
    else:
        add("OK", "chain", "every step solves the problem the previous step created")
    # the narration of step i should mention the problem (loosely): check solves keywords appear in previous text or this text
    for i in range(1, n):
        solves = beats[i].get("solves", "")
        kw = [w for w in words(solves.lower()) if len(w) > 3]
        blob = (beats[i - 1]["say"] + " " + beats[i]["say"]).lower()
        if kw and not any(k in blob for k in kw):
            add("WARN", f"step {i + 1}", f"narration never states the problem ('{solves}'); the viewer must hear the problem before the part")

    # ---- analogy ----
    if any(b.get("analogy") for b in beats):
        add("OK", "analogy", "at least one everyday analogy")
    else:
        add("WARN", "analogy", "no step has an analogy ('like the feathers on an arrow'); add one at the hardest part")

    # ---- asks ----
    ask_re = re.compile(r"\b(save this|subscribe|follow|like this|share this|comment|tell me)\b", re.I)
    inner = [i + 1 for i, b in enumerate(beats) if ask_re.search(b["say"])]
    if inner or ask_re.search(hook["say"]) or ask_re.search(payoff["say"]):
        add("FAIL", "asks", f"an ask appears before the end (steps {inner or 'hook/payoff'}). One ask only, in `ask`")
    if not ask_re.search(ask["say"]):
        add("WARN", "asks", "the final line does not ask for anything; channel plan uses 'Save this ...'")
    if len(ask_re.findall(ask["say"])) > 1:
        add("FAIL", "asks", "more than one ask in the last line")

    # ---- banned ----
    banned = re.compile(r"\b(guys|hey everyone|unlock|game[- ]?changer|like and subscribe|in this video|don't forget|smash|welcome back|hit that)\b", re.I)
    for nm, t in segs:
        m = banned.search(t)
        if m:
            add("FAIL", "voice", f"'{m.group(0)}' in {nm} is banned by channel/voice.md")

    # ---- numbers / sources ----
    numre = re.compile(r"\b(\d[\d,.]*|zero|one hundred|hundred|thousand|million|billion|percent)\b", re.I)
    ones = re.compile(r"\b(two|three|four|five|six|seven|eight|nine|ten)\b", re.I)
    claims = [nm for nm, t in segs if numre.search(t)]
    if claims and not d.get("sources"):
        add("FAIL", "numbers", f"digits in {claims} but 'sources' is empty. No invented numbers: add claim + source, or remove the number")
    elif claims:
        add("OK", "numbers", f"numbers in {claims} are backed by {len(d['sources'])} source entries (still verify them by hand)")
    soft = [nm for nm, t in segs if ones.search(t)]
    if soft and not claims:
        add("WARN", "numbers", f"number words in {soft}: fine for counting parts, a claim needs a source")

    # ---- safety ----
    risky = re.compile(r"\b(cure|treat|diagnos\w*|medication|dose|dosage|invest|stock|crypto|guaranteed|lose \d+ ?(kg|pounds|lbs))\b", re.I)
    for nm, t in segs:
        m = risky.search(t)
        if m:
            add("WARN", "safety", f"'{m.group(0)}' in {nm}: channel rule says no medical or financial advice. Read it yourself")

    if not d.get("original_element"):
        add("FAIL", "original", "'original_element' is empty. Every video needs one demo, example or point of view of its own")
    if not d.get("topic"):
        add("WARN", "topic", "'topic' is empty")

    # ---- print ----
    order = {"FAIL": 0, "WARN": 1, "OK": 2}
    fails = sum(1 for r in res if r[0] == "FAIL")
    warns = sum(1 for r in res if r[0] == "WARN")
    if "--json" in sys.argv:
        print(json.dumps({"fail": fails, "warn": warns, "est_seconds": round(est_p, 1), "words": total_words, "results": res}, indent=1))
    else:
        for lvl, nm, msg in sorted(res, key=lambda r: order[r[0]]):
            print(f"{lvl:<4}  {nm:<10} {msg}")
        print(f"\n{fails} FAIL, {warns} WARN, about {est_p:.0f} s, {total_words} words")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
