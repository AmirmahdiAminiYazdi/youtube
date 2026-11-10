// special-bicycle-brakes v2: cinematic shot-based 3D (1080x1920). Replaces the generic world.js build for this Short.
// Every frame is a pure function of timeline time t (hf-seek). No clocks, no Math.random: all variation comes from hash().
// Shot list and timings: channel/scripts/special-bicycle-brakes.motion.md (times are the voiceover word times).
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { FXAAPass } from "three/addons/postprocessing/FXAAPass.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { TTFLoader } from "three/addons/loaders/TTFLoader.js";
import { Font } from "three/addons/loaders/FontLoader.js";
import { LOOP } from "./beats.js";

const W = 1080, H = 1920;
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
const expoOut = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const bump = (t, a, len) => { const u = (t - a) / len; return u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u); };
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
// piecewise keyframes [[t, v], ...] with smoothstep between keys
function keys(K, t) {
  if (t <= K[0][0]) return K[0][1];
  for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) return lerp(K[i][1], K[i + 1][1], sm((t - K[i][0]) / (K[i + 1][0] - K[i][0])));
  return K[K.length - 1][1];
}
const V3 = (x, y, z = 0) => new THREE.Vector3(x, y, z);
const col = (hex) => new THREE.Color(hex);

// ---------------- story state (all from the voiceover word times) ----------------
const OMEGA = 11.0; // visual wheel speed at "32 km/h" (rad/s), slow enough to read at 30 fps
const SPEED = [[0, 1], [17.35, 1], [19.0, 0.18], [19.75, 0.18], [21.2, 1], [25.95, 1], [26.9, 0], [27.55, 0], [28.6, 1], [29.1, 1], [30.6, 0.72],
  [32.1, 0.9], [34.4, 0.9], [35.4, 0], [36.15, 0], [36.95, 1], [37.15, 1], [38.25, 0.68], [39.2, 0.78], [43.05, 0.8], [43.9, 0], [44.75, 0],
  [45.6, 1], [46.15, 0.55], [46.4, 0.55], [47.9, 0.92], [49.2, 0.92], [50.25, 0.32], [51.3, 0.32], [56.2, 0], [61, 0]];
const RIM = [[0, 0], [17.02, 0], [17.4, 1], [19.7, 1], [20.05, 0], [25.95, 0], [26.2, 1], [27.5, 1], [27.8, 0], [28.96, 0], [29.25, 1], [30.55, 1], [30.85, 0]];
const DISC = [[0, 0], [34.2, 0], [34.45, 1], [35.9, 1], [36.15, 0], [37.05, 0], [37.6, 0.35], [38.3, 0.35], [38.6, 0], [42.95, 0], [43.15, 1], [44.6, 1],
  [44.9, 0], [45.45, 0], [45.7, 0.85], [48.15, 0.85], [48.3, 0], [49.1, 0], [49.3, 1], [51.0, 1], [51.3, 0.4], [53.0, 0.4], [56.0, 0]];
const LEVER = [[0, 0], [25.8, 0], [26.15, 1], [27.5, 1], [27.8, 0], [28.9, 0], [29.2, 1], [30.55, 1], [30.85, 0], [34.1, 0], [34.4, 1], [35.9, 1], [36.15, 0],
  [37.0, 0], [37.45, 1], [38.3, 1], [38.6, 0], [42.3, 0], [42.95, 1], [44.6, 1], [44.9, 0], [45.4, 0], [45.7, 0.85], [48.15, 0.85], [48.3, 0], [49.05, 0],
  [49.3, 1], [51.0, 1], [51.3, 0.4], [53.0, 0.4], [56.0, 0]];
const HEAT_S = [[0, 0], [45.5, 0], [47.1, 1], [48.7, 1]];
const HEAT_B = [[0, 0], [49.3, 0], [49.75, 0.6], [49.9, 0.6], [50.8, 0.07], [53.5, 0.07], [54.1, 0.6], [54.9, 0.6], [56.4, 0]];
const RIMHEAT = [[0, 0], [17.4, 0], [18.6, 0.35], [19.8, 0.3], [21.0, 0], [26.2, 0], [27.2, 0.3], [28.2, 0]];
const RAIN = [[0, 0], [27.45, 0], [27.75, 1], [33.6, 1], [34.6, 0]];
const WET = [[0, 0], [27.6, 0], [28.6, 1], [34.5, 1], [36.5, 0]];

// wheel angle = integral of speed (pre-tabulated so any frame can be rendered alone)
const ANG_DT = 1 / 240, ANG = new Float32Array(Math.ceil(62 / ANG_DT) + 2);
for (let i = 1; i < ANG.length; i++) ANG[i] = ANG[i - 1] + OMEGA * keys(SPEED, (i - 0.5) * ANG_DT) * ANG_DT;
const angleAt = (t) => { const f = Math.max(0, t) / ANG_DT, i = Math.floor(f); return lerp(ANG[i], ANG[i + 1], f - i); };

// ---------------- renderer / scene ----------------
const cv = document.getElementById("world");
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(col("#0a1830"), 0.028);
const camera = new THREE.PerspectiveCamera(32, W / H, 0.05, 160);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.42;

// backdrop: a sphere around the camera with a navy gradient and a soft teal glow behind the subject
const backMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { uTop: { value: col("#050d1c") }, uHor: { value: col("#0e2544") }, uBot: { value: col("#040a16") }, uGlowDir: { value: V3(0, 0.1, -1).normalize() }, uGlow: { value: col("#0b4a55") }, uGlowAmt: { value: 1 } },
  vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `uniform vec3 uTop,uHor,uBot,uGlow,uGlowDir; uniform float uGlowAmt; varying vec3 vD;
    void main(){ vec3 d = normalize(vD); float h = d.y;
      vec3 c = mix(uHor, uTop, smoothstep(-0.02, 0.55, h)); c = mix(c, uBot, smoothstep(0.0, -0.35, h));
      c += uGlow * pow(max(dot(d, uGlowDir), 0.0), 5.0) * 0.55 * uGlowAmt; gl_FragColor = vec4(c, 1.0); }`,
});
const backdrop = new THREE.Mesh(new THREE.SphereGeometry(120, 48, 24), backMat);
backdrop.renderOrder = -10; scene.add(backdrop);

const key = new THREE.DirectionalLight(0xfff1e2, 1.9); key.position.set(4.5, 8.5, 6.5);
key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 30 });
key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
scene.add(key, key.target); key.target.position.set(0.6, 0, 0);
const rim = new THREE.DirectionalLight(0x19c3b1, 2.0); rim.position.set(-6, 3.5, -6); scene.add(rim);
const fill = new THREE.DirectionalLight(0x8fb2ff, 0.45); fill.position.set(-6, 1.5, 6); scene.add(fill);
const heatLight = new THREE.PointLight(0xff5a1e, 0, 3.2, 1.6); scene.add(heatLight);

// ---------------- materials ----------------
const M = {
  paint: new THREE.MeshPhysicalMaterial({ color: col("#DCD8CF"), roughness: 0.32, metalness: 0.0, clearcoat: 0.8, clearcoatRoughness: 0.22 }),
  black: new THREE.MeshPhysicalMaterial({ color: col("#121a26"), roughness: 0.45, metalness: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.2 }),
  tire: new THREE.MeshStandardMaterial({ color: col("#14181f"), roughness: 0.88, metalness: 0 }),
  alu: new THREE.MeshStandardMaterial({ color: col("#c9d2dc"), roughness: 0.22, metalness: 1 }),
  steel: new THREE.MeshStandardMaterial({ color: col("#aab4c0"), roughness: 0.3, metalness: 1 }),
  spoke: new THREE.MeshStandardMaterial({ color: col("#b9c3cf"), roughness: 0.25, metalness: 1, transparent: true, opacity: 1 }),
  rubber: new THREE.MeshStandardMaterial({ color: col("#2a2d33"), roughness: 0.92, metalness: 0 }),
  caliper: new THREE.MeshPhysicalMaterial({ color: col("#1f2b3d"), roughness: 0.32, metalness: 0.7, clearcoat: 0.8, clearcoatRoughness: 0.15, transparent: true, opacity: 1 }),
  tealMetal: new THREE.MeshPhysicalMaterial({ color: col(TEAL), roughness: 0.25, metalness: 0.8, clearcoat: 1, clearcoatRoughness: 0.1 }),
  glass: new THREE.MeshPhysicalMaterial({ color: col("#dff6f3"), roughness: 0.05, metalness: 0, clearcoat: 1, transparent: true, opacity: 0.28, depthWrite: false }),
  fluid: new THREE.MeshStandardMaterial({ color: col(TEAL), emissive: col(TEAL), emissiveIntensity: 0.55, roughness: 0.2, metalness: 0 }),
  hose: new THREE.MeshPhysicalMaterial({ color: col("#e8f4f3"), roughness: 0.1, metalness: 0, clearcoat: 1, transparent: true, opacity: 0.3, depthWrite: false }),
  housing: new THREE.MeshPhysicalMaterial({ color: col("#141c28"), roughness: 0.35, metalness: 0.1, clearcoat: 0.8, transparent: true, opacity: 1 }),
  wire: new THREE.MeshStandardMaterial({ color: col("#dfe6ee"), roughness: 0.18, metalness: 1, transparent: true, opacity: 1 }),
  ghost: new THREE.MeshBasicMaterial({ color: col(TEAL).multiplyScalar(1.6), transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending }),
  glowTeal: new THREE.MeshBasicMaterial({ color: col(TEAL).multiplyScalar(2.2), transparent: true, depthWrite: false, toneMapped: false }),
  glowWhite: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.2, 2.1), transparent: true, depthWrite: false, toneMapped: false }),
  floor: new THREE.MeshBasicMaterial({ color: col("#08142a") }),
};
const rotorMat = () => new THREE.MeshPhysicalMaterial({ color: col("#cfd6de"), roughness: 0.26, metalness: 1, emissive: col("#000000"), emissiveIntensity: 1, transparent: true, opacity: 1 });
const shadowAll = (o) => o.traverse((m) => { if (m.isMesh) { m.castShadow = true; } });

// ---------------- geometry helpers ----------------
function rod(a, b, r, m, seg = 16) {
  const d = b.clone().sub(a), len = d.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), m);
  mesh.position.copy(a).addScaledVector(d, 0.5);
  mesh.quaternion.setFromUnitVectors(V3(0, 1, 0), d.clone().normalize());
  return mesh;
}
const tube = (curve, segs, r, m, rs = 12) => new THREE.Mesh(new THREE.TubeGeometry(curve, segs, r, rs, false), m);
const crv = (pts) => new THREE.CatmullRomCurve3(pts, false, "centripetal");
// TubeGeometry indices run segment by segment, so drawRange draws a tube "on" from its start
function drawOn(mesh, f) { const g = mesh.geometry, rs = g.parameters.radialSegments, ts = g.parameters.tubularSegments; g.setDrawRange(0, Math.floor(clamp01(f) * ts) * rs * 6); mesh.visible = f > 0.002; }
class ArcCurve extends THREE.Curve {
  constructor(c, r, a0, span, z) { super(); Object.assign(this, { c, r, a0, span, z }); }
  getPoint(u, out = new THREE.Vector3()) { const a = this.a0 + this.span * u; return out.set(this.c.x + Math.cos(a) * this.r, this.c.y + Math.sin(a) * this.r, this.z); }
}

// ---------------- rig: floor, road and bike (tilted to the 8 % slope in the hook only) ----------------
const rig = new THREE.Group(); scene.add(rig);
const GROUND = -1.0;
const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), M.floor);
floor.rotation.x = -Math.PI / 2; floor.position.y = GROUND - 0.004; rig.add(floor);
const catcher = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.6, color: 0x000000 }));
catcher.rotation.x = -Math.PI / 2; catcher.position.y = GROUND + 0.002; catcher.receiveShadow = true; rig.add(catcher);
const poolTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d"); const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, "rgba(40,90,140,0.55)"); gr.addColorStop(0.5, "rgba(25,60,105,0.22)"); gr.addColorStop(1, "rgba(10,25,50,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
const pool = new THREE.Mesh(new THREE.PlaneGeometry(13, 7), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
pool.rotation.x = -Math.PI / 2; pool.position.set(0.2, GROUND + 0.003, 0.2); rig.add(pool);

function roadTexture() {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 256; const g = c.getContext("2d");
  g.fillStyle = "#1a212c"; g.fillRect(0, 0, 1024, 256);
  for (let i = 0; i < 9000; i++) { const v = 22 + hash(i * 3.3) * 40; g.fillStyle = `rgba(${v},${v + 4},${v + 12},0.55)`; g.fillRect(hash(i * 1.9) * 1024, hash(i * 7.1) * 256, 2, 2); }
  g.fillStyle = "rgba(244,241,234,0.85)"; g.fillRect(0, 18, 1024, 9); g.fillRect(0, 229, 1024, 9);           // edge lines
  for (let x = 0; x < 1024; x += 256) g.fillRect(x + 40, 62, 150, 10);                                       // centre dashes (far side)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.anisotropy = 8; return t;
}
const ROAD_LEN = 70, ROAD_TILE = 6;
const roadTex = roadTexture(); roadTex.repeat.set(ROAD_LEN / ROAD_TILE, 1);
const road = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_LEN, 3.4), new THREE.MeshBasicMaterial({ map: roadTex, color: col("#9aa4b4") }));
road.rotation.x = -Math.PI / 2; road.position.set(0, GROUND - 0.001, 0.15); rig.add(road);

// ---- bike (faces +x; front hub F, rear hub R, wheel radius 1) ----
const F = V3(1.55, 0, 0), R = V3(-1.55, 0, 0);
const CROWN = V3(1.21, 1.05, 0), HT_TOP = V3(1.10, 1.38, 0);
const DIR_RIM = V3(-0.1, 0.995, 0).normalize();                           // rim point just ahead of the fork legs
const RIM_R = 0.83, P_RIM = F.clone().addScaledVector(DIR_RIM, RIM_R);   // where rim-brake pads meet the rim
const TAN_A = Math.atan2(0.1, 0.995);
const RB_PIVOT = V3(1.36, 1.07, 0);                                   // rim tangent angle at P_RIM
const GRIP = V3(1.03, 1.62, 0.33), LEVER_PIVOT = V3(1.07, 1.63, 0.235);
const ROTOR_Z = 0.165, ROTOR_S = 0.36, ROTOR_B = 0.52, CAL_ANG = THREE.MathUtils.degToRad(212);

function wheel(front) {
  const g = new THREE.Group(), spin = new THREE.Group(); g.add(spin);
  spin.add(new THREE.Mesh(new THREE.TorusGeometry(0.93, 0.072, 20, 96), M.tire));
  // tread blocks so rotation reads even when spokes blur
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2, b = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.02, 0.09, 2, 0.008), M.tire);
    b.position.set(Math.cos(a) * 0.995, Math.sin(a) * 0.995, 0); b.rotation.z = a; spin.add(b);
  }
  const rimMesh = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.042, 14, 96), M.alu); rimMesh.scale.z = 0.95; spin.add(rimMesh);
  const spokes = new THREE.Group();
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2, side = i % 2 ? 1 : -1, cross = side * 0.32;
    spokes.add(rod(V3(Math.cos(a + cross) * 0.085, Math.sin(a + cross) * 0.085, side * 0.06), V3(Math.cos(a) * 0.79, Math.sin(a) * 0.79, 0), 0.0065, M.spoke, 6));
  }
  spin.add(spokes);
  // motion-blur disc for the spokes at speed
  const blur = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.79, 64, 1), new THREE.MeshBasicMaterial({ color: col("#9fb0c2"), transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
  g.add(blur);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 24), M.alu); hub.rotation.x = Math.PI / 2; spin.add(hub);
  for (const z of [-0.06, 0.06]) { const fl = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.015, 32), M.alu); fl.rotation.x = Math.PI / 2; fl.position.z = z; spin.add(fl); }
  g.position.copy(front ? F : R);
  return { g, spin, spokes, blur };
}
function bikeFrame() {
  const g = new THREE.Group(), T = 0.05;
  const BB = V3(-0.3, -0.2), S = V3(-0.78, 1.27);
  g.add(rod(BB, S, T, M.paint), rod(BB, V3(1.17, 1.1), T * 1.2, M.paint), rod(V3(-0.74, 1.2), V3(1.12, 1.32), T, M.paint), rod(CROWN.clone().add(V3(0, 0.02)), HT_TOP, T * 1.35, M.paint));
  for (const z of [-0.07, 0.07]) { g.add(rod(V3(BB.x, BB.y, z), V3(R.x, R.y, z), T * 0.62, M.paint), rod(V3(-0.74, 1.14, z * 0.6), V3(R.x, R.y, z), T * 0.55, M.paint)); }
  // fork
  for (const z of [-0.11, 0.11]) g.add(rod(V3(CROWN.x, CROWN.y, z), V3(F.x, F.y, z), T * 0.75, M.paint));
  const crown = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.08, 0.3, 3, 0.03), M.paint); crown.position.copy(CROWN); g.add(crown);
  // stem, bar, grips
  g.add(rod(HT_TOP, V3(1.04, 1.6), T * 0.8, M.black), rod(V3(1.03, 1.62, -0.4), V3(1.03, 1.62, 0.4), 0.028, M.black));
  for (const z of [-1, 1]) g.add(rod(V3(1.03, 1.62, z * 0.27), V3(1.03, 1.62, z * 0.41), 0.042, M.rubber));
  // seat
  g.add(rod(S, V3(-0.83, 1.5), T * 0.65, M.alu));
  const sad = new THREE.Mesh(new RoundedBoxGeometry(0.8, 0.1, 0.28, 4, 0.045), M.black); sad.position.set(-0.8, 1.56, 0); g.add(sad);
  // drivetrain
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.022, 10, 48), M.steel); ring.position.set(BB.x, BB.y, -0.1); g.add(ring);
  const chainTop = rod(V3(BB.x, BB.y + 0.21, -0.1), V3(R.x, R.y + 0.09, -0.1), 0.012, M.steel), chainBot = rod(V3(BB.x, BB.y - 0.21, -0.1), V3(R.x, R.y - 0.09, -0.1), 0.012, M.steel);
  g.add(chainTop, chainBot);
  const crank = new THREE.Group(); crank.position.set(BB.x, BB.y, 0);
  for (const s of [-1, 1]) {
    const arm = rod(V3(0, 0, s * 0.13), V3(0, -0.36 * s, s * 0.13), 0.026, M.alu); crank.add(arm);
    const ped = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.045, 0.14, 3, 0.015), M.black); ped.position.set(0, -0.37 * s, s * 0.2); crank.add(ped);
  }
  g.add(crank);
  return { g, crank };
}
const bike = new THREE.Group(); rig.add(bike);
const FW = wheel(true), RW = wheel(false), FR = bikeFrame();
bike.add(FW.g, RW.g, FR.g);

// ---- rim brake (side-pull caliper hanging from the crown, pads on the rim sides) ----
const rimBrake = new THREE.Group(); bike.add(rimBrake);
const rbArms = [], rbPads = [];
const ARM_CACHE = new Map();
function rimArmGeo(sideZ, open) {
  const k = `${sideZ}:${Math.round(open * 200)}`; if (ARM_CACHE.has(k)) return ARM_CACHE.get(k);
  const z = sideZ * (0.06 + open);
  const c = crv([V3(RB_PIVOT.x, RB_PIVOT.y, sideZ * 0.035), P_RIM.clone().addScaledVector(DIR_RIM, 0.27).setZ(sideZ * (0.17 + open * 0.6)),
    P_RIM.clone().addScaledVector(DIR_RIM, 0.12).setZ(sideZ * (0.15 + open * 0.8)), P_RIM.clone().addScaledVector(DIR_RIM, 0.025).setZ(z + sideZ * 0.025)]);
  const geo = new THREE.TubeGeometry(c, 24, 0.024, 10, false); ARM_CACHE.set(k, geo); return geo;
}
for (const s of [-1, 1]) {
  const arm = new THREE.Mesh(rimArmGeo(s, 0.08), M.steel); rimBrake.add(arm); rbArms.push(arm);
  const pad = new THREE.Group();
  const block = new THREE.Mesh(new RoundedBoxGeometry(0.17, 0.045, 0.034, 3, 0.01), M.rubber); pad.add(block);
  const shoe = new THREE.Mesh(new RoundedBoxGeometry(0.19, 0.05, 0.014, 2, 0.005), M.alu); shoe.position.z = s * 0.024; pad.add(shoe);
  pad.rotation.z = TAN_A; rimBrake.add(pad); rbPads.push(pad);
}
const rbBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.12, 16), M.alu); rbBolt.rotation.x = Math.PI / 2; rbBolt.position.copy(RB_PIVOT).add(CROWN).multiplyScalar(0.5); rbBolt.rotation.set(0, 0, Math.PI / 2); rbBolt.scale.set(1, 1.4, 1); rimBrake.add(rbBolt);

// ghost of the missing brake ("no brakes!")
const ghost = new THREE.Group(); bike.add(ghost);
const ghostHalo = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), new THREE.MeshBasicMaterial({ color: col(TEAL), transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending })); ghostHalo.position.copy(P_RIM).add(V3(-0.05, 0.12, 0)); ghost.add(ghostHalo);
for (const s of [-1, 1]) { const b = new THREE.Mesh(new RoundedBoxGeometry(0.17, 0.05, 0.04, 3, 0.012), M.ghost); b.position.copy(P_RIM).setZ(s * 0.075); b.rotation.z = TAN_A; ghost.add(b); ghost.add(new THREE.Mesh(rimArmGeo(s, 0.0), M.ghost)); }

// ---- lever (+ master cylinder for the hydraulic step) ----
const lever = new THREE.Group(); lever.position.copy(LEVER_PIVOT); bike.add(lever);
const leverClamp = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.09, 0.07, 3, 0.02), M.black); lever.add(leverClamp);
const blade = new THREE.Group(); lever.add(blade);
blade.add(new THREE.Mesh(new RoundedBoxGeometry(0.035, 0.03, 0.2, 3, 0.012), M.tealMetal)); blade.children[0].position.set(0.09, -0.02, 0.1);
blade.add(rod(V3(0.0, 0, 0), V3(0.09, -0.02, 0.0), 0.016, M.tealMetal));
const master = new THREE.Group(); master.position.set(1.06, 1.69, 0.15); bike.add(master);
const glassBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.24, 32, 1, true), M.glass); glassBarrel.rotation.x = Math.PI / 2; master.add(glassBarrel);
const capA = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 32), M.black); capA.rotation.x = Math.PI / 2; capA.position.z = -0.125; master.add(capA);
const fluidCol = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.2, 24), M.fluid); fluidCol.rotation.x = Math.PI / 2; master.add(fluidCol);
const plunger = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.03, 24), M.paint); plunger.rotation.x = Math.PI / 2; master.add(plunger);
const plungerRod = rod(V3(0, 0, 0.0), V3(0, 0, 0.16), 0.012, M.alu); master.add(plungerRod);

// ---- disc rotors (on the front hub, they spin with the wheel) ----
function rotor(r) {
  const g = new THREE.Group(), m = rotorMat();
  const sh = new THREE.Shape(); sh.absarc(0, 0, r, 0, Math.PI * 2, false);
  const inner = new THREE.Path(); inner.absarc(0, 0, r * 0.74, 0, Math.PI * 2, true); sh.holes.push(inner);
  const n = Math.round(r * 60);
  for (let row = 0; row < 2; row++) for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + row * (Math.PI / n), rr = r * (0.8 + row * 0.1), p = new THREE.Path(); p.absarc(Math.cos(a) * rr, Math.sin(a) * rr, r * 0.032, 0, Math.PI * 2, true); sh.holes.push(p); }
  const track = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.022, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 1, curveSegments: 64 }), m);
  track.position.z = -0.011; g.add(track);
  const sp = new THREE.Shape(); sp.absarc(0, 0, r * 0.765, 0, Math.PI * 2, false);
  const ch = new THREE.Path(); ch.absarc(0, 0, 0.05, 0, Math.PI * 2, true); sp.holes.push(ch);
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2, w = new THREE.Path(); w.absellipse(Math.cos(a) * r * 0.46, Math.sin(a) * r * 0.46, r * 0.19, r * 0.13, 0, Math.PI * 2, true, a); sp.holes.push(w); }
  const spider = new THREE.Mesh(new THREE.ExtrudeGeometry(sp, { depth: 0.016, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2, curveSegments: 48 }), M.caliper.clone());
  spider.material.transparent = false; spider.position.z = -0.008; g.add(spider);
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + Math.PI / 6, b = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.03, 12), M.alu); b.rotation.x = Math.PI / 2; b.position.set(Math.cos(a) * r * 0.75, Math.sin(a) * r * 0.75, 0); g.add(b); }
  g.position.z = ROTOR_Z; return { g, m };
}
const rotS = rotor(ROTOR_S), rotB = rotor(ROTOR_B);
FW.spin.add(rotS.g, rotB.g);
// caliper straddles the rotor edge at CAL_ANG, moves outward for the bigger rotor
const caliper = new THREE.Group(); bike.add(caliper);
const calOuter = new THREE.Mesh(new RoundedBoxGeometry(0.21, 0.13, 0.06, 4, 0.025), M.caliper); calOuter.position.z = 0.048; caliper.add(calOuter);
const calInner = new THREE.Mesh(new RoundedBoxGeometry(0.21, 0.13, 0.06, 4, 0.025), M.caliper); calInner.position.z = -0.048; caliper.add(calInner);
const calBridge = new THREE.Mesh(new RoundedBoxGeometry(0.21, 0.04, 0.16, 3, 0.015), M.caliper); calBridge.position.y = 0.075; caliper.add(calBridge);
const calLogo = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.02, 0.004, 2, 0.002), M.glowTeal); calLogo.position.set(0, 0.0, 0.081); caliper.add(calLogo);
const discPads = [], pistons = [];
for (const s of [-1, 1]) {
  const p = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.08, 0.016, 2, 0.006), M.rubber); caliper.add(p); discPads.push(p);
  const pi = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 20), M.alu); pi.rotation.x = Math.PI / 2; caliper.add(pi); pistons.push(pi);
}
const calMount = new THREE.Group(); bike.add(calMount);
let calMountKey = -1;
function caliperPose(r) { // position on the rotor edge, oriented tangentially
  const p = F.clone().add(V3(Math.cos(CAL_ANG) * (r - 0.02), Math.sin(CAL_ANG) * (r - 0.02), ROTOR_Z));
  return { p, rot: CAL_ANG + Math.PI / 2 };
}

// ---- cables, hose ----
const LEVER_END = V3(1.1, 1.6, 0.27);
const cableA = tube(crv([P_RIM.clone().addScaledVector(DIR_RIM, 0.3).setZ(0.03), V3(1.36, 1.52, 0.05), V3(1.42, 1.78, 0.2), V3(1.25, 1.72, 0.3), LEVER_END]), 90, 0.017, M.housing);
bike.add(cableA);
// lever -> down the fork -> around the outside of the rotor -> into the back of the caliper. Index 6 is the housing stop.
function cableBPts(calP) {
  const ra = F.distanceTo(V3(calP.x, calP.y, 0)) + 0.17, pt = (deg, z) => { const a = THREE.MathUtils.degToRad(deg); return V3(F.x + Math.cos(a) * ra, F.y + Math.sin(a) * ra, z); };
  const out = V3(Math.cos(CAL_ANG), Math.sin(CAL_ANG), 0);
  return [LEVER_END, V3(1.2, 1.5, 0.27), V3(1.3, 1.22, 0.22), V3(1.37, 0.88, 0.2), pt(102, 0.2), pt(135, 0.2), pt(160, 0.195), pt(188, ROTOR_Z + 0.02), calP.clone().addScaledVector(out, 0.06).add(V3(0, 0.05, 0))];
}
let cableB = null, hoseOuter = null, hoseFluid = null, hoseKey = -1;
function rebuildLines(calP) {
  const k = Math.round(calP.x * 500) * 1000 + Math.round(calP.y * 500); if (k === hoseKey) return; hoseKey = k;
  for (const m of [cableB, hoseOuter, hoseFluid]) if (m) { bike.remove(m); m.geometry.dispose(); }
  const P = cableBPts(calP), c = crv(P);
  cableB = tube(crv(P.slice(0, 7)), 100, 0.017, M.housing); hoseOuter = tube(c, 110, 0.026, M.hose, 14); hoseFluid = tube(c, 110, 0.014, M.fluid, 10);
  bike.add(cableB, hoseOuter, hoseFluid);
}
// exposed inner wire that stretches (step 4 problem)
let wireMesh = null;
const pulseBead = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), M.glowTeal); bike.add(pulseBead);
const pulseHalo = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), new THREE.MeshBasicMaterial({ color: col(TEAL), transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); bike.add(pulseHalo);

// reach line: grip -> pad (dashes)
const reach = new THREE.Group(); bike.add(reach);
{ const a = GRIP.clone().add(V3(0.04, -0.04, -0.02)), b = P_RIM.clone().add(V3(0.02, 0.05, 0.12)); const n = 16;
  for (let i = 0; i < n; i++) { const u0 = i / n, u1 = (i + 0.55) / n; reach.add(rod(a.clone().lerp(b, u0), a.clone().lerp(b, u1), 0.012, M.glowTeal, 8)); } }

// gauge ring around the front wheel ("560 watts")
const gaugeArc = new ArcCurve(F, 1.2, THREE.MathUtils.degToRad(-120), THREE.MathUtils.degToRad(-300), 0.28);
const gaugeTrack = tube(gaugeArc, 160, 0.022, new THREE.MeshBasicMaterial({ color: col("#2a4a6e"), transparent: true, opacity: 0.6, depthWrite: false }));
const gaugeFill = tube(gaugeArc, 160, 0.04, M.glowTeal);
const gaugeHead = new THREE.Mesh(new THREE.SphereGeometry(0.08, 20, 14), M.glowWhite);
const gauge = new THREE.Group(); gauge.add(gaugeTrack, gaugeFill, gaugeHead); bike.add(gauge);

// slope line + level reference ("8 % hill"): the slope line lives in the rig, the level line in the world
const slopeLine = tube(crv([V3(-9, GROUND + 0.01, 1.45), V3(9, GROUND + 0.01, 1.45)]), 120, 0.03, M.glowTeal); rig.add(slopeLine);
const levelLine = new THREE.Group(); scene.add(levelLine);
for (let i = 0; i < 26; i++) { const x0 = -9 + i * 0.72; levelLine.add(rod(V3(x0, 0, 0), V3(x0 + 0.4, 0, 0), 0.016, M.glowWhite, 8)); }

// ---- shoes (stylised sneaker, built from a side profile) ----
function sneaker() {
  const g = new THREE.Group();
  const sole = new THREE.Shape(); sole.moveTo(-0.5, 0); sole.lineTo(0.38, 0); sole.quadraticCurveTo(0.52, 0.0, 0.53, 0.08); sole.lineTo(0.5, 0.12); sole.lineTo(-0.5, 0.12); sole.quadraticCurveTo(-0.54, 0.06, -0.5, 0);
  const up = new THREE.Shape(); up.moveTo(-0.49, 0.11); up.lineTo(-0.47, 0.46); up.quadraticCurveTo(-0.4, 0.53, -0.3, 0.5); up.quadraticCurveTo(-0.2, 0.4, -0.08, 0.47); up.lineTo(0.02, 0.5);
  up.quadraticCurveTo(0.08, 0.38, 0.3, 0.27); up.quadraticCurveTo(0.5, 0.2, 0.5, 0.11); up.lineTo(-0.49, 0.11);
  const opt = { depth: 0.3, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.035, bevelSegments: 3, curveSegments: 16 };
  const s = new THREE.Mesh(new THREE.ExtrudeGeometry(sole, opt), M.paint); s.position.z = -0.15; g.add(s);
  const u = new THREE.Mesh(new THREE.ExtrudeGeometry(up, { ...opt, depth: 0.26, bevelThickness: 0.05 }), new THREE.MeshPhysicalMaterial({ color: col("#4a74a8"), roughness: 0.5, clearcoat: 0.4 })); u.position.z = -0.13; g.add(u);
  const stripe = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.05, 0.36, 2, 0.02), M.tealMetal); stripe.position.set(-0.08, 0.24, 0); stripe.rotation.z = -0.35; g.add(stripe);
  for (let i = 0; i < 4; i++) g.add(rod(V3(-0.02 + i * 0.07, 0.45 - i * 0.045, -0.12), V3(-0.02 + i * 0.07, 0.45 - i * 0.045, 0.12), 0.012, M.paint, 8));
  g.scale.setScalar(0.85); return g;
}
const shoeGag = sneaker(); scene.add(shoeGag);
const shoePair = [sneaker(), sneaker()]; scene.add(...shoePair);

for (const o of [bike, shoeGag, ...shoePair]) shadowAll(o);
for (const o of [gauge, reach, ghost, levelLine, slopeLine, pulseBead, pulseHalo]) o.traverse((m) => { if (m.isMesh) m.castShadow = false; });
FW.blur.castShadow = RW.blur.castShadow = false;

// ---------------- particles (one additive and one soft system; pure functions of t) ----------------
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
const ADD = new PSys(2600, true, 1.6), SOFT = new PSys(900, false, 1.4);
const _o = new THREE.Vector3();
// continuous emission over [t0, t1]: n particles, each born once, life seconds long
function emit(ps, t, o) {
  if (t < o.t0 || t > o.t1 + o.life) return;
  for (let k = 0; k < o.n; k++) {
    const b = o.t0 + ((k + hash(o.seed + k * 1.7) * 0.95) / o.n) * (o.t1 - o.t0), age = t - b;
    if (age < 0 || age > o.life) continue;
    const u = age / o.life, h1 = hash(o.seed + k * 3.1) - 0.5, h2 = hash(o.seed + k * 5.3) - 0.5, h3 = hash(o.seed + k * 7.9) - 0.5, h4 = hash(o.seed + k * 9.7);
    const org = typeof o.org === "function" ? o.org(b, k) : o.org;
    const d = o.drag ? (1 - Math.exp(-o.drag * age)) / o.drag : age;
    _o.set(org.x + (o.vel[0] + h1 * o.spr[0]) * d, org.y + (o.vel[1] + h2 * o.spr[1]) * d + 0.5 * (o.g || 0) * age * age, org.z + (o.vel[2] + h3 * o.spr[2]) * d);
    if (o.local) o.local.localToWorld(_o);
    const a = o.a * Math.pow(1 - u, o.pw || 1.5) * Math.min(1, age / 0.05) * (o.mod ? o.mod(b) : 1);
    if (a <= 0.002) continue;
    const c = o.col(u, h4);
    const sz = lerp(o.s0, o.s1, u) * (0.6 + 0.8 * h4);
    if (ps === SOFT) ps.push(_o.x, _o.y, _o.z, sz, c[0], c[1], c[2], a); else ps.push(_o.x, _o.y, _o.z, sz, c[0] * a, c[1] * a, c[2] * a, 1);
  }
}
const cSpark = (u) => [2.6, lerp(1.4, 0.45, u), lerp(0.6, 0.12, u)];
const cWhite = () => [1.8, 1.9, 2.0];
const cTeal = () => [0.25, 1.6, 1.45];
const cHeat = (u) => [1.8 * (1 - u * 0.5), 0.55 * (1 - u), 0.12];
const cSmoke = (u, h) => { const v = 0.36 + h * 0.12; return [v, v + 0.02, v + 0.06]; };
const cDust = (u, h) => { const v = 0.16 + h * 0.08; return [v, v, v + 0.02]; };
const cSpray = () => [1.1, 1.3, 1.5];

// rain (instanced streaks around the front wheel) and droplets on the rim
const RAIN_N = 700;
const rainMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.0035, 0.16, 0.0035), new THREE.MeshBasicMaterial({ color: col("#cfe6ff"), transparent: true, opacity: 0.42, depthWrite: false, blending: THREE.AdditiveBlending }), RAIN_N);
rainMesh.frustumCulled = false; scene.add(rainMesh);
const DROP_N = 90;
const dropMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshPhysicalMaterial({ color: col("#e8f6ff"), roughness: 0.02, metalness: 0, clearcoat: 1, transparent: true, opacity: 0.75 }), DROP_N);
dropMesh.frustumCulled = false; FW.spin.add(dropMesh);
// confetti ("Congratulations!") and speed streaks (hook)
const CONF_N = 70;
const confMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.05, 0.028), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.3, side: THREE.DoubleSide, emissive: col("#222222") }), CONF_N);
for (let i = 0; i < CONF_N; i++) confMesh.setColorAt(i, col(i % 3 === 0 ? WHITE : i % 3 === 1 ? TEAL : "#7fe3d8"));
confMesh.frustumCulled = false; scene.add(confMesh);
const STREAK_N = 46;
const streakMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1.6, 0.012, 0.012), new THREE.MeshBasicMaterial({ color: col("#bfe9f0"), transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }), STREAK_N);
streakMesh.frustumCulled = false; rig.add(streakMesh);
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _p = new THREE.Vector3();

// ---------------- 3D numbers ----------------
let FONT3D = null;
const textMats = [new THREE.MeshStandardMaterial({ color: col(WHITE), emissive: col(WHITE), emissiveIntensity: 0.28, roughness: 0.35, metalness: 0 }),
  new THREE.MeshPhysicalMaterial({ color: col(TEAL), roughness: 0.22, metalness: 0.75, clearcoat: 1, emissive: col(TEAL), emissiveIntensity: 0.12 })];
function text3D(str, size) {
  const geo = new TextGeometry(str, { font: FONT3D, size, depth: size * 0.3, curveSegments: 8, bevelEnabled: true, bevelThickness: size * 0.05, bevelSize: size * 0.028, bevelSegments: 3 });
  geo.computeBoundingBox(); const bb = geo.boundingBox; geo.center();
  const m = new THREE.Mesh(geo, textMats); m.castShadow = true; const g = new THREE.Group(); g.add(m); scene.add(g); g.visible = false; g.userData.w = bb.max.x - bb.min.x; return g;
}

// ---------------- shots (camera keys: t, camera position, look-at target, fov, focus aperture) ----------------
// positions are in bike space; in the hook the rig is tilted so the camera sees the slope against the level line
const SHOTS = [
  { t0: 0, t1: 3.4, hand: 0.04, keys: [[0, [7.7, -0.25, 12.2], [0.25, 0.1, 0], 32], [3.4, [7.0, -0.15, 11.2], [0.3, 0.12, 0], 32]] },
  { t0: 3.4, t1: 8.3, hand: 0.04, keys: [[3.4, [3.3, -0.3, 12.8], [0.25, 0.4, 0], 32], [5.25, [3.7, -0.25, 12.0], [0.35, 0.4, 0], 32],
    [6.35, [4.6, 2.3, 6.2], [1.45, 0.62, 0], 32, 0.002], [8.3, [4.1, 2.05, 5.4], [1.45, 0.62, 0], 32, 0.002]] },
  { t0: 8.3, t1: 13.88, hand: 0.02, keys: [[8.3, [4.4, 1.0, 9.2], [1.55, 0.3, 0], 30, 0.0015], [13.88, [3.7, 0.8, 8.3], [1.55, 0.3, 0], 30, 0.0015]] },
  { t0: 13.88, t1: 15.3, hand: 0.05, keys: [[13.88, [4.7, -0.3, 3.4], [2.0, -0.45, 0.4], 34, 0.004], [15.3, [4.5, -0.32, 3.2], [2.0, -0.5, 0.4], 34, 0.004]] },
  { t0: 15.3, t1: 19.5, hand: 0.02, keys: [[15.3, [2.95, 1.05, 1.35], [1.47, 0.84, 0], 30, 0.006], [17.3, [2.8, 1.0, 1.2], [1.47, 0.84, 0], 30, 0.006],
    [18.6, [3.0, 1.3, 2.5], [1.42, 0.8, 0], 30, 0.004], [19.5, [3.05, 1.3, 2.55], [1.42, 0.8, 0], 30, 0.004]] },
  { t0: 19.5, t1: 27.48, hand: 0.03, keys: [[19.5, [4.9, 2.6, 5.4], [1.25, 0.85, 0.1], 32, 0.0015], [22.1, [4.6, 2.6, 5.1], [1.25, 0.85, 0.1], 32, 0.0015],
    [24.3, [2.75, 2.25, 2.5], [1.06, 1.5, 0.3], 30, 0.005], [25.65, [2.65, 2.2, 2.4], [1.06, 1.5, 0.3], 30, 0.005],
    [26.35, [3.0, 1.55, 2.75], [1.42, 0.85, 0.1], 30, 0.004], [27.48, [3.1, 1.5, 2.9], [1.42, 0.82, 0.05], 30, 0.004]] },
  { t0: 27.48, t1: 30.88, hand: 0.02, keys: [[27.48, [2.55, 1.05, 1.55], [1.45, 0.8, 0], 30, 0.009], [30.88, [2.4, 1.0, 1.35], [1.45, 0.8, 0], 30, 0.009]] },
  { t0: 30.88, t1: 36.08, hand: 0.02, keys: [[30.88, [2.85, 0.5, 2.0], [1.5, -0.02, 0.15], 30, 0.008], [32.7, [3.0, 0.6, 2.25], [1.5, 0.0, 0.15], 30, 0.008],
    [33.5, [3.7, 1.0, 3.4], [1.45, 0.25, 0.1], 31, 0.004], [34.2, [2.8, 0.45, 2.25], [1.42, -0.08, 0.15], 30, 0.008], [36.08, [2.6, 0.4, 2.3], [1.42, -0.1, 0.15], 30, 0.008]] },
  { t0: 36.08, t1: 38.5, hand: 0.035, keys: [[36.08, [2.75, 0.75, 2.1], [1.2, 0.1, 0.18], 30, 0.006], [38.5, [2.5, 0.68, 1.85], [1.2, 0.08, 0.18], 30, 0.006]] },
  { t0: 38.5, t1: 44.7, hand: 0.02, keys: [[38.5, [3.6, 1.85, 3.2], [1.25, 0.85, 0.2], 31, 0.004], [41.3, [3.3, 1.85, 2.95], [1.2, 0.95, 0.2], 31, 0.004],
    [41.95, [1.92, 1.88, 1.42], [1.03, 1.66, 0.22], 30, 0.012], [42.45, [1.88, 1.84, 1.34], [1.03, 1.66, 0.22], 30, 0.012],
    [43.3, [2.55, 0.42, 1.6], [1.3, -0.12, 0.16], 30, 0.01], [44.7, [2.45, 0.38, 1.66], [1.3, -0.12, 0.16], 30, 0.01]] },
  { t0: 44.7, t1: 51.34, hand: 0.025, keys: [[44.7, [2.7, 0.3, 2.05], [1.42, -0.05, 0.15], 30, 0.009], [47.7, [2.3, 0.2, 1.65], [1.4, -0.08, 0.15], 30, 0.01],
    [48.45, [3.05, 0.45, 2.45], [1.4, -0.08, 0.15], 30, 0.008], [50.6, [2.6, 0.3, 2.0], [1.4, -0.1, 0.15], 30, 0.009], [51.34, [1.95, -0.12, 0.85], [1.35, -0.2, 0.15], 30, 0.009]] },
  { t0: 51.34, t1: 61, hand: 0.015, keys: [[51.34, [3.4, 0.55, 3.5], [1.0, 0.35, 0], 32, 0.002], [53.6, [6.4, 1.3, 7.9], [0.3, 0.7, 0], 32, 0.0012],
    [57.4, [5.6, 1.7, 9.5], [0.15, 0.75, 0], 32, 0.001], [61, [5.0, 1.85, 10.0], [0.1, 0.75, 0], 32, 0.001]] },
];
const WHIPS = [{ t: 19.5, axis: "x", amt: -0.75, dir: [0, 1] }, { t: 30.88, axis: "y", amt: 0.8, dir: [1, 0] }, { t: 51.34, axis: "x", amt: 0.55, dir: [0, 1] }];
const IMPACTS = [[0.0, 0.0], [1.4, 0.05], [3.98, 0.05], [6.44, 0.03], [13.97, 0.05], [16.6, 0.02], [17.4, 0.025], [26.2, 0.02], [32.64, 0.02], [34.45, 0.025], [43.15, 0.03], [49.3, 0.025], [51.34, 0.03], [55.85, 0.02]];

function shotAt(t) { for (let i = 0; i < SHOTS.length; i++) if (t < SHOTS[i].t1) return i; return SHOTS.length - 1; }
const _cp = new THREE.Vector3(), _ct = new THREE.Vector3();
function cameraFor(t) {
  const si = shotAt(t), S = SHOTS[si], K = S.keys;
  let a = K[0], b = K[K.length - 1], u = 0;
  if (t <= K[0][0]) { a = b = K[0]; } else if (t >= b[0]) { a = b; } else for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) { a = K[i]; b = K[i + 1]; u = eInOut((t - a[0]) / (b[0] - a[0])); break; }
  _cp.set(lerp(a[1][0], b[1][0], u), lerp(a[1][1], b[1][1], u), lerp(a[1][2], b[1][2], u));
  _ct.set(lerp(a[2][0], b[2][0], u), lerp(a[2][1], b[2][1], u), lerp(a[2][2], b[2][2], u));
  const fov = lerp(a[3], b[3], u), ap = lerp(a[4] || 0, b[4] || 0, u);
  // handheld micro motion + impacts
  let shake = 0; for (const [ti, amp] of IMPACTS) if (t >= ti) shake += amp * Math.exp(-(t - ti) * 9) * Math.sin((t - ti) * 70);
  const hd = S.hand;
  _cp.x += (Math.sin(t * 1.3) * 0.6 + Math.sin(t * 2.9 + 1) * 0.4) * hd + shake;
  _cp.y += (Math.sin(t * 1.7 + 2) * 0.6 + Math.sin(t * 3.7) * 0.4) * hd + shake * 0.7;
  return { si, fov, ap };
}

// ---------------- post ----------------
// no MSAA (FXAA at the end) and depth of field from the depth buffer of the main render: both are far cheaper on a CPU renderer
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
const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.45, 0.4, 1.6); composer.addPass(bloom);
const grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uFrame: { value: 0 }, uBlur: { value: 0 }, uDir: { value: new THREE.Vector2(0, 1) }, uFlash: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uFrame, uBlur, uFlash; uniform vec2 uDir; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){
      vec4 c = vec4(0.0);
      if (uBlur > 0.001) { for (int i = 0; i < 16; i++) { float o = (float(i) / 15.0 - 0.5) * uBlur; c += texture2D(tDiffuse, vUv + uDir * o); } c /= 16.0; }
      else c = texture2D(tDiffuse, vUv);
      vec2 q = vUv - 0.5; q.y *= 1.3;
      c.rgb *= mix(0.62, 1.0, smoothstep(0.92, 0.28, length(q)));
      c.rgb += (h(vUv * vec2(1080.0, 1920.0) + uFrame * 7.13) - 0.5) * 0.028;
      c.rgb += uFlash * vec3(0.06, 0.2, 0.2);
      gl_FragColor = c; }`,
});
composer.addPass(grade);
composer.addPass(new OutputPass());
const fxaa = new FXAAPass(); fxaa.setSize(W, H); composer.addPass(fxaa);

// ---------------- per frame ----------------
let T3 = null;
const _v = new THREE.Vector3(), _w = new THREE.Vector3();
// a point fixed in the shot's camera space at refT (sx, sy in -1..1 of the screen, depth in front of the lens), in world space
function screenAnchor(refT, sx, sy, depth) {
  const { fov } = cameraFor(refT);
  const tilt = new THREE.Group(); tilt.rotation.z = refT < 9.46 ? -Math.atan(0.08) : 0; tilt.updateMatrixWorld(true);
  const c = new THREE.PerspectiveCamera(fov, W / H); c.position.copy(tilt.localToWorld(_cp.clone())); c.lookAt(tilt.localToWorld(_ct.clone())); c.updateMatrixWorld(true);
  const hh = depth * Math.tan(THREE.MathUtils.degToRad(fov / 2)), hw = hh * (W / H);
  return { pos: c.localToWorld(V3(sx * hw, sy * hh, -depth)), hw };
}
function placeText(g, t, tin, tout, an, wfrac, yaw) {
  const on = t >= tin && t < tout;
  g.visible = on; if (!on) return;
  const pos = an.pos, scl = (wfrac * 2 * an.hw) / g.userData.w;
  const land = tin <= 0.001 ? 1 : seg(t, tin, tin + 0.42), leave = seg(t, tout - 0.18, tout);
  g.position.copy(pos).add(V3(0, (1 - eOut(land)) * 0.9, (1 - eOut(land)) * -2.2));
  g.scale.setScalar(scl * Math.max(0.001, (tin <= 0.001 ? 1 : eBack(land)) * (1 - eIn(leave))));
  g.lookAt(camera.position); g.rotateY(yaw + (1 - eOut(land)) * 0.6); g.rotateX(-0.06);
}

function renderAt(tIn) {
  if (!T3) return;
  const t = tIn >= LOOP ? 0 : tIn;
  const { si, fov, ap } = cameraFor(t);
  const S = SHOTS[si];
  const hook = t < 9.46;

  // rig tilt: 8 % slope (atan 0.08) in the hook, level afterwards; the bike rolls downhill to +x
  rig.rotation.z = hook ? -Math.atan(0.08) : 0;
  rig.updateMatrixWorld(true);
  // camera (bike space -> world)
  camera.fov = fov; camera.updateProjectionMatrix();
  camera.position.copy(rig.localToWorld(_cp.clone()));
  const tgtW = rig.localToWorld(_ct.clone());
  camera.up.set(0, 1, 0); camera.lookAt(tgtW);
  // whip pans across the cuts
  let blur = 0, dir = [0, 1];
  for (const wp of WHIPS) {
    if (t >= wp.t - 0.16 && t < wp.t) { const u = eIn(seg(t, wp.t - 0.16, wp.t)); wp.axis === "x" ? camera.rotateX(wp.amt * u) : camera.rotateY(wp.amt * u); blur = u * 0.09; dir = wp.dir; }
    if (t >= wp.t && t < wp.t + 0.2) { const u = 1 - eOut(seg(t, wp.t, wp.t + 0.2)); wp.axis === "x" ? camera.rotateX(-wp.amt * u) : camera.rotateY(-wp.amt * u); blur = u * 0.09; dir = wp.dir; }
  }
  backdrop.position.copy(camera.position);
  grade.uniforms.uBlur.value = blur; grade.uniforms.uDir.value.set(dir[0], dir[1]);

  // depth of field: focus on the look-at point
  const PF = window.__perf || {};
  bokeh.enabled = ap > 0.0005 && !PF.noDof; bloom.enabled = !PF.noBloom; key.castShadow = !PF.noShadow;
  bokeh.uniforms.focus.value = camera.position.distanceTo(tgtW);
  bokeh.uniforms.aperture.value = ap;

  // ---- wheels, road, crank ----
  const ang = angleAt(t), spd = keys(SPEED, t);
  FW.spin.rotation.z = -ang; RW.spin.rotation.z = -ang;
  FR.crank.rotation.z = -ang * 0.42;
  for (const w of [FW, RW]) { const bl = clamp01((spd - 0.25) / 0.6); w.blur.material.opacity = bl * 0.16; M.spoke.opacity = 1 - bl * 0.55; }
  roadTex.offset.x = ang / ROAD_TILE; // the bike stays put, the road streams under it (wheel radius 1)
  road.visible = floor.visible = true;

  // ---- hook: numbers, slope, empty brake, confetti ----
  placeText(T3.kg, t, 0.0, 3.42, T3.aKg, 0.56, -0.12);
  placeText(T3.kmh, t, 1.4, 3.42, T3.aKmh, 0.68, -0.12);
  placeText(T3.pct, t, 3.98, 5.45, T3.aPct, 0.34, -0.12);
  placeText(T3.watts, t, 11.44, 13.86, T3.aW, 0.58, -0.1);
  const slopeOn = t >= 3.6 && t < 5.6;
  drawOn(slopeLine, slopeOn ? eOut(seg(t, 3.6, 4.2)) : 0);
  levelLine.visible = slopeOn; levelLine.position.set(0, GROUND - 0.0 + 0.0, 1.45); levelLine.children.forEach((d, i) => { d.scale.setScalar(slopeOn ? eOut(seg(t, 3.75 + i * 0.012, 4.1 + i * 0.012)) : 0); });
  ghost.visible = t >= 6.3 && t < 8.3; M.ghost.opacity = 0.3 + 0.35 * (0.5 + 0.5 * Math.sin((t - 6.3) * 12)); ghost.scale.setScalar(1); ghostHalo.scale.setScalar(1 + 0.25 * Math.sin((t - 6.3) * 12));

  for (let i = 0; i < CONF_N; i++) {
    const age = t - 7.86 - hash(i * 2.3) * 0.08;
    if (age < 0 || age > 1.6 || t >= 8.3 + 0.0001 && si !== 1) { _m.makeScale(0, 0, 0); confMesh.setMatrixAt(i, _m); continue; }
    const vx = (hash(i * 3.7) - 0.5) * 2.2, vy = 1.8 + hash(i * 5.1) * 1.6, vz = (hash(i * 7.3) - 0.5) * 1.6 + 0.6;
    _p.copy(P_RIM).add(V3(vx * age, vy * age - 3.2 * age * age, vz * age)); rig.localToWorld(_p);
    _e.set(age * (6 + hash(i) * 8), age * 5 + i, age * 3); _q.setFromEuler(_e); _m.compose(_p, _q, _s.setScalar(1 - seg(age, 1.1, 1.6))); confMesh.setMatrixAt(i, _m);
  }
  confMesh.instanceMatrix.needsUpdate = true;

  // speed streaks in the hook
  for (let i = 0; i < STREAK_N; i++) {
    const on = hook && t < 8.3, L = 22, x = 11 - ((t * OMEGA * spd * 1.7 + hash(i * 1.3) * L) % L);
    _p.set(x, -0.6 + hash(i * 2.9) * 3.6, -2.2 + hash(i * 4.1) * 3.4);
    _m.compose(_p, _q.identity(), _s.set(on ? 0.6 + hash(i * 6.1) : 0, 1, 1)); streakMesh.setMatrixAt(i, _m);
  }
  streakMesh.instanceMatrix.needsUpdate = true;

  // gauge (560 W)
  const gOn = t >= 9.5 && t < 13.88;
  gauge.visible = gOn;
  const gf = eInOut(seg(t, 9.75, 11.44));
  drawOn(gaugeFill, gOn ? gf : 0); gaugeTrack.visible = gOn;
  gaugeArc.getPoint(gf, gaugeHead.position); gaugeHead.scale.setScalar(gOn ? 1 + bump(t, 11.44, 0.5) * 1.4 : 0);

  // ---- shoe gag ("your shoes can't") ----
  const shoeOn = t >= 13.88 && t < 15.3;
  shoeGag.visible = shoeOn;
  if (shoeOn) {
    const drop = eOut(seg(t, 13.88, 13.98)), fly = eIn(seg(t, 14.85, 15.3));
    shoeGag.position.set(2.25 - fly * 2.6, GROUND + 0.02 + (1 - drop) * 0.7 + fly * 1.2 + Math.sin(t * 60) * 0.006, 0.55 + fly * 0.4);
    shoeGag.rotation.set(0, 0, 0.12 - fly * 2.2 + Math.sin(t * 47) * 0.02);
    rig.localToWorld(shoeGag.position);
  }
  shoePair.forEach((s, i) => {
    const tin = 55.72 + i * 0.12, on = t >= tin;
    s.visible = on; if (!on) return;
    const u = seg(t, tin, tin + 0.5), bounce = Math.abs(Math.sin(u * Math.PI * 2.2)) * Math.pow(1 - u, 2) * 0.5;
    const x = -0.15 + i * 0.5;
    s.position.set(x, 1.27 + x * 0.065 + 0.05 + (1 - eOut(seg(t, tin, tin + 0.18))) * 2.2 + bounce * 0.6, 0.0);
    s.rotation.set(0, i ? 0.2 : -0.15, 0.065 + (1 - eOut(u)) * 0.5); s.scale.setScalar(1.25);
  });

  // ---- rim brake ----
  const rbIn = seg(t, 15.92, 16.6), rbOut = seg(t, 31.96, 32.5);
  rimBrake.visible = t >= 15.92 && t < 32.5;
  if (rimBrake.visible) {
    const clamp = keys(RIM, t), open = (1 - clamp) * 0.085;
    rbArms.forEach((a, i) => { a.geometry = rimArmGeo(i ? 1 : -1, open); });
    rbPads.forEach((p, i) => { const s = i ? 1 : -1; p.position.copy(P_RIM).setZ(s * (0.064 + open)); });
    const fin = eBack(rbIn), fout = eIn(rbOut);
    rimBrake.position.set((1 - fin) * 0.6 + fout * 0.8, fout * 1.2, (1 - fin) * 1.6);
    rimBrake.rotation.set(0, 0, 0); rimBrake.scale.setScalar(Math.max(0.001, 1 - fout * 0.6));
  }
  const rh = keys(RIMHEAT, t);

  // ---- lever, master cylinder ----
  const lv = t >= 23.64; lever.visible = lv;
  if (lv) { const pop = eBack(seg(t, 23.64, 24.05)); lever.scale.setScalar(Math.max(0.001, pop)); blade.rotation.y = keys(LEVER, t) * 0.42; }
  master.visible = t >= 40.0;
  if (master.visible) { master.scale.setScalar(Math.max(0.001, eBack(seg(t, 40.0, 40.45)))); const push = keys(LEVER, t); plunger.position.z = lerp(0.085, -0.05, push); plungerRod.position.z = lerp(0.085, -0.05, push) + 0.08; fluidCol.scale.y = lerp(1, 0.4, push); fluidCol.position.z = lerp(0, -0.06, push); }

  // ---- rotors + caliper ----
  const sIn = seg(t, 31.96, 32.42), sOut = seg(t, 48.25, 48.65), bIn = seg(t, 48.64, 49.02);
  rotS.g.visible = t >= 31.96 && t < 48.65; rotS.g.position.z = ROTOR_Z + (1 - eOut(sIn)) * 1.4 + eIn(sOut) * 1.6; rotS.m.opacity = 1 - sOut;
  rotB.g.visible = t >= 48.64; rotB.g.position.z = ROTOR_Z + (1 - eOut(bIn)) * 1.6;
  const calR = lerp(ROTOR_S, ROTOR_B, eInOut(seg(t, 48.5, 49.0)));
  const cp = caliperPose(calR);
  caliper.visible = t >= 32.64;
  if (caliper.visible) {
    const sw = eBack(seg(t, 32.64, 33.0));
    caliper.position.copy(cp.p).add(V3(0, 0, (1 - sw) * 0.9)); caliper.rotation.set(0, 0, cp.rot + (1 - sw) * 1.4);
    const dc = keys(DISC, t), gap = (1 - dc) * 0.022;
    discPads.forEach((p, i) => { const s = i ? 1 : -1; p.position.set(0, -0.005, s * (0.02 + gap)); });
    pistons.forEach((p, i) => { const s = i ? 1 : -1; p.position.set(0, -0.005, s * (0.045 + gap)); });
    const xray = 1 - 0.65 * bump(t, 42.25, 2.3);
    M.caliper.opacity = xray; M.caliper.depthWrite = xray > 0.95;
  }
  calMount.visible = false;

  // ---- cables / hose ----
  rebuildLines(cp.p);
  drawOn(cableA, t < 22.62 ? 0 : t < 31.6 ? eInOut(seg(t, 22.62, 23.55)) : 0);
  M.housing.opacity = t >= 31.0 && t < 31.6 ? 1 - seg(t, 31.0, 31.6) : t >= 39.0 && t < 39.6 ? 1 - seg(t, 39.0, 39.6) : 1;
  cableA.visible = cableA.visible && t < 31.6;
  drawOn(cableB, t >= 33.0 && t < 39.6 ? eInOut(seg(t, 33.0, 33.9)) : 0);
  drawOn(hoseOuter, t >= 40.88 ? eInOut(seg(t, 40.88, 41.6)) : 0);
  drawOn(hoseFluid, t >= 41.0 ? eInOut(seg(t, 41.0, 41.95)) : 0);
  // stretching exposed wire (36.6 - 38.6)
  if (wireMesh) { bike.remove(wireMesh); wireMesh.geometry.dispose(); wireMesh = null; }
  if (t >= 33.9 && t < 39.6) {
    const P = cableBPts(cp.p), wc = crv(P.slice(6)), st = seg(t, 37.05, 37.6) * (1 - seg(t, 38.3, 38.6));
    const pts = []; for (let i = 0; i <= 16; i++) { const u = i / 16, p = wc.getPoint(u); const bulge = Math.sin(u * Math.PI); p.x -= bulge * st * 0.1; p.y -= bulge * st * 0.06; p.z += Math.sin(u * Math.PI * 4 + t * 32) * st * 0.01; pts.push(p); }
    wireMesh = tube(crv(pts), 40, 0.009 * (1 - st * 0.5), M.wire, 8); bike.add(wireMesh);
    const wf = t < 33.9 + 0.9 ? seg(t, 33.75, 33.95) : 1; wireMesh.scale.setScalar(1); if (wf < 1) drawOn(wireMesh, wf);
    M.wire.opacity = t >= 39.0 ? 1 - seg(t, 39.0, 39.6) : 1;
  }
  // pulse bead along the active line
  let pulse = null;
  const PULSES = [[25.78, 26.18, () => cableA, true, 1], [34.0, 34.4, () => cableB, false, 1], [37.05, 37.75, () => cableB, false, 0.62], [42.35, 43.05, () => hoseFluid, false, 1]];
  for (const [a0, a1, m, rev, max] of PULSES) if (t >= a0 && t < a1) { const u = eInOut(seg(t, a0, a1)) * max; pulse = { m: m(), u: rev ? 1 - u : u, fade: max < 1 ? 1 - seg(t, a1 - 0.25, a1) : 1 }; }
  pulseBead.visible = pulseHalo.visible = !!pulse;
  if (pulse) { pulse.m.geometry.parameters.path.getPoint(clamp01(pulse.u), pulseBead.position); pulseHalo.position.copy(pulseBead.position); pulseBead.scale.setScalar(pulse.fade); pulseHalo.scale.setScalar((1 + 0.3 * Math.sin(t * 40)) * pulse.fade); }

  // reach line ("can't reach the wheel")
  reach.visible = t >= 19.9 && t < 22.3;
  reach.children.forEach((d, i) => d.scale.setScalar(reach.visible ? eOut(seg(t, 19.9 + i * 0.03, 20.2 + i * 0.03)) * (1 - seg(t, 21.9, 22.3)) : 0));

  // ---- heat ----
  const hs = keys(HEAT_S, t), hb = keys(HEAT_B, t);
  const heatCol = (h) => h < 0.5 ? col("#000000").lerp(col("#d81e04"), h * 2) : col("#d81e04").lerp(col("#ff5a10"), (h - 0.5) * 2);
  rotS.m.emissive.copy(heatCol(hs)).multiplyScalar(lerp(0, 1.15, hs)); rotS.m.color.set("#cfd6de").multiplyScalar(1 - 0.85 * hs);
  rotB.m.emissive.copy(heatCol(hb)).multiplyScalar(lerp(0, 1.15, hb)); rotB.m.color.set("#cfd6de").multiplyScalar(1 - 0.85 * hb);
  const heat = Math.max(hs * (t < 48.65 ? 1 : 0), hb);
  heatLight.intensity = heat * 1.2; heatLight.position.copy(cp.p).add(V3(0.05, 0.05, 0.3));
  rig.localToWorld(heatLight.position);

  // ---- rain + wet rim ----
  const rain = keys(RAIN, t);
  for (let i = 0; i < RAIN_N; i++) {
    const vis = hash(i * 1.1) < rain;
    const span = 4.2, y = 2.6 - ((t * 3.2 + hash(i * 2.2) * span) % span);
    _p.set(0.2 + hash(i * 3.3) * 2.8 + y * 0.12, y, -1.4 + hash(i * 4.4) * 2.3);
    _m.compose(_p, _q.setFromEuler(_e.set(0, 0, 0.12)), _s.setScalar(vis ? 1 : 0)); rainMesh.setMatrixAt(i, _m);
  }
  rainMesh.instanceMatrix.needsUpdate = true;
  const wet = keys(WET, t);
  for (let i = 0; i < DROP_N; i++) {
    const a = hash(i * 7.7) * Math.PI * 2, side = i % 2 ? 1 : -1, rr = 0.79 + hash(i * 8.8) * 0.06, sz = (0.008 + hash(i * 9.9) * 0.012) * wet;
    _p.set(Math.cos(a) * rr, Math.sin(a) * rr, side * 0.042); _m.compose(_p, _q.identity(), _s.set(sz, sz * 1.15, sz * 0.6)); dropMesh.setMatrixAt(i, _m);
  }
  dropMesh.instanceMatrix.needsUpdate = true;

  // ---- particles ----
  ADD.begin(); SOFT.begin();
  const contactRim = P_RIM.clone();
  // shoe scrape: rubber smoke and dust streaming back
  emit(SOFT, t, { t0: 13.97, t1: 14.9, n: 70, life: 0.9, org: V3(2.25, GROUND + 0.06, 0.55), vel: [-2.6, 0.6, 0.1], spr: [1.0, 0.7, 0.8], drag: 1.6, s0: 0.2, s1: 0.9, col: cSmoke, a: 0.75, seed: 11, local: rig });
  emit(SOFT, t, { t0: 13.97, t1: 14.9, n: 60, life: 0.4, org: V3(2.3, GROUND + 0.03, 0.55), vel: [-4.5, 0.9, 0], spr: [1.5, 1.2, 1.0], g: -6, s0: 0.025, s1: 0.015, col: cDust, a: 0.9, seed: 12, local: rig });
  // rim pad: rubber dust and a faint heat haze
  emit(SOFT, t, { t0: 17.4, t1: 19.3, n: 40, life: 0.9, org: contactRim.clone().setZ(0.08), vel: [-0.6, 0.3, 0.25], spr: [0.4, 0.3, 0.3], drag: 1.2, s0: 0.05, s1: 0.22, col: cDust, a: 0.5, seed: 21 });
  emit(SOFT, t, { t0: 26.2, t1: 26.9, n: 16, life: 0.8, org: contactRim.clone().setZ(0.08), vel: [-0.5, 0.3, 0.25], spr: [0.4, 0.3, 0.3], drag: 1.2, s0: 0.05, s1: 0.2, col: cDust, a: 0.45, seed: 22 });
  // wet rim: spray from the pads, the wheel keeps turning
  emit(ADD, t, { t0: 29.0, t1: 30.85, n: 160, life: 0.55, org: contactRim.clone().setZ(0.05), vel: [-1.2, 1.1, 0.5], spr: [1.0, 0.9, 0.8], g: -5, s0: 0.022, s1: 0.012, col: cSpray, a: 0.55, seed: 31 });
  // splashes of rain on the tyre top
  emit(ADD, t, { t0: 27.7, t1: 33.8, n: 120, life: 0.3, org: (b, k) => F.clone().add(V3(Math.cos(1.2 + hash(k) * 0.9) * 1.0, Math.sin(1.2 + hash(k) * 0.9) * 1.0, (hash(k * 3) - 0.5) * 0.12)), vel: [0, 0.7, 0], spr: [0.8, 0.5, 0.6], g: -6, s0: 0.016, s1: 0.008, col: cSpray, a: 0.5, seed: 33 });
  // disc clamp: a short bright kiss of sparks? no: clean dry stop, only a few glints
  emit(ADD, t, { t0: 34.45, t1: 34.8, n: 14, life: 0.25, org: cp.p.clone(), vel: [-0.8, 0.4, 0.4], spr: [0.6, 0.6, 0.4], s0: 0.02, s1: 0.01, col: cWhite, a: 0.6, seed: 41 });
  // cable drag: friction glints at the housing stop
  emit(ADD, t, { t0: 37.1, t1: 38.2, n: 40, life: 0.3, org: (b) => cableBPts(cp.p)[6], vel: [0.2, 0.5, 0.3], spr: [0.8, 0.8, 0.6], g: -3, s0: 0.022, s1: 0.01, col: cSpark, a: 0.7, seed: 51 });
  // cable dissolves into teal dust
  emit(ADD, t, { t0: 39.0, t1: 39.6, n: 140, life: 0.7, org: (b, k) => cableB.geometry.parameters.path.getPoint(hash(k * 1.9)), vel: [0, 0.3, 0.2], spr: [0.5, 0.5, 0.5], drag: 2, s0: 0.03, s1: 0.0, col: cTeal, a: 0.8, seed: 61 });
  // heat: rising shimmer + glowing flecks off the rotor and pads
  const rotC = F.clone().setZ(ROTOR_Z + 0.03);
  const hsMod = (b) => keys(HEAT_S, b), hbMod = (b) => keys(HEAT_B, b);
  emit(ADD, t, { t0: 45.6, t1: 48.6, n: 220, life: 0.9, org: (b, k) => rotC.clone().add(V3(Math.cos(hash(k) * 6.28) * ROTOR_S * 0.9, Math.sin(hash(k) * 6.28) * ROTOR_S * 0.9, 0)), vel: [0, 0.9, 0.1], spr: [0.3, 0.3, 0.3], drag: 0.8, s0: 0.03, s1: 0.1, col: cHeat, a: 0.22, seed: 71, mod: hsMod });
  emit(ADD, t, { t0: 46.0, t1: 48.6, n: 90, life: 0.45, org: cp.p.clone(), vel: [-1.4, 0.8, 0.5], spr: [1.0, 1.0, 0.6], g: -4, s0: 0.022, s1: 0.01, col: cSpark, a: 0.5, seed: 72, mod: hsMod });
  emit(SOFT, t, { t0: 46.3, t1: 48.5, n: 40, life: 1.2, org: cp.p.clone().add(V3(0, 0.05, 0.05)), vel: [-0.3, 0.6, 0.2], spr: [0.3, 0.3, 0.3], drag: 0.8, s0: 0.08, s1: 0.4, col: cSmoke, a: 0.3, seed: 73, mod: hsMod });
  // bigger rotor: heat streams off its larger area and fades fast
  emit(ADD, t, { t0: 49.4, t1: 56.3, n: 380, life: 0.9, org: (b, k) => rotC.clone().add(V3(Math.cos(hash(k) * 6.28) * ROTOR_B * 0.9, Math.sin(hash(k) * 6.28) * ROTOR_B * 0.9, 0)), vel: [0, 1.1, 0.15], spr: [0.5, 0.4, 0.4], drag: 0.9, s0: 0.03, s1: 0.12, col: cHeat, a: 0.2, seed: 81, mod: hbMod });
  // payoff: a soft teal shimmer on the reveal
  emit(ADD, t, { t0: 51.34, t1: 51.8, n: 60, life: 0.9, org: (b, k) => V3(-2 + hash(k) * 4.6, -0.8 + hash(k * 2) * 2.6, (hash(k * 3) - 0.5) * 1.2), vel: [0, 0.4, 0], spr: [0.2, 0.2, 0.2], drag: 1, s0: 0.03, s1: 0.0, col: cTeal, a: 0.6, seed: 91 });
  ADD.end(); SOFT.end();

  // visibility per shot (keeps the frame clean)
  rainMesh.visible = rain > 0.001;
  const flash = bump(t, 11.44, 0.35) * 0.12 + bump(t, 51.34, 0.45) * 0.18 + bump(t, 1.4, 0.25) * 0.06 + bump(t, 3.98, 0.25) * 0.05;
  grade.uniforms.uFlash.value = flash;
  grade.uniforms.uFrame.value = Math.round(tIn * 30);
  bloom.strength = 0.42 + heat * 0.3;
  // light mood: cooler in the rain, warmer in the heat
  key.intensity = 1.9 * (1 - 0.45 * rain); rim.intensity = 2.0 * (1 + 0.4 * rain);
  backMat.uniforms.uGlow.value.set(lerp(0.01, 0.3, heat), lerp(0.07, 0.06, heat), lerp(0.09, 0.02, heat));
  composer.render();
}

// ---------------- boot ----------------
(async function boot() {
  try {
    const json = await new TTFLoader().loadAsync("assets/fonts/Outfit-Bold.ttf");
    FONT3D = new Font(json);
    T3 = { kg: text3D("80 KG", 1), kmh: text3D("32 KM/H", 1), pct: text3D("8%", 1), watts: text3D("560 W", 1),
      aKg: screenAnchor(1.0, 0, 0.66, 10), aKmh: screenAnchor(1.0, 0, 0.42, 10), aPct: screenAnchor(4.4, -0.3, 0.42, 9), aW: screenAnchor(11.4, 0, 0.6, 7) };
  } catch (e) { console.error("font failed", e); }
  window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
  window.__cineRender = renderAt; // for quick local checks
  window.__cine = { bokeh, bloom, composer, renderer, key, scene };
  renderAt(0);
  window.__worldReady && window.__worldReady();
})();
