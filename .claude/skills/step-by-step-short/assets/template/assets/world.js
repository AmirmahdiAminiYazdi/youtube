// "Built Step by Step" 3D world (1080x1920). Starter engine of the step-by-step-short skill.
// Every frame is a pure function of timeline time t (hf-seek). No clocks, no Math.random.
// Part timings come from assets/beats.js (written by scripts/build_timeline.py from the voiceover word times).
//
// WHAT TO EDIT PER TOPIC (and nothing else in this file):
//   1. BUILDERS: one function per part kind that returns a THREE.Group. Replace the primitive stand-ins with
//      the real shape of the thing (a wing, a heart valve, a lock). Keep each part readable at 1/4 screen width.
//   2. The part positions/sizes/rotations live in beats.json -> beats.js (pos, size, rot, tone).
// Everything else (camera framing, pop-in, callout pills, bursts, dust, bloom, loop) is generic.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { BEATS, LOOP, PAYOFF_T } from "./beats.js";

const W = 1080, H = 1920;
const FONT = "BrandOutfit";
const NAVY = "#0B1B33", TEAL = "#19C3B1", WHITE = "#F4F1EA", ORANGE = "#FF7A3D";

// ---------- math ----------
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const lerp = (a, b, u) => a + (b - a) * u;
const eOut = (x) => 1 - Math.pow(1 - x, 3);
const eInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eBack = (x) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const expoOut = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const bump = (t, a, len) => { const u = (t - a) / len; return u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u); };
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }

// ---------- canvas helpers ----------
function canvas(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function tex(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.needsUpdate = true; return t; }
const col = (hex) => new THREE.Color(hex);
function glowTex(inner, outer) {
  const c = canvas(256, 256), g = c.getContext("2d");
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, inner); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256); return tex(c);
}

// ---------- renderer / scene ----------
const cv = document.getElementById("world");
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.toneMapping = THREE.NoToneMapping; // brand colours must stay exact
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = col("#071226");
scene.fog = new THREE.Fog(col("#071226"), 16, 34);
const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 90);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.6;
const key = new THREE.DirectionalLight(0xfff3e6, 1.3); key.position.set(-4, 6, 8); scene.add(key);
const rim = new THREE.DirectionalLight(0x19c3b1, 1.2); rim.position.set(5, 2, -6); scene.add(rim);
scene.add(new THREE.HemisphereLight(0x33507a, 0x050a14, 0.5));

// soft backdrop glow behind the build
const backGlow = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), new THREE.MeshBasicMaterial({ map: glowTex("rgba(30,70,120,0.85)", "rgba(7,18,38,0)"), transparent: true, depthWrite: false, fog: false }));
backGlow.position.set(0, 0, -7); scene.add(backGlow);
// floor disc the build stands on (gives the 3D object a place)
const floor = new THREE.Mesh(new THREE.CircleGeometry(5.2, 96), new THREE.MeshBasicMaterial({ map: glowTex("rgba(25,195,177,0.12)", "rgba(25,195,177,0)"), transparent: true, depthWrite: false }));
floor.rotation.x = -Math.PI / 2; scene.add(floor);

const DUST = 600, dustBase = new Float32Array(DUST * 3);
for (let i = 0; i < DUST; i++) {
  dustBase[i * 3] = (hash(i * 3.1) - 0.5) * 30; dustBase[i * 3 + 1] = (hash(i * 5.7) - 0.5) * 22; dustBase[i * 3 + 2] = -6 + hash(i * 9.3) * 10;
}
const dustGeo = new THREE.BufferGeometry();
dustGeo.setAttribute("position", new THREE.BufferAttribute(dustBase.slice(), 3));
const dotTex = (() => { const c = canvas(64, 64), g = c.getContext("2d"); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,0.5)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return tex(c); })();
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: 0.045, map: dotTex, transparent: true, opacity: 0.5, depthWrite: false, color: col("#9fd8ea"), blending: THREE.AdditiveBlending }));
scene.add(dust);

// ---------- bursts (ring + sparks when a part lands) ----------
const BURST_N = 36, haloTex = glowTex("rgba(25,195,177,1)", "rgba(25,195,177,0)");
function makeBurst() {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.96, 1.0, 96), new THREE.MeshBasicMaterial({ color: col(TEAL).multiplyScalar(2.2), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(BURST_N * 3), 3));
  const pts = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.07, map: dotTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: col(ORANGE).multiplyScalar(2.4) }));
  g.add(halo, ring, pts); scene.add(g);
  return { g, ring, halo, pts };
}
function drawBurst(b, t, t0, origin, scale, seed) {
  const u = (t - t0) / 0.8;
  if (u < 0 || u > 1) { b.g.visible = false; return; }
  b.g.visible = true; b.g.position.copy(origin); b.g.quaternion.copy(camera.quaternion);
  b.ring.scale.setScalar(lerp(0.8, 2.6, expoOut(u)) * scale); b.ring.material.opacity = Math.pow(1 - u, 2.5) * 0.55;
  b.halo.scale.setScalar(lerp(1.0, 2.6, eOut(u)) * scale); b.halo.material.opacity = (1 - u) * 0.25;
  const p = b.pts.geometry.attributes.position;
  for (let i = 0; i < BURST_N; i++) {
    const a = hash(seed + i * 1.3) * Math.PI * 2, sp = 0.6 + hash(seed + i * 7.7) * 1.4, d = expoOut(u) * sp * 1.3 * scale;
    p.setXYZ(i, Math.cos(a) * d, Math.sin(a) * d - u * u * 0.25, 0.15);
  }
  p.needsUpdate = true; b.pts.material.opacity = 1 - u;
}
const bursts = BEATS.map(() => makeBurst());

// ---------- callout pill ----------
function pillMesh(text) {
  const fs = 64, pad = 44, m = canvas(8, 8).getContext("2d"); m.font = `700 ${fs}px ${FONT}`;
  const w = Math.ceil(m.measureText(text).width + pad * 2), h = Math.ceil(fs * 1.7);
  const c = canvas(w, h), g = c.getContext("2d");
  rr(g, 3, 3, w - 6, h - 6, (h - 6) / 2); g.fillStyle = "rgba(11,27,51,0.90)"; g.fill();
  g.lineWidth = 5; g.strokeStyle = TEAL; g.stroke();
  g.font = `700 ${fs}px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = WHITE; g.fillText(text, w / 2, h / 2 + fs * 0.04);
  const unit = 0.5;  // world height of the pill at scale 1; the per-frame scale keeps it ~70 px tall on screen
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(unit * w / h, unit), new THREE.MeshBasicMaterial({ map: tex(c), transparent: true, depthWrite: false, depthTest: false }));
  mesh.renderOrder = 10; return { mesh, w: unit * w / h };
}

// ---------- part builders: EDIT THESE PER TOPIC ----------
const TONES = { teal: TEAL, white: WHITE, navy: "#16345c", steel: "#7C93B3", orange: ORANGE };
function mat(tone, extra = {}) {
  return new THREE.MeshPhysicalMaterial({ color: col(TONES[tone] || tone || WHITE), roughness: 0.42, metalness: 0.12, clearcoat: 0.5, clearcoatRoughness: 0.35, ...extra });
}
// Each builder receives the beat definition d = { size:[x,y,z], tone } and returns a Group centred on its origin.
const BUILDERS = {
  box: (d) => { const g = new THREE.Group(); g.add(new THREE.Mesh(new RoundedBoxGeometry(d.size[0], d.size[1], d.size[2], 5, Math.min(...d.size) * 0.18), mat(d.tone))); return g; },
  plate: (d) => BUILDERS.box({ ...d, size: [d.size[0], Math.min(d.size[1], 0.08), d.size[2]] }),
  fin: (d) => BUILDERS.box({ ...d, size: [Math.min(d.size[0], 0.1), d.size[1], d.size[2]] }),
  cyl: (d) => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.CylinderGeometry(d.size[0] / 2, d.size[0] / 2, d.size[1], 48), mat(d.tone))); return g; },
  cone: (d) => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.ConeGeometry(d.size[0] / 2, d.size[1], 48), mat(d.tone))); return g; },
  sphere: (d) => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(d.size[0] / 2, 48, 32), mat(d.tone))); return g; },
  torus: (d) => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.TorusGeometry(d.size[0] / 2, d.size[1] / 2, 24, 64), mat(d.tone))); return g; },
};

// ---------- build ----------
const ready = (async function build() {
  const ff = new FontFace(FONT, "url(assets/fonts/Outfit-Bold.ttf)", { weight: "700" });
  await ff.load(); document.fonts.add(ff);
})();

let S = null;
function buildAll() {
  const parts = BEATS.filter((b) => b.part).map((b, i) => {
    const grp = (BUILDERS[b.kind] || BUILDERS.box)(b);
    const holder = new THREE.Group(); holder.add(grp); scene.add(holder);
    const pill = b.label ? pillMesh(b.label) : null;
    if (pill) scene.add(pill.mesh);
    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: col(TEAL), transparent: true, depthTest: false }));
    line.renderOrder = 9; scene.add(line);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
    scene.add(glow);
    return { b, i, holder, pill, line, glow, base: i === 0 };
  });
  return { parts };
}

// ---------- post ----------
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
composer.setPixelRatio(1); composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.5, 0.5, 1.0));
const grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uFrame: { value: 0 }, uFlash: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uFrame, uFlash; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 q = vUv - 0.5; q.y *= 1.25;
      c.rgb *= mix(0.55, 1.0, smoothstep(0.95, 0.25, length(q)));
      c.rgb += (h(vUv * vec2(1080.0, 1920.0) + uFrame * 7.13) - 0.5) * 0.022;
      c.rgb += uFlash * vec3(0.10, 0.45, 0.42); gl_FragColor = c; }`,
});
composer.addPass(grade);
composer.addPass(new OutputPass());

// ---------- per-frame ----------
const tmpV = new THREE.Vector3(), camPos = new THREE.Vector3(), camTgt = new THREE.Vector3();
const POP = 0.55;           // seconds a part takes to pop in
const HOLD = 1.7;           // seconds a callout stays up (it also leaves when the next part lands)

// how "present" a part is at time t: 0..1 (the base object is present from frame 0)
const presence = (p, t) => (p.base ? 1 : eOut(seg(t, p.b.t, p.b.t + POP)));

function frameCamera(t) {
  // frame everything built so far: centre on the weighted centre of present parts, back off with the radius
  let cx = 0, cy = 0, cz = 0, wsum = 0;
  for (const p of S.parts) {
    const w = presence(p, t); if (w <= 0) continue;
    cx += p.b.pos[0] * w; cy += p.b.pos[1] * w; cz += p.b.pos[2] * w; wsum += w;
  }
  cx /= wsum; cy /= wsum; cz /= wsum;
  let r = 1.0;
  for (const p of S.parts) {
    const w = presence(p, t); if (w <= 0) continue;
    r = Math.max(r, w * (Math.hypot(p.b.pos[0] - cx, p.b.pos[2] - cz) + Math.max(...p.b.size) * 0.5), w * (Math.abs(p.b.pos[1] - cy) * 0.6 + Math.max(...p.b.size) * 0.5));
  }
  // visible width at distance d is 0.355 d (fov 35, 9:16); keep the build inside ~62% of it
  const payoff = eInOut(seg(t, PAYOFF_T, PAYOFF_T + 1.6));
  const orbit = 0.35 + t * 0.03 + payoff * 0.5 + Math.sin(t * 0.35) * 0.04;
  const dist = Math.max(8.5, (r * 2) / (0.355 * 0.62)) * (1 + payoff * 0.12);
  camPos.set(cx + Math.sin(orbit) * dist * 0.5, cy + dist * 0.22, cz + Math.cos(orbit) * dist);
  camTgt.set(cx, cy - dist * 0.03, cz);
  let kick = 0;
  for (const p of S.parts) if (!p.base && t >= p.b.t) kick += Math.exp(-(t - p.b.t) * 5);
  camPos.lerp(camTgt, Math.min(0.08, kick * 0.04));
}

function renderAt(tIn) {
  if (!S) return;
  const t = tIn >= LOOP ? 0 : tIn;           // last 0.15 s repeat frame 0 so the Short loops
  frameCamera(t);
  camera.position.copy(camPos); camera.lookAt(camTgt);

  const dp = dust.geometry.attributes.position;
  for (let i = 0; i < DUST; i++) dp.setXYZ(i, dustBase[i * 3] + Math.sin(t * 0.21 + i) * 0.25, dustBase[i * 3 + 1] + ((t * 0.08 + hash(i * 1.7) * 3) % 3) - 1.5, dustBase[i * 3 + 2]);
  dp.needsUpdate = true;

  let flash = 0;
  for (const p of S.parts) {
    const b = p.b, u = presence(p, t);
    const land = p.base ? 0 : seg(t, b.t, b.t + POP);
    p.holder.visible = u > 0.001;
    // pop: scale with overshoot, drop in from above, small settle wobble
    const s = p.base ? 1 : Math.max(0.001, eBack(land));
    p.holder.scale.setScalar(s);
    p.holder.position.set(b.pos[0], b.pos[1] + (p.base ? 0 : (1 - eOut(land)) * 1.6), b.pos[2]);
    p.holder.rotation.set(b.rot[0], b.rot[1] + (p.base ? Math.sin(t * 0.6) * 0.02 : 0), b.rot[2] + (p.base ? 0 : (1 - eOut(land)) * 0.5));
    // glow on landing
    p.glow.visible = !p.base && t >= b.t && t < b.t + 1.4;
    p.glow.quaternion.copy(camera.quaternion);
    p.glow.position.copy(p.holder.position); p.glow.scale.setScalar(Math.min(4, Math.max(...b.size) * 1.6 + 0.8));
    p.glow.material.opacity = 0.3 * bump(t, b.t, 1.3);
    // callout pill: pops with the part, leaves after HOLD or when the next beat starts to land
    if (p.pill) {
      const on = p.base ? t < HOLD + 0.4 : t >= b.t + 0.12 && t < b.t + HOLD;
      const k = p.base ? 1 - seg(t, HOLD, HOLD + 0.4) : eBack(seg(t, b.t + 0.12, b.t + 0.5)) * (1 - seg(t, b.t + HOLD - 0.3, b.t + HOLD));
      p.pill.mesh.visible = on && k > 0.01; p.line.visible = p.pill.mesh.visible;
      if (p.pill.mesh.visible) {
        // work in camera space: pill keeps a constant size on screen and stays inside the 80% title-safe width
        const z = camera.position.distanceTo(p.holder.position);
        const halfW = z * Math.tan(THREE.MathUtils.degToRad(17.5)) * (W / H);   // half visible width at depth z
        const sc = 0.046 * z * Math.max(0.001, k);
        const pw = p.pill.w * sc;
        const a = p.holder.position.clone(); camera.worldToLocal(a);
        const reach = Math.max(...b.size) * 0.5;
        let px = a.x + (b.label_side === "left" ? -1 : b.label_side === "right" ? 1 : (a.x > 0 ? -1 : 1)) * (reach * 0.3);
        let py = a.y + reach * 0.5 + z * 0.075 + (b.label_up || 0);
        const lim = 0.8 * halfW - pw * 0.5;
        px = Math.max(-lim, Math.min(lim, px));
        const pc = new THREE.Vector3(px, py, a.z); camera.localToWorld(pc);
        p.pill.mesh.position.copy(pc); p.pill.mesh.quaternion.copy(camera.quaternion); p.pill.mesh.scale.setScalar(sc);
        p.pill.mesh.material.opacity = clamp01(k * 1.4);
        const pb = new THREE.Vector3(px, py - z * 0.023 * 0.5, a.z); camera.localToWorld(pb);
        const ln = p.line.geometry.attributes.position;
        ln.setXYZ(0, p.holder.position.x, p.holder.position.y, p.holder.position.z); ln.setXYZ(1, pb.x, pb.y, pb.z);
        ln.needsUpdate = true; p.line.material.opacity = clamp01(k);
      }
    }
    if (!p.base) { drawBurst(bursts[p.i], t, b.t + 0.18, p.holder.position, Math.min(1.1, 0.35 + Math.max(...b.size) * 0.18), 10 + p.i * 13); flash = Math.max(flash, bump(t, b.t, 0.3) * 0.05); }
    else bursts[p.i].g.visible = false;
  }
  // payoff: a bright pulse and every callout shown briefly again is left to the HUD; the 3D just flashes
  flash = Math.max(flash, bump(t, PAYOFF_T, 0.5) * 0.09);
  grade.uniforms.uFlash.value = flash;
  grade.uniforms.uFrame.value = Math.round(tIn * 30);
  composer.render();
}

ready.then(() => {
  S = buildAll();
  window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
  renderAt(0);
  window.__worldReady && window.__worldReady();
}).catch((err) => { console.error("world build failed", err); window.__worldReady && window.__worldReady(); });
