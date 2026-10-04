/* Shared pieces of the 3D films (three.js): the renderer and its post chain
 * (bloom, SMAA, grain and vignette), the bright studio, the extruded logo and
 * how it assembles, and the glossy service cards. Arabic stays HTML over the
 * canvas in each film, so it keeps Cairo's shaping. */
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const TX = window.TX;
const { E, p, lerp, clamp, px } = TX;
export const W = 1080, H = 1920;
const S = 0.01; // traced SVG units → scene units

// ------------------------------------------------------------------ helpers
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
/** Keyframed values: [[t, [a, b, c]], ...], eased between each pair. */
export function track(t, keys, ease = E.inOutSine) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, va] = keys[i], [b, vb] = keys[i + 1];
    if (t <= b) { const k = ease((t - a) / (b - a)); return va.map((v, j) => lerp(v, vb[j], k)); }
  }
  return keys[keys.length - 1][1];
}
function shapesFromD(d) {
  const data = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`);
  return data.paths.flatMap((path) => SVGLoader.createShapes(path));
}
export const lathe = (pts, seg = 72) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
export const mesh = (geo, mat, parent, pos) => { const m = new THREE.Mesh(geo, mat); if (pos) m.position.set(...pos); if (parent) parent.add(m); return m; };
export const glossy = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1, ...o });
export function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
export const radial = (inner, outer) => canvasTexture(256, 256, (g, w, h) => {
  const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  gr.addColorStop(0, inner); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
});

/** Additive points whose colours (and so brightness) are set every frame. */
export function sparkles(n, size) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size, map: radial('rgba(255,255,255,1)', 'rgba(255,255,255,0)'), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  return {
    pts,
    put(i, x, y, z, c, k) { pos.set([x, y, z], i * 3); col.set([c.r * k, c.g * k, c.b * k], i * 3); },
    commit() { geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true; },
  };
}

// -------------------------------------------------------- renderer + post
/** A WebGL canvas on the stage, with studio reflections to light the materials. */
export function makeRenderer(stage, { alpha = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(1);
  renderer.setSize(W, H);
  renderer.toneMapping = THREE.NeutralToneMapping; // keeps the brand hex values honest
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  stage.appendChild(canvas);
  px(canvas, { position: 'absolute', left: 0, top: 0, width: W, height: H });
  const envTex = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  return { renderer, envTex };
}

/** Render → bloom → tone map → SMAA → grain and vignette. */
export function makePost(renderer, scene, camera) {
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType }));
  const renderPass = new RenderPass(scene, camera);
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.4, 0.55, 0.92);
  const grain = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uGrain: { value: 0.03 }, uVig: { value: 0.3 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime, uGrain, uVig; varying vec2 vUv;
      float hash(vec2 q){ q = fract(q*vec2(123.34, 456.21)); q += dot(q, q+45.32); return fract(q.x*q.y); }
      void main(){ vec4 c = texture2D(tDiffuse, vUv);
        c.rgb += (hash(vUv*vec2(1080.,1920.) + uTime*17.13) - 0.5) * uGrain;
        vec2 d = (vUv - 0.5) * vec2(0.5625, 1.0);
        c.rgb *= mix(1.0 - uVig, 1.0, smoothstep(0.62, 0.18, length(d)));
        gl_FragColor = c; }`,
  });
  composer.addPass(renderPass);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  composer.addPass(new SMAAPass());
  composer.addPass(grain);
  return { composer, renderPass, bloom, grain };
}

// ------------------------------------------------------ the bright studio
/** White cyclorama with a soft key that casts the logo's shadow, a fill and a sweep light. */
export function makeStudio(envTex, { alpha = false } = {}) {
  const scene = new THREE.Scene();
  scene.background = alpha ? null : new THREE.Color('#F2F3F8');
  scene.fog = new THREE.Fog('#F2F3F8', 10, 24);
  scene.environment = envTex;
  scene.environmentIntensity = 0.85;
  const camera = new THREE.PerspectiveCamera(40, W / H, 0.05, 80);
  scene.add(new THREE.HemisphereLight('#ffffff', '#cfd3e3', 0.85));
  const key = new THREE.DirectionalLight('#ffffff', 3.0);
  key.position.set(-3.5, 7.5, 5); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 7, bottom: -3, near: 1, far: 25 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  scene.add(key);
  const fill = new THREE.DirectionalLight('#dfe8ff', 0.55); fill.position.set(4, 3, 4); scene.add(fill);
  const sweep = new THREE.PointLight('#ffffff', 0, 8, 2); scene.add(sweep);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: '#F4F5F9', roughness: 0.92 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.visible = !alpha; scene.add(floor);
  return { scene, camera, sweep };
}

// ----------------------------------------------------------------- logo
/** One extruded mesh per logo shape, each pivoting on its own centre. */
export function buildLogo() {
  const L = TX.logo;
  const group = new THREE.Group();
  const parts = {};
  for (const k of L.order) {
    const part = L.parts[k];
    const [bx, by, bw, bh] = part.bbox;
    const cx = bx + bw / 2, cy = by + bh / 2;
    const letter = k[0] === 'l';
    const depth = letter ? 16 : 24;
    const geo = new THREE.ExtrudeGeometry(shapesFromD(part.d), {
      depth, bevelEnabled: true, curveSegments: 18, bevelSegments: 4,
      bevelThickness: letter ? 2.5 : 4, bevelSize: letter ? 1.4 : 2.6,
    });
    geo.translate(-cx, -cy, -depth / 2);
    const mesh = new THREE.Mesh(geo, glossy(part.color, letter ? { clearcoat: 0.6, roughness: 0.38 } : {}));
    mesh.scale.set(S, -S, S);
    mesh.castShadow = true;
    mesh.userData.home = V((cx - 540) * S, -(cy - 521.6) * S, 0);
    mesh.position.copy(mesh.userData.home);
    group.add(mesh);
    parts[k] = mesh;
  }
  return { group, parts };
}

/** The logo standing in the studio. assemble(t, at) flies the arms, torso and
 * legs in from `at`, raises the wordmark, and locks at `at + 3.2` with a bump
 * and a sweep of light. The head is the caller's to move. */
export function logoRig(scene, sweep) {
  const logo = buildLogo();
  logo.group.position.set(0, 1.72, 0);
  logo.group.scale.setScalar(0.46);
  scene.add(logo.group);
  const LP = logo.parts;
  const letters = TX.logo.order.filter((k) => k[0] === 'l').map((k) => LP[k]);
  const flights = {
    arms: { dt: 0, from: V(0, 1.3, -1.8), rot: V(-1.1, 0, 0) },
    torso: { dt: 0.35, from: V(0, -1.9, 1.3), rot: V(0.95, 0, 0) },
    legL: { dt: 0.7, from: V(-2.4, -0.7, 0.8), rot: V(0, -1.2, 0) },
    legR: { dt: 0.8, from: V(2.4, -0.7, 0.8), rot: V(0, 1.2, 0) },
  };
  return {
    logo, parts: LP,
    /** When each part lands, for the score. */
    hits: (at) => Object.values(flights).map((f) => at + f.dt),
    lock: (at) => at + 3.2,
    assemble(t, at) {
      for (const [k, f] of Object.entries(flights)) {
        const m = LP[k], kk = p(t, at + f.dt, 1.2, E.outExpo);
        m.visible = t >= at + f.dt;
        m.position.copy(m.userData.home).addScaledVector(f.from, 1 - kk);
        m.rotation.set(f.rot.x * (1 - kk), f.rot.y * (1 - kk), 0);
      }
      letters.forEach((m, i) => {
        const la = at + 1.95 + i * 0.06, kk = p(t, la, 0.9, E.outExpo);
        m.visible = t >= la;
        m.position.copy(m.userData.home).add(V(0, -0.9 * (1 - kk), 0.4 * (1 - kk)));
        m.rotation.set(1.4 * (1 - kk), 0, 0);
      });
      const lock = at + 3.2;
      const bump = 1 + 0.018 * Math.sin(Math.PI * p(t, lock, 0.45, E.linear));
      logo.group.scale.setScalar(0.46 * bump);
      const ks = p(t, lock - 0.2, 1.3, E.inOutSine);
      sweep.position.set(lerp(-3.2, 3.2, ks), 2.4, 1.3);
      sweep.intensity = 26 * Math.sin(Math.PI * ks);
    },
  };
}

// ---------------------------------------------------------------- cards
export function iconImage(name) {
  const svg = TX.icon(name, '#1B9CCE', 3).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" ');
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  return img;
}
function cardLabel(img, text) {
  return canvasTexture(1024, 280, (g, w, h) => {
    const s = 172, x = w - 40 - s, y = (h - s) / 2;
    g.fillStyle = 'rgba(27,156,206,.2)';
    g.beginPath(); g.roundRect(x, y, s, s, 46); g.fill();
    g.drawImage(img, x + 26, y + 26, s - 52, s - 52);
    g.fillStyle = '#FFFEFF';
    g.font = '700 104px Cairo';
    g.direction = 'rtl';
    g.textAlign = 'right';
    g.textBaseline = 'middle';
    g.fillText(text, x - 44, h / 2 + 8);
  });
}
/** Glossy navy cards with an icon and a white label, one per { icon, text }.
 * `ready` resolves once the icons have decoded and the labels are drawn. */
export function makeCards(scene, items) {
  const geo = new RoundedBoxGeometry(2.2, 0.62, 0.08, 5, 0.1);
  const mat = glossy('#1E2063', { roughness: 0.34, clearcoat: 0.7, clearcoatRoughness: 0.12, envMapIntensity: 0.35 });
  const icons = items.map((it) => iconImage(it.icon));
  const cards = items.map((it, i) => {
    const g = new THREE.Group();
    const box = new THREE.Mesh(geo, mat); box.castShadow = true; g.add(box);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.574), new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false }));
    face.position.z = 0.0412; g.add(face);
    g.userData = { face, i, text: it.text };
    scene.add(g);
    return g;
  });
  const ready = Promise.all(icons.map((im) => im.decode())).then(() => {
    cards.forEach((g) => { g.userData.face.material.map = cardLabel(icons[g.userData.i], g.userData.text); g.userData.face.material.needsUpdate = true; });
  });
  return { cards, ready };
}

// ------------------------------------------------------------- the door
export const DOOR = { wo: 2.9, ho: 4.1, wi: 2.5, hi: 3.9, gap: 0.008 };
/** An arch-topped opening of half-width r and height h, standing on y = 0. */
export function archPath(r, h, path = new THREE.Path()) {
  path.moveTo(-r, 0); path.lineTo(-r, h - r); path.absarc(0, h - r, r, Math.PI, 0, true); path.lineTo(r, 0); path.lineTo(-r, 0);
  return path;
}
function frameShape() {
  const { wo, ho, wi, hi } = DOOR, ro = wo / 2, ri = wi / 2, s = new THREE.Shape();
  s.moveTo(-ro, 0); s.lineTo(-ro, ho - ro); s.absarc(0, ho - ro, ro, Math.PI, 0, true); s.lineTo(ro, 0);
  s.lineTo(ri, 0); s.lineTo(ri, hi - ri); s.absarc(0, hi - ri, ri, 0, Math.PI, false); s.lineTo(-ri, 0); s.lineTo(-ro, 0);
  return s;
}
function leafShape(side) {
  const { hi, wi, gap } = DOOR, ri = wi / 2, s = new THREE.Shape();
  const a = Math.acos(gap / ri);
  if (side < 0) {
    s.moveTo(-ri, 0.03); s.lineTo(-ri, hi - ri); s.absarc(0, hi - ri, ri, Math.PI, Math.PI - a, true); s.lineTo(-gap, 0.03); s.lineTo(-ri, 0.03);
  } else {
    s.moveTo(ri, 0.03); s.lineTo(ri, hi - ri); s.absarc(0, hi - ri, ri, 0, a, false); s.lineTo(gap, 0.03); s.lineTo(ri, 0.03);
  }
  return s;
}
/** An arched Baghdadi double door with a lit room behind it. `wall: false` leaves out
 * the wide wall around the doorway, for a door set into a building. */
export function buildDoor({ wall = true } = {}) {
  const g = new THREE.Group();
  const { wo, ho, wi, hi } = DOOR, ri = wi / 2;
  const frameGeo = new THREE.ExtrudeGeometry(frameShape(), { depth: 0.2, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 48 });
  frameGeo.translate(0, 0, -0.05);
  const frame = new THREE.Mesh(frameGeo, new THREE.MeshPhysicalMaterial({ color: '#E9E6DF', roughness: 0.5, clearcoat: 0.3 }));
  g.add(frame);
  const leafMat = new THREE.MeshPhysicalMaterial({ color: '#23266B', roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.45 });
  const studMat = glossy('#1B9CCE', { roughness: 0.25 });
  const knobMat = glossy('#F4F2EC', { roughness: 0.2 });
  const studGeo = new THREE.SphereGeometry(0.03, 16, 12), knobGeo = new THREE.SphereGeometry(0.055, 20, 16);
  const leaves = [-1, 1].map((side) => {
    const hinge = new THREE.Group();
    hinge.position.set(side * ri, 0, 0.02);
    const geo = new THREE.ExtrudeGeometry(leafShape(side), { depth: 0.08, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 32 });
    geo.translate(-side * ri, 0, 0);
    hinge.add(new THREE.Mesh(geo, leafMat));
    const zf = 0.08 + 0.012;
    for (let c = 0; c < 3; c++) for (let r = 0; r < 6; r++) {
      const s = new THREE.Mesh(studGeo, studMat);
      s.position.set(-side * (0.3 + c * 0.3), 0.55 + r * 0.44, zf);
      hinge.add(s);
    }
    const knob = new THREE.Mesh(knobGeo, knobMat);
    knob.position.set(-side * (ri - 0.15), 1.75, zf + 0.02);
    hinge.add(knob);
    g.add(hinge);
    return hinge;
  });
  // The wall around the doorway, and the lit room behind it.
  if (wall) {
    const shape = new THREE.Shape();
    shape.moveTo(-9, 0); shape.lineTo(9, 0); shape.lineTo(9, 10); shape.lineTo(-9, 10); shape.lineTo(-9, 0);
    shape.holes.push(archPath(wo / 2 - 0.01, ho));
    g.add(new THREE.Mesh(new THREE.ShapeGeometry(shape, 48), new THREE.MeshStandardMaterial({ color: '#15163C', roughness: 0.95 })));
  }
  const room = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ map: radial('#ffffff', '#ffcf94'), color: new THREE.Color(2.1, 1.9, 1.55) }));
  room.position.set(0, 1.9, -3.4);
  g.add(room);
  // Light leaking round the closed leaves: someone is waiting outside.
  const leakMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 2.6, 1.8), transparent: true });
  const leakV = new THREE.Mesh(new THREE.PlaneGeometry(0.012, hi - 0.1), leakMat);
  leakV.position.set(0, (hi - 0.1) / 2 + 0.03, 0.125);
  const leakB = new THREE.Mesh(new THREE.PlaneGeometry(wi - 0.1, 0.05), leakMat);
  leakB.rotation.x = -Math.PI / 2;
  leakB.position.set(0, 0.004, 0.14);
  g.add(leakV, leakB);
  return { group: g, leaves, leakMat, room };
}

// ------------------------------------------------------------ lab tubes
export const TUBE = { r: 0.12, full: 0.9, red: 0.5, band: 0.022 };
/** A blood-sample tube; `fill(sep, left)` separates it into red cells, a white band and golden plasma. */
export function buildTube(mats) {
  const g = new THREE.Group();
  mesh(lathe([[0, 0], [0.07, 0.006], [0.11, 0.035], [0.13, 0.09], [0.132, 0.14], [0.132, 1.1], [0.142, 1.12]], 48), mats.glass, g);
  const red = mesh(lathe([[0, 0.014], [0.06, 0.02], [0.1, 0.045], [0.118, 0.09], [0.12, 0.13], [0.12, 1.0], [0, 1.0]], 40), mats.blood.clone(), g);
  const band = mesh(new THREE.CylinderGeometry(0.121, 0.121, TUBE.band, 40), mats.band.clone(), g);
  const gold = mesh(new THREE.CylinderGeometry(0.12, 0.12, 1, 40), mats.gold.clone(), g);
  /** sep: 0 = whole blood, 1 = separated; left: how much of the golden layer is still there. */
  const fill = (sep, left = 1) => {
    const redTop = lerp(TUBE.full, TUBE.red, sep);
    red.scale.y = redTop;
    band.visible = sep > 0.02;
    band.position.y = redTop + TUBE.band / 2;
    band.material.opacity = sep;
    const goldH = (TUBE.full - TUBE.red - TUBE.band) * sep * left;
    gold.visible = goldH > 0.004;
    gold.scale.y = Math.max(goldH, 0.001);
    gold.position.y = redTop + TUBE.band * sep + goldH / 2;
    gold.material.color.lerpColors(mats.blood.color, mats.gold.color, clamp(sep * 1.4));
    return { redTop, goldTop: redTop + TUBE.band * sep + goldH, goldH };
  };
  fill(0);
  return { g, fill };
}
