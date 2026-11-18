// special-smart-glasses: cinematic 3D miniature world (1080x1920) in the style of the Fable 5.2 Short
// (isometric floating slab, Brainmaxx robot with a screen face, toy-like props), combined with the
// "Built Step by Step" chain: the robot builds a pair of smart glasses on its own face, one part per problem.
// Post pipeline from the special-water-well engine, plus a sanitize pass after depth of field (black-frame fix).
// Every frame is a pure function of timeline time t (hf-seek). No clocks, no Math.random.
// Times are voiceover word times of take 2 (channel/voiceover/special-smart-glasses.words.json).
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
const LOOP = 47.35;            // cover is held 46.35-47.35, then frame 0 returns (the Short loops)
const TEAL = "#19C3B1", WHITE = "#F4F1EA", ORANGE = "#FF7A3D", NAVY = "#0B1B33";

// ---------------- math ----------------
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const lerp = (a, b, u) => a + (b - a) * u;
const sm = (x) => x * x * (3 - 2 * x);
const eOut = (x) => 1 - Math.pow(1 - x, 3);
const eInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eBack = (x) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const bump = (t, a, len) => { const u = (t - a) / len; return u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u); };
const pop = (t, a, d = 0.35) => (t < a ? 0 : eBack(seg(t, a, a + d)));          // 0 -> overshoot -> 1
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
const V3 = (x, y, z = 0) => new THREE.Vector3(x, y, z);
const col = (hex) => new THREE.Color(hex);

// ---------------- story times (take 2 word times) ----------------
const T = {
  score: 0.46, of400: 2.8, then: 3.8, ai: 4.96, why: 6.28, blame: 7.0, glassesQ: 7.42,
  plain: 8.48, hear: 9.12, nothing: 9.42, mics: 11.26, frame: 12.18,
  next: 12.98, twelve: 13.64, camera: 14.52, corner: 15.2, sees: 16.04,
  speakers: 17.32, arms: 17.98, ears: 18.96, open: 19.98,
  brain: 20.82, isnt: 21.16, phone: 22.68, cloud: 23.34, thinking: 24.02,
  light: 25.2, shines: 25.64, records: 26.6,
  pCamera: 27.76, pMic: 28.72, pAI: 29.92, face: 31.26,
  confession: 32.82, tinyCam: 34.22, cPhone: 35.04, cAI: 35.96,
  sub: 36.9, like: 39.08, brainmaxx: 40.18, should: 41.2, ban: 42.0, yes: 43.56, no: 43.9, defend: 44.5,
};

// ---------------- renderer / scene ----------------
const cv = document.getElementById("world");
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(col("#0a1830"), 0.012);
const camera = new THREE.PerspectiveCamera(32, W / H, 0.03, 160);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.45;

const backMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { uTop: { value: col("#06101f") }, uHor: { value: col("#0d2a45") }, uBot: { value: col("#040a16") }, uGlowDir: { value: V3(0, -0.3, -1).normalize() }, uGlow: { value: col("#0e5560") } },
  vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `uniform vec3 uTop,uHor,uBot,uGlow,uGlowDir; varying vec3 vD;
    void main(){ vec3 d = normalize(vD); float h = d.y;
      vec3 c = mix(uHor, uTop, smoothstep(-0.05, 0.6, h)); c = mix(c, uBot, smoothstep(-0.05, -0.5, h));
      c += uGlow * pow(max(dot(d, uGlowDir), 0.0), 3.0) * 0.7; gl_FragColor = vec4(c, 1.0); }`,
});
const backdrop = new THREE.Mesh(new THREE.SphereGeometry(120, 48, 24), backMat);
backdrop.renderOrder = -10; scene.add(backdrop);

const key = new THREE.DirectionalLight(0xfff0e0, 2.3); key.position.set(-6, 10, 8);
key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -4.5, right: 4.5, top: 4.5, bottom: -4.5, near: 1, far: 30 });
key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
scene.add(key, key.target);
const rim = new THREE.DirectionalLight(0x19c3b1, 2.6); rim.position.set(5, 4, -8); scene.add(rim);
const fill = new THREE.DirectionalLight(0xa9c0ff, 0.6); fill.position.set(7, 2, 6); scene.add(fill);
const warm = new THREE.PointLight(0xffa060, 0, 6, 1.5); scene.add(warm);      // hook glow behind the paper
const ledLight = new THREE.PointLight(0xffffff, 0, 1.2, 1.6); scene.add(ledLight);
const spot = new THREE.SpotLight(0xfff1d8, 0, 9, 0.32, 0.5, 1.2); spot.position.set(-1.75, 5.2, 2.2); scene.add(spot, spot.target);

const world = new THREE.Group(); scene.add(world);

// ---------------- textures and helpers ----------------
function canvasTex(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
let FONT = "BrandOutfitC";
function labelTex(text, opts = {}) {
  const fs = opts.fs || 120, pad = 40, c = document.createElement("canvas"), g = c.getContext("2d");
  g.font = `700 ${fs}px ${FONT}`; const w = Math.ceil(g.measureText(text).width) + pad * 2; c.width = w; c.height = fs + pad * 2;
  g.font = `700 ${fs}px ${FONT}`; g.textBaseline = "middle"; g.lineJoin = "round";
  if (opts.bg) { g.fillStyle = opts.bg; const r = c.height / 2 - 8; g.beginPath(); g.roundRect(8, 8, w - 16, c.height - 16, r); g.fill(); }
  g.lineWidth = fs * 0.16; g.strokeStyle = opts.stroke || "rgba(6,14,28,0.92)"; if (!opts.noStroke) g.strokeText(text, pad, c.height / 2 + fs * 0.04);
  g.fillStyle = opts.fill || WHITE; g.fillText(text, pad, c.height / 2 + fs * 0.04);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { t, aspect: w / c.height };
}
function rod(a, b, r, m, segs = 10) {
  const d = b.clone().sub(a), len = d.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, segs), m);
  mesh.position.copy(a).addScaledVector(d, 0.5);
  mesh.quaternion.setFromUnitVectors(V3(0, 1, 0), d.clone().normalize());
  return mesh;
}
function roundRect(w, h, r) { const s = new THREE.Shape(); const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
const shadowAll = (o) => o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });

// ---------------- materials ----------------
const M = {
  navy: new THREE.MeshPhysicalMaterial({ color: col("#16294a"), roughness: 0.45, metalness: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
  white: new THREE.MeshPhysicalMaterial({ color: col("#ECE8DF"), roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.3 }),
  teal: new THREE.MeshPhysicalMaterial({ color: col("#4fd6c4"), roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.15 }),
  tealDeep: new THREE.MeshPhysicalMaterial({ color: col("#1aa596"), roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.15 }),
  orange: new THREE.MeshPhysicalMaterial({ color: col(ORANGE), roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12 }),
  dark: new THREE.MeshPhysicalMaterial({ color: col("#141a26"), roughness: 0.28, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08 }),
  frame: new THREE.MeshPhysicalMaterial({ color: col("#11151d"), roughness: 0.22, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05 }),
  steel: new THREE.MeshStandardMaterial({ color: col("#c0c8d2"), roughness: 0.25, metalness: 1 }),
  paper: new THREE.MeshStandardMaterial({ color: col("#f6f2e8"), roughness: 0.85, map: (() => { const c = document.createElement("canvas"); c.width = 256; c.height = 336; const g = c.getContext("2d");
    g.fillStyle = "#f6f2e8"; g.fillRect(0, 0, 256, 336); g.fillStyle = "#1c335a"; g.fillRect(0, 0, 256, 46);
    g.fillStyle = "#19C3B1"; g.fillRect(16, 14, 90, 18); for (let i = 0; i < 9; i++) { g.fillStyle = "rgba(28,51,90,0.55)"; g.fillRect(22, 74 + i * 26, 150 + ((i * 37) % 60), 7); }
    g.strokeStyle = "#d8282a"; g.lineWidth = 7; g.beginPath(); g.ellipse(190, 290, 44, 28, -0.1, 0, 6.3); g.stroke();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; })() }),
  glass: new THREE.MeshPhysicalMaterial({ color: col("#dff8f4"), roughness: 0.04, clearcoat: 1, transparent: true, opacity: 0.22, depthWrite: false }),
  glowTeal: new THREE.MeshBasicMaterial({ color: col(TEAL).multiplyScalar(2.2), transparent: true, depthWrite: false, toneMapped: false }),
  glowWhite: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 2.6, 2.5), transparent: true, depthWrite: false, toneMapped: false }),
  glowOrange: new THREE.MeshBasicMaterial({ color: col(ORANGE).multiplyScalar(2.0), transparent: true, depthWrite: false, toneMapped: false }),
};

// ---------------- the slab ----------------
const SL = 3.0, SLT = 0.42;    // half size, thickness (top surface y = 0)
{
  const slab = new THREE.Mesh(new RoundedBoxGeometry(SL * 2, SLT, SL * 2, 4, 0.12), M.navy); slab.position.y = -SLT / 2; slab.receiveShadow = true; world.add(slab);
  const grid = canvasTex(1024, 1024, (g, w) => {
    g.fillStyle = "#1c335a"; g.fillRect(0, 0, w, w);
    for (let i = 0; i <= 16; i++) { const p = (i / 16) * w; g.strokeStyle = i % 4 === 0 ? "rgba(70,220,200,0.55)" : "rgba(70,220,200,0.18)"; g.lineWidth = i % 4 === 0 ? 4 : 2;
      g.beginPath(); g.moveTo(p, 0); g.lineTo(p, w); g.stroke(); g.beginPath(); g.moveTo(0, p); g.lineTo(w, p); g.stroke(); }
  });
  const top = new THREE.Mesh(new THREE.PlaneGeometry(SL * 2 - 0.3, SL * 2 - 0.3), new THREE.MeshPhysicalMaterial({ map: grid, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.2 }));
  top.rotation.x = -Math.PI / 2; top.position.y = 0.004; top.receiveShadow = true; world.add(top);
  const E = SL - 0.06, y = 0.03;
  const c = [[-E, -E], [E, -E], [E, E], [-E, E]];
  for (let i = 0; i < 4; i++) { const [x0, z0] = c[i], [x1, z1] = c[(i + 1) % 4]; world.add(rod(V3(x0, y, z0), V3(x1, y, z1), 0.028, M.glowTeal, 6)); world.add(rod(V3(x0 * 1.02, -SLT + 0.04, z0 * 1.02), V3(x1 * 1.02, -SLT + 0.04, z1 * 1.02), 0.02, M.glowTeal, 6)); }
}
const poolTex = canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, "rgba(25,195,177,0.55)"); gr.addColorStop(0.45, "rgba(20,110,120,0.2)"); gr.addColorStop(1, "rgba(10,25,50,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
const pool = new THREE.Mesh(new THREE.PlaneGeometry(13, 13), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
pool.rotation.x = -Math.PI / 2; pool.position.y = -1.2; world.add(pool);

// ---------------- exam hall props ----------------
const DESKS = [[-1.75, 0.1], [1.75, 0.1], [-1.75, 1.5], [1.75, 1.5]];
const SUSPECT = V3(-1.75, 0, 1.5);
const DESK_H = 0.52;
function makeDesk(x, z, chairOrange) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const top = new THREE.Mesh(new RoundedBoxGeometry(1.05, 0.07, 0.62, 3, 0.03), M.white); top.position.y = DESK_H; g.add(top);
  const band = new THREE.Mesh(new RoundedBoxGeometry(1.06, 0.03, 0.63, 2, 0.012), M.teal); band.position.y = DESK_H - 0.045; g.add(band);
  for (const sx of [-0.45, 0.45]) for (const sz of [-0.24, 0.24]) g.add(rod(V3(sx, 0, sz), V3(sx, DESK_H - 0.04, sz), 0.025, M.navy, 8));
  const ppr = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.006, 0.42), M.paper); ppr.position.set(0.18, DESK_H + 0.04, 0.02); ppr.rotation.y = 0.18; g.add(ppr);
  const pen = rod(V3(-0.12, DESK_H + 0.05, -0.05), V3(0.02, DESK_H + 0.05, 0.12), 0.012, M.orange, 6); g.add(pen);
  // chair behind the desk (students face the robot at the back)
  const chair = new THREE.Group(); chair.position.set(0, 0, 0.55); g.add(chair);
  const seat = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.06, 0.42, 3, 0.03), chairOrange ? M.orange : M.white); seat.position.y = 0.34; chair.add(seat);
  const back = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.38, 0.06, 3, 0.03), chairOrange ? M.orange : M.white); back.position.set(0, 0.56, 0.19); chair.add(back);
  for (const sx of [-0.18, 0.18]) for (const sz of [-0.15, 0.15]) chair.add(rod(V3(sx, 0, sz), V3(sx, 0.32, sz), 0.018, M.navy, 6));
  shadowAll(g); world.add(g); return g;
}
const deskG = DESKS.map(([x, z], i) => makeDesk(x, z, i === 2));
const suspectClutter = deskG[2].children.filter((c) => c.material === M.paper || c.material === M.orange);
// side table next to the robot, with the phone
const SIDE = V3(1.25, 0, -1.25);
makeDesk(SIDE.x, SIDE.z, false).children.forEach((c) => { if (c.isGroup) c.visible = false; });
const phone = new THREE.Group(); phone.position.set(SIDE.x - 0.12, DESK_H + 0.06, SIDE.z + 0.02); phone.rotation.y = -0.3; world.add(phone);
{ const body = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.025, 0.38, 3, 0.012), M.dark); phone.add(body);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.33), new THREE.MeshBasicMaterial({ color: col(TEAL).multiplyScalar(1.6), toneMapped: false })); scr.rotation.x = -Math.PI / 2; scr.position.y = 0.014; scr.name = "scr"; phone.add(scr); shadowAll(phone); }
const phoneScr = phone.getObjectByName("scr");
const PHONE_REST = phone.position.clone(), PHONE_UP = V3(0.85, 1.75, -1.0);
// back wall pieces (toy-like, like the Fable world)
for (const [x, z, w, r] of [[-2.55, -1.6, 1.0, Math.PI / 2], [2.55, -0.4, 1.4, Math.PI / 2], [-0.9, -2.55, 1.2, 0]]) {
  const wall = new THREE.Group(); wall.position.set(x, 0, z); wall.rotation.y = r; world.add(wall);
  const b = new THREE.Mesh(new RoundedBoxGeometry(w, 0.62, 0.16, 3, 0.04), M.white); b.position.y = 0.31; wall.add(b);
  const cap = new THREE.Mesh(new RoundedBoxGeometry(w + 0.02, 0.08, 0.2, 3, 0.03), M.teal); cap.position.y = 0.64; wall.add(cap); shadowAll(wall);
}
// a wall clock board behind the robot ("EXAM" screen)
const board = new THREE.Group(); board.position.set(-2.0, 0, -2.3); board.rotation.y = 0.32; world.add(board);
{ const tex = canvasTex(512, 300, (g, w, h) => { g.fillStyle = "#0b1b33"; g.fillRect(0, 0, w, h); g.strokeStyle = "#19C3B1"; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = "#19C3B1"; g.font = `700 74px ${FONT}`; g.textAlign = "center"; g.fillText("EXAM", w / 2, 120); g.fillStyle = "#F4F1EA"; g.font = `700 52px ${FONT}`; g.fillText("NO PHONES", w / 2, 210); });
  board.userData.tex = tex;
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.64), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scr.position.set(0, 1.25, 0.03); board.add(scr);
  const fr = new THREE.Mesh(new RoundedBoxGeometry(1.2, 0.74, 0.05, 3, 0.03), M.dark); fr.position.set(0, 1.25, 0); board.add(fr);
  board.add(rod(V3(0, 0, 0), V3(0, 0.9, 0), 0.03, M.navy, 8)); shadowAll(board); }

// ---------------- the robot ----------------
const ROBOT = V3(0, 0, -1.5), ROBOT_RY = 0.22;
const robot = new THREE.Group(); robot.position.copy(ROBOT); robot.rotation.y = ROBOT_RY; world.add(robot);
const HEAD_Y = 1.62;
const head = new THREE.Group(); head.position.y = HEAD_Y; robot.add(head);
{
  const body = new THREE.Mesh(new RoundedBoxGeometry(0.78, 0.62, 0.55, 5, 0.18), M.white); body.position.y = 0.78; robot.add(body);
  const chest = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.18, 0.05, 3, 0.05), M.teal); chest.position.set(0, 0.82, 0.27); robot.add(chest);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.18, 16), M.dark); neck.position.y = 1.16; robot.add(neck);
  for (const sx of [-0.18, 0.18]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.22, 6, 14), M.teal); leg.position.set(sx, 0.32, 0); robot.add(leg);
    const foot = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.12, 0.34, 3, 0.05), M.white); foot.position.set(sx, 0.07, 0.04); robot.add(foot);
  }
  const shell = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.8, 0.8, 6, 0.2), M.teal); head.add(shell);
  const bezel = new THREE.Mesh(new RoundedBoxGeometry(0.86, 0.62, 0.06, 4, 0.12), M.dark); bezel.position.z = 0.39; head.add(bezel);
  for (const sx of [-1, 1]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 28), M.orange); cup.rotation.z = Math.PI / 2; cup.position.set(sx * 0.55, 0, 0); head.add(cup);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.022, 10, 28), M.glowTeal); ring.rotation.y = Math.PI / 2; ring.position.set(sx * 0.63, 0, 0); head.add(ring);
  }
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.38, 0.06, 32), M.white); collar.position.y = 0.42; head.add(collar);
}
const domeMat = new THREE.MeshPhysicalMaterial({ color: col("#cffcf6"), roughness: 0.02, transmission: 0, transparent: true, opacity: 0.28, clearcoat: 1, depthWrite: false });
const dome = new THREE.Mesh(new THREE.SphereGeometry(0.34, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), domeMat); dome.position.y = 0.44; head.add(dome);
const brainMat = new THREE.MeshBasicMaterial({ color: col(TEAL).multiplyScalar(1.6), toneMapped: false, transparent: true });
const brain = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), brainMat, 60); brain.position.y = 0.44; head.add(brain);
{ const m4 = new THREE.Matrix4(); for (let i = 0; i < 60; i++) { const a = hash(i * 3.1) * 6.28, r = Math.sqrt(hash(i * 5.3)) * 0.24, y = 0.03 + hash(i * 7.1) * 0.2 * (1 - r / 0.3);
    m4.compose(V3(Math.cos(a) * r, y, Math.sin(a) * r), new THREE.Quaternion(), V3(1, 1, 1).multiplyScalar(0.018 + hash(i) * 0.016)); brain.setMatrixAt(i, m4); } }
// arms (pivot at the shoulder)
const arms = [];
for (const sx of [-1, 1]) {
  const piv = new THREE.Group(); piv.position.set(sx * 0.46, 0.98, 0); robot.add(piv);
  const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.3, 6, 12), M.teal); arm.position.y = -0.22; piv.add(arm);
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), M.orange); hand.position.y = -0.46; piv.add(hand);
  arms.push(piv);
}
shadowAll(robot);
// screen face (canvas textures, one per expression)
const FACE_W = 512, FACE_H = 360;
const faceCache = {};
function faceTex(kind) {
  if (faceCache[kind]) return faceCache[kind];
  const t = canvasTex(FACE_W, FACE_H, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#151b26"); gr.addColorStop(1, "#06080d"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(255,255,255,0.05)"; g.beginPath(); g.ellipse(w * 0.3, h * 0.18, w * 0.35, h * 0.1, -0.2, 0, 7); g.fill();
    const C = "#6ffbea"; g.strokeStyle = C; g.fillStyle = C; g.lineCap = "round"; g.lineJoin = "round"; g.shadowColor = "#19C3B1"; g.shadowBlur = 26;
    const ex = [w * 0.33, w * 0.67], ey = h * 0.44;
    const eye = (x, type) => {
      g.lineWidth = 16;
      if (type === "dot") { g.beginPath(); g.arc(x, ey, 34, 0, 7); g.fill(); }
      else if (type === "big") { g.beginPath(); g.arc(x, ey, 44, 0, 7); g.lineWidth = 14; g.stroke(); g.beginPath(); g.arc(x, ey, 16, 0, 7); g.fill(); }
      else if (type === "arc") { g.beginPath(); g.arc(x, ey + 18, 34, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
      else if (type === "line") { g.beginPath(); g.moveTo(x - 34, ey); g.lineTo(x + 34, ey); g.stroke(); }
      else if (type === "side") { g.beginPath(); g.arc(x + 20, ey, 30, 0, 7); g.fill(); }
      else if (type === "up") { g.beginPath(); g.arc(x + 8, ey - 18, 28, 0, 7); g.fill(); }
      else if (type === "small") { g.beginPath(); g.arc(x, ey, 18, 0, 7); g.fill(); }
      else if (type === "star") { g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 20 : 48; g.lineTo(x + Math.cos(a) * r, ey + Math.sin(a) * r); } g.closePath(); g.fill(); }
    };
    const mouth = (type) => {
      const mx = w / 2, my = h * 0.74; g.lineWidth = 14;
      if (type === "smile") { g.beginPath(); g.arc(mx, my - 34, 46, Math.PI * 0.2, Math.PI * 0.8); g.stroke(); }
      else if (type === "open") { g.beginPath(); g.moveTo(mx - 56, my - 14); g.quadraticCurveTo(mx, my + 64, mx + 56, my - 14); g.closePath(); g.fill(); }
      else if (type === "o") { g.beginPath(); g.arc(mx, my, 18, 0, 7); g.stroke(); }
      else if (type === "flat") { g.beginPath(); g.moveTo(mx - 34, my); g.lineTo(mx + 34, my); g.stroke(); }
      else if (type === "wavy") { g.beginPath(); g.moveTo(mx - 50, my); for (let k = 1; k <= 4; k++) g.quadraticCurveTo(mx - 50 + (k - 0.5) * 25, my + (k % 2 ? -14 : 14), mx - 50 + k * 25, my); g.stroke(); }
      else if (type === "side") { g.beginPath(); g.arc(mx + 20, my - 30, 36, Math.PI * 0.25, Math.PI * 0.7); g.stroke(); }
    };
    const F = { happy: ["arc", "arc", "smile"], neutral: ["dot", "dot", "smile"], surprised: ["big", "big", "o"], nervous: ["side", "side", "wavy"],
      confused: ["small", "big", "flat"], think: ["up", "up", "side"], star: ["star", "star", "open"], wink: ["dot", "line", "smile"], blink: ["line", "line", "smile"], listen: ["dot", "dot", "o"] }[kind];
    eye(ex[0], F[0]); eye(ex[1], F[1]); mouth(F[2]);
    if (kind === "confused") { g.font = `700 90px ${FONT}`; g.shadowBlur = 20; g.fillText("?", w * 0.84, h * 0.3); }
  });
  faceCache[kind] = t; return t;
}
const faceMat = new THREE.MeshBasicMaterial({ map: null, toneMapped: false, color: new THREE.Color(1.35, 1.35, 1.35) });
const face = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.56), faceMat); face.position.z = 0.425; head.add(face);
const FACES = [[0, "happy"], [T.score, "surprised"], [T.of400, "star"], [T.then, "nervous"], [T.blame, "surprised"], [T.plain, "neutral"], [T.hear, "confused"], [T.mics, "listen"],
  [T.frame, "happy"], [T.next, "confused"], [T.camera, "surprised"], [T.sees, "star"], [T.speakers, "happy"], [T.isnt, "confused"], [T.phone, "think"], [T.thinking, "happy"],
  [T.shines, "wink"], [27.46, "neutral"], [T.face, "star"], [32.38, "think"], [T.cAI, "surprised"], [T.sub, "happy"], [T.like, "wink"], [T.should, "think"], [T.yes, "happy"], [45.0, "neutral"]];
const BLINKS = [2.2, 5.6, 10.0, 19.0, 23.0, 29.0, 34.7, 38.2, 42.6, 45.3];
function faceAt(t) { let k = FACES[0][1]; for (const [a, f] of FACES) if (t >= a) k = f; for (const b of BLINKS) if (t >= b && t < b + 0.12 && !["star", "happy", "wink"].includes(k)) return "blink"; return k; }

// ---------------- the smart glasses ----------------
const glasses = new THREE.Group(); world.add(glasses);
const lensMat = new THREE.MeshPhysicalMaterial({ color: col("#9ff3e8"), roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.18, depthWrite: false });
const GL = { rimX: 0.215, rimW: 0.38, rimH: 0.27, endX: 0.5, templeX: 0.535 };
{
  const outer = roundRect(GL.rimW, GL.rimH, 0.08), inner = roundRect(GL.rimW - 0.07, GL.rimH - 0.07, 0.055);
  outer.holes.push(new THREE.Path(inner.getPoints(24).reverse()));
  const rimGeo = new THREE.ExtrudeGeometry(outer, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 3, curveSegments: 16 });
  rimGeo.translate(0, 0, -0.018);
  for (const sx of [-1, 1]) {
    const rim = new THREE.Mesh(rimGeo, M.frame); rim.position.x = sx * GL.rimX; glasses.add(rim);
    const lens = new THREE.Mesh(new THREE.ShapeGeometry(roundRect(GL.rimW - 0.07, GL.rimH - 0.07, 0.055), 12), lensMat); lens.position.set(sx * GL.rimX, 0, 0.004); glasses.add(lens);
    const endp = new THREE.Mesh(new RoundedBoxGeometry(0.11, 0.07, 0.05, 2, 0.02), M.frame); endp.position.set(sx * (GL.endX - 0.04), 0.06, -0.005); glasses.add(endp);
    const temple = new THREE.Mesh(new RoundedBoxGeometry(0.045, 0.06, 0.44, 2, 0.018), M.frame); temple.position.set(sx * GL.templeX, 0.06, -0.22); glasses.add(temple);
  }
  const bridge = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.035, 0.035, 2, 0.012), M.frame); bridge.position.y = 0.05; glasses.add(bridge);
}
// parts (hidden until built)
const mics = [];
for (const x of [-0.33, -0.12, 0.12, 0.33]) {
  const g = new THREE.Group(); g.position.set(x, GL.rimH / 2 + 0.006, 0.0); glasses.add(g);
  const micMat = new THREE.MeshStandardMaterial({ color: col("#1b2433"), roughness: 0.75, metalness: 0.1 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.038, 0.026, 20), micMat); base.position.y = 0.008; g.add(base);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.01, 20), micMat); mesh.position.y = 0.024; g.add(mesh);
  const dot = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.005, 8, 24), M.glowTeal.clone()); dot.rotation.x = Math.PI / 2; dot.position.y = 0.03; g.add(dot); g.userData.dot = dot; mics.push(g);
}
const camPart = new THREE.Group(); camPart.position.set(-(GL.endX - 0.05), 0.06, 0.03); glasses.add(camPart);
{ const cb = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.046, 0.03, 24), M.dark); cb.rotation.x = Math.PI / 2; camPart.add(cb);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.006, 8, 24), M.glowTeal.clone()); ring.position.z = 0.016; camPart.add(ring);
  const glassL = new THREE.Mesh(new THREE.SphereGeometry(0.026, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: col("#1f3a66"), roughness: 0.02, clearcoat: 1, metalness: 0.4 }));
  glassL.rotation.x = Math.PI / 2; glassL.position.z = 0.014; camPart.add(glassL);
  const glint = new THREE.Mesh(new THREE.CircleGeometry(0.008, 10), M.glowWhite); glint.position.set(-0.008, 0.009, 0.042); camPart.add(glint); }
const ledPart = new THREE.Group(); ledPart.position.set(GL.endX - 0.05, 0.06, 0.03); glasses.add(ledPart);
const ledMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 0.32, 0.34), toneMapped: false });
{ const lb = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 20), M.dark); lb.rotation.x = Math.PI / 2; ledPart.add(lb);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.018, 16, 10), ledMat); led.position.z = 0.012; ledPart.add(led); }
const ledHaloTex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,255,255,0.5)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
const ledHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: ledHaloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(2, 2, 2) })); ledHalo.scale.setScalar(0.3); ledPart.add(ledHalo);
const speakers = [];
for (const sx of [-1, 1]) {
  const g = new THREE.Group(); g.position.set(sx * (GL.templeX + sx * 0.024), 0.06, -0.33); glasses.add(g);
  const pad = new THREE.Mesh(new RoundedBoxGeometry(0.03, 0.075, 0.2, 2, 0.012), M.dark); g.add(pad);
  for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.05, 0.014), M.glowTeal.clone()); s.position.set(sx * 0.016, 0, -0.075 + i * 0.03); g.add(s); }
  speakers.push(g);
}
shadowAll(glasses);
// poses: lying on the suspect desk, then on the robot's face
const gTmp = new THREE.Object3D();
const DESK_POSE = { p: V3(SUSPECT.x - 0.12, DESK_H + 0.08, SUSPECT.z - 0.05), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(-1.25, 0.35, 0, "YXZ")), s: 0.62 };
const _hp = new THREE.Vector3(), _hq = new THREE.Quaternion();
function headPose() { head.updateWorldMatrix(true, false); _hp.set(0, 0.03, 0.47); head.localToWorld(_hp); head.getWorldQuaternion(_hq); return { p: _hp, q: _hq, s: 1 }; }

// ---------------- the big exam paper (hook) ----------------
const paperTex = canvasTex(1024, 720, (g, w, h) => {
  g.fillStyle = "#f7f3e9"; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 12; i++) { g.strokeStyle = "rgba(60,90,140,0.18)"; g.lineWidth = 3; g.beginPath(); g.moveTo(40, 120 + i * 50); g.lineTo(w - 40, 120 + i * 50); g.stroke(); }
  g.fillStyle = "#3a4a66"; g.font = `700 52px ${FONT}`; g.fillText("EXAM  ·  SCORE", 60, 80);
  g.fillStyle = "#d8282a"; g.font = `700 220px ${FONT}`; g.textAlign = "center"; g.fillText("397.5", w / 2 - 40, 430);
  g.font = `700 120px ${FONT}`; g.fillText("/400", w / 2 + 300, 560);
  g.strokeStyle = "#d8282a"; g.lineWidth = 14; g.beginPath(); g.ellipse(w / 2, 400, 450, 210, -0.05, 0.2, Math.PI * 2 - 0.1); g.stroke();
});
const bigPaper = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.2), new THREE.MeshStandardMaterial({ map: paperTex, roughness: 0.8, side: THREE.DoubleSide }));
world.add(bigPaper); bigPaper.castShadow = true;

// ---------------- labels, tags, effects objects ----------------
let suspectTag = null, qTag = null, brainQ = null, recTag = null;
function makeTags() {
  const a = labelTex("SUSPECT", { fs: 110, fill: WHITE, bg: ORANGE, stroke: "rgba(0,0,0,0)" });
  suspectTag = new THREE.Mesh(new THREE.PlaneGeometry(0.22 * a.aspect, 0.22), new THREE.MeshBasicMaterial({ map: a.t, transparent: true, depthWrite: false, toneMapped: false })); world.add(suspectTag);
  const q = labelTex("?", { fs: 220, fill: ORANGE }); qTag = new THREE.Mesh(new THREE.PlaneGeometry(0.45 * q.aspect, 0.45), new THREE.MeshBasicMaterial({ map: q.t, transparent: true, depthWrite: false, toneMapped: false })); world.add(qTag);
  const b = labelTex("?", { fs: 220, fill: ORANGE }); brainQ = new THREE.Mesh(new THREE.PlaneGeometry(0.26 * b.aspect, 0.26), new THREE.MeshBasicMaterial({ map: b.t, transparent: true, depthWrite: false, toneMapped: false })); world.add(brainQ);
  const r = labelTex("● REC", { fs: 110, fill: WHITE, bg: "rgba(216,40,42,0.92)", stroke: "rgba(0,0,0,0)" });
  recTag = new THREE.Mesh(new THREE.PlaneGeometry(0.16 * r.aspect, 0.16), new THREE.MeshBasicMaterial({ map: r.t, transparent: true, depthWrite: false, toneMapped: false })); world.add(recTag);
}
// spotlight cone on the suspect desk
const coneMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.92, 0.75), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.95, 4.6, 32, 1, true), coneMat); cone.position.set(SUSPECT.x, DESK_H + 2.3, SUSPECT.z); world.add(cone);
// sound source: a floating speech bubble above the class
const bubble = new THREE.Group(); bubble.position.set(-0.75, 3.05, -0.55); world.add(bubble);
{ bubble.add(new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.38, 0.12, 4, 0.12), M.teal));
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 12), M.teal); tail.position.set(-0.14, -0.24, 0); tail.rotation.z = 0.5; bubble.add(tail);
  for (let i = 0; i < 3; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), M.white); d.position.set(-0.14 + i * 0.14, 0, 0.07); bubble.add(d); } }
// sound rings (pool)
const RINGS = [];
for (let i = 0; i < 14; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(1, 0.045, 6, 40), M.glowTeal.clone()); r.visible = false; world.add(r); RINGS.push(r); }
// speaker arcs (pool)
const ARCS = [];
for (let i = 0; i < 10; i++) { const a = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 6, 24, Math.PI * 0.8), M.glowTeal.clone()); a.visible = false; world.add(a); ARCS.push(a); }
// camera view frustum ("now it sees")
const frustMat = new THREE.MeshBasicMaterial({ color: col(TEAL), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
const frust = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 4, 1, true), frustMat); world.add(frust);
// the cloud
const CLOUD_Y = 2.45; const cloud = new THREE.Group(); cloud.position.set(1.05, CLOUD_Y, -1.75); world.add(cloud);
const cloudMat = new THREE.MeshPhysicalMaterial({ color: col("#eafffb"), roughness: 0.55, emissive: col(TEAL), emissiveIntensity: 0.12, clearcoat: 0.4 });
for (const [x, y, r] of [[0, 0, 0.32], [-0.33, -0.07, 0.24], [0.34, -0.06, 0.25], [0.15, 0.17, 0.24], [-0.16, 0.13, 0.22], [0, -0.1, 0.28]]) { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), cloudMat); s.position.set(x, y, 0); cloud.add(s); }
// data beams (glasses -> phone -> cloud)
const beamMat = new THREE.MeshBasicMaterial({ color: col(TEAL).multiplyScalar(2.2), transparent: true, depthWrite: false, toneMapped: false });
let beam1 = null, beam2 = null, beamCurve1 = null, beamCurve2 = null;
function drawOn(mesh, f) { const g = mesh.geometry, rs = g.parameters.radialSegments, ts = g.parameters.tubularSegments; g.setDrawRange(0, Math.floor(clamp01(f) * ts) * rs * 6); mesh.visible = f > 0.002; }
// confession items on the suspect desk
const tinyCam = new THREE.Group(); world.add(tinyCam);
{ tinyCam.add(new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.1, 0.1, 3, 0.025), M.dark));
  const l = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 16), M.steel); l.rotation.x = Math.PI / 2; l.position.z = 0.06; tinyCam.add(l);
  const r = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.006, 6, 20), M.glowOrange); r.position.z = 0.076; tinyCam.add(r); shadowAll(tinyCam); }
tinyCam.position.set(SUSPECT.x + 0.33, DESK_H + 0.1, SUSPECT.z - 0.1);
const phone2 = phone.clone(); world.add(phone2); phone2.position.set(SUSPECT.x - 0.34, DESK_H + 0.055, SUSPECT.z - 0.08); phone2.rotation.y = 0.2;
const aiChip = new THREE.Group(); world.add(aiChip); aiChip.position.set(SUSPECT.x + 0.02, DESK_H + 0.75, SUSPECT.z + 0.1);
// a copy of the glasses on the desk for the confession: suspected, but not named (the "?" hangs over it)
const ghost = glasses.clone(true); world.add(ghost); ghost.visible = false;
ghost.traverse((m) => { m.visible = true; m.scale && m.parent !== world && m !== ghost && m.scale.set(1, 1, 1); });
const GHOST_P = V3(SUSPECT.x - 0.0, DESK_H + 0.115, SUSPECT.z - 0.12);
let aiChipLabel = null;

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
const ADD = new PSys(2600, true, 1.6);
const _o = new THREE.Vector3();
function emit(t, o) {
  if (t < o.t0 || t > o.t1 + o.life) return;
  for (let k = 0; k < o.n; k++) {
    const b = o.t0 + ((k + hash(o.seed + k * 1.7) * 0.95) / o.n) * (o.t1 - o.t0), age = t - b;
    if (age < 0 || age > o.life) continue;
    const u = age / o.life, h1 = hash(o.seed + k * 3.1) - 0.5, h2 = hash(o.seed + k * 5.3) - 0.5, h3 = hash(o.seed + k * 7.9) - 0.5, h4 = hash(o.seed + k * 9.7);
    const org = typeof o.org === "function" ? o.org(b, k) : o.org;
    const d = o.drag ? (1 - Math.exp(-o.drag * age)) / o.drag : age;
    _o.set(org.x + (o.vel[0] + h1 * o.spr[0]) * d, org.y + (o.vel[1] + h2 * o.spr[1]) * d + 0.5 * (o.g || 0) * age * age, org.z + (o.vel[2] + h3 * o.spr[2]) * d);
    world.localToWorld(_o);
    const a = o.a * Math.pow(1 - u, o.pw || 1.5) * Math.min(1, age / 0.05);
    if (a <= 0.002) continue;
    const c = o.col(u, h4), sz = lerp(o.s0, o.s1, u) * (0.6 + 0.8 * h4);
    ADD.push(_o.x, _o.y, _o.z, sz, c[0] * a, c[1] * a, c[2] * a, 1);
  }
}
const cTeal = () => [0.25, 1.6, 1.45], cWhite = () => [1.7, 1.8, 1.9], cGold = (u) => [2.2, lerp(1.5, 0.8, u), 0.4];

// ---------------- shots ----------------
// world-space keys: [t, pos, target, fov, aperture]; R(...) converts robot-local coordinates to world space.
const _rq = new THREE.Quaternion().setFromAxisAngle(V3(0, 1, 0), ROBOT_RY);
const R = (x, y, z) => { const v = V3(x, y, z).applyQuaternion(_rq).add(ROBOT); return [v.x, v.y, v.z]; };
const SHOTS = [
  { t1: 3.8, hand: 0.02, keys: [[0, [7.7, 7.2, 11.0], [-0.1, 1.15, -0.1], 30, 0.0008], [3.8, [7.0, 6.6, 10.0], [-0.1, 1.1, -0.1], 30, 0.0008]] },
  { t1: 6.9, hand: 0.02, keys: [[3.8, [5.6, 4.6, 8.6], [-0.3, 1.35, -0.7], 31, 0.0012], [6.9, [5.0, 4.1, 7.8], [-0.35, 1.4, -0.9], 31, 0.0012]] },
  { t1: 8.42, hand: 0.02, keys: [[6.9, [0.6, 3.1, 5.8], [-1.75, 0.7, 1.45], 30, 0.0005], [8.42, [-0.2, 2.6, 5.0], [-1.75, 0.7, 1.45], 30, 0.0005]] },
  { t1: 12.9, hand: 0.012, keys: [[8.42, [3.4, 3.4, 5.8], [-0.8, 1.35, -0.1], 34, 0.0012], [9.25, R(0.85, 1.95, 3.5), R(0, 1.5, 0.3), 34, 0.002], [12.9, R(0.6, 1.86, 3.0), R(0, 1.47, 0.3), 34, 0.0025]] },
  { t1: 15.95, hand: 0.01, keys: [[12.9, R(-0.25, 1.76, 2.6), R(-0.28, 1.52, 0.4), 32, 0.004], [15.95, R(-0.45, 1.7, 2.0), R(-0.38, 1.54, 0.45), 32, 0.006]] },
  { t1: 17.25, hand: 0.008, keys: [[15.95, R(-0.45, 1.69, 0.62), [-1.6, 0.36, 0.3], 44, 0.0005], [17.25, R(-0.45, 1.66, 0.85), [-1.6, 0.38, 0.3], 38, 0.0005]] },
  { t1: 20.55, hand: 0.01, keys: [[17.25, R(2.7, 1.95, 2.0), R(0.2, 1.52, 0.1), 32, 0.002], [20.55, R(2.45, 1.88, 1.65), R(0.25, 1.5, 0.05), 32, 0.0025]] },
  { t1: 24.5, hand: 0.012, keys: [[20.55, R(0.3, 1.95, 3.6), R(0.15, 1.42, 0.2), 34, 0.002], [21.9, R(0.75, 2.05, 5.4), R(0.55, 1.62, -0.1), 40, 0.0012], [24.5, R(0.8, 2.15, 5.9), R(0.6, 1.68, -0.2), 40, 0.001]] },
  { t1: 27.42, hand: 0.008, keys: [[24.5, R(0.8, 1.8, 2.6), R(0.35, 1.53, 0.45), 32, 0.004], [27.42, R(0.75, 1.76, 2.15), R(0.38, 1.54, 0.45), 32, 0.005]] },
  { t1: 31.85, hand: 0.01, keys: [[27.42, R(0, 2.0, 5.0), R(0, 1.68, 0), 32, 0.0015], [31.85, R(0, 1.95, 4.2), R(0, 1.66, 0), 32, 0.002]] },
  { t1: 36.65, hand: 0.015, keys: [[31.85, [0.4, 2.85, 4.7], [-1.72, 0.6, 1.4], 31, 0.0015], [36.65, [0.1, 2.65, 4.35], [-1.74, 0.62, 1.42], 31, 0.0015]] },
  { t1: 41.15, hand: 0.012, keys: [[36.65, R(0.9, 2.3, 6.6), R(0, 1.72, 0), 32, 0.001], [41.15, R(-0.7, 2.3, 6.4), R(0, 1.72, 0), 32, 0.001]] },
  { t1: 99, hand: 0.012, keys: [[41.15, [7.1, 6.0, 9.6], [0, 1.85, -0.4], 30, 0.0008], [46.4, [6.4, 5.6, 8.8], [0, 1.8, -0.4], 30, 0.0008]] },
];
const WHIPS = [3.8, 6.9, 8.42, 12.9, 15.95, 17.25, 20.55, 24.5, 27.42, 31.85, 36.65, 41.15].map((t, i) => ({ t, amt: i % 2 ? -0.6 : 0.6 }));
const IMPACTS = [[T.score, 0.04], [T.of400, 0.03], [T.blame, 0.03], [9.12, 0.02], [T.camera, 0.02], [T.face, 0.025]];
function shotAt(t) { for (let i = 0; i < SHOTS.length; i++) if (t < SHOTS[i].t1) return i; return SHOTS.length - 1; }
const _cp = new THREE.Vector3(), _ct = new THREE.Vector3();
function cameraFor(t) {
  const S = SHOTS[shotAt(t)], K = S.keys;
  let a = K[0], b = K[K.length - 1], u = 0;
  if (t <= K[0][0]) b = a; else if (t >= b[0]) a = b; else for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) { a = K[i]; b = K[i + 1]; u = eInOut((t - a[0]) / (b[0] - a[0])); break; }
  _cp.set(lerp(a[1][0], b[1][0], u), lerp(a[1][1], b[1][1], u), lerp(a[1][2], b[1][2], u));
  _ct.set(lerp(a[2][0], b[2][0], u), lerp(a[2][1], b[2][1], u), lerp(a[2][2], b[2][2], u));
  let shake = 0; for (const [ti, amp] of IMPACTS) if (t >= ti) shake += amp * Math.exp(-(t - ti) * 9) * Math.sin((t - ti) * 70);
  _cp.x += (Math.sin(t * 1.3) * 0.6 + Math.sin(t * 2.9 + 1) * 0.4) * S.hand + shake;
  _cp.y += (Math.sin(t * 1.7 + 2) * 0.6 + Math.sin(t * 3.7) * 0.4) * S.hand + shake * 0.7;
  return { fov: lerp(a[3], b[3], u), ap: lerp(a[4] || 0, b[4] || 0, u) };
}

// ---------------- post ----------------
const rt0 = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 0 });
rt0.depthTexture = new THREE.DepthTexture(W, H); rt0.depthTexture.type = THREE.UnsignedIntType;
const composer = new EffectComposer(renderer, rt0);
composer.setPixelRatio(1); composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
class DofPass extends ShaderPass { render(r, w, rd, dt, m) { this.uniforms.tDepth.value = rd.depthTexture; super.render(r, w, rd, dt, m); } }
const bokeh = new DofPass({
  uniforms: { tDiffuse: { value: null }, tDepth: { value: null }, uNear: { value: 0.03 }, uFar: { value: 160 }, focus: { value: 5 }, aperture: { value: 0.004 }, uRes: { value: new THREE.Vector2(W, H) } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse, tDepth; uniform float uNear, uFar, focus, aperture; uniform vec2 uRes; varying vec2 vUv;
    float vz(vec2 uv){ float z = texture2D(tDepth, uv).x * 2.0 - 1.0; return 2.0 * uNear * uFar / (uFar + uNear - z * (uFar - uNear)); }
    float coc(vec2 uv){ return clamp(abs(vz(uv) - focus) * aperture * 1080.0, 0.0, 12.0); }
    void main(){
      float c0 = coc(vUv); vec4 acc = texture2D(tDiffuse, vUv); float ws = 1.0;
      if (c0 > 0.6) { for (int i = 0; i < 12; i++) { float fi = float(i) + 0.5; float a = fi * 2.39996; float r = sqrt(fi / 12.0) * c0;
          vec2 uv = vUv + vec2(cos(a), sin(a)) * r / uRes; float cs = coc(uv); float w = clamp(cs / (c0 * 0.5), 0.0, 1.0); acc += texture2D(tDiffuse, uv) * w; ws += w; } }
      gl_FragColor = acc / ws; }`,
});
bokeh.uniforms = bokeh.material.uniforms;
composer.addPass(bokeh);
// sanitize: Inf/NaN pixels in the half-float buffer would spread through the bloom mip chain as black frames
composer.addPass(new ShaderPass({
  uniforms: { tDiffuse: { value: null } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv;
    void main(){ vec4 c = texture2D(tDiffuse, vUv);
      if (!(c.r == c.r) || !(c.g == c.g) || !(c.b == c.b) || c.r > 6e4 || c.g > 6e4 || c.b > 6e4) c = vec4(0.0, 0.0, 0.0, 1.0);
      gl_FragColor = vec4(clamp(c.rgb, 0.0, 24.0), 1.0); }`,
}));
const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.55, 0.42, 1.25); composer.addPass(bloom);
const grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uFrame: { value: 0 }, uBlur: { value: 0 }, uFlash: { value: 0 }, uPov: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uFrame, uBlur, uFlash, uPov; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){
      vec4 c = vec4(0.0);
      if (abs(uBlur) > 0.001) { for (int i = 0; i < 16; i++) { float o = (float(i) / 15.0 - 0.5) * uBlur; c += texture2D(tDiffuse, vUv + vec2(0.0, o)); } c /= 16.0; }
      else c = texture2D(tDiffuse, vUv);
      vec2 q = vUv - 0.5; q.y *= 1.3;
      c.rgb *= mix(0.62, 1.0, smoothstep(0.95, 0.28, length(q)));
      c.rgb = mix(c.rgb, vec3(dot(c.rgb, vec3(0.3,0.59,0.11))) * vec3(0.75, 1.15, 1.1), uPov * 0.35); c.rgb *= 1.0 - uPov * 0.62;
      c.rgb += (h(vUv * vec2(1080.0, 1920.0) + uFrame * 7.13) - 0.5) * 0.024;
      c.rgb += uFlash * vec3(0.07, 0.2, 0.2);
      gl_FragColor = c; }`,
});
composer.addPass(grade);
composer.addPass(new OutputPass());
const fxaa = new FXAAPass(); fxaa.setSize(W, H); composer.addPass(fxaa);

// ---------------- per frame ----------------
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _q2 = new THREE.Quaternion();
function face2cam(m) { m.quaternion.copy(camera.quaternion); }
function partPop(obj, t, a, s = 1) { const k = pop(t, a, 0.4); obj.visible = k > 0.001; obj.scale.setScalar(Math.max(0.0001, k * s)); }

function renderAt(tIn) {
  const t = tIn >= LOOP ? 0 : tIn;
  const { fov, ap } = cameraFor(t);
  camera.fov = fov; camera.position.copy(_cp); camera.lookAt(_ct); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  bokeh.uniforms.focus.value = camera.position.distanceTo(_ct); bokeh.uniforms.aperture.value = ap;
  world.position.y = Math.sin(t * 0.9) * 0.03; world.rotation.y = Math.sin(t * 0.25) * 0.01; world.updateMatrixWorld(true);
  ADD.begin();

  board.visible = t < 8.42 || t >= 41.15;
  for (const c of suspectClutter) c.visible = !(t > 32.3 && t < 36.7);
  // robot idle + gestures
  robot.position.y = ROBOT.y + Math.sin(t * 2.1) * 0.012;
  head.rotation.z = Math.sin(t * 1.1) * 0.03 + bump(t, T.hear, 1.4) * 0.12 - bump(t, T.isnt, 1.2) * 0.1;
  head.rotation.x = -bump(t, T.sees, 1.0) * 0.08 + bump(t, T.blame, 1.2) * 0.05;
  head.rotation.y = -0.18 * bump(t, T.then, 2.4) + 0.25 * bump(t, T.phone - 0.2, 1.8) - 0.15 * bump(t, 32.38, 2.6);
  // left arm (screen right) points at the paper in the hook, right arm waves on the subscribe line
  const wave = seg(t, T.sub + 0.2, T.sub + 0.6) * (1 - seg(t, 40.6, 41.0));
  arms[1].rotation.z = 0.12 + wave * (2.4 + Math.sin((t - T.sub) * 9) * 0.35);
  arms[0].rotation.z = -0.12 - bump(t, T.ai, 2.0) * 1.3 - bump(t, T.phone, 1.6) * 0.9;
  arms[0].rotation.x = -bump(t, T.ai, 2.0) * 0.6 - bump(t, T.phone, 1.6) * 0.3;
  faceMat.map = faceTex(faceAt(t)); faceMat.needsUpdate = false;
  // brain dome glows on AI moments
  const brainGlow = 0.6 + 0.4 * Math.sin(t * 3) * 0.3 + bump(t, T.ai, 0.9) * 1.2 + bump(t, T.pAI, 0.9) * 1.6 + seg(t, T.thinking - 0.1, T.thinking + 0.2) * (1 - seg(t, 25.0, 25.6)) * 1.0 + bump(t, T.cAI, 0.8) * 1.2;
  brainMat.color.copy(col(TEAL)).multiplyScalar(1.1 + brainGlow);
  brain.rotation.y = t * 0.6;

  // big exam paper (frame 0: settled; punch on the numbers; leaves before the build)
  { const inK = t < 0.01 ? 1 : 1, out = eOut(seg(t, 8.05, 8.45));
    const k = (1 + bump(t, T.score, 0.3) * 0.12 + bump(t, T.of400, 0.28) * 0.08) * (1 - out * 0.9);
    const side = sm(seg(t, 3.6, 4.1)); bigPaper.position.set(-0.55 - side * 0.35 + out * -2.5, 2.75 + side * 0.5 + Math.sin(t * 1.4) * 0.04 + out * 1.4, 0.55 - side * 0.9);
    bigPaper.visible = out < 0.99; bigPaper.scale.setScalar(k * inK * (1 - side * 0.3));
    face2cam(bigPaper); bigPaper.rotateZ(0.06 + Math.sin(t * 1.1) * 0.02); }
  warm.position.set(-0.6, 3.1, 0.2); warm.intensity = 1.4 * (1 - seg(t, 7.6, 8.4)) * (0.8 + 0.4 * bump(t, T.score, 0.6)) * (1 - 0.85 * sm(seg(t, 3.6, 4.1)));
  emit(t, { t0: T.score, t1: T.score + 0.12, n: 60, life: 0.9, org: V3(-0.55, 2.75, 0.55), vel: [0, 0, 0], spr: [3.2, 2.6, 2.0], drag: 3, s0: 0.05, s1: 0.0, col: cGold, a: 0.9, seed: 3 });
  emit(t, { t0: T.of400, t1: T.of400 + 0.1, n: 40, life: 0.8, org: V3(-0.2, 2.6, 0.55), vel: [0, 0, 0], spr: [2.6, 2.2, 1.6], drag: 3, s0: 0.045, s1: 0.0, col: cGold, a: 0.8, seed: 5 });

  // glasses: on the suspect desk until "Plain", fly onto the robot's face on an arc
  { const u = eInOut(seg(t, T.plain, T.plain + 0.62)), hp = headPose();
    gTmp.position.lerpVectors(DESK_POSE.p, hp.p, u); gTmp.position.y += Math.sin(Math.PI * u) * 1.1;
    _q2.slerpQuaternions(DESK_POSE.q, hp.q, u); gTmp.quaternion.copy(_q2);
    if (u > 0 && u < 1) gTmp.rotateY(Math.sin(Math.PI * u) * 1.2);
    glasses.position.copy(gTmp.position); glasses.quaternion.copy(gTmp.quaternion);
    glasses.scale.setScalar(lerp(DESK_POSE.s, hp.s, u) * (1 + bump(t, T.plain + 0.6, 0.25) * 0.08));
    glasses.position.y += bump(t, T.blame, 0.5) * 0.06 * (1 - u); }
  // lenses: dark while "blind", teal tint once the camera is in
  { const blind = seg(t, T.next, T.next + 0.2) * (1 - seg(t, T.camera, T.camera + 0.3));
    lensMat.color.copy(col("#9ff3e8")).lerp(col("#05070b"), blind); lensMat.opacity = lerp(0.18, 0.86, blind) + bump(t, T.sees, 0.6) * 0.25; }
  // spotlight on the suspect desk
  { const s = seg(t, T.blame - 0.05, T.blame + 0.15) * (1 - seg(t, 8.3, 8.7)) + seg(t, 32.4, 32.8) * (1 - seg(t, 36.4, 36.8)) * 0.3;
    coneMat.opacity = 0.03 * s * (t > 30 ? 0.3 : 1); cone.visible = s > 0.01; spot.intensity = 2.2 * s; spot.target.position.copy(SUSPECT).setY(DESK_H); }
  if (suspectTag) {
    const s = pop(t, T.blame + 0.1, 0.35) * (1 - seg(t, T.plain - 0.1, T.plain + 0.1));
    suspectTag.visible = s > 0.01; suspectTag.scale.setScalar(Math.max(0.001, s)); suspectTag.position.set(SUSPECT.x, DESK_H + 0.72 + Math.sin(t * 3) * 0.03, SUSPECT.z); face2cam(suspectTag);
    // "?" over the glasses in the confession: the confession did not name glasses
    const q = pop(t, 32.6, 0.35) * (1 - seg(t, 36.4, 36.7)); const hp = headPose();
    qTag.visible = q > 0.01; qTag.scale.setScalar(Math.max(0.001, q * 0.42)); _c.copy(GHOST_P).add(V3(0.0, 0.2 + Math.sin(t * 3) * 0.015, 0.06)); world.localToWorld(_c); qTag.position.copy(_c); face2cam(qTag);
    const bq = pop(t, T.isnt, 0.3) * (1 - seg(t, T.phone, T.phone + 0.15));
    brainQ.visible = bq > 0.01; brainQ.scale.setScalar(Math.max(0.001, bq)); brainQ.position.copy(hp.p).add(V3(0, 0.33 + Math.sin(t * 4) * 0.02, 0.05)); face2cam(brainQ);
  }

  // part 1: microphones + sound rings from the speech bubble
  mics.forEach((m, i) => { partPop(m, t, T.mics + i * 0.07, 1.1); m.userData.dot.material.color.copy(col(TEAL)).multiplyScalar(0.9 + 1.6 * bump(t, T.pMic + i * 0.04, 0.5) + 1.0 * bump(t, T.mics + 0.4 + i * 0.07, 0.5)); });
  { const bs = pop(t, 8.95, 0.35) * (1 - seg(t, 12.75, 13.0)); bubble.visible = bs > 0.01; bubble.scale.setScalar(Math.max(0.001, bs)); bubble.position.y = 3.05 + Math.sin(t * 2.5) * 0.04; bubble.lookAt(camera.position); }
  { const hp = headPose(); _b.copy(hp.p).add(V3(0, 0.14, 0)); _a.copy(bubble.position); world.localToWorld(_a);
    RINGS.forEach((r, i) => {
      const b = 9.05 + i * 0.27, age = t - b, life = 0.85;
      if (age < 0 || age > life || t > 12.75) { r.visible = false; return; }
      const u = age / life, caught = b + life * 0.8 > T.mics;
      if (caught) { _c.lerpVectors(_a, _b, eOut(u)); } else { _c.lerpVectors(_a, _b, u * 1.35).add(V3(0.6 * u * u, -0.25 * u * u, 0.4 * u * u)); }
      r.visible = true; r.position.copy(_c); r.lookAt(camera.position);
      const s = caught ? lerp(0.12, 0.02, u) : lerp(0.08, 0.17, u); r.scale.set(s, s, s * 0.5);
      r.material.opacity = (caught ? 0.9 : 0.55) * Math.sin(Math.PI * u); r.material.color.copy(col(TEAL)).multiplyScalar(caught ? 1.8 : 1.2);
    }); }

  // part 2: camera in the corner; "now it sees": a view cone sweeps the class
  partPop(camPart, t, T.camera, 1);
  { const k = seg(t, T.sees - 0.15, T.sees + 0.1) * (1 - seg(t, 17.0, 17.3)); frust.visible = k > 0.01; frustMat.opacity = 0.11 * k;
    camPart.updateWorldMatrix(true, false); _a.set(0, 0, 0); camPart.localToWorld(_a); const L = 3.6;
    _b.set(0, -0.62, L).applyQuaternion(_rq); _b.add(_a);
    frust.position.lerpVectors(_a, _b, 0.5); frust.lookAt(_a); frust.rotateX(-Math.PI / 2); frust.rotateY(Math.PI / 4); frust.scale.set(1.25, L, 1.0); }
  grade.uniforms.uPov.value = seg(t, 15.95, 16.05) * (1 - seg(t, 17.2, 17.3));

  // part 3: speakers in the arms, sound arcs toward the ear cups
  speakers.forEach((s, i) => { partPop(s, t, T.arms + i * 0.08, 1); s.children.forEach((b, j) => b.material.color.copy(col(TEAL)).multiplyScalar(1.4 + 2.2 * bump(t, 18.3 + ((j + i) % 4) * 0.12 + Math.floor((t - 18.3) / 0.5) * 0.5, 0.25))); });
  ARCS.forEach((a, i) => {
    const side = i % 2 ? 1 : -1, b = T.arms + 0.25 + Math.floor(i / 2) * 0.42, age = t - b, life = 0.7;
    if (age < 0 || age > life || t > 20.5) { a.visible = false; return; }
    const sp = speakers[side > 0 ? 1 : 0]; sp.updateWorldMatrix(true, false); _a.set(0, 0, 0.0); sp.localToWorld(_a);
    head.updateWorldMatrix(true, false); _b.set(side * 0.62, 0, 0); head.localToWorld(_b);
    const u = age / life; a.visible = true; a.position.lerpVectors(_a, _b, u * 0.8); a.lookAt(_b); a.rotateZ(Math.PI * 0.1);
    a.scale.setScalar(lerp(0.07, 0.2, u)); a.material.opacity = Math.sin(Math.PI * u); a.material.color.copy(col(TEAL)).multiplyScalar(2.2);
  });

  // part 4: phone + cloud (the thinking happens off the frame)
  { const ph = pop(t, T.phone - 0.05, 0.35), up = sm(seg(t, T.phone - 0.1, T.phone + 0.45)) * (1 - sm(seg(t, 24.35, 24.6)));
    phone.position.lerpVectors(PHONE_REST, PHONE_UP, up); phone.position.y += Math.sin(Math.PI * up) * 0.15 + up * Math.sin(t * 2.2) * 0.03;
    phone.rotation.set(up * 1.25, -0.3 + up * 0.1, 0);
    phone.scale.setScalar(Math.max(0.001, 0.4 + 0.6 * ph) * (1 + up * 0.35) * (1 + bump(t, T.phone, 0.3) * 0.25));
    phoneScr.material.color.copy(col(TEAL)).multiplyScalar(0.4 + 1.6 * ph + 1.5 * bump(t, T.thinking + 0.4, 0.5));
    const cs = pop(t, T.cloud - 0.05, 0.45) * (1 - seg(t, 24.4, 24.6)); cloud.visible = cs > 0.01; cloud.scale.setScalar(Math.max(0.001, cs) * (1 + bump(t, T.thinking, 0.5) * 0.12 + bump(t, T.pAI, 0.6) * 0.1));
    cloud.position.y = CLOUD_Y + Math.sin(t * 1.3) * 0.05;
    cloudMat.emissiveIntensity = 0.12 + bump(t, T.thinking, 0.9) * 0.9;
    if (!beam1) {
      const g0 = V3(...R(0.5, HEAD_Y + 0.09, 0.45)), p0 = PHONE_UP.clone().add(V3(-0.08, 0.05, 0.05)), c0 = V3(1.05, CLOUD_Y - 0.28, -1.75);
      beamCurve1 = new THREE.CatmullRomCurve3([g0, g0.clone().lerp(p0, 0.5).add(V3(0.25, 0.25, 0.1)), p0]);
      beamCurve2 = new THREE.CatmullRomCurve3([p0, p0.clone().lerp(c0, 0.5).add(V3(0.2, 0.05, 0.15)), c0]);
      beam1 = new THREE.Mesh(new THREE.TubeGeometry(beamCurve1, 80, 0.016, 8, false), beamMat); beam2 = new THREE.Mesh(new THREE.TubeGeometry(beamCurve2, 80, 0.016, 8, false), beamMat); world.add(beam1, beam2);
    }
    const fade = 1 - seg(t, 24.3, 24.5);
    drawOn(beam1, seg(t, T.phone, T.phone + 0.5) * clamp01(fade)); drawOn(beam2, seg(t, T.cloud, T.cloud + 0.55) * clamp01(fade));
    // data beads up, answer beads down
    for (let i = 0; i < 6; i++) {
      const u1 = ((t - T.phone - 0.3) * 0.9 + i / 6) % 1, on1 = t > T.phone + 0.3 && fade > 0.5;
      if (on1 && u1 > 0) { beamCurve1.getPoint(u1, _o); world.localToWorld(_o); ADD.push(_o.x, _o.y, _o.z, 0.06, 0.4, 2.2, 2.0, 1); }
      const u2 = ((t - T.cloud - 0.4) * 0.8 + i / 6) % 1, on2 = t > T.cloud + 0.4 && fade > 0.5;
      if (on2 && u2 > 0) { beamCurve2.getPoint(t > T.thinking ? 1 - u2 : u2, _o); world.localToWorld(_o); ADD.push(_o.x, _o.y, _o.z, 0.07, t > T.thinking ? 2.4 : 0.4, t > T.thinking ? 1.6 : 2.2, t > T.thinking ? 0.6 : 2.0, 1); }
    }
    emit(t, { t0: T.cloud + 0.3, t1: T.thinking + 0.3, n: 70, life: 1.3, org: () => cloud.position.clone().add(V3(0, -0.1, 0)), vel: [0, 0.35, 0], spr: [0.9, 0.3, 0.6], drag: 1.2, s0: 0.05, s1: 0.02, col: cWhite, a: 0.7, seed: 11 });
  }

  // part 5: the recording light
  partPop(ledPart, t, T.light, 1);
  { const on = seg(t, T.shines, T.shines + 0.08) * (1 - seg(t, 31.6, 31.9)) + seg(t, T.pCamera, T.pCamera + 0.1) * (1 - seg(t, 31.6, 31.9)) * 0;
    const pulse = 1 + bump(t, T.shines, 0.4) * 0.8 + bump(t, T.records, 0.4) * 0.5;
    ledMat.color.setRGB(0.3 + on * 1.5 * pulse, 0.32 + on * 1.5 * pulse, 0.34 + on * 1.45 * pulse);
    ledHalo.visible = on > 0.01; ledHalo.material.opacity = on; ledHalo.scale.setScalar(0.09 * pulse);
    ledPart.updateWorldMatrix(true, false); _a.set(0, 0, 0.04); ledPart.localToWorld(_a); ledLight.position.copy(_a); ledLight.intensity = on * 0.35 * pulse;
    const rk = pop(t, T.records, 0.3) * (1 - seg(t, 27.3, 27.5)); recTag.visible = rk > 0.01; recTag.scale.setScalar(Math.max(0.001, rk)); recTag.position.copy(_a).add(V3(0.05, 0.16, 0.02)); face2cam(recTag); }

  // payoff flashes: camera, microphone, AI
  camPart.children[1].material.color.copy(col(TEAL)).multiplyScalar(2.2 + 3 * bump(t, T.pCamera, 0.5) + 2 * bump(t, T.tinyCam, 0.5));
  emit(t, { t0: T.face, t1: T.face + 0.12, n: 70, life: 1.0, org: () => { const hp = headPose(); return world.worldToLocal(hp.p.clone()); }, vel: [0, 0.2, 0], spr: [2.6, 2.4, 1.6], drag: 2.6, s0: 0.04, s1: 0.0, col: cTeal, a: 0.8, seed: 21 });

  // confession items on the suspect desk
  { const k = pop(t, 32.45, 0.4) * (1 - seg(t, 36.5, 36.8)); ghost.visible = k > 0.01;
    ghost.position.copy(GHOST_P); ghost.position.y += Math.sin(t * 2) * 0.01; ghost.rotation.set(-0.15, 0.12, 0); ghost.scale.setScalar(Math.max(0.001, k * 0.5)); }
  partPop(tinyCam, t, T.tinyCam, 1.9); tinyCam.rotation.y = 0.6 + Math.sin(t * 1.5) * 0.1; tinyCam.visible = tinyCam.visible && t < 36.8;
  partPop(phone2, t, T.cPhone, 1.4); phone2.visible = phone2.visible && t < 36.8;
  { const k = pop(t, T.cAI, 0.35) * (1 - seg(t, 36.5, 36.8)); aiChip.visible = k > 0.01; aiChip.scale.setScalar(Math.max(0.001, k * 0.6)); aiChip.position.y = DESK_H + 0.36 + Math.sin(t * 3) * 0.02; aiChip.position.x = SUSPECT.x + 0.36; aiChip.position.z = SUSPECT.z - 0.1; face2cam(aiChip); }
  emit(t, { t0: T.tinyCam, t1: T.tinyCam + 0.08, n: 30, life: 0.6, org: tinyCam.position, vel: [0, 0.4, 0], spr: [1.5, 1.2, 1.5], drag: 3, s0: 0.04, s1: 0, col: cGold, a: 0.8, seed: 31 });
  emit(t, { t0: T.cPhone, t1: T.cPhone + 0.08, n: 30, life: 0.6, org: phone2.position, vel: [0, 0.4, 0], spr: [1.5, 1.2, 1.5], drag: 3, s0: 0.04, s1: 0, col: cGold, a: 0.8, seed: 33 });

  // ambient motes
  for (let i = 0; i < 70; i++) { _o.set((hash(i * 1.1) - 0.5) * 9, -1 + hash(i * 2.2) * 6 + Math.sin(t * 0.3 + i) * 0.2, (hash(i * 3.3) - 0.5) * 9); const a = 0.25 * (0.5 + 0.5 * Math.sin(t * 0.7 + i * 2)); ADD.push(_o.x, _o.y, _o.z, 0.03, 0.5 * a, 0.9 * a, 1.0 * a, 1); }
  ADD.end();

  // whips and flashes
  let blur = 0; for (const w of WHIPS) blur += w.amt * bump(t, w.t - 0.12, 0.26) * 0.06;
  grade.uniforms.uBlur.value = blur;
  grade.uniforms.uFlash.value = bump(t, T.score, 0.35) * 0.1 + bump(t, T.mics, 0.35) * 0.05 + bump(t, T.camera, 0.35) * 0.05 + bump(t, T.sees, 0.3) * 0.08 + bump(t, T.face, 0.45) * 0.12;
  grade.uniforms.uFrame.value = Math.round(tIn * 30);
  bloom.strength = 0.55 - grade.uniforms.uPov.value * 0.3;
  composer.render();
}

// ---------------- boot ----------------
(async function boot() {
  try { const ff = new FontFace(FONT, "url(assets/fonts/Outfit-Bold.ttf)"); await ff.load(); document.fonts.add(ff); }
  catch (e) { console.error("font failed", e); FONT = "sans-serif"; }
  // redraw canvas textures that use the font
  for (const tex of [paperTex, board.userData.tex]) { tex.dispose(); }
  {
    const p = canvasTex(1024, 720, (g, w, h) => {
      g.fillStyle = "#f7f3e9"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 12; i++) { g.strokeStyle = "rgba(60,90,140,0.18)"; g.lineWidth = 3; g.beginPath(); g.moveTo(40, 120 + i * 50); g.lineTo(w - 40, 120 + i * 50); g.stroke(); }
      g.fillStyle = "#3a4a66"; g.font = `700 52px ${FONT}`; g.fillText("EXAM  ·  SCORE", 60, 80);
      g.fillStyle = "#d8282a"; g.font = `700 230px ${FONT}`; g.textAlign = "center"; g.fillText("397.5", w / 2 - 40, 430);
      g.font = `700 120px ${FONT}`; g.fillText("/400", w / 2 + 300, 580);
      g.strokeStyle = "#d8282a"; g.lineWidth = 14; g.beginPath(); g.ellipse(w / 2 - 30, 360, 440, 200, -0.05, 0.2, Math.PI * 2 - 0.1); g.stroke();
    });
    bigPaper.material.map = p; bigPaper.material.needsUpdate = true;
    const b = canvasTex(512, 300, (g, w, h) => { g.fillStyle = "#0b1b33"; g.fillRect(0, 0, w, h); g.strokeStyle = "#19C3B1"; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16);
      g.textAlign = "center"; g.fillStyle = "#19C3B1"; g.font = `700 84px ${FONT}`; g.fillText("EXAM", w / 2, 130); g.fillStyle = "#F4F1EA"; g.font = `700 50px ${FONT}`; g.fillText("NO PHONES", w / 2, 220); });
    board.children[0].material.map = b; board.children[0].material.needsUpdate = true;
  }
  for (const k of Object.keys(faceCache)) delete faceCache[k];
  makeTags();
  { const a = labelTex("AI", { fs: 130, fill: NAVY, bg: TEAL, stroke: "rgba(0,0,0,0)" });
    aiChipLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.3 * a.aspect, 0.3), new THREE.MeshBasicMaterial({ map: a.t, transparent: true, depthWrite: false, toneMapped: false })); aiChip.add(aiChipLabel); }
  window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
  window.__cineRender = renderAt;
  window.__cine = { composer, renderer, scene, camera };
  renderAt(0);
  window.__worldReady && window.__worldReady();
})();
