#!/usr/bin/env python3
"""Refresh the AUTO block of channel/STATUS.md from the repository state.

Usage:  python3 scripts/refresh_status.py

Standard library only. Text outside the AUTO markers is never changed.
Pipeline convention: idea number NN has files named "NN-slug" in
channel/scripts, channel/motion, channel/voiceover and channel/published.
A published/NN-*.md file containing a line "status: published" marks the
video as published.
"""
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

try:
    from zoneinfo import ZoneInfo
    NOW = datetime.now(ZoneInfo("Europe/Berlin"))
except Exception:  # no tz database available
    NOW = datetime.now()

ROOT = Path(__file__).resolve().parents[1]
CHANNEL = ROOT / "channel"
STATUS = CHANNEL / "STATUS.md"
IDEAS = CHANNEL / "ideas" / "first-12-ideas.md"
START, END = "<!-- AUTO:START -->", "<!-- AUTO:END -->"
SERIES = {"AI in 60", "Mind Hacks", "Learn Faster"}
STAGES = [("Script", "scripts"), ("Motion", "motion"),
          ("Voiceover", "voiceover"), ("Package", "published")]


def read_ideas():
    series, out = None, []
    for line in IDEAS.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^### (.+)$", line)
        if m:
            series = m.group(1).strip()
            continue
        m = re.match(r"^(\d+)\. \*\*(.+?)\*\*", line)
        if m and series in SERIES:
            out.append((int(m.group(1)), series, m.group(2)))
    return out


def stage_done(folder, n):
    d = CHANNEL / folder
    if not d.exists():
        return False
    return any(p.name.startswith(f"{n:02d}-") and p.name != ".gitkeep"
               for p in d.iterdir())


def is_published(n):
    d = CHANNEL / "published"
    if not d.exists():
        return False
    for p in d.glob(f"{n:02d}-*"):
        if p.is_file() and re.search(r"^\s*status:\s*published",
                                     p.read_text(errors="ignore"),
                                     re.I | re.M):
            return True
    return False


def count_files(folder):
    d = CHANNEL / folder
    if not d.exists():
        return 0
    return sum(1 for p in d.rglob("*") if p.is_file() and p.name != ".gitkeep")


def git_log():
    try:
        out = subprocess.run(
            ["git", "-C", str(ROOT), "log", "-10",
             "--pretty=format:%ad  %s", "--date=short"],
            capture_output=True, text=True, timeout=20, check=True).stdout
        return out.strip().splitlines() or ["(no commits)"]
    except Exception:
        return ["(git history not available)"]


def build_block():
    ideas = read_ideas()
    rows, next_item, published = [], None, 0
    for n, series, title in ideas:
        cells = ["yes" if stage_done(f, n) else "-" for _, f in STAGES]
        pub = is_published(n)
        published += pub
        rows.append(f"| {n} | {series} | {title} | " + " | ".join(cells)
                    + f" | {'yes' if pub else '-'} |")
        if next_item is None and not pub:
            for (label, _), c in zip(STAGES, cells):
                if c == "-":
                    next_item = f"#{n} \"{title}\": next stage is {label}"
                    break
    skills = sorted(p.parent.name for p in
                    (ROOT / ".claude" / "skills").glob("*/SKILL.md"))
    lines = [
        f"_Auto-refreshed: {NOW:%Y-%m-%d %H:%M} (Europe/Berlin)._",
        "",
        "### Snapshot",
        "",
        f"- Stage: {'pre-launch, nothing published yet' if published == 0 else f'{published} video(s) published'}",
        f"- Next in the pipeline: {next_item or 'all listed ideas are published'}",
        f"- Skills installed: {len(skills)} (`.claude/skills/`)",
        "- Files: " + ", ".join(
            f"{f} {count_files(f)}" for f in
            ["ideas", "scripts", "thumbnails", "motion", "voiceover",
             "published", "research"]),
        "",
        "### Pipeline (from `channel/ideas/first-12-ideas.md`)",
        "",
        "| # | Series | Working title | Script | Motion | Voiceover | Package | Published |",
        "|---|---|---|---|---|---|---|---|",
        *rows,
        "",
        "### Last 10 commits",
        "",
        *[f"- {l}" for l in git_log()],
    ]
    return "\n".join(lines)


def main():
    text = STATUS.read_text(encoding="utf-8")
    if START not in text or END not in text:
        sys.exit("AUTO markers not found in channel/STATUS.md")
    head, rest = text.split(START, 1)
    _, tail = rest.split(END, 1)
    STATUS.write_text(f"{head}{START}\n{build_block()}\n{END}{tail}",
                      encoding="utf-8")
    print("channel/STATUS.md refreshed")


if __name__ == "__main__":
    main()
