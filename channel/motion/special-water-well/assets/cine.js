// special-water-well: cinematic shot-based 3D (1080x1920), built on the special-bicycle-brakes v2 engine.
// A floating block of earth cut open on the front; the well is built in the cutaway, one problem at a time.
// Every frame is a pure function of timeline time t (hf-seek). No clocks, no Math.random: variation comes from hash().
// Shot list and timings: channel/scripts/special-water-well.motion.md (times are voiceover word times, take 1).
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { FXAAPass } from "three/addons/postprocessing/FXAAPass.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const W = 1080, H = 1920;
const LOOP = 54.9;            // last 0.15 s repeat frame 0 (the Short loops)
const TEAL = "#19C3B1", WHITE = "#F4F1EA", ORANGE = "#FF7A3D";

// ---------------- math ----------------
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const lerp = (a, b, u) => a + (b - a) * u;
const sm = (x) => x * x * (3 - 2 * x);
const eOut = (x) => 1 - Math.pow(1 - x, 3);
const eIn = (x) => x * x * x;
const eInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eBack = (x) => { const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const bump = (t, a, len) => { const u = (t - a) / len; return u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u); };
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function keys(K, t) {
  if (t <= K[0][0]) return K[0][1];
  for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) return lerp(K[i][1], K[i + 1][1], sm((t - K[i][0]) / (K[i + 1][0] - K[i][0])));
  return K[K.length - 1][1];
}
const V3 = (x, y, z = 0) => new THREE.Vector3(x, y, z);
const col = (hex) => new THREE.Color(hex);

// ---------------- world layout ----------------
const BX = 2.2, BZ = 1.4, BOT = -4.2;               // block half width, half depth, bottom (top surface is y = 0)
const GX = 0.36, GZ0 = 0.7;                          // groove (the cut through the well): x in [-GX, GX], z in [GZ0, BZ]
const WZ = 1.05, PR = 0.2;                           // well axis (x = 0, z = WZ), pipe radius
const LAYERS = [
  { id: "soil", top: 0, bot: -0.55, label: "SOIL" },
  { id: "clay", top: -0.55, bot: -1.4, label: "CLAY" },
  { id: "sand", top: -1.4, bot: -2.4, label: "SAND" },
  { id: "aqui", top: -2.4, bot: -3.35, label: "AQUIFER" },
  { id: "rock", top: -3.35, bot: BOT, label: "" },
];
const CAS_BOT = -2.5, SCR_BOT = -3.2, HOLE_BOT = -3.0;
const HOUSE = V3(1.3, 0, -0.75), TAP = V3(1.45, 0.29, -0.4), GLASS = V3(1.45, 0, -0.3), TANK = V3(1.72, 0, 0.5);

// ---------------- story state (voiceover word times) ----------------
const HOLE = [[0, 0.06], [0.72, 0.06], [1.7, -0.14], [12.36, -0.14], [13.5, HOLE_BOT]];          // drilled depth
const RPM = [[0, 0], [0.55, 0], [0.75, 1], [1.8, 1], [2.3, 0.12], [12.1, 0.12], [12.36, 1], [13.6, 1], [14.3, 0.15], [14.9, 0]];
const LIFT = [[14.85, HOLE_BOT], [15.6, 0.3]];
const RIGX = [[0, 0], [15.1, 0], [16.3, -1.45]];
const CAS = [[0, 1], [17.24, 1], [17.9, 0]];                    // casing slide (1 = above, 0 = in place)
const RAIN = [[0, 0], [19.84, 0], [20.1, 1], [22.6, 1], [23.4, 0]];
const MURK = [[0, 0], [20.9, 0], [22.4, 1], [24.3, 1], [25.8, 0]];
const GROUT = [[0, 0], [23.04, 0], [24.6, 1]];
const SANDL = [[0, HOLE_BOT], [28.0, HOLE_BOT], [29.4, -2.62], [30.2, -2.62], [31.3, HOLE_BOT]];
const SCR = [[0, 1], [29.6, 1], [30.2, 0]];
const WL = [[0, -2.55], [37.92, -2.55], [38.95, 0.12]];          // water level inside the pipe
const PUMPON = [[0, 0], [37.8, 0], [37.95, 1], [39.3, 1], [39.6, 0]];
const BLINKS = [[41.28, 41.52], [41.72, 41.92], [42.12, 42.3], [42.48, 42.62], [42.8, 42.92], [43.08, 43.18]];
const POUR = [[42.32, 43.25], [45.0, 45.7]];
const GLASSF = [[0, 0], [42.4, 0], [43.2, 0.55], [45.05, 0.55], [45.7, 0.95]];
const TANKY = [43.84, 44.45];
const GAUGE = [[0, -2.2], [44.3, -2.2], [45.0, 0.5]];
const FLOW1 = [[0, 0], [38.6, 0], [39.6, 1]];                    // well -> house line
const FLOW2 = [[0, 0], [44.2, 0], [44.9, 1]];                    // branch -> tank

const DRILL_DT = 1 / 240, DANG = new Float32Array(Math.ceil(56 / DRILL_DT) + 2);
for (let i = 1; i < DANG.length; i++) DANG[i] = DANG[i - 1] + 22 * keys(RPM, (i - 0.5) * DRILL_DT) * DRILL_DT;
const drillAngle = (t) => { const f = Math.max(0, t) / DRILL_DT, i = Math.floor(f); return lerp(DANG[i], DANG[i + 1], f - i); };
const holeAt = (t) => keys(HOLE, Math.min(t, 13.5));
const pumpOn = (t) => { let v = keys(PUMPON, t); for (const [a, b] of BLINKS) v = Math.max(v, seg(t, a, a + 0.04) * (1 - seg(t, b - 0.04, b))); return v; };
const pouring = (t) => POUR.reduce((v, [a, b]) => Math.max(v, seg(t, a, a + 0.12) * (1 - seg(t, b - 0.12, b))), 0);

// ---------------- renderer / scene ----------------
const cv = document.getElementById("world");
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.localClippingEnabled = true;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(col("#0a1830"), 0.011);
const camera = new THREE.PerspectiveCamera(32, W / H, 0.05, 160);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.38;

const backMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { uTop: { value: col("#040b18") }, uHor: { value: col("#0c2140") }, uBot: { value: col("#030814") }, uGlowDir: { value: V3(0, -0.15, -1).normalize() }, uGlow: { value: col("#0b4a55") } },
  vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `uniform vec3 uTop,uHor,uBot,uGlow,uGlowDir; varying vec3 vD;
    void main(){ vec3 d = normalize(vD); float h = d.y;
      vec3 c = mix(uHor, uTop, smoothstep(-0.05, 0.6, h)); c = mix(c, uBot, smoothstep(-0.05, -0.5, h));
      c += uGlow * pow(max(dot(d, uGlowDir), 0.0), 4.0) * 0.6; gl_FragColor = vec4(c, 1.0); }`,
});
const backdrop = new THREE.Mesh(new THREE.SphereGeometry(120, 48, 24), backMat);
backdrop.renderOrder = -10; scene.add(backdrop);

const key = new THREE.DirectionalLight(0xfff1e2, 2.1); key.position.set(-5, 9, 7.5);
key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -4.5, right: 4.5, top: 4.5, bottom: -6, near: 1, far: 30 });
key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
scene.add(key, key.target); key.target.position.set(0, -1.5, 0);
const rim = new THREE.DirectionalLight(0x19c3b1, 2.4); rim.position.set(5, 3, -7); scene.add(rim);
const fill = new THREE.DirectionalLight(0x9fb8ff, 0.55); fill.position.set(6, 1, 6); scene.add(fill);
const pumpLight = new THREE.PointLight(0xff6a2a, 0, 1.6, 1.6); scene.add(pumpLight);
const aquiLight = new THREE.PointLight(0x19c3b1, 0, 3.5, 1.4); scene.add(aquiLight);

// world group (gently floats)
const world = new THREE.Group(); scene.add(world);

// ---------------- textures (canvas, deterministic) ----------------
function canvasTex(size, draw, repeat = 1) {
  const c = document.createElement("canvas"); c.width = c.height = size; const g = c.getContext("2d"); draw(g, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.repeat.set(repeat, repeat); return t;
}
const TEX = {
  soil: (g, s) => { g.fillStyle = "#4b3325"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 2600; i++) { const v = hash(i * 1.3); g.fillStyle = v > 0.5 ? `rgba(30,18,12,${0.25 + 0.4 * hash(i)})` : `rgba(120,88,62,${0.2 + 0.3 * hash(i * 2)})`; const r = 1 + hash(i * 3.7) * 4; g.beginPath(); g.arc(hash(i * 5.1) * s, hash(i * 7.3) * s, r, 0, 7); g.fill(); }
    for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(150,140,128,${0.5 + 0.4 * hash(i * 9)})`; g.beginPath(); g.ellipse(hash(i * 11) * s, hash(i * 13) * s, 3 + hash(i * 17) * 7, 2 + hash(i * 19) * 5, hash(i) * 3, 0, 7); g.fill(); } },
  clay: (g, s) => { g.fillStyle = "#56677f"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 46; i++) { const y = (i / 46) * s + hash(i) * 8; g.strokeStyle = `rgba(${hash(i) > 0.5 ? "35,45,62" : "130,145,165"},${0.18 + 0.2 * hash(i * 3)})`; g.lineWidth = 1 + hash(i * 5) * 4; g.beginPath();
      for (let x = 0; x <= s; x += 16) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 5 + Math.sin(x * 0.07 + i * 2) * 2); g.stroke(); }
    for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(20,28,42,${0.15 * hash(i * 2.1)})`; g.fillRect(hash(i * 1.7) * s, hash(i * 4.3) * s, 2, 2); } },
  sand: (g, s) => { g.fillStyle = "#c5a676"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 9000; i++) { const v = hash(i * 1.9); g.fillStyle = v > 0.6 ? `rgba(240,225,190,${0.5 * hash(i)})` : `rgba(120,90,55,${0.45 * hash(i * 3)})`; const r = 0.6 + hash(i * 2.3) * 1.8; g.beginPath(); g.arc(hash(i * 3.1) * s, hash(i * 6.7) * s, r, 0, 7); g.fill(); }
    for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(140,110,75,${0.6})`; g.beginPath(); g.arc(hash(i * 21) * s, hash(i * 23) * s, 2 + hash(i * 29) * 4, 0, 7); g.fill(); } },
  aqui: (g, s) => { g.fillStyle = "#145e66"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 700; i++) { const x = hash(i * 3.3) * s, y = hash(i * 5.9) * s, r = 3 + hash(i * 7.7) * 9; const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r);
      gr.addColorStop(0, "rgba(160,215,205,0.9)"); gr.addColorStop(1, "rgba(30,90,95,0.85)"); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, r, r * (0.7 + 0.3 * hash(i)), hash(i * 2) * 3, 0, 7); g.fill(); }
    for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(120,255,235,${0.5 * hash(i * 9)})`; g.beginPath(); g.arc(hash(i * 13) * s, hash(i * 17) * s, 1.2 + hash(i * 19) * 2.2, 0, 7); g.fill(); } },
  rock: (g, s) => { g.fillStyle = "#2c3139"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 26; i++) { const cx = hash(i * 3.1) * s, cy = hash(i * 4.7) * s, r = 40 + hash(i * 5.3) * 70; g.fillStyle = `rgba(${55 + hash(i) * 25},${60 + hash(i) * 25},${70 + hash(i) * 25},0.9)`; g.beginPath();
      for (let k = 0; k < 7; k++) { const a = (k / 7) * 6.283 + hash(i * 9 + k), rr = r * (0.7 + 0.3 * hash(i * 11 + k)); g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.closePath(); g.fill();
      g.strokeStyle = "rgba(12,14,18,0.95)"; g.lineWidth = 3; g.stroke(); } },
  grass: (g, s) => { g.fillStyle = "#3d7334"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 6000; i++) { g.fillStyle = hash(i) > 0.5 ? `rgba(95,160,70,${0.5 * hash(i * 2)})` : `rgba(25,60,25,${0.5 * hash(i * 3)})`; g.fillRect(hash(i * 1.1) * s, hash(i * 2.9) * s, 1.5, 3); } },
  grout: (g, s) => { g.fillStyle = "#e9e3d6"; g.fillRect(0, 0, s, s); for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(150,140,125,${0.25 * hash(i)})`; g.fillRect(hash(i * 1.7) * s, hash(i * 3.3) * s, 2, 2); } },
};
const TILE = 1.25; // world units per texture tile
const texCache = {};
function layerTex(id) { return texCache[id] || (texCache[id] = canvasTex(512, TEX[id])); }
function texFor(id, w, h) { const t = layerTex(id).clone(); t.needsUpdate = true; t.repeat.set(w / TILE, h / TILE); return t; }

// ---------------- materials ----------------
const M = {
  steel: new THREE.MeshStandardMaterial({ color: col("#b8c2cd"), roughness: 0.28, metalness: 1, side: THREE.DoubleSide }),
  steelDark: new THREE.MeshStandardMaterial({ color: col("#6f7b89"), roughness: 0.35, metalness: 1 }),
  paint: new THREE.MeshPhysicalMaterial({ color: col("#E9E5DC"), roughness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.2 }),
  dark: new THREE.MeshPhysicalMaterial({ color: col("#1a2232"), roughness: 0.5, metalness: 0.3, clearcoat: 0.4 }),
  roof: new THREE.MeshStandardMaterial({ color: col("#2c3a50"), roughness: 0.6 }),
  window: new THREE.MeshStandardMaterial({ color: col("#9fe9df"), emissive: col("#19C3B1"), emissiveIntensity: 0.6, roughness: 0.1 }),
  tealMetal: new THREE.MeshPhysicalMaterial({ color: col(TEAL), roughness: 0.25, metalness: 0.8, clearcoat: 1, clearcoatRoughness: 0.1, side: THREE.DoubleSide }),
  pump: new THREE.MeshPhysicalMaterial({ color: col(ORANGE), roughness: 0.25, metalness: 0.3, clearcoat: 1, emissive: col(ORANGE), emissiveIntensity: 0.25 }),
  tank: new THREE.MeshPhysicalMaterial({ color: col("#F1EEE6"), roughness: 0.2, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08 }),
  glass: new THREE.MeshPhysicalMaterial({ color: col("#dff6f3"), roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.35, depthWrite: false }),
  water: new THREE.MeshStandardMaterial({ color: col("#1a9e94"), emissive: col(TEAL), emissiveIntensity: 0.45, roughness: 0.15, transparent: true, opacity: 0.72 }),
  glowTeal: new THREE.MeshBasicMaterial({ color: col(TEAL).multiplyScalar(2.2), transparent: true, depthWrite: false, toneMapped: false }),
  glowWhite: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.2, 2.1), transparent: true, depthWrite: false, toneMapped: false }),
  bucket: new THREE.MeshStandardMaterial({ color: col("#9aa6b4"), roughness: 0.32, metalness: 0.9, side: THREE.DoubleSide }),
};
const shadowAll = (o) => o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });

// ---------------- helpers ----------------
function rod(a, b, r, m, segs = 12) {
  const d = b.clone().sub(a), len = d.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, segs), m);
  mesh.position.copy(a).addScaledVector(d, 0.5);
  mesh.quaternion.setFromUnitVectors(V3(0, 1, 0), d.clone().normalize());
  return mesh;
}
const tube = (curve, segs, r, m, rs = 10) => new THREE.Mesh(new THREE.TubeGeometry(curve, segs, r, rs, false), m);
const crv = (pts) => new THREE.CatmullRomCurve3(pts, false, "centripetal");
function drawOn(mesh, f) { const g = mesh.geometry, rs = g.parameters.radialSegments, ts = g.parameters.tubularSegments; g.setDrawRange(0, Math.floor(clamp01(f) * ts) * rs * 6); mesh.visible = f > 0.002; }
// back half of a vertical tube (the front half is "cut away" with the block)
const halfTube = (r, h, m, segs = 40) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, segs, 1, true, Math.PI / 2, Math.PI), m);
const clipBelow = (plane) => [plane];   // keeps y <= plane.constant (normal 0,-1,0)
const planeY = () => new THREE.Plane(V3(0, -1, 0), 0);

// ---------------- the block of earth ----------------
const block = new THREE.Group(); world.add(block);
const HOLE_PLANE = planeY();
const layerMats = {};
for (const L of LAYERS) {
  const h = L.top - L.bot, yc = (L.top + L.bot) / 2;
  const mk = (w, d) => {
    const side = new THREE.MeshStandardMaterial({ map: texFor(L.id, w, h), roughness: L.id === "aqui" ? 0.35 : 0.9, metalness: 0 });
    if (L.id === "aqui") { side.emissive = col("#0d8f86"); side.emissiveMap = side.map; side.emissiveIntensity = 0.55; }
    const top = L.top === 0 ? new THREE.MeshStandardMaterial({ map: texFor("grass", w, d), roughness: 0.95 }) : side;
    return [side, side, top, side, side, side];
  };
  const parts = [
    [BX - GX, BZ * 2, (-BX - GX) / 2, 0],             // left of the groove (full depth)
    [BX - GX, BZ * 2, (BX + GX) / 2, 0],               // right of the groove
    [GX * 2, GZ0 + BZ, 0, (-BZ + GZ0) / 2],            // behind the groove
  ];
  layerMats[L.id] = [];
  for (const [w, d, x, z] of parts) {
    const mats = mk(w, d); layerMats[L.id].push(mats[0]);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats); m.position.set(x, yc, z); m.receiveShadow = true; m.castShadow = true; block.add(m);
  }
  // filler: the groove before it is drilled (clipped to below the drilled depth)
  const fm = mk(GX * 2, BZ - GZ0).map((m) => { const c = m.clone(); c.clippingPlanes = [HOLE_PLANE]; return c; });
  const filler = new THREE.Mesh(new THREE.BoxGeometry(GX * 2, h, BZ - GZ0), fm); filler.position.set(0, yc, (BZ + GZ0) / 2); filler.receiveShadow = true; block.add(filler);
  if (L.id === "aqui") layerMats.aquiFill = fm[0];
}
// glowing outline on the block edges
const EDGE = 0.014;
{
  const c = [[-BX, -BZ], [BX, -BZ], [BX, BZ], [-BX, BZ]];
  for (let i = 0; i < 4; i++) { const [x0, z0] = c[i], [x1, z1] = c[(i + 1) % 4]; block.add(rod(V3(x0, BOT, z0), V3(x1, BOT, z1), EDGE, M.glowTeal, 6)); block.add(rod(V3(x0, BOT, z0), V3(x0, 0, z0), EDGE, M.glowTeal, 6)); }
  block.add(rod(V3(-BX, 0.004, BZ), V3(-GX, 0.004, BZ), EDGE * 0.8, M.glowTeal, 6), rod(V3(GX, 0.004, BZ), V3(BX, 0.004, BZ), EDGE * 0.8, M.glowTeal, 6));
  block.add(rod(V3(BX, 0.004, -BZ), V3(BX, 0.004, BZ), EDGE * 0.8, M.glowTeal, 6), rod(V3(-BX, 0.004, -BZ), V3(BX, 0.004, -BZ), EDGE * 0.8, M.glowTeal, 6), rod(V3(-BX, 0.004, -BZ), V3(-BX, 0.004, BZ), EDGE * 0.8, M.glowTeal, 6));
}
// soft glow pool under the floating block
const poolTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d"); const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, "rgba(25,195,177,0.5)"); gr.addColorStop(0.45, "rgba(20,110,120,0.18)"); gr.addColorStop(1, "rgba(10,25,50,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
const pool = new THREE.Mesh(new THREE.PlaneGeometry(10, 7), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
pool.rotation.x = -Math.PI / 2; pool.position.set(0, BOT - 0.7, 0); world.add(pool);

// grass tufts on top
const TUFT_N = 90;
const tufts = new THREE.InstancedMesh(new THREE.ConeGeometry(0.035, 0.12, 5), new THREE.MeshStandardMaterial({ color: col("#4f8f3e"), roughness: 0.8 }), TUFT_N);
{ const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(); let k = 0;
  for (let i = 0; k < TUFT_N && i < 600; i++) { const x = (hash(i * 3.1) * 2 - 1) * (BX - 0.08), z = (hash(i * 5.7) * 2 - 1) * (BZ - 0.08);
    if (Math.abs(x) < 0.7 && z > 0.3) continue; if (Math.abs(x - HOUSE.x) < 0.6 && Math.abs(z - HOUSE.z) < 0.5) continue; if (Math.abs(x - TANK.x) < 0.35 && Math.abs(z - TANK.z) < 0.35) continue;
    q.setFromEuler(new THREE.Euler((hash(i) - 0.5) * 0.5, 0, (hash(i * 2) - 0.5) * 0.5)); const s = 0.45 + hash(i * 7) * 0.6;
    m4.compose(V3(x, 0.05 * s, z), q, V3(s, s, s)); tufts.setMatrixAt(k++, m4); }
  tufts.count = k; }
block.add(tufts);

// face labels (revealed by the x-ray scan)
let LABEL_FONT = "BrandOutfitC";
function labelTex(text, opts = {}) {
  const fs = opts.fs || 120, pad = 40, c = document.createElement("canvas"), g = c.getContext("2d");
  g.font = `700 ${fs}px ${LABEL_FONT}`; const w = Math.ceil(g.measureText(text).width) + pad * 2; c.width = w; c.height = fs + pad * 2;
  g.font = `700 ${fs}px ${LABEL_FONT}`; g.textBaseline = "middle"; g.lineJoin = "round";
  g.lineWidth = fs * 0.16; g.strokeStyle = opts.stroke || "rgba(6,14,28,0.92)"; g.strokeText(text, pad, c.height / 2 + fs * 0.04);
  g.fillStyle = opts.fill || WHITE; g.fillText(text, pad, c.height / 2 + fs * 0.04);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { t, aspect: w / c.height };
}
const labels = [];
function makeLabels() {
  for (const L of LAYERS) {
    if (!L.label) continue;
    const { t, aspect } = labelTex(L.label, { fs: 110, fill: L.id === "aqui" ? "#7ff5e6" : WHITE });
    const h = 0.19, m = new THREE.Mesh(new THREE.PlaneGeometry(h * aspect, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, opacity: 0, toneMapped: L.id !== "aqui" }));
    m.position.set(-0.6 - (h * aspect) / 2, (L.top + L.bot) / 2, BZ + 0.012); block.add(m);
    const line = rod(V3(-0.58, (L.top + L.bot) / 2, BZ + 0.01), V3(-0.4, (L.top + L.bot) / 2, BZ + 0.01), 0.008, M.glowTeal.clone(), 6); block.add(line);
    labels.push({ L, m, line, y: (L.top + L.bot) / 2 });
  }
}
// x-ray scan line
const scan = new THREE.Group(); block.add(scan);
scan.add(new THREE.Mesh(new THREE.BoxGeometry(BX * 2 + 0.06, 0.018, 0.02), M.glowTeal.clone()));
const scanGlowTex = (() => { const c = document.createElement("canvas"); c.width = 8; c.height = 128; const g = c.getContext("2d"); const gr = g.createLinearGradient(0, 0, 0, 128);
  gr.addColorStop(0, "rgba(25,195,177,0)"); gr.addColorStop(0.5, "rgba(25,195,177,0.55)"); gr.addColorStop(1, "rgba(25,195,177,0)"); g.fillStyle = gr; g.fillRect(0, 0, 8, 128); return new THREE.CanvasTexture(c); })();
const scanGlow = new THREE.Mesh(new THREE.PlaneGeometry(BX * 2, 0.5), new THREE.MeshBasicMaterial({ map: scanGlowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
scanGlow.position.z = 0.012; scan.add(scanGlow); scan.position.z = BZ + 0.01;

// ---------------- drill rig ----------------
const rig = new THREE.Group(); world.add(rig);
const MX = -0.2, mast = new THREE.Group(); mast.position.set(MX, 0.3, 0);
{
  const base = new THREE.Mesh(new RoundedBoxGeometry(1.15, 0.2, 0.62, 3, 0.07), M.dark); base.position.set(-0.62, 0.12, 0); rig.add(base);
  for (const z of [-0.33, 0.33]) { const tr = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.16, 0.13, 3, 0.07), M.steelDark); tr.position.set(-0.62, 0.09, z); rig.add(tr); }
  const cab = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.42, 0.5, 4, 0.06), M.paint); cab.position.set(-0.78, 0.43, 0); rig.add(cab);
  for (let i = 0; i < 5; i++) { const v = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.004), M.dark); v.position.set(-0.98 + i * 0.07, 0.45, 0.252); rig.add(v); }
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.63, 0.035, 0.51), M.tealMetal); stripe.position.set(-0.78, 0.6, 0); rig.add(stripe);
  // mast (lattice) in its own group so it can fold down for transport after drilling
  rig.add(mast);
  for (const dz of [-0.07, 0.07]) for (const dx of [-0.06, 0.06]) mast.add(rod(V3(dx, -0.1, dz), V3(dx, 1.6, dz), 0.016, M.steelDark, 6));
  for (let i = 0; i < 8; i++) { const y = -0.05 + i * 0.2; mast.add(rod(V3(-0.06, y, 0.07), V3(0.06, y + 0.2, 0.07), 0.009, M.steel, 5), rod(V3(-0.06, y, -0.07), V3(0.06, y + 0.2, -0.07), 0.009, M.steel, 5)); }
  const head = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.2, 0.26, 3, 0.04), M.dark); head.position.set(0.12, 1.5, 0); mast.add(head);
}
const drill = new THREE.Group(); rig.add(drill);        // x = 0 in rig space = well axis
const drillRod = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1, 12), M.steel); drill.add(drillRod);
const bit = new THREE.Group(); drill.add(bit);
{ const cone = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.32, 24), M.steel); cone.rotation.x = Math.PI; cone.position.y = 0.16; bit.add(cone);
  const pts = []; for (let i = 0; i <= 120; i++) { const u = i / 120, a = u * Math.PI * 2 * 3.2; pts.push(V3(Math.cos(a) * 0.2, 0.22 + u * 0.75, Math.sin(a) * 0.2)); }
  bit.add(tube(new THREE.CatmullRomCurve3(pts), 240, 0.035, M.tealMetal, 6));
  bit.add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.8, 12), M.steelDark)); bit.children[2].position.y = 0.6; }

// ---------------- well parts ----------------
const well = new THREE.Group(); well.position.set(0, 0, WZ); world.add(well);
const casing = new THREE.Group(); well.add(casing);
{ const h = 0.18 - CAS_BOT; const p = halfTube(PR, h, M.steel); p.position.y = (0.18 + CAS_BOT) / 2; casing.add(p);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(PR + 0.012, 0.018, 8, 40, Math.PI), M.steel); lip.rotation.x = Math.PI / 2; lip.rotation.z = Math.PI; lip.position.y = 0.18; casing.add(lip);
  for (const y of [-0.8, -1.7]) { const c = new THREE.Mesh(new THREE.TorusGeometry(PR + 0.008, 0.012, 6, 40, Math.PI), M.steelDark); c.rotation.x = Math.PI / 2; c.rotation.z = Math.PI; c.position.y = y; casing.add(c); } }
const screenG = new THREE.Group(); well.add(screenG);
{ const slots = canvasTex(256, (g, s) => { g.fillStyle = "#fff"; g.fillRect(0, 0, s, s); g.fillStyle = "#000"; for (let i = 0; i < 16; i++) g.fillRect(s * 0.06, i * (s / 16) + 4, s * 0.88, s / 16 * 0.38); });
  slots.repeat.set(3, 2.5); slots.colorSpace = THREE.NoColorSpace;
  const m = M.tealMetal.clone(); m.alphaMap = slots; m.alphaTest = 0.5;
  const h = CAS_BOT - SCR_BOT, p = halfTube(PR * 0.97, h, m); p.position.y = (CAS_BOT + SCR_BOT) / 2; screenG.add(p);
  const cap = new THREE.Mesh(new THREE.CircleGeometry(PR * 0.97, 32, 0, Math.PI), M.tealMetal); cap.rotation.x = Math.PI / 2; cap.rotation.z = Math.PI; cap.position.y = SCR_BOT; screenG.add(cap); }
// water inside the hole/pipe (clipped to the level)
const WL_PLANE = planeY();
const waterMat = M.water.clone(); waterMat.clippingPlanes = [WL_PLANE];
const waterCol = new THREE.Mesh(new THREE.CylinderGeometry(PR * 0.93, PR * 0.93, 3.6, 32, 1, false, Math.PI / 2, Math.PI), waterMat); waterCol.position.y = HOLE_BOT + 1.8; well.add(waterCol); waterMat.side = THREE.DoubleSide;
const waterFront = new THREE.Mesh(new THREE.PlaneGeometry(PR * 1.86, 3.6), waterMat); waterFront.position.set(0, HOLE_BOT + 1.8, -0.005); well.add(waterFront);
const waterHoleMat = waterMat.clone(); waterHoleMat.emissiveIntensity = 0.15; waterHoleMat.opacity = 0.3; waterHoleMat.depthWrite = false;
const waterHole = new THREE.Mesh(new THREE.BoxGeometry(GX * 2 - 0.02, CAS_BOT - HOLE_BOT, BZ - GZ0 - 0.02), waterHoleMat); // the open borehole in the aquifer before the screen
waterHole.position.set(0, (CAS_BOT + HOLE_BOT) / 2, (BZ + GZ0) / 2 - WZ); well.add(waterHole);
// sand that gets into the pipe
const SAND_PLANE = planeY();
const sandMat = new THREE.MeshStandardMaterial({ map: texFor("sand", 0.4, 0.5), roughness: 0.9, clippingPlanes: [SAND_PLANE] });
const sandCol = new THREE.Mesh(new THREE.CylinderGeometry(PR * 0.92, PR * 0.92, 0.6, 24, 1, false, Math.PI / 2, Math.PI), sandMat); sandCol.position.y = HOLE_BOT + 0.3; well.add(sandCol); sandMat.side = THREE.DoubleSide;
const sandFront = new THREE.Mesh(new THREE.PlaneGeometry(PR * 1.84, 0.6), sandMat); sandFront.position.set(0, HOLE_BOT + 0.3, 0); well.add(sandFront);
// grout (fills the gap around the casing, rising from the bottom of the clay to the surface)
const GROUT_PLANE = planeY();
const groutMat = new THREE.MeshStandardMaterial({ map: texFor("grout", 0.5, 1.4), roughness: 0.85, clippingPlanes: [GROUT_PLANE] });
{ const h = 1.4, yc = -0.7, zc = (BZ + GZ0) / 2 - WZ, d = BZ - GZ0;
  for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(GX - PR - 0.005, h, d), groutMat); b.position.set(s * (PR + GX) / 2 + s * 0.0025, yc, zc); well.add(b); }
  const back = new THREE.Mesh(new THREE.BoxGeometry(PR * 2, h, WZ - GZ0 - PR - 0.005), groutMat); back.position.set(0, yc, (GZ0 + WZ - PR) / 2 - WZ); well.add(back);
  const pad = new THREE.Mesh(new THREE.BoxGeometry(GX * 2 + 0.16, 0.05, BZ - GZ0 + 0.1), groutMat.clone()); pad.material.clippingPlanes = []; pad.position.set(0, 0.025, zc - 0.05); pad.userData.pad = true; well.add(pad); var groutPad = pad; }
// pump on its cable
const pump = new THREE.Group(); well.add(pump);
{ const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.3, 8, 20), M.pump); pump.add(body);
  for (let i = 0; i < 6; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.112, 0.01, 6, 24), M.steelDark); r.rotation.x = Math.PI / 2; r.position.y = -0.17 + i * 0.022; pump.add(r); }
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.06, 16), M.steelDark); top.position.y = 0.27; pump.add(top);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), new THREE.MeshBasicMaterial({ color: col(ORANGE), toneMapped: false })); led.position.set(0, 0.08, 0.105); led.name = "led"; pump.add(led); }
const pumpLed = pump.getObjectByName("led");
const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 6), M.dark); well.add(cable);
const riser = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 10), M.steelDark); well.add(riser);

// ---------------- house, tap, glass, tank, bucket ----------------
const house = new THREE.Group(); house.position.copy(HOUSE); world.add(house);
{ const body = new THREE.Mesh(new RoundedBoxGeometry(0.82, 0.5, 0.56, 3, 0.03), M.paint); body.position.y = 0.25; house.add(body);
  const roofSh = new THREE.Shape(); roofSh.moveTo(-0.5, 0); roofSh.lineTo(0.5, 0); roofSh.lineTo(0, 0.32); roofSh.closePath();
  const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(roofSh, { depth: 0.66, bevelEnabled: false }), M.roof); roof.rotation.y = Math.PI / 2; roof.position.set(-0.33 + 0.33, 0.5, 0.33); roof.position.set(0, 0.5, 0); roof.rotation.y = 0; roof.position.z = -0.33; house.add(roof);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.26, 0.01), M.roof); door.position.set(-0.18, 0.13, 0.285); house.add(door);
  const win = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.13, 0.01), M.window); win.position.set(0.05, 0.3, 0.285); house.add(win);
  const chim = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), M.paint); chim.position.set(0.22, 0.72, -0.05); house.add(chim); }
const tap = new THREE.Group(); world.add(tap);
tap.add(rod(V3(TAP.x, TAP.y, HOUSE.z + 0.28), V3(TAP.x, TAP.y, TAP.z), 0.016, M.steel, 8), rod(V3(TAP.x, TAP.y, TAP.z), V3(TAP.x, TAP.y - 0.06, TAP.z + 0.01), 0.016, M.steel, 8));
const glass = new THREE.Group(); glass.position.copy(GLASS); world.add(glass);
const glassShell = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.15, 24, 1, true), M.glass); glassShell.position.y = 0.075; glass.add(glassShell);
const glassWater = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.047, 1, 24), M.water); glass.add(glassWater);
const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 1, 8), M.water); world.add(stream);
const tank = new THREE.Group(); world.add(tank);
{ const prof = []; for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI / 2; prof.push(new THREE.Vector2(Math.cos(a) * 0.2, 0.42 + Math.sin(a) * 0.12)); }
  prof.unshift(new THREE.Vector2(0.2, 0.08)); prof.unshift(new THREE.Vector2(0.16, 0.06)); prof.unshift(new THREE.Vector2(0.0001, 0.06));
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), M.tank); tank.add(body);
  for (const a of [0, 2.1, 4.2]) tank.add(rod(V3(Math.cos(a) * 0.14, 0.08, Math.sin(a) * 0.14), V3(Math.cos(a) * 0.17, 0, Math.sin(a) * 0.17), 0.012, M.steelDark, 6));
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.202, 0.012, 6, 40), M.tealMetal); band.rotation.x = Math.PI / 2; band.position.y = 0.3; tank.add(band);
  const dial = new THREE.Group(); dial.position.set(0, 0.36, 0.2); tank.add(dial);
  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 24), M.paint); face.rotation.x = Math.PI / 2; dial.add(face);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.008, 6, 24), M.steelDark); ring.position.z = 0.006; dial.add(ring);
  for (let i = 0; i <= 6; i++) { const a = -2.2 + (i / 6) * 4.4, tk = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.014, 0.004), M.dark); tk.position.set(Math.sin(a) * 0.045, Math.cos(a) * 0.045, 0.012); tk.rotation.z = -a; dial.add(tk); }
  const needle = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.05, 0.004), new THREE.MeshBasicMaterial({ color: col(ORANGE) })); needle.geometry.translate(0, 0.022, 0); needle.position.z = 0.014; needle.name = "needle"; dial.add(needle); }
const needle = tank.getObjectByName("needle");
const bucket = new THREE.Group(); world.add(bucket);
{ const prof = [new THREE.Vector2(0.0001, 0), new THREE.Vector2(0.1, 0), new THREE.Vector2(0.13, 0.2), new THREE.Vector2(0.135, 0.21)];
  bucket.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 32), M.bucket));
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.008, 6, 32, Math.PI), M.steelDark); handle.position.y = 0.2; handle.rotation.y = 0.4; bucket.add(handle);
  for (const y of [0.06, 0.15]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.11 + y * 0.12, 0.006, 6, 32), M.steelDark); r.rotation.x = Math.PI / 2; r.position.y = y; bucket.add(r); } }

// flow lines on the surface (well -> house tap, and the branch to the tank)
const flowCurve1 = crv([V3(0, 0.03, WZ), V3(0.45, 0.03, 0.95), V3(0.95, 0.03, 0.25), V3(1.35, 0.03, -0.2), V3(TAP.x, 0.03, HOUSE.z + 0.29)]);
const flowCurve2 = crv([V3(0.45, 0.03, 0.95), V3(1.05, 0.03, 0.75), V3(TANK.x - 0.2, 0.03, TANK.z + 0.05)]);
const flow1 = tube(flowCurve1, 120, 0.016, M.glowTeal, 8), flow2 = tube(flowCurve2, 80, 0.016, M.glowTeal, 8);
world.add(flow1, flow2);

// "far below" measure: dashed arrow from the water level to the surface + a question mark
const measure = new THREE.Group(); world.add(measure);
const MEAS_X = 0.62, MEAS_Z = BZ + 0.06;
const dashes = [];
for (let i = 0; i < 22; i++) { const d = rod(V3(0, 0, 0), V3(0, 0.07, 0), 0.012, M.glowWhite, 6); measure.add(d); dashes.push(d); }
const arrowHead = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.1, 12), M.glowWhite); measure.add(arrowHead);
let qMark = null;

for (const o of [rig, well, house, tank, bucket, tap]) shadowAll(o);
for (const o of [measure, flow1, flow2, scan]) o.traverse((m) => { if (m.isMesh) { m.castShadow = false; m.receiveShadow = false; } });

// ---------------- particles ----------------
const PSV = `attribute float aSize; attribute vec4 aCol; varying vec4 vCol; uniform float uScale;
  void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = aSize * uScale / max(0.05, -mv.z); vCol = aCol; gl_Position = projectionMatrix * mv; }`;
const PSF = `varying vec4 vCol; uniform float uSoft; void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float a = pow(clamp(1.0 - d, 0.0, 1.0), uSoft); gl_FragColor = vec4(vCol.rgb, vCol.a * a); }`;
class PSys {
  constructor(n, additive, soft) {
    this.n = n; const g = new THREE.BufferGeometry();
    this.pos = new Float32Array(n * 3); this.size = new Float32Array(n); this.colr = new Float32Array(n * 4);
    g.setAttribute("position", new THREE.BufferAttribute(this.pos, 3)); g.setAttribute("aSize", new THREE.BufferAttribute(this.size, 1)); g.setAttribute("aCol", new THREE.BufferAttribute(this.colr, 4));
    this.mat = new THREE.ShaderMaterial({ vertexShader: PSV, fragmentShader: PSF, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, uniforms: { uScale: { value: 1000 }, uSoft: { value: soft } } });
    this.pts = new THREE.Points(g, this.mat); this.pts.frustumCulled = false; scene.add(this.pts); this.k = 0;
  }
  begin() { this.k = 0; this.mat.uniforms.uScale.value = H / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))); }
  push(x, y, z, s, r, g, b, a) { if (this.k >= this.n) return; const k = this.k++; this.pos.set([x, y, z], k * 3); this.size[k] = s; this.colr.set([r, g, b, a], k * 4); }
  end() { for (let k = this.k; k < this.n; k++) this.size[k] = 0; const at = this.pts.geometry.attributes; at.position.needsUpdate = at.aSize.needsUpdate = at.aCol.needsUpdate = true; }
}
const ADD = new PSys(3000, true, 1.6), SOFT = new PSys(1600, false, 1.3);
const _o = new THREE.Vector3();
function emit(ps, t, o) {
  if (t < o.t0 || t > o.t1 + o.life) return;
  for (let k = 0; k < o.n; k++) {
    const b = o.t0 + ((k + hash(o.seed + k * 1.7) * 0.95) / o.n) * (o.t1 - o.t0), age = t - b;
    if (age < 0 || age > o.life) continue;
    const u = age / o.life, h1 = hash(o.seed + k * 3.1) - 0.5, h2 = hash(o.seed + k * 5.3) - 0.5, h3 = hash(o.seed + k * 7.9) - 0.5, h4 = hash(o.seed + k * 9.7);
    const org = typeof o.org === "function" ? o.org(b, k) : o.org;
    const vel = typeof o.vel === "function" ? o.vel(k) : o.vel;
    const d = o.drag ? (1 - Math.exp(-o.drag * age)) / o.drag : age;
    _o.set(org.x + (vel[0] + h1 * o.spr[0]) * d, org.y + (vel[1] + h2 * o.spr[1]) * d + 0.5 * (o.g || 0) * age * age, org.z + (vel[2] + h3 * o.spr[2]) * d);
    if (o.floor !== undefined && _o.y < o.floor) _o.y = o.floor;
    world.localToWorld(_o);
    const a = o.a * Math.pow(1 - u, o.pw || 1.5) * Math.min(1, age / 0.05) * (o.mod ? o.mod(b) : 1);
    if (a <= 0.002) continue;
    const c = o.col(u, h4);
    const sz = lerp(o.s0, o.s1, u) * (0.6 + 0.8 * h4);
    if (ps === SOFT) ps.push(_o.x, _o.y, _o.z, sz, c[0], c[1], c[2], a); else ps.push(_o.x, _o.y, _o.z, sz, c[0] * a, c[1] * a, c[2] * a, 1);
  }
}
const cSpark = (u) => [2.6, lerp(1.4, 0.45, u), lerp(0.6, 0.12, u)];
const cTeal = () => [0.25, 1.6, 1.45];
const cWhite = () => [1.6, 1.8, 1.9];
const cDust = (u, h) => { const v = 0.42 + h * 0.15; return [v * 0.9, v * 0.75, v * 0.6]; };
const cMud = (u, h) => [0.2 + h * 0.06, 0.14 + h * 0.04, 0.09];
const cSand = (u, h) => [0.78 + h * 0.1, 0.64 + h * 0.08, 0.42];

// cave-in chunks (instanced, pure functions of t)
const CH_N = 46;
const chunkMesh = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ roughness: 0.9 }), CH_N);
chunkMesh.castShadow = true; world.add(chunkMesh);
const CH = [];
for (let i = 0; i < CH_N; i++) {
  const side = i % 2 ? 1 : -1, y0 = -0.5 - hash(i * 3.3) * 1.85;
  const L = LAYERS.find((l) => y0 <= l.top && y0 > l.bot) || LAYERS[1];
  const colr = { soil: "#5a3d2b", clay: "#5d6f88", sand: "#c4a473" }[L.id] || "#5d6f88";
  chunkMesh.setColorAt(i, col(colr));
  CH.push({ b: 15.76 + hash(i * 1.9) * 1.4, x: side * (GX - 0.05 - hash(i * 5.1) * 0.08), z: GZ0 + 0.05 + hash(i * 7.7) * 0.6, y0, s: 0.045 + hash(i * 9.1) * 0.06, rx: hash(i * 11) * 6, vx: -side * (0.2 + hash(i * 13) * 0.3) });
}
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler();
function updateChunks(t) {
  let k = 0;
  for (let i = 0; i < CH_N; i++) {
    const c = CH[i], age = t - c.b;
    if (age < 0 || t > 26.4) { _m4.makeScale(0, 0, 0); chunkMesh.setMatrixAt(i, _m4); continue; }
    let y = c.y0 - 0.5 * 2.6 * age * age, x = c.x + c.vx * Math.min(age, 0.25);
    const pileY = HOLE_BOT + 0.03 + (i % 5) * 0.025;
    if (t > 17.5 && y > CAS_BOT && c.y0 > CAS_BOT) { // the casing is in: chunks above its bottom are gone (pushed back into the wall)
      _m4.makeScale(0, 0, 0); chunkMesh.setMatrixAt(i, _m4); continue; }
    if (y < pileY) { y = pileY; x = Math.max(-GX + 0.05, Math.min(GX - 0.05, x)); }
    _e.set(c.rx + age * 4, c.rx * 2 + age * 3, 0); _q.setFromEuler(_e);
    _m4.compose(V3(x, y, c.z), _q, V3(c.s, c.s * 0.8, c.s)); chunkMesh.setMatrixAt(i, _m4); k++;
  }
  chunkMesh.instanceMatrix.needsUpdate = true; if (chunkMesh.instanceColor) chunkMesh.instanceColor.needsUpdate = true;
}

// rain streaks
const RAIN_N = 520;
const rainMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.006, 0.2, 0.006), new THREE.MeshBasicMaterial({ color: col("#cfe6ff"), transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }), RAIN_N);
rainMesh.frustumCulled = false; world.add(rainMesh);
function updateRain(t, amt) {
  rainMesh.visible = amt > 0.001; if (!rainMesh.visible) return;
  rainMesh.material.opacity = 0.5 * amt;
  for (let i = 0; i < RAIN_N; i++) {
    const x = (hash(i * 1.3) * 2 - 1) * (BX + 0.3), z = (hash(i * 2.9) * 2 - 1) * (BZ + 0.3), sp = 7 + hash(i * 4.1) * 3, ph = hash(i * 6.7) * 3.2;
    let y = 3.2 - ((t * sp + ph * sp) % 3.2);
    _m4.compose(V3(x, y, z), _q.identity(), V3(1, 1, 1)); rainMesh.setMatrixAt(i, _m4);
  }
  rainMesh.instanceMatrix.needsUpdate = true;
}

// ---------------- shots (t, camera position, look-at target, fov, aperture) ----------------
const SHOTS = [
  { t0: 0, t1: 3.52, hand: 0.03, keys: [[0, [6.6, 2.6, 18.8], [0.15, -0.95, 0], 32], [3.52, [6.0, 2.3, 17.0], [0.1, -1.0, 0], 32]] },
  { t0: 3.52, t1: 7.64, hand: 0.03, keys: [[3.52, [6.0, 2.3, 17.0], [0.1, -1.0, 0], 32], [6.6, [-3.8, 2.5, 17.4], [0.0, -1.1, 0], 32], [7.64, [0.6, -0.6, 4.2], [-0.2, -1.1, 1.4], 34]] },
  { t0: 7.64, t1: 14.8, hand: 0.02, keys: [[7.64, [1.6, 0.1, 8.6], [-0.35, -1.0, 1.4], 32, 0.0015], [10.0, [1.6, -1.5, 8.6], [-0.35, -2.4, 1.4], 32, 0.0015], [11.5, [1.5, -2.1, 8.2], [-0.35, -2.9, 1.4], 32, 0.0015],
    [12.36, [2.3, 0.9, 9.4], [-0.1, -0.9, 1.4], 32, 0.0012], [13.5, [2.2, -1.1, 8.8], [-0.1, -2.4, 1.4], 32, 0.0012], [14.8, [2.4, -0.4, 10.2], [-0.15, -1.6, 1.4], 32, 0.0012]] },
  { t0: 14.8, t1: 19.76, hand: 0.025, keys: [[14.8, [1.8, -0.7, 6.2], [0, -1.7, 1.4], 32, 0.003], [17.0, [1.7, -0.9, 5.9], [0, -1.8, 1.4], 32, 0.003],
    [17.3, [2.1, 0.8, 7.0], [0, -0.8, 1.4], 32, 0.0025], [19.76, [2.0, 0.4, 6.6], [0, -1.0, 1.4], 32, 0.0025]] },
  { t0: 19.76, t1: 26.4, hand: 0.02, keys: [[19.76, [3.2, 2.7, 7.4], [0, -0.2, 0.7], 32, 0.002], [20.6, [3.0, 2.5, 7.0], [0, -0.3, 0.8], 32, 0.002],
    [21.6, [1.7, -0.5, 5.6], [0, -1.35, 1.3], 32, 0.003], [22.9, [1.6, -0.4, 5.4], [0, -1.25, 1.3], 32, 0.003], [24.6, [1.7, 0.1, 5.4], [0, -0.75, 1.3], 32, 0.003], [26.4, [1.8, 0.2, 5.6], [0, -0.75, 1.3], 32, 0.003]] },
  { t0: 26.4, t1: 34.0, hand: 0.015, keys: [[26.4, [1.6, -2.3, 5.4], [0, -2.8, 1.3], 32, 0.004], [29.4, [1.4, -2.35, 5.1], [0, -2.82, 1.3], 32, 0.004],
    [31.6, [0.2, -2.35, 5.0], [0, -2.82, 1.3], 32, 0.004], [34.0, [-0.9, -2.35, 5.1], [0, -2.82, 1.3], 32, 0.004]] },
  { t0: 34.0, t1: 40.64, hand: 0.02, keys: [[34.0, [3.2, -0.3, 11.6], [0.25, -1.5, 1.4], 32, 0.0012], [36.1, [3.0, -0.4, 11.0], [0.25, -1.55, 1.4], 32, 0.0012],
    [36.35, [2.1, 0.6, 7.8], [0, -0.4, 1.4], 32, 0.002], [37.05, [2.0, -2.1, 7.0], [0, -2.85, 1.3], 32, 0.002], [37.95, [2.0, -2.0, 7.0], [0, -2.75, 1.3], 32, 0.002],
    [38.95, [2.3, 0.9, 8.0], [0.1, -0.3, 1.2], 32, 0.002], [40.64, [2.6, 1.1, 8.3], [0.3, -0.3, 1.0], 32, 0.002]] },
  { t0: 40.64, t1: 47.12, hand: 0.015, keys: [[40.64, [3.3, 1.0, 2.6], [1.38, 0.2, -0.35], 32, 0.004], [41.85, [3.15, 0.95, 2.45], [1.38, 0.2, -0.35], 32, 0.004],
    [41.95, [1.5, -2.5, 4.8], [0, -2.9, 1.2], 32, 0.003], [42.25, [1.45, -2.52, 4.65], [0, -2.9, 1.2], 32, 0.003],
    [42.3, [3.1, 0.85, 2.35], [1.4, 0.15, -0.32], 32, 0.004], [43.3, [3.0, 0.8, 2.25], [1.4, 0.15, -0.32], 32, 0.004],
    [43.6, [4.2, 1.7, 4.2], [1.3, 0.15, 0.0], 32, 0.002], [44.9, [3.9, 1.5, 3.8], [1.35, 0.15, 0.0], 32, 0.002], [47.12, [3.8, 1.45, 3.7], [1.35, 0.15, 0.0], 32, 0.002]] },
  { t0: 47.12, t1: 50.8, hand: 0.015, keys: [[47.12, [4.0, 1.5, 6.0], [0.9, -0.4, 0.5], 32, 0.002], [48.6, [5.6, 2.4, 18.0], [0.1, -1.05, 0], 32, 0.001], [50.8, [3.4, 2.5, 18.8], [0.05, -1.05, 0], 32, 0.001]] },
  { t0: 50.8, t1: 56, hand: 0.01, keys: [[50.8, [3.4, 2.5, 18.8], [0.05, -1.05, 0], 32, 0.001], [56, [1.2, 2.6, 19.4], [0.05, -1.05, 0], 32, 0.001]] },
];
const WHIPS = [{ t: 7.3, amt: 0.6, dir: [0, 1] }, { t: 19.76, amt: -0.7, dir: [0, 1] }, { t: 34.0, amt: 0.5, dir: [0, 1] }, { t: 38.3, amt: -0.7, dir: [0, 1] }, { t: 41.9, amt: 0.6, dir: [0, 1] }, { t: 42.28, amt: -0.6, dir: [0, 1] }];
const IMPACTS = [[0.72, 0.03], [15.76, 0.06], [16.2, 0.035], [17.85, 0.05], [36.92, 0.03], [44.4, 0.03], [49.7, 0.015]];

function shotAt(t) { for (let i = 0; i < SHOTS.length; i++) if (t < SHOTS[i].t1) return i; return SHOTS.length - 1; }
const _cp = new THREE.Vector3(), _ct = new THREE.Vector3();
function cameraFor(t) {
  const si = shotAt(t), S = SHOTS[si], K = S.keys;
  let a = K[0], b = K[K.length - 1], u = 0;
  if (t <= K[0][0]) { a = b = K[0]; } else if (t >= b[0]) { a = b; } else for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) { a = K[i]; b = K[i + 1]; u = eInOut((t - a[0]) / (b[0] - a[0])); break; }
  _cp.set(lerp(a[1][0], b[1][0], u), lerp(a[1][1], b[1][1], u), lerp(a[1][2], b[1][2], u));
  _ct.set(lerp(a[2][0], b[2][0], u), lerp(a[2][1], b[2][1], u), lerp(a[2][2], b[2][2], u));
  const fov = lerp(a[3], b[3], u), ap = lerp(a[4] || 0, b[4] || 0, u);
  let shake = 0; for (const [ti, amp] of IMPACTS) if (t >= ti) shake += amp * Math.exp(-(t - ti) * 9) * Math.sin((t - ti) * 70);
  const hd = S.hand;
  _cp.x += (Math.sin(t * 1.3) * 0.6 + Math.sin(t * 2.9 + 1) * 0.4) * hd + shake;
  _cp.y += (Math.sin(t * 1.7 + 2) * 0.6 + Math.sin(t * 3.7) * 0.4) * hd + shake * 0.7;
  return { si, fov, ap };
}

// ---------------- post ----------------
const rt0 = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 0 });
rt0.depthTexture = new THREE.DepthTexture(W, H); rt0.depthTexture.type = THREE.UnsignedIntType;
const composer = new EffectComposer(renderer, rt0);
composer.setPixelRatio(1); composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
class DofPass extends ShaderPass { render(r, w, rd, dt, m) { this.uniforms.tDepth.value = rd.depthTexture; super.render(r, w, rd, dt, m); } }
const bokeh = new DofPass({
  uniforms: { tDiffuse: { value: null }, tDepth: { value: null }, uNear: { value: 0.05 }, uFar: { value: 160 }, focus: { value: 5 }, aperture: { value: 0.004 }, uRes: { value: new THREE.Vector2(W, H) } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse, tDepth; uniform float uNear, uFar, focus, aperture; uniform vec2 uRes; varying vec2 vUv;
    float vz(vec2 uv){ float z = texture2D(tDepth, uv).x * 2.0 - 1.0; return 2.0 * uNear * uFar / (uFar + uNear - z * (uFar - uNear)); }
    float coc(vec2 uv){ return clamp(abs(vz(uv) - focus) * aperture * 1080.0, 0.0, 12.0); }
    void main(){
      float c0 = coc(vUv); vec4 acc = texture2D(tDiffuse, vUv); float ws = 1.0;
      if (c0 > 0.6) {
        for (int i = 0; i < 12; i++) {
          float fi = float(i) + 0.5; float a = fi * 2.39996; float r = sqrt(fi / 12.0) * c0;
          vec2 uv = vUv + vec2(cos(a), sin(a)) * r / uRes;
          float cs = coc(uv); float w = clamp(cs / (c0 * 0.5), 0.0, 1.0);
          acc += texture2D(tDiffuse, uv) * w; ws += w;
        }
      }
      gl_FragColor = acc / ws; }`,
});
bokeh.uniforms = bokeh.material.uniforms;
composer.addPass(bokeh);
const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.5, 0.4, 1.4); composer.addPass(bloom);
const grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uFrame: { value: 0 }, uBlur: { value: 0 }, uDir: { value: new THREE.Vector2(0, 1) }, uFlash: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uFrame, uBlur, uFlash; uniform vec2 uDir; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){
      vec4 c = vec4(0.0);
      if (abs(uBlur) > 0.001) { for (int i = 0; i < 16; i++) { float o = (float(i) / 15.0 - 0.5) * uBlur; c += texture2D(tDiffuse, vUv + uDir * o); } c /= 16.0; }
      else c = texture2D(tDiffuse, vUv);
      vec2 q = vUv - 0.5; q.y *= 1.3;
      c.rgb *= mix(0.6, 1.0, smoothstep(0.95, 0.28, length(q)));
      c.rgb += (h(vUv * vec2(1080.0, 1920.0) + uFrame * 7.13) - 0.5) * 0.026;
      c.rgb += uFlash * vec3(0.06, 0.2, 0.2);
      gl_FragColor = c; }`,
});
composer.addPass(grade);
composer.addPass(new OutputPass());
const fxaa = new FXAAPass(); fxaa.setSize(W, H); composer.addPass(fxaa);

// ---------------- per frame ----------------
const _v = new THREE.Vector3();
const aquiBase = col("#0d8f86"), aquiMurk = col("#4a3a26");
function renderAt(tIn) {
  const t = tIn >= LOOP ? 0 : tIn;
  const { si, fov, ap } = cameraFor(t);

  // camera
  camera.fov = fov; camera.position.copy(_cp); camera.lookAt(_ct); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  bokeh.uniforms.focus.value = camera.position.distanceTo(_ct); bokeh.uniforms.aperture.value = ap;
  world.position.y = Math.sin(t * 0.9) * 0.03;
  world.rotation.y = Math.sin(t * 0.25) * 0.012;
  world.updateMatrixWorld(true);

  // drilling
  const hole = holeAt(t);
  HOLE_PLANE.constant = hole + world.position.y;  // filler kept only below the drilled depth
  rig.position.set(keys(RIGX, t), 0, WZ);
  mast.rotation.x = -Math.PI / 2 * 0.97 * eInOut(seg(t, 16.3, 17.2));
  const tip = t < 14.85 ? hole : keys(LIFT, t);
  const rodTop = 1.72, rodBot = tip + 1.0;
  drill.visible = t < 15.7;
  drillRod.scale.y = Math.max(0.01, rodTop - rodBot); drillRod.position.y = (rodTop + rodBot) / 2;
  bit.position.y = tip; bit.rotation.y = -drillAngle(t);
  drillRod.rotation.y = bit.rotation.y;

  // casing / screen / grout / sand / water / pump
  const cas = keys(CAS, t), casOff = t < 17.24 ? 99 : eOut(1 - cas) * 0 + (1 - eOut(seg(t, 17.24, 17.9))) * 3.2;
  casing.visible = t >= 17.24; casing.position.y = casOff;
  screenG.visible = t >= 29.6; screenG.position.y = (1 - eOut(seg(t, 29.6, 30.2))) * 0.75;
  GROUT_PLANE.constant = lerp(-1.42, 0.02, eInOut(keys(GROUT, t))) + world.position.y;
  groutPad.visible = t > 24.4; groutPad.scale.y = Math.max(0.01, seg(t, 24.4, 24.7));
  const sl = keys(SANDL, t); SAND_PLANE.constant = sl + world.position.y; sandCol.visible = sandFront.visible = sl > HOLE_BOT + 0.01 && t > 27.5;
  const wl = t < 13.0 ? -9 : keys(WL, t);
  WL_PLANE.constant = (t < 13.5 ? lerp(HOLE_BOT, -2.55, seg(t, 13.0, 14.2)) : wl) + world.position.y;
  waterCol.visible = waterFront.visible = t > 13.0;
  waterMat.emissiveIntensity = 0.45 + 0.9 * keys([[0, 0], [37.9, 0], [38.2, 1], [40.6, 1], [41.4, 0.3]], t); waterHole.visible = t > 13.0 && t < 30.2;
  const pumpY = t < 36.24 ? 9 : lerp(0.6, -2.92, eOut(seg(t, 36.24, 36.92)));
  pump.visible = t >= 36.24; pump.position.y = pumpY + bump(t, 36.92, 0.3) * 0.03;
  cable.visible = riser.visible = pump.visible;
  const cTop = 0.2; cable.scale.y = Math.max(0.01, cTop - (pumpY + 0.26)); cable.position.set(0.07, (cTop + pumpY + 0.26) / 2, 0);
  riser.scale.y = Math.max(0.01, cTop - (pumpY + 0.3)); riser.position.set(0, (cTop + pumpY + 0.3) / 2, 0);
  const on = pumpOn(t);
  M.pump.emissiveIntensity = 0.25 + 1.6 * on; pumpLed.material.color.set(on > 0.5 ? ORANGE : "#2a3a4a");
  if (on > 0.02) pumpLed.material.color.multiplyScalar(2.4);
  pump.getWorldPosition(_v); pumpLight.position.copy(_v).add(V3(0, 0, 0.3)); pumpLight.intensity = on * 3.0 * (pump.visible ? 1 : 0);
  pump.rotation.y = on * t * 6;

  // aquifer: glows from "aquifers"; muddy in the seepage step
  const aq = keys([[0, 0.45], [10.88, 0.45], [11.3, 1.0], [14, 0.8]], t), murk = keys(MURK, t);
  for (const m of [...layerMats.aqui, layerMats.aquiFill]) { m.emissive.copy(aquiBase).lerp(aquiMurk, murk * 0.85); m.emissiveIntensity = aq * (1 - murk * 0.6); m.color.setRGB(1, 1, 1).lerp(col("#9b8a70"), murk * 0.6); }
  aquiLight.position.set(0, -2.9 + world.position.y, BZ + 0.8); aquiLight.intensity = aq * 2.2 * (1 - murk * 0.7);

  // x-ray scan and labels
  const sc = seg(t, 8.0, 10.95), scY = lerp(0.1, BOT, sc);
  scan.visible = t > 7.9 && t < 11.3; scan.position.y = scY; scan.children.forEach((c) => (c.material.opacity = 1 - seg(t, 10.95, 11.3)));
  for (const lb of labels) {
    const rev = t > 7.9 ? seg(scY, lb.y + 0.05, lb.y - 0.15) : 0, out = seg(t, 14.6, 15.0);
    const isAq = lb.L.id === "aqui";
    lb.m.material.opacity = rev * (1 - out) * (isAq ? 1 : 0.9);
    lb.line.material.opacity = rev * (1 - out);
    const pulse = isAq ? 1 + bump(t, 10.88, 0.6) * 0.35 : 1;
    lb.m.scale.setScalar(pulse * (0.85 + 0.15 * eOut(rev)));
    lb.m.visible = lb.line.visible = lb.m.material.opacity > 0.01;
  }

  // tank, gauge, glass, pour, flow lines, bucket
  const tk = seg(t, TANKY[0], TANKY[1]);
  tank.visible = t >= TANKY[0]; tank.position.set(TANK.x, (1 - eOut(tk)) * 2.6 + bump(t, TANKY[1], 0.25) * 0.04, TANK.z);
  tank.scale.set(1 + bump(t, TANKY[1] - 0.02, 0.22) * 0.08, 1 - bump(t, TANKY[1] - 0.02, 0.22) * 0.1, 1 + bump(t, TANKY[1] - 0.02, 0.22) * 0.08);
  needle.rotation.z = -keys(GAUGE, t) - Math.sin(t * 9) * 0.03 * seg(t, 45.0, 45.2);
  const gf = keys(GLASSF, t) * (t > 47.0 ? 1.05 : 1);
  glassWater.visible = gf > 0.01; glassWater.scale.y = Math.max(0.01, gf * 0.13); glassWater.position.y = 0.01 + gf * 0.065;
  const pr = pouring(t);
  stream.visible = pr > 0.02; stream.scale.set(pr, Math.max(0.01, TAP.y - 0.06 - (0.01 + gf * 0.13)), pr);
  stream.position.set(TAP.x, (TAP.y - 0.06 + 0.01 + gf * 0.13) / 2, TAP.z + 0.01);
  drawOn(flow1, eOut(keys(FLOW1, t))); drawOn(flow2, eOut(keys(FLOW2, t)));
  const bk = seg(t, 49.28, 49.85);
  bucket.visible = t >= 49.28; bucket.scale.setScalar(1.7); bucket.position.set(lerp(3.4, 1.95, eOut(bk)), 0, 1.05); bucket.rotation.z = Math.sin((t - 49.85) * 18) * 0.12 * Math.exp(-Math.max(0, t - 49.85) * 4) * (t > 49.85 ? 1 : 0) - (1 - eOut(bk)) * 0.15;

  // measure arrow + question mark ("the water sits far below")
  const mIn = seg(t, 34.6, 35.3), mOut = seg(t, 37.85, 38.3), mOn = t > 34.6 && t < 38.3;
  measure.visible = mOn;
  if (mOn) {
    const y0 = -2.55, y1 = -0.05, n = dashes.length, step = (y1 - y0) / n;
    for (let i = 0; i < n; i++) { const d = dashes[i], show = seg(mIn * n, i, i + 1) * (1 - mOut); d.visible = show > 0.01; d.position.set(MEAS_X, y0 + i * step, MEAS_Z); d.scale.set(1, Math.max(0.01, show) * (step * 0.6 / 0.07), 1); }
    arrowHead.visible = mIn > 0.95 && mOut < 1; arrowHead.position.set(MEAS_X, y1 + 0.04, MEAS_Z);
    for (const d of dashes) d.material.opacity = 0.9;
  }
  if (qMark) {
    const qi = seg(t, 35.04, 35.4), qo = seg(t, 36.1, 36.3);
    qMark.visible = t > 35.04 && t < 36.3;
    qMark.position.set(MEAS_X + 0.42, -1.2, MEAS_Z + 0.05); qMark.lookAt(camera.position);
    qMark.scale.setScalar(Math.max(0.001, eBack(qi) * (1 - qo) * (1 + Math.sin(t * 10) * 0.05)));
  }

  updateChunks(t);
  const rain = keys(RAIN, t); updateRain(t, rain);


  // particles
  ADD.begin(); SOFT.begin();
  // drill bites in (hook) and drills down: dust + sparks at the bit
  emit(SOFT, t, { t0: 0.72, t1: 2.2, n: 90, life: 1.1, org: V3(0, 0.04, WZ), vel: [0, 0.5, 0], spr: [1.4, 0.5, 1.4], drag: 2, g: -0.6, s0: 0.05, s1: 0.16, col: cDust, a: 0.55, seed: 3 });
  emit(ADD, t, { t0: 0.72, t1: 1.6, n: 50, life: 0.45, org: V3(0, 0.05, WZ + 0.1), vel: [0, 1.6, 0.4], spr: [2.4, 1.2, 1.6], g: -6, s0: 0.035, s1: 0.0, col: cSpark, a: 1, seed: 5 });
  emit(SOFT, t, { t0: 12.36, t1: 13.6, n: 120, life: 1.2, org: V3(0, 0.05, WZ), vel: [0, 1.0, 0], spr: [1.2, 0.8, 1.2], drag: 2, g: -1.2, s0: 0.05, s1: 0.15, col: cDust, a: 0.6, seed: 7 });
  emit(SOFT, t, { t0: 12.36, t1: 13.5, n: 140, life: 0.6, org: (b) => V3(0, holeAt(b) + 0.15, WZ + 0.15), vel: [0, 0.6, 0.2], spr: [1.0, 0.6, 0.5], g: -2, s0: 0.03, s1: 0.06, col: cDust, a: 0.7, seed: 9 });
  // cave-in dust
  emit(SOFT, t, { t0: 15.76, t1: 17.3, n: 110, life: 1.0, org: (b, k) => V3((k % 2 ? 1 : -1) * 0.3, -0.6 - hash(k * 3) * 1.8, GZ0 + 0.1 + hash(k * 5) * 0.5), vel: [0, -0.4, 0], spr: [0.4, 0.4, 0.3], drag: 1.5, s0: 0.05, s1: 0.13, col: cDust, a: 0.5, seed: 11 });
  emit(SOFT, t, { t0: 17.75, t1: 17.95, n: 40, life: 0.8, org: V3(0, 0.15, WZ), vel: [0, 0.4, 0], spr: [1.4, 0.3, 1.0], drag: 2, s0: 0.05, s1: 0.14, col: cDust, a: 0.5, seed: 13 });
  // rain splashes on the ground and the muddy seepage down the gap outside the pipe
  emit(ADD, t, { t0: 20.1, t1: 22.6, n: 160, life: 0.25, org: (b, k) => V3((hash(k * 1.3) * 2 - 1) * BX, 0.02, (hash(k * 2.7) * 2 - 1) * BZ), vel: [0, 0.8, 0], spr: [0.8, 0.4, 0.8], g: -6, s0: 0.025, s1: 0.0, col: cWhite, a: 0.5, seed: 15 });
  emit(SOFT, t, { t0: 20.64, t1: 23.5, n: 260, life: 1.9, org: (b, k) => V3((k % 2 ? 1 : -1) * (PR + 0.07 + hash(k) * 0.06), 0.0, WZ + 0.12 + hash(k * 3) * 0.2), vel: [0, -1.25, 0], spr: [0.03, 0.15, 0.03], s0: 0.05, s1: 0.04, col: cMud, a: 0.85, pw: 0.6, floor: -2.4, seed: 17, mod: (b) => 1 - seg(b, 23.1, 23.5) });
  // grout pour from the top
  emit(SOFT, t, { t0: 23.04, t1: 24.5, n: 120, life: 0.5, org: (b, k) => V3((k % 2 ? 1 : -1) * (PR + 0.08), 0.5, WZ + 0.1), vel: [0, -2.4, 0], spr: [0.05, 0.3, 0.05], s0: 0.06, s1: 0.05, col: () => [0.9, 0.88, 0.82], a: 0.9, seed: 19 });
  // groundwater dots drifting toward the well (from "aquifers" on)
  if (t > 10.6) {
    const fa = seg(t, 10.6, 11.4) * (1 - murk * 0.8);
    for (let i = 0; i < 150; i++) {
      const side = i % 2 ? 1 : -1, sp = 0.18 + hash(i * 2.3) * 0.2, x0 = hash(i * 4.1) * (BX - GX);
      let x = side * (BX - ((x0 + t * sp) % (BX - GX)));
      const y = -2.45 - hash(i * 6.1) * 0.85, z = BZ + 0.02;
      const inPipe = t > 37.92 && t < 40.6 ? 1.6 : 1;
      _o.set(x, y, z); world.localToWorld(_o); const a = fa * 0.7 * (0.5 + 0.5 * Math.sin(t * 3 + i)) * inPipe;
      ADD.push(_o.x, _o.y, _o.z, 0.03 + hash(i * 8) * 0.03, 0.2 * a, 1.5 * a, 1.35 * a, 1);
    }
  }
  // sand into the open hole (problem) and bouncing off the screen (fix); water through the slots
  emit(SOFT, t, { t0: 27.9, t1: 29.7, n: 260, life: 0.8, org: (b, k) => V3((k % 2 ? 1 : -1) * (0.5 + hash(k) * 0.35), -2.55 - hash(k * 3) * 0.4, BZ + 0.03 + hash(k * 7) * 0.04), vel: (k) => [(k % 2 ? -1 : 1) * 0.95, -0.1, 0], spr: [0.2, 0.15, 0.1], s0: 0.07, s1: 0.06, col: cSand, a: 1, pw: 0.4, seed: 21 });
  emit(SOFT, t, { t0: 30.2, t1: 33.8, n: 260, life: 0.7, org: (b, k) => V3((k % 2 ? 1 : -1) * (0.5 + hash(k) * 0.3), -2.6 - hash(k * 3) * 0.5, BZ + 0.03 + hash(k * 7) * 0.04), vel: (k) => [(k % 2 ? -1 : 1) * 0.9, 0, 0], spr: [0.15, 0.1, 0.1], s0: 0.07, s1: 0.06, col: cSand, a: 1, pw: 0.4, seed: 23,
    mod: () => 1 });
  emit(ADD, t, { t0: 30.2, t1: 33.9, n: 200, life: 0.75, org: (b, k) => V3((k % 2 ? 1 : -1) * (0.5 + hash(k) * 0.3), -2.6 - hash(k * 3) * 0.55, BZ + 0.03 + hash(k * 7) * 0.04), vel: (k) => [(k % 2 ? -1 : 1) * 0.95, 0.05, 0], spr: [0.1, 0.1, 0.05], s0: 0.03, s1: 0.02, col: cTeal, a: 0.8, seed: 25 });
  // the pump lands: ripple and bubbles; water pushed up the pipe
  emit(ADD, t, { t0: 36.88, t1: 37.1, n: 60, life: 0.6, org: V3(0, -2.6, WZ + 0.1), vel: [0, 0.6, 0], spr: [0.5, 0.5, 0.3], g: -1.5, s0: 0.04, s1: 0.0, col: cWhite, a: 0.8, seed: 27 });
  emit(ADD, t, { t0: 37.92, t1: 40.4, n: 220, life: 1.1, org: (b, k) => V3((hash(k) - 0.5) * 0.22, -2.75, WZ + 0.06), vel: [0, 3.0, 0], spr: [0.05, 0.4, 0.02], s0: 0.035, s1: 0.025, col: cTeal, a: 0.9, seed: 29, mod: (b) => 1 });
  // surface flow beads along the lines once water arrives
  const beads = (curve, t0, t1, n, seed) => { if (t < t0) return; for (let i = 0; i < n; i++) { const u = ((t - t0) * 0.45 + i / n) % 1; const p = curve.getPoint(u); p.y += 0.02; world.localToWorld(p); const a = seg(t, t0, t0 + 0.4) * (t1 ? 1 - seg(t, t1, t1 + 0.4) : 1); ADD.push(p.x, p.y, p.z, 0.05, 0.4 * a, 2.2 * a, 2.0 * a, 1); } };
  beads(flowCurve1, 39.6, 0, 9, 1); beads(flowCurve2, 44.9, 0, 6, 2);
  // the tank lands: dust ring
  emit(SOFT, t, { t0: TANKY[1] - 0.02, t1: TANKY[1] + 0.08, n: 40, life: 0.7, org: V3(TANK.x, 0.03, TANK.z), vel: [0, 0.2, 0], spr: [1.2, 0.2, 1.2], drag: 3, s0: 0.04, s1: 0.1, col: cDust, a: 0.5, seed: 31 });
  // payoff shimmer + floating dust motes everywhere
  emit(ADD, t, { t0: 47.12, t1: 47.6, n: 70, life: 1.0, org: (b, k) => V3(-2 + hash(k) * 4, -3.8 + hash(k * 2) * 4, BZ + 0.1), vel: [0, 0.4, 0], spr: [0.2, 0.2, 0.2], drag: 1, s0: 0.035, s1: 0.0, col: cTeal, a: 0.6, seed: 33 });
  for (let i = 0; i < 70; i++) { _o.set((hash(i * 1.1) - 0.5) * 9, -5 + hash(i * 2.2) * 8 + Math.sin(t * 0.3 + i) * 0.2, (hash(i * 3.3) - 0.5) * 7 + 0.5); const a = 0.25 * (0.5 + 0.5 * Math.sin(t * 0.7 + i * 2)); ADD.push(_o.x, _o.y, _o.z, 0.03, 0.5 * a, 0.9 * a, 1.0 * a, 1); }
  ADD.end(); SOFT.end();

  // whips (directional blur) and flashes
  let blur = 0, dir = [0, 1];
  for (const w of WHIPS) { const b = bump(t, w.t - 0.12, 0.26); if (b > 0) { blur += w.amt * b * 0.06; dir = w.dir; } }
  grade.uniforms.uBlur.value = blur; grade.uniforms.uDir.value.set(dir[0], dir[1]);
  grade.uniforms.uFlash.value = bump(t, 47.12, 0.45) * 0.14 + bump(t, 17.85, 0.25) * 0.05 + bump(t, 10.88, 0.4) * 0.06;
  grade.uniforms.uFrame.value = Math.round(tIn * 30);
  bloom.strength = 0.5 + on * 0.25;
  key.intensity = 2.1 * (1 - 0.35 * rain); rim.intensity = 2.4 * (1 + 0.3 * rain);
  composer.render();
}

// ---------------- boot ----------------
(async function boot() {
  try {
    const ff = new FontFace(LABEL_FONT, "url(assets/fonts/Outfit-Bold.ttf)"); await ff.load(); document.fonts.add(ff);
  } catch (e) { console.error("font failed", e); LABEL_FONT = "sans-serif"; }
  makeLabels();
  { const { t, aspect } = labelTex("?", { fs: 220, fill: "#7ff5e6" }); qMark = new THREE.Mesh(new THREE.PlaneGeometry(0.5 * aspect, 0.5), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false })); world.add(qMark); }
  window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
  window.__cineRender = renderAt;
  window.__cine = { composer, renderer, scene, camera };
  renderAt(0);
  window.__worldReady && window.__worldReady();
})();
