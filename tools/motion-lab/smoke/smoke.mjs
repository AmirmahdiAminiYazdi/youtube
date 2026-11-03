// Smoke test: every pinned library must install at the pinned version and load.
// Browser-only libraries (lottie-web, wavesurfer.js, react-three-fiber, tone) are
// checked by resolving the package and reading its manifest; the ones that are
// safe to import in Node are imported for real.
import { readFileSync } from 'node:fs';
const pkgJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const pinned = pkgJson.dependencies;

function manifest(name) {
  // Read the file directly: many packages hide package.json behind "exports".
  return JSON.parse(readFileSync(new URL(`../node_modules/${name}/package.json`, import.meta.url)));
}

const importable = {
  three: (m) => typeof m.Scene === 'function',
  animejs: (m) => typeof m.animate === 'function',
  motion: (m) => typeof m.animate === 'function',
  gsap: (m) => typeof (m.gsap || m.default).to === 'function',
  remotion: (m) => typeof m.interpolate === 'function' && m.interpolate(5, [0, 10], [0, 100]) === 50,
};
// Not importable in plain Node on purpose: @motion-canvas/* and @revideo/* are
// Vite/bundler packages (directory imports), so they are checked by manifest only.

let failed = 0;
for (const [name, want] of Object.entries(pinned)) {
  try {
    const mf = manifest(name);
    if (mf.version !== want) throw new Error(`version ${mf.version} != pinned ${want}`);
    let how = 'manifest';
    if (importable[name]) {
      const m = await import(name);
      if (!importable[name](m)) throw new Error('import loaded but API check failed');
      how = 'import+api';
    }
    console.log(`ok   ${name}@${mf.version} (${how})`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${name}: ${e.message}`);
  }
}
process.exit(failed ? 1 : 0);
