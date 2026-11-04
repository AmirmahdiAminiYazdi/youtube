// 3D world for #9 "Stop Rereading" (1080x1920, 43 s).
// Every frame is a pure function of timeline time t (hf-seek). No clocks, no Math.random.
// Times come from the ElevenLabs Scribe word timings in channel/voiceover/09-stop-rereading.words.json.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { TTFLoader } from "three/addons/loaders/TTFLoader.js";
import { Font } from "three/addons/loaders/FontLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const W = 1080, H = 1920;
const LOOP = 42.85;               // from here the frame equals frame 0, so the loop is seamless
const FONT = "BrandOutfit";

// ---------- palette (sRGB hex) ----------
const NAVY = "#0B1B33", TEAL = "#19C3B1", WHITE = "#F4F1EA", ORANGE = "#FF7A3D";
const INK = "#0B1B33";

// ---------- math ----------
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const lerp = (a, b, u) => a + (b - a) * u;
const eOut = (x) => 1 - Math.pow(1 - x, 3);
const eIn = (x) => x * x * x;
const eInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eBack = (x) => { const c1 = 2.0, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const expoOut = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const bump = (t, a, len) => { const u = (t - a) / len; return u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u); };
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }

// keyframe track: keys = [[time, v0, v1, ...], ...], eased in-out between keys
function track(keys, t, ease = eInOut) {
  if (t <= keys[0][0]) return keys[0].slice(1);
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t < b[0]) {
      const u = ease((t - a[0]) / (b[0] - a[0]));
      const out = [];
      for (let k = 1; k < a.length; k++) out.push(lerp(a[k], b[k], u));
      return out;
    }
  }
  return keys[keys.length - 1].slice(1);
}

// ---------- canvas helpers ----------
function canvas(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function tex(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.needsUpdate = true; return t; }
const lin = (hex) => new THREE.Color(hex); // three converts sRGB hex to linear working space

// ---------- renderer ----------
const cv = document.getElementById("world");
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.toneMapping = THREE.NoToneMapping; // UI colours must stay exact brand colours
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = lin("#071226");
scene.fog = new THREE.Fog(lin("#071226"), 14, 30);
const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 80);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;

const key = new THREE.DirectionalLight(0xfff3e6, 1.2); key.position.set(-4, 6, 8); scene.add(key);
const rim = new THREE.DirectionalLight(0x19c3b1, 1.2); rim.position.set(5, 2, -6); scene.add(rim);
scene.add(new THREE.HemisphereLight(0x33507a, 0x050a14, 0.5));

// stations in world space
const P = new THREE.Vector3(0, -9, 0);   // the notes page (hook, rereading)
const Wl = new THREE.Vector3(0, 0, 0);   // the card wall
const D = new THREE.Vector3(9, 0, 0);    // the recall demo
const C = new THREE.Vector3(-9, 0, 0);   // the spacing calendar

// ---------- backdrop: soft glow discs behind each station ----------
function glowTex(inner, outer) {
  const c = canvas(512, 512), g = c.getContext("2d");
  const gr = g.createRadialGradient(256, 256, 0, 256, 256, 256);
  gr.addColorStop(0, inner); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512); return tex(c);
}
const haloTex = glowTex("rgba(25,195,177,1)", "rgba(25,195,177,0)");
const orangeHaloTex = glowTex("rgba(255,122,61,1)", "rgba(255,122,61,0)");
const backGlowTex = glowTex("rgba(30,70,120,0.85)", "rgba(7,18,38,0)");
for (const s of [P, Wl, D, C]) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshBasicMaterial({ map: backGlowTex, transparent: true, depthWrite: false, fog: false }));
  m.position.set(s.x, s.y - 0.5, -6); scene.add(m);
}

// ---------- dust ----------
const DUST = 700;
const dustBase = new Float32Array(DUST * 3);
for (let i = 0; i < DUST; i++) {
  dustBase[i * 3] = (hash(i * 3.1) - 0.5) * 30;
  dustBase[i * 3 + 1] = (hash(i * 5.7) - 0.5) * 24 - 3;
  dustBase[i * 3 + 2] = -5 + hash(i * 9.3) * 9;
}
const dustGeo = new THREE.BufferGeometry();
dustGeo.setAttribute("position", new THREE.BufferAttribute(dustBase.slice(), 3));
const dotTex = (() => { const c = canvas(64, 64), g = c.getContext("2d"); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,0.5)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return tex(c); })();
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: 0.045, map: dotTex, transparent: true, opacity: 0.55, depthWrite: false, color: lin("#9fd8ea"), blending: THREE.AdditiveBlending }));
scene.add(dust);

// ---------- sparks / rings (bursts) ----------
const BURST_N = 48;
function makeBurst(color, haloMap) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.96, 1.0, 96), new THREE.MeshBasicMaterial({ color: lin(color).multiplyScalar(2.2), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: haloMap, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(BURST_N * 3), 3));
  const pts = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.07, map: dotTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: lin(color).multiplyScalar(2.5) }));
  g.add(halo, ring, pts); scene.add(g);
  return { g, ring, halo, pts };
}
function drawBurst(b, t, t0, origin, scale, seed) {
  const u = (t - t0) / 0.9;
  if (u < 0 || u > 1) { b.g.visible = false; return; }
  b.g.visible = true; b.g.position.copy(origin);
  const r = lerp(1.0, 3.4, expoOut(u)) * scale;
  b.ring.scale.setScalar(r); b.ring.material.opacity = Math.pow(1 - u, 2.5) * 0.6;
  b.halo.scale.setScalar(lerp(1.2, 3.0, eOut(u)) * scale); b.halo.material.opacity = (1 - u) * 0.28;
  const p = b.pts.geometry.attributes.position;
  for (let i = 0; i < BURST_N; i++) {
    const a = hash(seed + i * 1.3) * Math.PI * 2, sp = 0.6 + hash(seed + i * 7.7) * 1.6;
    const d = expoOut(u) * sp * 1.6 * scale;
    p.setXYZ(i, Math.cos(a) * d, Math.sin(a) * d - u * u * 0.3, 0.2 + hash(seed + i) * 0.3);
  }
  p.needsUpdate = true; b.pts.material.opacity = 1 - u;
}
const burstA = makeBurst(TEAL, haloTex), burstB = makeBurst(TEAL, haloTex), burstM = makeBurst(ORANGE, orangeHaloTex), burstS = makeBurst(TEAL, haloTex);

// ================= build (needs fonts) =================
const ready = (async function build() {
  const ff = new FontFace(FONT, "url(assets/fonts/Outfit-Bold.ttf)", { weight: "700" });
  const fr = new FontFace(FONT, "url(assets/fonts/Outfit-Regular.ttf)", { weight: "400" });
  await Promise.all([ff.load(), fr.load()]);
  document.fonts.add(ff); document.fonts.add(fr);
  const ttf = await new Promise((res, rej) => new TTFLoader().load("assets/fonts/Outfit-Bold.ttf", res, undefined, rej));
  const font = new Font(ttf);
  return font;
})();

let S = null; // everything built lives here

function cardFace(c, variant) {
  const cw = 1024, ch = 308, cvs = canvas(cw, ch), g = cvs.getContext("2d");
  const isBack = variant === "back";
  const low = variant === "low", mod = variant === "mod", high = variant === "high";
  rr(g, 6, 6, cw - 12, ch - 12, 46);
  const gr = g.createLinearGradient(0, 0, cw, ch);
  if (low || mod) { gr.addColorStop(0, "#2a3344"); gr.addColorStop(1, "#1d2534"); }
  else if (high) { gr.addColorStop(0, "#0f3f4a"); gr.addColorStop(1, "#0b2a3d"); }
  else { gr.addColorStop(0, "#173a66"); gr.addColorStop(1, "#0f2647"); }
  g.fillStyle = gr; g.fill();
  g.lineWidth = high ? 10 : 4;
  g.strokeStyle = high ? TEAL : isBack ? "rgba(25,195,177,0.55)" : "rgba(244,241,234,0.22)";
  g.stroke();
  if (isBack) {
    // fine diagonal lines and a big question mark
    g.save(); rr(g, 6, 6, cw - 12, ch - 12, 46); g.clip();
    g.strokeStyle = "rgba(25,195,177,0.08)"; g.lineWidth = 3;
    for (let x = -ch; x < cw; x += 34) { g.beginPath(); g.moveTo(x, ch); g.lineTo(x + ch, 0); g.stroke(); }
    g.restore();
    g.fillStyle = TEAL; g.font = `700 230px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("?", cw / 2, ch / 2 + 12);
    return tex(cvs);
  }
  const lines = c.lines;
  g.textAlign = "left"; g.textBaseline = "middle";
  const big = lines.length === 1 ? 92 : 78;
  g.fillStyle = low || mod ? "#8b95a7" : WHITE;
  g.font = `700 ${big}px ${FONT}`;
  const x0 = 64;
  if (lines.length === 1) g.fillText(lines[0], x0, ch / 2 + (c.sub ? -18 : 4));
  else { g.fillText(lines[0], x0, ch / 2 - 42); g.fillText(lines[1], x0, ch / 2 + 46); }
  if (c.sub) { g.font = `400 44px ${FONT}`; g.fillStyle = low || mod ? "#7d8799" : "rgba(244,241,234,0.75)"; g.fillText(c.sub, x0, ch / 2 + 62); }
  // rating badge
  if (low || mod || high) {
    const label = low ? "RATED LOW" : mod ? "MODERATE" : "RATED HIGH";
    g.font = `700 40px ${FONT}`;
    const tw = g.measureText(label).width, bw = tw + 52, bh = 70, bx = cw - bw - 40, by = 34;
    rr(g, bx, by, bw, bh, 35);
    g.fillStyle = high ? TEAL : "#3a4558"; g.fill();
    g.fillStyle = high ? NAVY : "#c3cad6"; g.textAlign = "center"; g.fillText(label, bx + bw / 2, by + bh / 2 + 2);
  }
  return tex(cvs);
}

function notesCanvas(mode) {
  // mode: "notes" (paper + text + highlights), "blank" (paper + rules), "mask" (highlights only)
  const cw = 1024, ch = 1366, cvs = canvas(cw, ch), g = cvs.getContext("2d");
  if (mode !== "mask") {
    g.fillStyle = WHITE; g.fillRect(0, 0, cw, ch);
    // paper shading
    const sh = g.createRadialGradient(cw * 0.45, ch * 0.35, 100, cw * 0.5, ch * 0.5, ch * 0.8);
    sh.addColorStop(0, "rgba(255,255,255,0)"); sh.addColorStop(1, "rgba(120,110,95,0.18)");
    g.fillStyle = sh; g.fillRect(0, 0, cw, ch);
    g.strokeStyle = "rgba(11,27,51,0.12)"; g.lineWidth = 2;
    for (let y = 250; y < ch - 60; y += 74) { g.beginPath(); g.moveTo(60, y); g.lineTo(cw - 60, y); g.stroke(); }
    g.strokeStyle = "rgba(25,195,177,0.45)"; g.lineWidth = 3; g.beginPath(); g.moveTo(130, 60); g.lineTo(130, ch - 60); g.stroke();
  } else { g.fillStyle = "#000"; g.fillRect(0, 0, cw, ch); }
  if (mode === "blank") return cvs;
  const rows = [
    ["Evaporation", ": the sun heats water"], ["", "and it rises as vapor."],
    ["Condensation", ": vapor cools and"], ["", "forms clouds."],
    ["Precipitation", ": water falls as"], ["", "rain, snow or hail."],
    ["Collection", ": water gathers in"], ["", "oceans, lakes and rivers."],
  ];
  g.textBaseline = "alphabetic";
  if (mode === "notes") { g.fillStyle = INK; g.font = `700 64px ${FONT}`; g.fillText("Ch. 4  The Water Cycle", 160, 190); }
  let y = 324;
  for (const [k, rest] of rows) {
    g.font = `700 44px ${FONT}`;
    const kw = k ? g.measureText(k).width : 0;
    if (k) {
      g.fillStyle = mode === "mask" ? "#fff" : "rgba(25,195,177,0.42)";
      g.fillRect(150, y - 40, kw + 20, 54);
    }
    if (mode === "notes") {
      g.fillStyle = INK; if (k) g.fillText(k, 160, y);
      g.font = `400 44px ${FONT}`; g.fillStyle = "#24324a"; g.fillText(rest, 160 + kw, y);
    }
    y += 74;
  }
  if (mode === "notes") { g.font = `400 44px ${FONT}`; g.fillStyle = "#24324a"; g.fillText("Then the cycle repeats.", 160, y + 30); }
  return cvs;
}

function labelCanvas(text, opts = {}) {
  const fs = opts.size || 72, pad = opts.pad || 40;
  const m = canvas(8, 8).getContext("2d"); m.font = `700 ${fs}px ${FONT}`;
  const w = Math.ceil(m.measureText(text).width + pad * 2), h = Math.ceil(fs * 1.6);
  const c = canvas(w, h), g = c.getContext("2d");
  if (opts.bg) { rr(g, 2, 2, w - 4, h - 4, h / 2 - 2); g.fillStyle = opts.bg; g.fill(); }
  g.font = `700 ${fs}px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillStyle = opts.color || WHITE; g.fillText(text, w / 2, h / 2 + fs * 0.04);
  return c;
}
function labelMesh(text, heightUnits, opts) {
  const c = labelCanvas(text, opts);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(heightUnits * c.width / c.height, heightUnits), new THREE.MeshBasicMaterial({ map: tex(c), transparent: true, depthWrite: false }));
  return m;
}

// ---------- the recall card (redrawn when its state changes) ----------
const recallCvs = canvas(1024, 760);
let recallKey = "";
function drawRecall(t) {
  const lines = ["Evaporation", "Condensation", "Precipitation"];
  const starts = [26.30, 26.84, 27.34], durs = [0.45, 0.46, 0.55];
  const typed = lines.map((s, i) => s.slice(0, Math.round(s.length * seg(t, starts[i], starts[i] + durs[i]))));
  const ticks = [29.84, 30.02, 30.18].map((a) => seg(t, a, a + 0.12));
  const miss = seg(t, 30.30, 30.42);
  const cursorOn = t > 25.9 && t < 30.3 && Math.floor(t * 3.2) % 2 === 0;
  const k = typed.join("|") + ticks.map((x) => x.toFixed(2)).join(",") + miss.toFixed(2) + cursorOn;
  if (k === recallKey) return false;
  recallKey = k;
  const g = recallCvs.getContext("2d"), cw = 1024, ch = 760;
  g.clearRect(0, 0, cw, ch);
  rr(g, 4, 4, cw - 8, ch - 8, 36); g.fillStyle = WHITE; g.fill();
  g.strokeStyle = "rgba(11,27,51,0.10)"; g.lineWidth = 2;
  for (let y = 250; y < ch - 40; y += 118) { g.beginPath(); g.moveTo(60, y + 30); g.lineTo(cw - 60, y + 30); g.stroke(); }
  g.fillStyle = INK; g.font = `700 60px ${FONT}`; g.textBaseline = "alphabetic"; g.textAlign = "left";
  g.fillText("Water cycle", 64, 112);
  g.font = `400 40px ${FONT}`; g.fillStyle = "#5a667a"; g.fillText("from memory, notes closed", 64, 166);
  // EXAMPLE tag
  g.font = `700 30px ${FONT}`; const tw = g.measureText("EXAMPLE").width;
  rr(g, cw - tw - 104, 60, tw + 44, 54, 27); g.fillStyle = "#e3dfd5"; g.fill();
  g.fillStyle = "#5a667a"; g.textAlign = "center"; g.fillText("EXAMPLE", cw - tw / 2 - 82, 98); g.textAlign = "left";
  let y = 262;
  for (let i = 0; i < 4; i++) {
    g.font = `700 54px ${FONT}`; g.fillStyle = "#8b95a7"; g.fillText(String(i + 1), 70, y);
    if (i < 3) {
      g.fillStyle = INK; g.fillText(typed[i], 140, y);
      if (cursorOn && typed[i].length > 0 && typed[i].length < lines[i].length) { const w = g.measureText(typed[i]).width; g.fillRect(146 + w, y - 46, 6, 56); }
      if (ticks[i] > 0) {
        const s = eBack(ticks[i]);
        g.save(); g.translate(cw - 120, y - 18); g.scale(s, s);
        g.beginPath(); g.arc(0, 0, 34, 0, Math.PI * 2); g.fillStyle = TEAL; g.fill();
        g.strokeStyle = WHITE; g.lineWidth = 9; g.lineCap = "round"; g.lineJoin = "round";
        g.beginPath(); g.moveTo(-14, 1); g.lineTo(-4, 12); g.lineTo(16, -11); g.stroke(); g.restore();
      }
    } else {
      if (miss <= 0) {
        if (cursorOn && typed[2].length === lines[2].length) g.fillRect(146, y - 46, 6, 56);
        g.fillStyle = "#b9c0cc"; if (t > 28.0) g.fillText("?", 146 + (cursorOn ? 20 : 0), y);
      } else {
        g.globalAlpha = miss;
        g.fillStyle = INK; g.fillText("Collection", 140, y);
        const w = g.measureText("Collection").width;
        g.strokeStyle = ORANGE; g.lineWidth = 7; g.lineCap = "round";
        g.beginPath(); g.ellipse(140 + w / 2, y - 18, w / 2 + 34, 48, -0.04, 0, Math.PI * 2 * eOut(miss)); g.stroke();
        g.font = `700 34px ${FONT}`; const mw = g.measureText("MISSED").width;
        rr(g, cw - mw - 116, y - 52, mw + 48, 58, 29); g.fillStyle = NAVY; g.fill();
        g.fillStyle = WHITE; g.textAlign = "center"; g.fillText("MISSED", cw - mw / 2 - 92, y - 12); g.textAlign = "left";
        g.globalAlpha = 1;
      }
    }
    y += 118;
  }
  return true;
}

// ---------- page shader (dissolve with a teal burning edge) ----------
const NOISE = `
  float h21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
  float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
    return mix(mix(h21(i),h21(i+vec2(1,0)),u.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x), u.y); }
  float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<4;i++){ v+=a*vnoise(p); p=p*2.03+vec2(17.1,9.2); a*=0.5; } return v; }`;

function buildAll(font) {
  const o = {};
  // ---------- page ----------
  const notesT = tex(notesCanvas("notes")), blankT = tex(notesCanvas("blank")), maskC = notesCanvas("mask");
  const maskT = new THREE.CanvasTexture(maskC);
  o.pageMat = new THREE.ShaderMaterial({
    uniforms: { uNotes: { value: notesT }, uBlank: { value: blankT }, uMask: { value: maskT }, uDis: { value: 0 }, uGlow: { value: 0 }, uDim: { value: 1 }, uGhost: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: NOISE + `
      uniform sampler2D uNotes, uBlank, uMask; uniform float uDis, uGlow, uDim, uGhost; varying vec2 vUv;
      void main(){
        vec3 a = texture2D(uNotes, vUv).rgb, b = texture2D(uBlank, vUv).rgb;
        float n = fbm(vUv * vec2(6.0, 8.0)) * 0.8 + vUv.y * 0.35;
        float th = uDis * 1.35 - 0.05;
        float k = smoothstep(th - 0.03, th + 0.03, n);       // 1 = still ink, 0 = dissolved
        float edge = (1.0 - smoothstep(0.0, 0.022, abs(n - th))) * step(0.001, uDis) * step(uDis, 0.999);
        vec3 col = mix(b, a, k);
        float m = texture2D(uMask, vUv).r;
        col += vec3(0.04, 0.55, 0.50) * m * uGlow * k;
        col = mix(col, b * 0.92 + a * 0.08, uGhost * (1.0 - k));
        col *= uDim;
        col += vec3(0.03, 0.75, 0.68) * edge;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  o.page = new THREE.Mesh(new THREE.PlaneGeometry(2.25, 3.0), o.pageMat);
  o.pageGroup = new THREE.Group(); o.pageGroup.add(o.page);
  const pshadow = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 4.4), new THREE.MeshBasicMaterial({ map: glowTex("rgba(0,0,0,0.7)", "rgba(0,0,0,0)"), transparent: true, depthWrite: false }));
  pshadow.position.set(0.1, -0.15, -0.08); o.pageGroup.add(pshadow);
  o.pageGroup.position.copy(P); scene.add(o.pageGroup);
  // cursor on the blank page
  o.cursor = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.2, 0.01), new THREE.MeshBasicMaterial({ color: lin(INK) }));
  o.cursor.position.set(-0.78, 0.86, 0.01); o.page.add(o.cursor);

  // ---------- hook 3D type ----------
  // text3d(str, width, mat): extruded Outfit Bold, scaled so the word is exactly `width` units wide
  function text3d(str, width, mat) {
    const size = 1;
    const g = new TextGeometry(str, { font, size, depth: 0.24, curveSegments: 8, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.018, bevelSegments: 3 });
    g.computeBoundingBox(); const bb = g.boundingBox; g.translate(-(bb.max.x + bb.min.x) / 2, -(bb.max.y + bb.min.y) / 2, 0);
    const k = width / (bb.max.x - bb.min.x); g.scale(k, k, k);
    return new THREE.Mesh(g, mat);
  }
  const whiteMat = new THREE.MeshStandardMaterial({ color: lin(WHITE).multiplyScalar(0.6), roughness: 0.55, metalness: 0.0, envMapIntensity: 0.3 });
  const tealMat = new THREE.MeshStandardMaterial({ color: lin(TEAL).multiplyScalar(0.62), emissive: lin(TEAL), emissiveIntensity: 0.16, roughness: 0.5, metalness: 0.0, envMapIntensity: 0.3 });
  o.hook = new THREE.Group();
  o.stop = text3d("STOP", 1.8, whiteMat); o.stop.position.set(0, 0.42, 0);
  o.rer = text3d("REREADING", 2.0, tealMat); o.rer.position.set(0, -0.22, 0);
  o.strike = new THREE.Mesh(new RoundedBoxGeometry(2.2, 0.06, 0.07, 2, 0.025), new THREE.MeshBasicMaterial({ color: lin(WHITE) }));
  o.strike.position.set(0, -0.22, 0.12);
  o.hook.add(o.stop, o.rer, o.strike);
  o.hook.position.set(P.x, P.y + 0.15, 1.1); scene.add(o.hook);

  // ---------- cards ----------
  const CW = 1.4, CH = 0.42, CD = 0.07;
  const bodyGeo = new RoundedBoxGeometry(CW, CH, CD, 4, 0.05);
  const faceGeo = new THREE.PlaneGeometry(CW - 0.01, CH - 0.01);
  const backT = cardFace(null, "back");
  const DEF = [
    { lines: ["REREADING"], rate: "low", col: 0, row: 0, drop: 11.22 },
    { lines: ["ELABORATIVE", "INTERROGATION"], rate: "mod", col: 1, row: 0, mod: 13.95 },
    { lines: ["HIGHLIGHTING"], rate: "low", col: 0, row: 1, drop: 12.0 },
    { lines: ["PRACTICE", "TESTING"], rate: "high", col: 1, row: 1, hi: "A" },
    { lines: ["KEYWORD", "MNEMONIC"], rate: "low", col: 0, row: 2, drop: 13.56 },
    { lines: ["SELF-", "EXPLANATION"], rate: "mod", col: 1, row: 2, mod: 14.0 },
    { lines: ["SPACING"], sub: "distributed practice", rate: "high", col: 0, row: 3, hi: "B" },
    { lines: ["SUMMARIZING"], rate: "low", col: 1, row: 3, drop: 12.64 },
    { lines: ["INTERLEAVED", "PRACTICE"], rate: "mod", col: 0, row: 4, mod: 14.05 },
    { lines: ["IMAGERY", "FOR TEXT"], rate: "low", col: 1, row: 4, drop: 13.75 },
  ];
  let k = 0;
  o.cards = DEF.map((c, i) => {
    const grp = new THREE.Group();
    const body = new THREE.Mesh(bodyGeo, new THREE.MeshPhysicalMaterial({ color: lin("#0f2443"), roughness: 0.3, metalness: 0.2, clearcoat: 1.0, clearcoatRoughness: 0.18, transparent: true }));
    const frontT = cardFace(c, c.rate === "high" ? "high" : "front");
    const stampT = c.rate === "high" ? frontT : cardFace(c, c.rate);
    const front = new THREE.Mesh(faceGeo, new THREE.MeshBasicMaterial({ map: frontT, transparent: true }));
    front.position.z = CD / 2 + 0.002;
    const back = new THREE.Mesh(faceGeo, new THREE.MeshBasicMaterial({ map: backT, transparent: true }));
    back.rotation.y = Math.PI; back.position.z = -CD / 2 - 0.002;
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(CW * 1.9, CH * 3.2), new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
    halo.position.z = -0.12;
    grp.add(halo, body, front, back);
    scene.add(grp);
    const slot = new THREE.Vector3((c.col === 0 ? -1 : 1) * 0.74, (2 - c.row) * 0.5, 0);
    const flip = c.rate === "high" ? null : 8.15 + 0.3 * k++;
    return Object.assign({}, c, { i, grp, body, front, back, halo, frontT, stampT, slot, flip, arr: 2.62 + hash(i * 3.3) * 0.45 });
  });

  // ---------- recall demo (station D) ----------
  o.recallT = tex(recallCvs);
  o.recall = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.93), new THREE.MeshBasicMaterial({ map: o.recallT, transparent: true }));
  scene.add(o.recall);
  o.recallShadow = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.9), new THREE.MeshBasicMaterial({ map: glowTex("rgba(0,0,0,0.65)", "rgba(0,0,0,0)"), transparent: true, depthWrite: false }));
  scene.add(o.recallShadow);
  // notebook: left page, hinged right page (front = notes, back = cover)
  const PW = 1.2, PH = 1.6;
  const leftC = canvas(512, 683), lg = leftC.getContext("2d"); lg.drawImage(notesCanvas("notes"), 0, 0, 1024, 1366, 0, 0, 512, 683);
  const rightC = canvas(512, 683), rg = rightC.getContext("2d"); rg.drawImage(notesCanvas("blank"), 0, 0, 1024, 1366, 0, 0, 512, 683);
  const coverC = canvas(512, 683), cg = coverC.getContext("2d");
  { const gr = cg.createLinearGradient(0, 0, 512, 683); gr.addColorStop(0, "#1b4377"); gr.addColorStop(1, "#0f2647"); cg.fillStyle = gr; cg.fillRect(0, 0, 512, 683);
    cg.fillStyle = TEAL; cg.fillRect(0, 0, 26, 683);
    cg.fillStyle = WHITE; cg.font = `700 78px ${FONT}`; cg.textAlign = "center"; cg.fillText("NOTES", 270, 300);
    cg.font = `400 36px ${FONT}`; cg.fillStyle = "rgba(244,241,234,0.7)"; cg.fillText("Ch. 4  Water Cycle", 270, 360); }
  o.book = new THREE.Group();
  const leftP = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: tex(leftC) }));
  leftP.position.x = -PW / 2;
  o.hinge = new THREE.Group();
  const rf = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: tex(rightC) }));
  rf.position.x = PW / 2;
  const rb = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: tex(coverC) }));
  rb.position.x = PW / 2; rb.rotation.y = Math.PI; rb.position.z = -0.003;
  o.hinge.add(rf, rb); o.hinge.position.z = 0.004;
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.05, PH + 0.04, 0.05), new THREE.MeshBasicMaterial({ color: lin(TEAL) }));
  const bshadow = new THREE.Mesh(new THREE.PlaneGeometry(PW * 2 + 1.2, PH + 1.0), new THREE.MeshBasicMaterial({ map: glowTex("rgba(0,0,0,0.6)", "rgba(0,0,0,0)"), transparent: true, depthWrite: false }));
  bshadow.position.z = -0.05;
  o.bookGlow = new THREE.Mesh(new THREE.PlaneGeometry(PW * 3.2, PH * 1.9), new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  o.bookGlow.position.z = -0.08;
  o.book.add(o.bookGlow, bshadow, leftP, o.hinge, spine);
  scene.add(o.book);

  // ---------- spacing calendar (station C) ----------
  o.cal = new THREE.Group(); o.cal.position.copy(C); o.cal.scale.setScalar(0.9); scene.add(o.cal);
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const tileGeo = new RoundedBoxGeometry(0.4, 0.08, 0.5, 3, 0.03);
  const tileMat = new THREE.MeshPhysicalMaterial({ color: lin("#13305a"), roughness: 0.35, metalness: 0.2, clearcoat: 0.8 });
  o.dayX = days.map((_, i) => (i - 3) * 0.44);
  o.tiles = days.map((d, i) => {
    const g = new THREE.Group();
    const tile = new THREE.Mesh(tileGeo, tileMat); g.add(tile);
    const lab = labelMesh(d, 0.15, { size: 64, pad: 16, color: "rgba(244,241,234,0.85)" });
    lab.position.set(0, -0.2, 0.3); g.add(lab);
    g.position.set(o.dayX[i], -1.0, 0); o.cal.add(g); return g;
  });
  const blockGeo = new RoundedBoxGeometry(0.32, 1, 0.32, 3, 0.04);
  o.tall = new THREE.Mesh(blockGeo, new THREE.MeshPhysicalMaterial({ color: lin("#5b6678"), roughness: 0.4, metalness: 0.1, clearcoat: 0.6, transparent: true }));
  o.cal.add(o.tall);
  o.tallLabel = labelMesh("ALL AT ONCE", 0.17, { size: 60, pad: 30, bg: "#3a4558", color: WHITE });
  o.cal.add(o.tallLabel);
  o.spaced = [0, 2, 4].map((di) => {
    const m = new THREE.Mesh(blockGeo, new THREE.MeshPhysicalMaterial({ color: lin(TEAL), emissive: lin(TEAL), emissiveIntensity: 0.55, roughness: 0.3, metalness: 0.1, clearcoat: 1 }));
    m.userData.di = di; o.cal.add(m); return m;
  });
  o.spacedLabel = labelMesh("SPACED", 0.17, { size: 60, pad: 30, bg: TEAL, color: NAVY });
  o.cal.add(o.spacedLabel);

  // ---------- bookmark (save) ----------
  const bs = new THREE.Shape();
  bs.moveTo(-0.34, 0.5); bs.lineTo(0.34, 0.5); bs.lineTo(0.34, -0.5); bs.lineTo(0, -0.26); bs.lineTo(-0.34, -0.5); bs.closePath();
  const bgeo = new THREE.ExtrudeGeometry(bs, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 4, curveSegments: 4 });
  bgeo.translate(0, 0, -0.04);
  o.bookmark = new THREE.Mesh(bgeo, new THREE.MeshPhysicalMaterial({ color: lin(TEAL), emissive: lin(TEAL), emissiveIntensity: 0.4, roughness: 0.35, metalness: 0.1, clearcoat: 0.6 }));
  o.bmHalo = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  scene.add(o.bookmark, o.bmHalo);
  return o;
}

// ---------- post ----------
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
composer.setPixelRatio(1); composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.55, 0.5, 1.0);
composer.addPass(bloom);
const grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uFrame: { value: 0 }, uFlash: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uFrame, uFlash; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      vec2 q = vUv - 0.5; q.y *= 1.25;
      c.rgb *= mix(0.55, 1.0, smoothstep(0.95, 0.25, length(q)));
      c.rgb += (h(vUv * vec2(1080.0, 1920.0) + uFrame * 7.13) - 0.5) * 0.022;
      c.rgb += uFlash * vec3(0.10, 0.45, 0.42);
      gl_FragColor = c;
    }`,
});
composer.addPass(grade);
composer.addPass(new OutputPass());

// ---------- camera ----------
// [time, camX, camY, camZ, tgtX, tgtY, tgtZ]
const CAM = [
  [0.00, 0.12, -9.48, 8.3, 0, -9.62, 0],
  [2.42, 0.0, -9.5, 7.65, 0, -9.62, 0],
  [3.20, 0.0, -0.5, 10.6, 0, -0.6, 0],
  [5.90, 0.18, -0.55, 10.0, 0, -0.6, 0],
  [6.45, 0.0, -0.58, 9.6, 0, -0.6, 0],
  [10.8, -0.2, -0.58, 9.75, 0, -0.6, 0],
  [14.75, 0.0, -0.58, 9.8, 0, -0.6, 0],
  [15.15, 0.0, -9.6, 9.8, 0, -9.75, 0],
  [21.25, 0.0, -9.6, 9.4, 0, -9.75, 0],
  [21.75, 0.0, -0.62, 7.7, 0, -0.62, 0],
  [24.25, 0.0, -0.58, 6.7, 0, -0.62, 0],
  [24.72, 9.0, -0.6, 8.7, 9, -0.66, 0],
  [30.65, 9.15, -0.6, 8.1, 9, -0.66, 0],
  [31.12, 0.0, -0.6, 7.4, 0, -0.62, 0],
  [32.5, 0.0, -0.58, 6.9, 0, -0.62, 0],
  [32.95, -9.0, 0.35, 8.6, -9, -0.62, 0],
  [38.1, -9.15, 0.3, 8.0, -9, -0.62, 0],
  [38.55, 0.0, -0.6, 7.6, 0, -0.62, 0],
  [42.85, 0.0, -0.6, 7.0, 0, -0.62, 0],
];
const camPos = new THREE.Vector3(), camTgt = new THREE.Vector3();

// ---------- per-frame ----------
const tmpV = new THREE.Vector3();
function cardState(c, t) {
  // returns pose for card c at time t
  let x = c.slot.x, y = c.slot.y, z = 0, s = 1, rx = 0, ry = Math.PI, rz = 0, alpha = 1, dim = 1, glow = 0, stamp = false;
  // arrival from below and behind
  const a = eOut(seg(t, c.arr, c.arr + 0.8));
  x = lerp(c.slot.x * 1.8, c.slot.x, a); y = lerp(c.slot.y - 4.2, c.slot.y, a); z = lerp(-5, 0, a);
  rx = lerp(-1.4, 0, a); rz = lerp((hash(c.i) - 0.5) * 1.2, 0, a);
  alpha = clamp01(a * 3);
  // "Which two?" ripple
  const d = Math.hypot(c.slot.x, c.slot.y);
  const rip = bump(t, 5.96 + d * 0.12, 0.42);
  s += rip * 0.07; z += rip * 0.18; glow = Math.max(glow, rip * 0.55);
  // flip face-up (all but the two high cards)
  if (c.flip !== null) ry = lerp(Math.PI, 0, eBack(seg(t, c.flip, c.flip + 0.5)));
  // low: stamp, then fall
  if (c.drop) {
    if (t >= c.drop) stamp = true;
    const u = seg(t, c.drop + 0.12, c.drop + 1.15);
    y -= 5.0 * u * u; z += 1.2 * u; rx -= 1.6 * eIn(u); rz += (c.col ? 0.5 : -0.5) * u; alpha *= 1 - seg(t, c.drop + 0.7, c.drop + 1.15);
    dim = lerp(1, 0.75, seg(t, c.drop, c.drop + 0.12));
    if (t > c.drop + 1.15) alpha = 0;
  }
  // moderate: stamp, then sink back and fade
  if (c.mod) {
    if (t >= c.mod) stamp = true;
    const u = eInOut(seg(t, c.mod + 0.08, c.mod + 0.45));
    z -= 2.2 * u; s *= lerp(1, 0.8, u); alpha *= 1 - u; dim = lerp(1, 0.8, seg(t, c.mod, c.mod + 0.1));
  }
  // high cards: the two that stay hidden
  if (c.hi) {
    glow = Math.max(glow, 0.35 * seg(t, 10.2, 10.8) + 0.3 * bump(t, 14.4, 0.6));
    const A = c.hi === "A";
    // path keys: [t, x, y, z, s]
    const keys = A ? [
      [14.9, c.slot.x, c.slot.y, 0, 1], [15.4, 0, 0.34, 0, 1.25], [21.84, 0, 0.34, 0, 1.25], [22.5, 0, 0.3, 0.55, 1.33],
      [24.25, 0, 0.3, 0.55, 1.33], [24.9, 0, 3.6, 0, 0.78], [38.05, 0, 3.6, 0, 0.78], [38.55, 0, 0.0, 0.35, 1.38], [42.85, 0, 0.0, 0.35, 1.38],
    ] : [
      [14.9, c.slot.x, c.slot.y, 0, 1], [15.4, 0, -0.34, 0, 1.25], [21.84, 0, -0.34, 0, 1.25], [22.5, 0, -0.62, -0.3, 1.15],
      [24.25, 0, -0.62, -0.3, 1.15], [24.9, 0, -0.12, 0, 1.3], [31.02, 0, -0.12, 0, 1.3], [31.6, 0, -0.1, 0.5, 1.36],
      [32.5, 0, -0.1, 0.5, 1.36], [38.05, 0, -0.1, 0.5, 1.36], [38.55, 0, -3.6, 0, 0.78], [42.85, 0, -3.6, 0, 0.78],
    ];
    if (t >= 14.9) { const v = track(keys, t); x = v[0]; y = v[1]; z = v[2]; s = v[3]; }
    const flipT = A ? 23.32 : 31.98;
    ry = lerp(Math.PI, 0, eBack(seg(t, flipT, flipT + 0.55)));
    glow = Math.max(glow, A ? 0.45 * seg(t, 21.84, 23.2) : 0.45 * seg(t, 31.02, 31.9));
    if (t >= flipT) glow = Math.max(glow, lerp(1.0, 0.45, seg(t, flipT + 0.3, flipT + 1.6)));
    if (!A && t > 21.84 && t < 24.9) dim = 0.7;
    // the save morph at the end (card A)
    if (A) { const m = seg(t, 40.25, 40.6); s *= lerp(1, 0.2, eIn(m)); alpha *= 1 - m; }
    // idle float
    y += Math.sin(t * 1.3 + c.i) * 0.012;
  }
  return { x, y, z, s, rx, ry, rz, alpha, dim, glow, stamp };
}

let lastFrame = -1;
function renderAt(tIn) {
  if (!S) return;
  let t = tIn >= LOOP ? 0 : tIn;
  const frame = Math.round(tIn * 30);
  // ----- camera -----
  const cv7 = track(CAM, t);
  camPos.set(cv7[0], cv7[1], cv7[2]); camTgt.set(cv7[3], cv7[4], cv7[5]);
  // handheld drift + hit shakes
  camPos.x += Math.sin(t * 0.7) * 0.03; camPos.y += Math.sin(t * 0.9 + 1) * 0.025;
  let shake = 0;
  for (const [ht, amp] of [[1.4, 0.07], [23.32, 0.05], [31.98, 0.05], [33.15, 0.04]]) if (t > ht) shake += amp * Math.exp(-(t - ht) * 14) * Math.sin((t - ht) * 95);
  camPos.y += shake; camTgt.y += shake * 0.5;
  camera.position.copy(camPos); camera.lookAt(camTgt);
  camera.rotateZ(Math.sin(t * 0.5) * 0.004);

  // ----- dust -----
  const dp = dust.geometry.attributes.position;
  for (let i = 0; i < DUST; i++) {
    dp.setXYZ(i, dustBase[i * 3] + Math.sin(t * 0.21 + i) * 0.25, dustBase[i * 3 + 1] + ((t * 0.08 + hash(i * 1.7) * 3) % 3) - 1.5, dustBase[i * 3 + 2]);
  }
  dp.needsUpdate = true;

  // ----- hook page + type -----
  const fall = t >= 2.42 && t < 14.9 ? eIn(seg(t, 2.42, 3.05)) : 0;
  const tiltBase = t < 14.9 ? -0.42 : lerp(-0.42, -0.2, eOut(seg(t, 14.9, 16.0)));
  S.pageGroup.position.set(P.x, P.y - fall * 5.5 - (t < 14.9 ? 0.32 : 0), -fall * 1.5);
  S.pageGroup.rotation.set(tiltBase - fall * 0.9, 0.05 - fall * 0.2, -0.04 + fall * 0.3);
  S.pageGroup.visible = fall < 0.999;
  const pm = S.pageMat.uniforms;
  pm.uDim.value = t < 15 ? 0.55 : lerp(0.55, 1.0, seg(t, 15.0, 15.6)) * (1 - 0.18 * seg(t, 18.1, 18.6));
  pm.uGlow.value = Math.max(bump(t, 16.9, 1.2) * 1.0, t > 17.6 && t < 19.0 ? 0.5 : 0);
  pm.uDis.value = eInOut(seg(t, 19.04, 19.95));
  pm.uGhost.value = 0.32 * bump(t, 20.4, 1.0);
  S.cursor.visible = t > 20.0 && t < 21.4 && Math.floor((t - 20.0) * 3) % 2 === 0;
  // hook type: present at frame 0, punch on "stop", strike on "rereading", then flies past the camera
  const fly = eIn(seg(t, 2.42, 3.0));
  S.hook.visible = t < 3.05;
  const punch = bump(t, 1.36, 0.28);
  S.hook.position.set(P.x, P.y - 0.31 + fly * 4.6, 1.1 + punch * 0.25 + fly * 1.2);
  S.hook.rotation.set(-0.12 + Math.sin(t * 1.1) * 0.03 - fly * 0.6, Math.sin(t * 0.8) * 0.06, 0);
  S.stop.scale.setScalar(1 + punch * 0.06);
  S.strike.scale.set(Math.max(0.001, eOut(seg(t, 1.84, 2.3))), 1, 1);
  S.strike.visible = t >= 1.84;

  // ----- cards -----
  for (const c of S.cards) {
    const st = cardState(c, t);
    c.grp.position.set(st.x, st.y, st.z);
    c.grp.rotation.set(st.rx, st.ry, st.rz);
    c.grp.scale.setScalar(st.s);
    c.grp.visible = st.alpha > 0.002 && t < 42.85 && !(t < c.arr);
    c.front.material.map = st.stamp ? c.stampT : c.frontT;
    c.front.material.opacity = st.alpha; c.back.material.opacity = st.alpha; c.body.material.opacity = st.alpha;
    c.front.material.color.setScalar(st.dim); c.back.material.color.setScalar(st.dim);
    c.halo.material.opacity = st.glow * st.alpha;
  }
  // reveal bursts
  const A = S.cards[3], B = S.cards[6];
  drawBurst(burstA, t, 23.62, tmpV.set(0, 0.3, 0.6), 0.62, 11);
  drawBurst(burstB, t, 32.28, tmpV.set(0, -0.1, 0.6), 0.62, 23);
  grade.uniforms.uFlash.value = 0.09 * Math.max(bump(t, 23.55, 0.35), bump(t, 32.2, 0.35));

  // ----- recall demo -----
  const showD = t > 24.0 && t < 31.3;
  S.book.visible = showD; S.recall.visible = showD; S.recallShadow.visible = showD;
  if (showD) {
    // notebook: open in the centre, closes, drops down small, reopens
    const close = eInOut(seg(t, 24.62, 25.2)), reopen = eInOut(seg(t, 28.76, 29.3));
    S.hinge.rotation.y = -Math.PI * 0.985 * (close - reopen);
    const bv = track([[24.0, 0, -0.2, 0, 1.0], [25.25, 0, -0.2, 0, 1.0], [25.75, 0, -4.2, 0, 0.6], [28.5, 0, -4.2, 0, 0.6], [29.05, 0, -0.86, 0.2, 0.55], [31.3, 0, -0.86, 0.2, 0.55]], t);
    const centre = 0.6 * (close - reopen) * bv[3];
    S.book.position.set(D.x + bv[0] + centre, D.y + bv[1] + (close > 0.98 && t < 25.3 ? -0.02 * bump(t, 25.15, 0.15) : 0), bv[2]);
    S.book.scale.setScalar(bv[3]);
    S.book.rotation.set(-0.08, 0, 0);
    S.bookGlow.material.opacity = 0.6 * bump(t, 28.8, 1.6);
    const rv = track([[24.0, 4.2, 0.18, 0, 1.0, 0.25], [25.3, 4.2, 0.18, 0, 1.0, 0.25], [25.85, 0, 0.18, 0, 1.0, 0], [28.6, 0, 0.18, 0, 1.0, 0], [29.1, 0, 0.6, 0, 0.78, 0], [31.3, 0, 0.6, 0, 0.78, 0]], t);
    S.recall.position.set(D.x + rv[0], D.y + rv[1], rv[2]);
    S.recall.scale.setScalar(rv[3]); S.recall.rotation.set(-0.04, 0, rv[4]);
    S.recallShadow.position.set(D.x + rv[0] + 0.1, D.y + rv[1] - 0.12, -0.06); S.recallShadow.scale.setScalar(rv[3]);
    if (drawRecall(t)) S.recallT.needsUpdate = true;
    drawBurst(burstM, t, 30.3, tmpV.set(D.x - 0.4, D.y + 0.55 - 0.6 * 0.78, 0.3), 0.32, 37);
  } else { burstM.g.visible = false; }

  // ----- spacing calendar -----
  const showC = t > 32.3 && t < 38.6;
  S.cal.visible = showC;
  if (showC) {
    S.cal.rotation.set(0.3, -0.06 + (t - 33) * 0.01, 0);
    const td = seg(t, 32.95, 33.22), shrink = eInOut(seg(t, 35.72, 36.3));
    const tx = S.dayX[6];
    const th = 1.9;
    S.tall.scale.set(1, th * (1 - shrink * 0.97), 1);
    S.tall.position.set(tx, -0.96 + th * (1 - shrink * 0.97) / 2 + (1 - eIn(td)) * 4.5 + bump(t, 33.22, 0.2) * -0.04, 0);
    S.tall.material.opacity = 1 - 0.6 * shrink;
    S.tall.visible = t > 32.95;
    S.tallLabel.position.set(tx - 0.22, -0.96 + th * (1 - shrink) + 0.22 + (1 - eIn(td)) * 4.5, 0.25);
    S.tallLabel.material.opacity = 1 - shrink; S.tallLabel.visible = t > 33.0;
    S.spaced.forEach((m, j) => {
      const t0 = [34.32, 34.58, 34.85][j];
      const u = seg(t, t0, t0 + 0.26);
      m.visible = t > t0;
      m.scale.set(1, 0.62, 1);
      m.position.set(S.dayX[m.userData.di], -0.96 + 0.31 + (1 - eIn(u)) * 4 + bump(t, t0 + 0.26, 0.18) * -0.03, 0);
    });
    S.spacedLabel.position.set(S.dayX[2], -0.96 + 0.62 + 0.3, 0.25);
    S.spacedLabel.visible = t > 35.0; S.spacedLabel.material.opacity = eOut(seg(t, 35.0, 35.3));
    S.spacedLabel.scale.setScalar(lerp(0.6, 1, eBack(seg(t, 35.0, 35.35))));
  }
  drawBurst(burstS, t, 35.05, tmpV.set(C.x + S.dayX[2], C.y - 0.05, 0.4), 0.55, 51);

  // ----- bookmark -----
  const bmIn = seg(t, 40.3, 40.85);
  S.bookmark.visible = t > 40.3 && t < LOOP;
  S.bookmark.position.set(0, 0.46 + Math.sin(t * 1.6) * 0.03, 0.6);
  S.bookmark.scale.setScalar(Math.max(0.001, eBack(bmIn)) * 0.82);
  S.bookmark.rotation.set(0.05, lerp(-Math.PI * 2, 0, eOut(bmIn)) + Math.sin(t * 1.2) * 0.12, 0);
  S.bmHalo.position.set(0, 0.46, 0.3); S.bmHalo.material.opacity = 0.42 * eOut(bmIn) + 0.3 * bump(t, 40.62, 0.4);

  grade.uniforms.uFrame.value = frame;
  composer.render();
  lastFrame = frame;
}

ready.then((font) => {
  S = buildAll(font);
  window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
  renderAt(0);
  window.__worldReady && window.__worldReady();
}).catch((err) => { console.error("world build failed", err); window.__worldReady && window.__worldReady(); });
