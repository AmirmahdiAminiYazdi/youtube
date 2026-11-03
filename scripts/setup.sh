#!/usr/bin/env bash
# One-command setup for the channel toolbox. Safe to run again.
#   bash scripts/setup.sh            # everything that does not need a GUI app or an account
#   bash scripts/setup.sh --check    # only report what is installed
# Needs: git, node >= 22, npm, python3, uv (https://docs.astral.sh/uv/), ffmpeg, Chrome or Chromium.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# shellcheck disable=SC1091
source tools/pins.env
CHECK_ONLY=0; [ "${1:-}" = "--check" ] && CHECK_ONLY=1
export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1
ok()   { printf '  ok    %s\n' "$*"; }
warn() { printf '  WARN  %s\n' "$*"; }
step() { printf '\n== %s\n' "$*"; }

fetch_pinned() {  # repo sha dest  -> shallow checkout of exactly that commit
  local repo="$1" sha="$2" dest="$3"
  if [ -d "$dest/.git" ] && [ "$(git -C "$dest" rev-parse HEAD 2>/dev/null)" = "$sha" ]; then ok "$repo already at ${sha:0:7}"; return; fi
  rm -rf "$dest"; mkdir -p "$dest"
  git -C "$dest" init -q
  git -C "$dest" remote add origin "https://github.com/$repo.git"
  if git -C "$dest" fetch -q --depth 1 origin "$sha" && git -C "$dest" checkout -q FETCH_HEAD; then ok "$repo fetched at ${sha:0:7}"
  else warn "could not fetch $repo (network blocked?)"; rm -rf "$dest"; return 1; fi
}

step "Prerequisites"
for c in git node npm python3 uv ffmpeg; do command -v "$c" >/dev/null && ok "$c $($c --version 2>&1 | head -1)" || warn "$c missing"; done
CHROME="$(command -v google-chrome || command -v chromium || command -v chromium-browser || true)"
[ -n "$CHROME" ] && ok "browser: $CHROME" || warn "no Chrome/Chromium found (needed for HyperFrames and Remotion renders)"
node -e 'process.exit(+process.versions.node.split(".")[0] >= 22 ? 0 : 1)' && ok "node >= 22" || warn "node 22 or newer required"
[ "$CHECK_ONLY" = 1 ] && { step "Check only: stopping here"; exit 0; }

step "JavaScript libraries (tools/motion-lab, exact versions from package-lock.json)"
( cd tools/motion-lab && npm ci --ignore-scripts --no-audit --no-fund --loglevel=error && npm run -s smoke )

step "Python libraries (tools/python, manim + faster-whisper)"
if ! pkg-config --exists pangocairo 2>/dev/null; then
  warn "pango/cairo headers missing, manim will not build. Ubuntu/Debian: sudo apt-get install -y libcairo2-dev libpango1.0-dev pkg-config. macOS: brew install pango cairo pkg-config"
fi
( cd tools/python && uv venv --python 3.13 .venv -q 2>/dev/null || true
  uv pip install --python .venv/bin/python -r requirements.lock -q \
   && .venv/bin/python -I -W ignore -c "import manim, faster_whisper; print('  ok    manim', manim.__version__, '| faster-whisper', faster_whisper.__version__)" ) || warn "python libraries failed"

step "Remotion agent skills (no license file upstream, so fetched, not committed)"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
if fetch_pinned "$REMOTION_SKILLS_REPO" "$REMOTION_SKILLS_SHA" "$TMP/remotion-skills"; then
  for s in "$TMP"/remotion-skills/skills/*/; do rm -rf ".claude/skills/$(basename "$s")"; cp -r "$s" .claude/skills/; done
  ok "remotion skills copied to .claude/skills ($(ls "$TMP"/remotion-skills/skills | wc -l) skills)"
fi

step "UI component sources (shadcn/ui, magicui, motion-primitives, react-bits) into tools/ui-parts/vendor"
mkdir -p tools/ui-parts/vendor
fetch_pinned "$SHADCN_UI_REPO" "$SHADCN_UI_SHA" tools/ui-parts/vendor/shadcn-ui || true
fetch_pinned "$MAGICUI_REPO" "$MAGICUI_SHA" tools/ui-parts/vendor/magicui || true
fetch_pinned "$MOTION_PRIMITIVES_REPO" "$MOTION_PRIMITIVES_SHA" tools/ui-parts/vendor/motion-primitives || true
fetch_pinned "$REACT_BITS_REPO" "$REACT_BITS_SHA" tools/ui-parts/vendor/react-bits || true
( cd tools/ui-parts && npm ci --ignore-scripts --no-audit --no-fund --loglevel=error && ok "shadcn CLI $(npx --no-install shadcn --version 2>/dev/null | head -1)" ) || warn "shadcn CLI install failed"

step "Optional MCP servers (need an app or an account, see TOOLS.md)"
if [ -n "${SETUP_MCP:-}" ]; then
  mkdir -p tools/mcp/vendor
  fetch_pinned "$BLENDER_MCP_REPO" "$BLENDER_MCP_SHA" tools/mcp/vendor/blender-mcp || true
  fetch_pinned "$AFTER_EFFECTS_MCP_REPO" "$AFTER_EFFECTS_MCP_SHA" tools/mcp/vendor/after-effects-mcp || true
else
  ok "skipped (set SETUP_MCP=1 to fetch the Blender and After Effects MCP sources at their pinned commits)"
fi

step "Done"
echo "  Next: read TOOLS.md. Render test: cd tools/motion-lab && npm run smoke:remotion"
