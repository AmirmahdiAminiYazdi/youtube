#!/usr/bin/env bash
# Fetches the pinned third-party libraries into each project's assets/vendor (not committed).
# Versions match tools/motion-lab/package.json.
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
( cd "$TMP" && npm init -y >/dev/null && npm install --no-audit --no-fund gsap@3.15.0 three@0.187.0 >/dev/null )
mkdir -p "$HERE/overlays/assets/vendor" "$HERE/opener/assets/vendor"
for f in gsap.min.js DrawSVGPlugin.min.js CustomEase.min.js; do
  cp "$TMP/node_modules/gsap/dist/$f" "$HERE/overlays/assets/vendor/"
  cp "$TMP/node_modules/gsap/dist/$f" "$HERE/opener/assets/vendor/"
done
cp "$TMP/node_modules/three/build/three.module.js" "$TMP/node_modules/three/build/three.core.js" "$HERE/opener/assets/vendor/"
mkdir -p "$HERE/opener/assets/vendor/jsm"
cp -r "$TMP/node_modules/three/examples/jsm/postprocessing" "$TMP/node_modules/three/examples/jsm/shaders" "$HERE/opener/assets/vendor/jsm/"
rm -rf "$TMP"
echo "vendor files ready"
