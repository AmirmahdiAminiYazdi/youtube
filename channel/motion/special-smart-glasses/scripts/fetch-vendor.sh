#!/usr/bin/env bash
# Fetches the pinned third-party libraries into assets/vendor (not committed).
# Versions match tools/motion-lab/package.json.
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
( cd "$TMP" && npm init -y >/dev/null && npm install --no-audit --no-fund gsap@3.15.0 three@0.187.0 opentype.js@1.3.4 >/dev/null )
V="$HERE/assets/vendor"; mkdir -p "$V/jsm"
cp "$TMP/node_modules/gsap/dist/gsap.min.js" "$V/"
cp "$TMP/node_modules/three/build/three.module.js" "$TMP/node_modules/three/build/three.core.js" "$V/"
J="$TMP/node_modules/three/examples/jsm"
cp -r "$J/postprocessing" "$J/shaders" "$J/geometries" "$J/environments" "$J/loaders" "$J/utils" "$V/jsm/"
cp "$TMP/node_modules/opentype.js/dist/opentype.module.js" "$V/opentype.module.js"
# TTFLoader imports opentype from a CDN, which is blocked here and banned in the project: point it at the local copy.
sed -i "s#import opentype from 'https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/+esm';#import opentype from '../../opentype.module.js';#" "$V/jsm/loaders/TTFLoader.js"
rm -rf "$TMP"
echo "vendor files ready"
