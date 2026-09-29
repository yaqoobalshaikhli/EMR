/* «ركبتك... من جوّه»: a 3D explainer, 47.5 s, 1080×1920. No faces, no names.
 * Script and voice-over: content/scripts/94-knee-from-inside.md.
 *
 * One object carries the film, the knee, so a medical idea stays easy to follow:
 *   0.0–3.6   the knee turns into the light; the doorbell, then a «طگ».
 *   3.6–9.0   inside the joint: the cartilage, a cushion that squeezes as it bends.
 *   9.0–15.0  walking in time-lapse: the cartilage thins, the bones meet, heat.
 *  15.0–20.5  a kilo lands on the thigh bone and arrives at the knee four times over.
 *  20.5–27.5  the treatment ladder, four steps; the camera flies into step ٣.
 *  27.5–33.2  the lab: a blood tube spins in a centrifuge, separates, and a
 *             syringe draws the golden plasma.
 *  33.2–37.5  the knee, see-through: an ultrasound fan guides the needle, the
 *             plasma spreads over the cartilage and the heat cools.
 *  37.5–47.5  white studio: the team as three cards, then the logo builds and
 *             locks on the doorbell.
 * Anatomy is stylised from simple solids (lathed shafts, ellipsoid condyles),
 * in bone ivory with the cartilage in the brand blue. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { W, H, track, glossy, canvasTexture, radial, makeRenderer, makePost, makeStudio, logoRig, makeCards } from '../three-kit.js';

const TX = window.TX;
const { E, p, env, lerp, clamp, el, set } = TX;
const NAVY = '#181943', PINK = '#EE396B', BLUE = '#1B9CCE';
const T = {
  bell: 0.35, crack: 1.7, inside: 3.6, wear: 9.0, weight: 15.0, drop: 16.0, ladder: 20.5,
  steps: [21.3, 22.7, 24.1, 25.5], lab: 27.5, spin: [28.9, 30.7], draw: 32.2, inject: 33.2,
  cut: 37.75, cards: 38.1, head: 40.2, build: 41.3, total: 47.5,
};
T.lock = T.build + 3.2;
const LAB = new THREE.Vector3(20, 0, 0);
const WALK = 0.8; // steps per second in the time-lapse
const walkPeaks = [0, 1, 2, 3, 4].map((n) => T.wear + 0.2 + (n + 0.5) / WALK);

// ------------------------------------------------------------------ helpers
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const lathe = (pts, seg = 72) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
const mesh = (geo, mat, parent, pos) => { const m = new THREE.Mesh(geo, mat); if (pos) m.position.set(...pos); if (parent) parent.add(m); return m; };
const glow = (hex, k) => new THREE.Color(hex).multiplyScalar(k);
/** Additive points whose colours (and so brightness) are set every frame. */
function sparkles(n, size) {
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
/** White text centred on a canvas, for the faces of the kilo cubes. */
const kiloFace = (text, bg) => canvasTexture(256, 256, (g, w, h) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = '#FFFEFF'; g.font = '700 92px Cairo'; g.direction = 'rtl';
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 6);
});

// ------------------------------------------------------------- the knee
const COND = { r: 0.24, x: 0.2, y: 0.27, z: -0.02, sx: 0.92, sy: 0.9, sz: 1.2 };
const CART = 0.045;
function buildKnee() {
  const boneMat = new THREE.MeshPhysicalMaterial({ color: '#EEE7D8', roughness: 0.46, clearcoat: 0.5, clearcoatRoughness: 0.35 });
  const cartMat = new THREE.MeshPhysicalMaterial({ color: '#58BEEA', roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08, transparent: true, opacity: 0.92, emissive: new THREE.Color('#0E5A80'), emissiveIntensity: 0.55 });
  const menMat = new THREE.MeshPhysicalMaterial({ color: '#DDEFF8', roughness: 0.3, clearcoat: 0.8, transparent: true, opacity: 0.95, emissive: new THREE.Color('#1B6F96'), emissiveIntensity: 0.25 });
  const patMat = boneMat.clone();
  const knee = new THREE.Group();
  // Thigh bone: a lathed shaft flaring into two ellipsoid condyles, each capped with cartilage.
  const femur = new THREE.Group(); knee.add(femur);
  mesh(lathe([[0, 0.2], [0.36, 0.22], [0.45, 0.32], [0.44, 0.46], [0.36, 0.66], [0.26, 0.98], [0.21, 1.5], [0.2, 2.2], [0.2, 2.62], [0.17, 2.82], [0.1, 2.9], [0, 2.92]]), boneMat, femur).scale.z = 0.8;
  const condGeo = new THREE.SphereGeometry(COND.r, 64, 40);
  const capGeo = new THREE.SphereGeometry(COND.r + CART, 64, 32, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.58);
  const caps = [-1, 1].map((s) => {
    const c = mesh(condGeo, boneMat, femur, [s * COND.x, COND.y, COND.z]);
    c.scale.set(COND.sx, COND.sy, COND.sz);
    return mesh(capGeo, cartMat, femur, [s * COND.x, COND.y, COND.z]);
  });
  const patella = mesh(new THREE.SphereGeometry(1, 48, 32), patMat, femur, [0, 0.45, 0.36]);
  patella.scale.set(0.16, 0.2, 0.075);
  // Shin: pivots on the condyles' centre, so the knee bends like a hinge.
  const pivot = new THREE.Group(); pivot.position.set(0, COND.y, COND.z); knee.add(pivot);
  const shin = new THREE.Group(); shin.position.set(0, -COND.y, -COND.z); pivot.add(shin);
  mesh(lathe([[0, -3.0], [0.17, -2.98], [0.18, -2.2], [0.19, -1.5], [0.23, -0.85], [0.32, -0.48], [0.43, -0.2], [0.46, -0.08], [0.44, -0.035], [0, -0.03]]), boneMat, shin).scale.z = 0.8;
  const plate = mesh(new THREE.CylinderGeometry(0.42, 0.43, 0.04, 72), cartMat, shin, [0, -0.02, 0]);
  plate.scale.z = 0.8;
  const menisci = [-1, 1].map((s) => {
    const g = new THREE.TorusGeometry(0.14, 0.03, 14, 56, Math.PI * 1.55);
    g.rotateX(Math.PI / 2);
    g.rotateY(s < 0 ? Math.PI * 1.775 : Math.PI * 0.775); // the open side faces the middle
    return mesh(g, menMat, shin, [s * 0.21, 0.004, -0.01]);
  });
  mesh(new THREE.CylinderGeometry(0.055, 0.065, 2.5, 24), boneMat, shin, [0.34, -1.72, -0.1]);
  mesh(new THREE.SphereGeometry(0.095, 32, 20), boneMat, shin, [0.34, -0.42, -0.1]);
  return { knee, femur, pivot, shin, caps, plate, menisci, patella, boneMat, patMat, cartMat, menMat };
}
/** How far the shin must slide so its plateau rides the (oval) condyle as it bends. */
function rideOffset(theta, capScale) {
  const ry = (COND.r + CART) * COND.sy * capScale, rz = (COND.r + CART) * COND.sz * capScale;
  const c = Math.cos(theta), s = Math.sin(theta);
  return 1 / Math.sqrt((c * c) / (ry * ry) + (s * s) / (rz * rz)) - ry;
}

// ------------------------------------------------------------ the ladder
function stepFace(step, i) {
  const chip = [BLUE, BLUE, PINK, '#5E6187'][i];
  return canvasTexture(1024, 250, (g, w, h) => {
    const d = 160, cx = w - 40 - d / 2;
    g.fillStyle = chip; g.beginPath(); g.arc(cx, h / 2, d / 2, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#FFFEFF'; g.font = '700 100px Cairo'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(step.n, cx, h / 2 + 8);
    g.direction = 'rtl'; g.textAlign = 'right';
    g.fillStyle = i === 3 ? 'rgba(255,254,255,.62)' : '#FFFEFF'; g.font = '700 86px Cairo';
    g.fillText(step.title, cx - d / 2 - 40, 86);
    g.fillStyle = i === 3 ? 'rgba(255,254,255,.45)' : 'rgba(255,254,255,.72)'; g.font = '500 54px Cairo';
    g.fillText(step.sub, cx - d / 2 - 40, 184);
  });
}
const STEP_AT = (i) => V(0, -0.1 + 0.62 * i, -0.5 - 0.9 * i);
function buildLadder(steps) {
  const group = new THREE.Group();
  const geo = new RoundedBoxGeometry(2.3, 0.62, 0.9, 4, 0.08);
  const items = steps.map((st, i) => {
    const g = new THREE.Group();
    const mat = glossy('#1E2063', { roughness: 0.34, clearcoat: 0.7, clearcoatRoughness: 0.12, envMapIntensity: 0.5, emissive: new THREE.Color(i === 2 ? PINK : BLUE), emissiveIntensity: 0 });
    mesh(geo, mat, g);
    const face = mesh(new THREE.PlaneGeometry(2.2, 0.537), new THREE.MeshBasicMaterial({ map: stepFace(st, i), transparent: true, toneMapped: false }), g, [0, 0, 0.452]);
    group.add(g);
    return { g, mat, face };
  });
  return { group, items };
}

// --------------------------------------------------------------- the lab
const TUBE = { r: 0.12, full: 0.9, red: 0.5, band: 0.022 };
function buildTube(mats) {
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
function buildSyringe(mats) {
  const g = new THREE.Group();
  const white = glossy('#F4F6FA', { roughness: 0.3 });
  mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.8, 40, 1, true), mats.glass, g, [0, 0.4, 0]);
  const fill = mesh(new THREE.CylinderGeometry(0.066, 0.066, 1, 32), mats.gold, g);
  const stopper = mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.035, 32), glossy('#2A2C3F'), g);
  const rod = mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.85, 16), white, g);
  const thumb = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 32), white, g);
  mesh(new RoundedBoxGeometry(0.32, 0.03, 0.12, 2, 0.01), white, g, [0, 0.8, 0]);
  mesh(new THREE.CylinderGeometry(0.02, 0.045, 0.08, 24), white, g, [0, -0.04, 0]);
  mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.55, 12), new THREE.MeshPhysicalMaterial({ color: '#D6DBE3', metalness: 0.9, roughness: 0.2 }), g, [0, -0.355, 0]);
  /** f: how much of the barrel (0.8 long) holds plasma. */
  const setFill = (f) => {
    fill.visible = f > 0.004;
    fill.scale.y = Math.max(f, 0.001); fill.position.y = f / 2;
    stopper.position.y = f + 0.0175;
    rod.position.y = f + 0.035 + 0.425;
    thumb.position.y = f + 0.035 + 0.86;
  };
  setFill(0);
  return { g, setFill, tip: V(0, -0.63, 0) };
}
function buildCentrifuge(mats) {
  const g = new THREE.Group(); g.position.copy(LAB);
  mesh(new THREE.CylinderGeometry(1.25, 1.38, 0.62, 72), glossy('#F2F4F8', { roughness: 0.35, clearcoat: 0.6 }), g, [0, 0.31, 0]);
  const rim = mesh(new THREE.TorusGeometry(1.22, 0.05, 16, 96), glossy(BLUE, { roughness: 0.25 }), g, [0, 0.62, 0]);
  rim.rotation.x = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(1.12, 1.12, 0.02, 72), new THREE.MeshStandardMaterial({ color: '#2A2D45', roughness: 0.6 }), g, [0, 0.6, 0]);
  const rotor = new THREE.Group(); rotor.position.y = 0.64; g.add(rotor);
  mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.06, 72), new THREE.MeshPhysicalMaterial({ color: '#AEB6C4', metalness: 0.85, roughness: 0.28 }), rotor);
  mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.16, 32), new THREE.MeshPhysicalMaterial({ color: '#8C94A3', metalness: 0.9, roughness: 0.25 }), rotor, [0, 0.08, 0]);
  const slots = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const holder = new THREE.Group();
    holder.position.set(0.62 * Math.cos(a), 0.04, 0.62 * Math.sin(a));
    holder.rotation.set(0, -a, -0.62); // tilted out, as in a fixed-angle rotor
    holder.scale.setScalar(0.55);
    rotor.add(holder);
    slots.push(holder);
    if (i) holder.add(buildTube(mats).g);
  }
  const blurTex = canvasTexture(512, 512, (c, w, h) => {
    const gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.42, 'rgba(0,0,0,0)');
    gr.addColorStop(0.56, 'rgba(150,35,50,.55)'); gr.addColorStop(0.8, 'rgba(210,215,225,.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
  });
  const blur = mesh(new THREE.CircleGeometry(1.0, 96), new THREE.MeshBasicMaterial({ map: blurTex, transparent: true, opacity: 0, depthWrite: false }), g, [0, 0.98, 0]);
  blur.rotation.x = -Math.PI / 2;
  return { g, rotor, slots, blur };
}

// ------------------------------------------------------ ultrasound probe
function buildProbe() {
  const g = new THREE.Group(); // local -y is where it looks; the fan spreads in local y–z
  mesh(new RoundedBoxGeometry(0.16, 0.46, 0.34, 4, 0.06), glossy('#F4F6FA', { roughness: 0.28 }), g, [0, 0.25, 0]);
  mesh(new RoundedBoxGeometry(0.17, 0.05, 0.35, 3, 0.02), glossy(BLUE, { roughness: 0.25 }), g, [0, 0.05, 0]);
  const cable = new THREE.CatmullRomCurve3([V(0, 0.48, 0), V(0, 0.8, 0.05), V(0, 1.1, 0.35), V(0, 1.2, 0.9)]);
  mesh(new THREE.TubeGeometry(cable, 32, 0.025, 10), new THREE.MeshStandardMaterial({ color: '#2A2C3F', roughness: 0.5 }), g);
  // The fan: a triangle fan in local y–z, drawn with moving scan lines and speckle.
  const R = 1.25, SEG = 48, SPAN = 0.45;
  const pos = [0, 0, 0], rad = [0], ang = [0], idx = [];
  for (let i = 0; i <= SEG; i++) {
    const a = -SPAN + (2 * SPAN * i) / SEG;
    for (const r of [0.5, 1]) { pos.push(0, -R * r * Math.cos(a), R * r * Math.sin(a)); rad.push(r); ang.push(a); }
  }
  for (let i = 0; i < SEG; i++) {
    const a0 = 1 + i * 2, a1 = a0 + 2;
    idx.push(0, a0, a1, a0, a0 + 1, a1, a1, a0 + 1, a1 + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('aR', new THREE.Float32BufferAttribute(rad, 1));
  geo.setAttribute('aA', new THREE.Float32BufferAttribute(ang, 1));
  geo.setIndex(idx);
  const fanMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uT: { value: 0 }, uO: { value: 0 } },
    vertexShader: `attribute float aR; attribute float aA; varying float vR; varying float vA;
      void main(){ vR = aR; vA = aA; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `uniform float uT, uO; varying float vR; varying float vA;
      float hash(vec2 q){ q = fract(q*vec2(123.34, 456.21)); q += dot(q, q+45.32); return fract(q.x*q.y); }
      void main(){
        float side = smoothstep(0.0, 0.07, ${SPAN.toFixed(2)} - abs(vA));
        float fall = smoothstep(1.0, 0.2, vR) * smoothstep(0.0, 0.06, vR);
        float scan = pow(0.5 + 0.5 * sin(vR * 55.0 - uT * 7.0), 8.0);
        float speck = hash(floor(vec2(vR * 140.0, vA * 110.0)) + floor(uT * 12.0));
        float a = uO * side * fall * (0.1 + 0.28 * scan + 0.16 * speck);
        gl_FragColor = vec4(vec3(0.35, 0.8, 1.0) * 1.5, a); }`,
  });
  const fan = new THREE.Mesh(geo, fanMat);
  g.add(fan);
  return { g, fanMat };
}

// ------------------------------------------------------------------ score
/* A minor inside the worn knee, C major for the way out, on the film's own
 * clock (src/score.js). The doorbell (E5 → C5) is mixed on top by the renderer
 * at the start and on the lock. */
function composeScore() {
  const k = TX.score.kit(T.total);
  // The hook: a dark bed, the doorbell, then the knee cracks.
  k.air(0, 9.2, 0.03, 420);
  k.pad(['A2', 'E3', 'G3', 'C4'], 0.2, 3.8, { attack: 2.2, release: 1.5, vol: 0.05, from: 250, to: 600 });
  k.sub('A1', 0.4, 3.6, 0.05);
  k.crack(T.crack, 0.32);
  // Inside: a curious pluck over the slow bend, a glint as the cartilage lights.
  k.pad(['A2', 'E3', 'B3', 'C4', 'E4'], T.inside, T.wear, { attack: 1.4, release: 1.2, vol: 0.055, from: 500, to: 1500 });
  k.sub('A1', 3.8, 8.8, 0.045);
  const pluck = ['A4', 'C5', 'E5', 'B4', 'A4', 'E5', 'C5', 'B4'];
  for (let i = 0, t = 4.4; t < 8.9; i++, t += 0.45) k.piano(pluck[i % 8], t, { vel: i % 4 ? 0.07 : 0.1, decay: 1.4, pan: i % 2 ? 0.3 : -0.3, send: 0.5 });
  k.shimmer(4.9, 0.03, 10, 0.8);
  // Wear: a low drone, a grind on every step, cracks as the bones meet.
  k.pad(['A2', 'E3', 'F3', 'C4'], T.wear, T.weight, { attack: 1.0, release: 0.8, vol: 0.06, from: 300, to: 900 });
  k.sub('A1', T.wear, 14.8, 0.055);
  k.grind(T.wear + 0.2, 14.9, WALK, 0.09);
  walkPeaks.slice(1, 4).forEach((t) => k.crack(t, 0.18));
  for (let t = T.wear + 0.2; t < 14.9; t += 1 / WALK) k.kick(t, 0.18);
  k.riser(13.6, T.weight, 0.14);
  // Weight: the kilo lands, the pulse runs down the bone, four hits count to ٤.
  k.pad(['F2', 'C3', 'A3', 'E4'], 15.2, 20.4, { attack: 1.2, release: 1.0, vol: 0.055, from: 500, to: 1300 });
  k.sub('F1', 15.4, 20.2, 0.05);
  k.whoosh(15.35, 0.7, 0.12, 0, 0);
  k.impact(T.drop, 0.4, 0.4);
  k.whoosh(T.drop, 0.55, 0.08, 0, 0);
  ['A4', 'C5', 'E5', 'A5'].forEach((n, i) => { k.tom(16.8 + i * 0.22, 0.22, -0.3 + i * 0.2); k.piano(n, 16.8 + i * 0.22, { vel: 0.13, decay: 1.8 }); });
  // The ladder: C major, a rising note per step; step ٤, the last resort, lower and softer.
  k.pad(['C3', 'G3', 'E4', 'G4'], T.ladder, 26.4, { attack: 1.2, release: 1.0, vol: 0.06, from: 700, to: 2200 });
  k.sub('C2', 20.6, 26.2, 0.05);
  [['C5', 0.16], ['E5', 0.16], ['G5', 0.17], ['A4', 0.1]].forEach(([n, v], i) => { k.piano(n, T.steps[i], { vel: v, decay: 3 }); k.whoosh(T.steps[i] - 0.25, 0.5, 0.05, 0.3, -0.3); });
  for (let t = T.steps[0]; t < 26.3; t += 0.7) k.kick(t, 0.16);
  k.riser(26.2, T.lab - 0.15, 0.26);
  k.shimmer(T.lab - 0.2, 0.05, 16, 0.6);
  // The lab: a soft landing in the gold flash, a light pulse, the centrifuge, the layers, the draw.
  k.impact(T.lab - 0.1, 0.25, 0);
  k.pad(['D3', 'A3', 'F4', 'C5'], T.lab - 0.3, 33.1, { attack: 0.4, release: 0.8, vol: 0.055, from: 900, to: 2000 });
  k.sub('D2', 27.6, 32.9, 0.045);
  for (let t = 27.6; t < 32.9; t += 0.45) k.tick(t, 0.018, 0.2);
  k.whoosh(28.2, 0.7, 0.07);
  k.spin(T.spin[0], T.spin[1], 0.12);
  k.shimmer(31.0, 0.05, 20, 0.8);
  ['F5', 'A5', 'C6'].forEach((n, i) => k.piano(n, 31.0 + i * 0.14, { vel: 0.1, decay: 2.2 }));
  k.riser(T.draw, 32.95, 0.08);
  // The injection: sonar pings, the needle in, the heat cools.
  k.whoosh(32.95, 0.6, 0.1);
  k.pad(['F2', 'C3', 'A3', 'E4', 'G4'], T.inject, 37.0, { attack: 1.0, release: 1.2, vol: 0.065, from: 600, to: 2400 });
  k.sub('F1', 33.3, 36.8, 0.05);
  for (let t = 33.5; t < 36.4; t += 0.6) k.ping(t, 0.05);
  k.piano('C5', 34.4, { vel: 0.12, decay: 2.5 });
  k.piano('E5', 34.62, { vel: 0.11, decay: 2.5 });
  k.shimmer(35.0, 0.04, 22, 1.4);
  k.riser(36.2, T.cut - 0.05, 0.22);
  // Home: the white studio, C major, a note per card.
  k.impact(T.cut, 0.2, 0);
  k.shimmer(T.cut, 0.05, 18, 0.9);
  k.pad(['C4', 'G4', 'D5', 'E5'], T.cut, 40.3, { attack: 0.35, release: 0.9, vol: 0.05, from: 1400, to: 2600, send: 0.5 });
  k.sub('C2', 37.9, 40.0, 0.045);
  ['G4', 'C5', 'E5'].forEach((n, i) => k.piano(n, T.cards + i * 0.4, { vel: 0.18, decay: 3, pan: 0.2 }));
  // The logo: F, then G suspended and resolved, a hit per part, a sparkle for the letters.
  k.whoosh(T.head + 0.05, 1.0, 0.08, 0, 0);
  k.pad(['F2', 'C3', 'A3', 'E4', 'G4'], 40.2, 41.6, { attack: 0.8, release: 0.8, vol: 0.06, from: 600, to: 1500 });
  k.pad(['G2', 'D3', 'G3', 'C4', 'D4'], 41.3, 43.2, { attack: 1.0, release: 0.5, vol: 0.07, from: 600, to: 1800 });
  k.pad(['G2', 'D3', 'G3', 'B3', 'D4'], 43.2, T.lock - 0.05, { attack: 0.4, release: 0.1, vol: 0.08, from: 1800, to: 3200 });
  k.sub('G1', 41.4, T.lock - 0.1, 0.055);
  [0, 0.35, 0.7, 0.8].forEach((dt, i) => k.tom(T.build + dt, 0.3 + i * 0.02, [-0.3, 0.1, -0.4, 0.4][i]));
  ['G5', 'A5', 'C6', 'D6', 'E6', 'G6', 'A6'].forEach((n, i) => k.piano(n, T.build + 2.0 + i * 0.06, { vel: 0.06, decay: 1.2, pan: -0.4 + i * 0.13 }));
  k.riser(42.5, T.lock, 0.22);
  // The lock: the logo lands with the doorbell and the film comes home to C.
  k.impact(T.lock, 0.8);
  k.pad(['C2', 'G2', 'C3', 'G3', 'D4', 'E4'], T.lock, 46.2, { attack: 0.25, release: 1.2, vol: 0.08, from: 900, to: 2400 });
  k.sub('C2', T.lock, 46.0, 0.07);
  k.shimmer(T.lock + 0.1, 0.045, 16, 1.1);
  return k.render();
}

// ---------------------------------------------------------------- template
TX.register('knee-3d', {
  size: [W, H],
  fps: 30,
  build(stage, P, ctx) {
    const { renderer, envTex } = makeRenderer(stage);
    const rng = TX.rng(94);

    // ============================== scene K: dark anatomy studio and the lab
    const K = new THREE.Scene();
    K.background = canvasTexture(540, 960, (g, w, h) => {
      const gr = g.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h * 0.42, h * 0.7);
      gr.addColorStop(0, '#1C1F5A'); gr.addColorStop(0.55, '#0E1036'); gr.addColorStop(1, '#06071A');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
    K.environment = envTex;
    K.environmentIntensity = 0.4;
    const camK = new THREE.PerspectiveCamera(40, W / H, 0.02, 80);
    K.add(new THREE.HemisphereLight('#8fa6ff', '#0b0c26', 0.35));
    const key = new THREE.SpotLight('#fff3e6', 60, 20, 0.5, 0.8, 2); key.position.set(-3, 5, 5); K.add(key, key.target);
    const rim = new THREE.PointLight('#4db8ff', 12, 8, 2); rim.position.set(2.5, 1.5, -2.5); K.add(rim);
    const fill = new THREE.DirectionalLight('#c9d6ff', 0.6); fill.position.set(4, 1, 3); K.add(fill);
    const labKey = new THREE.SpotLight('#ffffff', 90, 25, 0.5, 0.8, 2); labKey.position.copy(LAB).add(V(-2, 6, 5)); labKey.target.position.copy(LAB).add(V(0, 0.8, 0)); K.add(labKey, labKey.target);
    const heatLight = new THREE.PointLight('#ff6a3d', 0, 2.5, 2); heatLight.position.set(0.35, 0.05, 0.45); K.add(heatLight);

    const kn = buildKnee(); K.add(kn.knee);
    const hotTex = radial('rgba(255,150,90,1)', 'rgba(255,60,30,0)');
    const hot = [-1, 1].map((s) => {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: hotTex, color: new THREE.Color(2.4, 1.0, 0.45), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true }));
      sp.position.set(s * 0.2, 0.0, 0.05); K.add(sp); return sp;
    });
    const ringMat = new THREE.MeshBasicMaterial({ color: glow(PINK, 2.2), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const rings = [0, 1, 2, 3].map(() => mesh(new THREE.TorusGeometry(1, 0.01, 8, 160), ringMat.clone(), K));
    const sparks = sparkles(4 * 24, 0.045); K.add(sparks.pts);
    const sparkSeeds = Array.from({ length: 4 * 24 }, () => [rng() * 2 - 1, 0.4 + rng() * 1.4, rng() * 1.5, rng() < 0.5 ? -1 : 1]);
    const bursts = [T.crack, ...walkPeaks.slice(1, 4)];

    // The kilo, and the four it becomes at the knee.
    const kiloGeo = new RoundedBoxGeometry(0.42, 0.42, 0.42, 4, 0.05);
    const kiloTex = kiloFace(P.kilo, '#1E2063'), fourTex = kiloFace(P.kilo, PINK);
    const kilo = mesh(kiloGeo, glossy('#FFFFFF', { map: kiloTex, roughness: 0.34, clearcoat: 0.7 }), K);
    const fourMat = glossy('#FFFFFF', { map: fourTex, roughness: 0.3, clearcoat: 0.8 });
    const right = V(0.78, 0, -0.62).normalize(); // screen right in the weight shot
    const fours = [0, 1, 2, 3].map((i) => {
      const m = mesh(kiloGeo, fourMat, K);
      m.position.copy(V(0, 0.05, 0)).addScaledVector(right, 0.5 + (i % 2) * 0.47).add(V(0, -0.22 + (i >> 1) * 0.47, 0)).addScaledVector(V(0.62, 0.1, 0.78), 0.55);
      m.lookAt(m.position.clone().add(V(0.62, 0, 0.78)));
      return m;
    });
    const pulse = mesh(new THREE.TorusGeometry(0.3, 0.022, 10, 80), new THREE.MeshBasicMaterial({ color: glow(PINK, 2.4), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), K);
    pulse.rotation.x = Math.PI / 2;

    const ladder = buildLadder(P.steps); K.add(ladder.group);

    const mats = {
      glass: new THREE.MeshPhysicalMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.22, roughness: 0.05, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide }),
      blood: new THREE.MeshPhysicalMaterial({ color: '#8E1426', roughness: 0.25, clearcoat: 0.6, emissive: new THREE.Color('#3a0008'), emissiveIntensity: 0.4 }),
      band: new THREE.MeshPhysicalMaterial({ color: '#F4F2EE', roughness: 0.4, transparent: true }),
      gold: new THREE.MeshPhysicalMaterial({ color: '#F3B544', roughness: 0.2, clearcoat: 0.8, transparent: true, opacity: 0.9, emissive: new THREE.Color('#8A5A00'), emissiveIntensity: 0.45 }),
    };
    const cf = buildCentrifuge(mats); K.add(cf.g);
    const hero = buildTube(mats); K.add(hero.g);
    const platelets = sparkles(46, 0.04); hero.g.add(platelets.pts);
    platelets.pts.material.depthTest = false; platelets.pts.renderOrder = 5;
    const plSeeds = Array.from({ length: 46 }, () => [rng() * 0.09, rng() * Math.PI * 2, rng(), rng() * 6.28]);
    const syr = buildSyringe(mats); K.add(syr.g);
    const probe = buildProbe(); K.add(probe.g);
    probe.g.position.set(0, 0.42, 0.66);
    probe.g.quaternion.setFromUnitVectors(V(0, -1, 0), V(0, -0.58, -0.81).normalize());
    const goldDots = sparkles(200, 0.05); K.add(goldDots.pts);
    goldDots.pts.material.depthTest = false; goldDots.pts.renderOrder = 5;
    const dotSeeds = Array.from({ length: 200 }, () => {
      const onPlate = rng() < 0.3, s = rng() < 0.5 ? -1 : 1;
      const th = rng() * Math.PI * 2, y = -(0.35 + rng() * 0.65), rr = Math.sqrt(1 - y * y);
      return { delay: rng() * 1.3, onPlate, s, dir: V(rr * Math.cos(th), y, rr * Math.sin(th) * 0.8 + 0.2), px: rng() * 0.72 - 0.36, pz: rng() * 0.5 - 0.25, tw: rng() * 6.28 };
    });

    // ================================ scene B: the studio, the team, the logo
    const { scene: B, camera: camB, sweep } = makeStudio(envTex);
    const { cards, ready: labelsDrawn } = makeCards(B, P.team);
    const rig = logoRig(B, sweep);
    const LP = rig.parts;

    const { composer, renderPass, bloom, grain } = makePost(renderer, K, camK);

    // ============================================== type, over the canvas
    const layer = () => el('div', 'layer', stage);
    const masked = (parent, text, cls, pos) => TX.text(parent, text, `col centered mask ${cls}`, pos);
    const rise = (words, t, at, o = {}) => TX.animWords(words, t, { at, stagger: o.stagger == null ? 0.08 : o.stagger, dur: o.dur || 0.8, y: o.y || 140, blur: 0, ease: E.outExpo, out: o.out, outDur: 0.45, outY: o.y || 140 });
    const typeK = layer();
    const tk = {
      hook: masked(typeK, P.hook, 't-hook', { top: 1420 }),
      cart: masked(typeK, P.cartilage, 't-hook', { top: 300 }),
      cartSub: masked(typeK, P.cartilageSub, 't-sub', { top: 1500 }),
      wear: masked(typeK, P.wear, 't-hook', { top: 300 }),
      wearSub: masked(typeK, P.wearSub, 't-sub', { top: 1500 }),
      weight: masked(typeK, P.weight, 't-hook-s', { top: 300 }),
      weightX: masked(typeK, P.weightX, 't-hook-s', { top: 300 }),
      weightSub: masked(typeK, P.weightSub, 't-sub', { top: 440 }),
      ladder: masked(typeK, P.ladder, 't-hook', { top: 250 }),
      prp: masked(typeK, P.prp, 't-hook', { top: 300 }),
      prpSub: masked(typeK, P.prpSub, 't-sub', { top: 1560 }),
      sonar: masked(typeK, P.sonar, 't-hook-s', { top: 300 }),
      prpNote: masked(typeK, P.prpNote, 't-sub', { top: 1560 }),
    };
    Object.values(tk).forEach((b) => { b.el.style.textShadow = '0 4px 30px rgba(5,6,26,.7)'; });
    tk.prpNote.el.style.fontSize = '40px';
    const typeB = layer();
    typeB.style.color = NAVY;
    const home = masked(typeB, P.home, 't-hook-s', { top: 300 });
    const tagline = masked(typeB, P.tagline, 't-hook-s', { top: 1300 });
    tagline.el.style.fontSize = '66px';
    const note = masked(typeB, P.note, 't-sub', { top: 1400 });
    Object.assign(note.el.style, { fontSize: '38px', color: 'rgba(24,25,67,.6)' });
    const strip = TX.C.strip(stage, ctx, ctx.brand.trustStrip);
    strip.el.style.color = 'rgba(24,25,67,.55)';
    const goldFlash = layer(); goldFlash.style.background = '#FFE7B8';
    const white = layer(); white.style.background = '#FFF9F0';

    const hits = [T.bell, T.bell + ctx.bell.second];
    const up = V(0, 1, 0), tmpQ = new THREE.Quaternion(), tmpV = new THREE.Vector3();
    const omega = (t) => 13 * env(t, T.spin[0], 0.6, T.spin[1] - 0.6, 0.6, E.inOutSine, E.inOutSine); // rad/s
    const rotorAngle = (t) => { let a = 0; const n = 120, t1 = Math.min(t, T.spin[1]); for (let i = 0; i < n; i++) { const tt = T.spin[0] + ((t1 - T.spin[0]) * (i + 0.5)) / n; a += (omega(tt) * (t1 - T.spin[0])) / n; } return t <= T.spin[0] ? 0 : a; };
    let texturesDrawn = false;

    function renderK(t) {
      const seg = t < T.ladder ? 'knee' : t < T.lab ? 'ladder' : t < T.inject ? 'lab' : 'inject';
      // ------------------------------------------------------ camera
      let cp, ct;
      if (seg === 'knee') {
        cp = track(t, [[0, [2.8, 1.3, 6.0]], [3.4, [2.0, 0.7, 4.6]], [5.0, [1.0, 0.15, 1.55]], [8.6, [0.85, 0.1, 1.3]], [9.8, [2.9, 0.35, 1.3]], [14.6, [3.0, 0.45, 0.7]], [15.6, [4.3, 1.6, 5.4]], [20.5, [4.1, 1.55, 5.1]]]);
        ct = track(t, [[0, [0, 0.25, 0]], [3.4, [0, 0.15, 0]], [5.0, [0.05, 0.03, 0]], [8.6, [0.05, 0.03, 0]], [9.8, [0, 0.05, 0]], [14.6, [0, 0.05, 0]], [15.6, [0, 1.1, 0]], [20.5, [0, 1.05, 0]]]);
      } else if (seg === 'ladder') {
        cp = track(t, [[T.ladder, [4.1, 1.55, 5.1]], [21.6, [0.9, 2.03, 4.95]], [25.8, [0.7, 2.1, 4.4]], [26.6, [0.65, 1.3, 1.6]], [T.lab, [0.8, 1.16, -1.05]]]);
        ct = track(t, [[T.ladder, [0, 1.05, 0]], [21.6, [0, 0.83, -1.85]], [25.8, [0, 0.95, -1.9]], [26.6, [0.4, 1.14, -1.85]], [T.lab, [0.78, 1.14, -1.85]]]);
      } else if (seg === 'lab') {
        cp = track(t, [[T.lab, [20.95, 1.85, 3.4]], [28.2, [21.0, 1.9, 3.5]], [28.9, [21.7, 3.4, 3.3]], [30.6, [21.2, 3.6, 3.0]], [31.3, [20.62, 1.55, 2.95]], [T.inject, [20.5, 1.5, 2.7]]]);
        ct = track(t, [[T.lab, [20, 1.45, 1.0]], [28.2, [20, 1.35, 0.8]], [28.9, [20, 0.75, 0]], [30.6, [20, 0.75, 0]], [31.3, [20, 1.3, 1.05]], [T.inject, [20, 1.3, 1.05]]]);
      } else {
        cp = track(t, [[T.inject, [3.3, 0.55, 3.25]], [T.cut, [3.0, 0.45, 2.9]]]);
        ct = track(t, [[T.inject, [0, 0.14, 0.28]], [T.cut, [0, 0.12, 0.28]]]);
      }
      camK.position.set(...cp);
      camK.lookAt(...ct);

      // ------------------------------------------------------ the knee
      const w = p(t, 9.6, 4.2, E.inOutSine); // wear
      const h = p(t, 35.0, 2.2, E.inOutSine); // the plasma settles in
      const walk = t >= 9.2 && t < 15 ? 0.5 * (0.5 - 0.5 * Math.cos(2 * Math.PI * WALK * (t - 9.2))) * p(t, 9.2, 0.3) * (1 - p(t, 14.5, 0.5)) : 0;
      let flex = 0.2 * Math.sin(Math.PI * clamp((t - T.crack) / 0.4))
        + (t >= 4.6 && t < T.wear ? 0.35 * (0.5 - 0.5 * Math.cos(2 * Math.PI * 0.28 * (t - 4.6))) * (1 - p(t, 8.4, 0.6)) : 0)
        + walk;
      if (seg === 'inject') flex = 0.12;
      const capScale = lerp(1, (COND.r + 0.008) / (COND.r + CART), w);
      kn.caps.forEach((c) => c.scale.set(COND.sx * capScale, COND.sy * capScale, COND.sz * capScale));
      kn.femur.position.y = -0.06 * w;
      kn.pivot.rotation.x = flex;
      kn.shin.position.y = -COND.y - rideOffset(flex, capScale);
      kn.plate.scale.y = lerp(1, 0.3, w) * (1 - 0.15 * (walk / 0.5) * (1 - w));
      kn.plate.position.y = lerp(-0.02, -0.026, w);
      kn.menisci.forEach((m) => m.scale.set(lerp(1, 0.72, w), lerp(0.65, 0.4, w), lerp(1, 0.72, w)));
      kn.cartMat.color.set('#58BEEA').lerp(new THREE.Color('#8C8F96'), w).lerp(new THREE.Color('#E8C77E'), 0.6 * h);
      kn.cartMat.emissive.set('#0E5A80').lerp(new THREE.Color('#C98A1E'), h);
      kn.cartMat.emissiveIntensity = lerp(lerp(0.55, 0.05, w), 0.55, h) * (1 + 0.6 * p(t, 4.6, 0.8) * (1 - p(t, 8.6, 0.6)));
      kn.menMat.color.set('#DDEFF8').lerp(new THREE.Color('#9FA3AA'), w);
      const fadeK = seg === 'ladder' ? 1 - p(t, T.ladder, 0.45) : 1;
      const boneO = (seg === 'inject' ? 0.26 : 1) * fadeK;
      kn.boneMat.color.set(seg === 'inject' ? '#D5E4F4' : '#EEE7D8'); // an X-ray look for the injection
      const patO = (seg === 'inject' ? 0 : 1 - p(t, T.inside, 0.8) + p(t, T.wear, 0.8)) * fadeK;
      for (const [m, o] of [[kn.boneMat, boneO], [kn.patMat, clamp(patO)], [kn.cartMat, 0.92 * fadeK], [kn.menMat, 0.95 * fadeK]]) {
        m.opacity = o;
        m.transparent = o < 0.999 || m === kn.cartMat || m === kn.menMat;
        m.depthWrite = o > 0.9;
      }
      kn.patella.visible = patO > 0.01;
      kn.knee.visible = (seg === 'knee' || seg === 'inject' || (seg === 'ladder' && fadeK > 0));
      kn.knee.position.y = seg === 'ladder' ? -2.2 * p(t, T.ladder, 0.6, E.inCubic) : 0;
      kn.knee.rotation.y = seg === 'knee' ? lerp(-0.7, 0, p(t, 0, 5.0, E.outCubic)) : 0;

      // Heat where the bones meet: a flash on the crack, then with every worn step.
      let heat = seg === 'knee' ? 0.9 * (t >= T.crack ? Math.exp(-(t - T.crack) * 4) : 0) : 0;
      if (seg === 'knee' && t >= T.wear) heat += w * (0.3 + 1.4 * walk);
      heat += env(t, 16.5, 0.08, 16.6, 1.2);
      if (seg === 'inject') heat = 0.75 * (1 - 0.8 * h);
      heat = clamp(heat) * fadeK;
      const hs = seg === 'inject' ? 0.6 : 1;
      hot.forEach((sp) => { sp.visible = kn.knee.visible && heat > 0.01; sp.material.opacity = heat * hs; sp.scale.setScalar((0.45 + 0.25 * heat) * hs); sp.position.y = kn.knee.position.y - 0.03 * w; });
      heatLight.intensity = seg === 'inject' ? 0 : 3 * heat;

      // Sparks on the crack and on the worn steps.
      bursts.forEach((b, bi) => {
        for (let j = 0; j < 24; j++) {
          const i = bi * 24 + j, [vx, vy, vz, s] = sparkSeeds[i], age = t - b;
          if (seg !== 'knee' || age < 0 || age > 0.7) { sparks.put(i, 0, -99, 0, ringMat.color, 0); continue; }
          sparks.put(i, s * 0.2 + vx * 0.9 * age, 0.02 + vy * age - 2.2 * age * age, 0.12 + vz * age, new THREE.Color(1.0, 0.55, 0.25), 2.2 * (1 - age / 0.7));
        }
      });
      sparks.commit();

      // The doorbell rings out from the joint.
      rings.forEach((r, i) => {
        const hit = hits[i >> 1], k = clamp((t - hit - (i % 2) * 0.16) / 1.4);
        r.visible = seg === 'knee' && k > 0 && k < 1;
        r.position.set(0, 0.05, 0.3);
        r.lookAt(camK.position);
        r.scale.setScalar(0.4 + k * 1.6);
        r.material.opacity = (1 - E.outQuad(k)) * 0.85;
      });

      // ------------------------------------------------------ weight
      const kf = p(t, 15.4, 0.6, E.inQuad);
      kilo.visible = t > 15.3 && t < 21.4;
      kilo.position.set(0, lerp(6.5, 3.13, kf) + 0.08 * Math.sin(Math.PI * clamp((t - T.drop) / 0.25)) + kn.knee.position.y, 0);
      kilo.rotation.set(0.25 * (1 - kf), 0.6 + 0.4 * (1 - kf), 0);
      const kp = p(t, T.drop, 0.55, E.inQuad);
      pulse.visible = t >= T.drop && t < T.drop + 0.6;
      pulse.position.set(0, lerp(2.9, 0.35, kp), 0);
      pulse.material.opacity = 1 - 0.5 * kp;
      fours.forEach((m, i) => {
        const k = p(t, 16.8 + i * 0.22, 0.35, E.outBack) * (1 - p(t, T.ladder, 0.5));
        m.visible = k > 0.001;
        m.scale.setScalar(Math.max(k, 0.001));
      });

      // ------------------------------------------------------ ladder
      ladder.group.visible = seg === 'ladder';
      ladder.items.forEach((it, i) => {
        const kr = p(t, 20.8 + i * 0.14, 0.9, E.outExpo);
        it.g.position.copy(STEP_AT(i)).add(V(0, -2.5 * (1 - kr), 0));
        const on = p(t, T.steps[i], 0.4) * (i === 3 ? 0.35 : 1);
        it.mat.emissiveIntensity = (i === 2 ? 0.5 : 0.28) * on + (i === 2 ? 0.4 * p(t, 26.2, 0.8) : 0);
        it.face.material.opacity = 0.35 + 0.65 * p(t, T.steps[i], 0.4);
      });

      // ------------------------------------------------------ lab
      cf.g.visible = hero.g.visible = seg === 'lab';
      const angle = rotorAngle(t);
      cf.rotor.rotation.y = angle;
      cf.blur.material.opacity = 0.85 * Math.pow(omega(t) / 13, 2);
      const sep = p(t, 30.95, 0.75, E.inOutCubic);
      const left = 1 - 0.65 * p(t, T.draw, 0.7, E.inOutSine);
      const lv = hero.fill(sep, left);
      const H0 = V(20, 0.9, 1.0), H1 = V(20, 0.75, 1.05);
      cf.g.updateMatrixWorld(true);
      const slot = cf.slots[0];
      slot.getWorldPosition(tmpV); slot.getWorldQuaternion(tmpQ);
      const kIn = p(t, 28.2, 0.7, E.inOutCubic), kOut = p(t, T.spin[1], 0.65, E.inOutCubic);
      if (t < T.spin[1]) {
        hero.g.position.lerpVectors(H0, tmpV, kIn);
        hero.g.quaternion.identity().slerp(tmpQ, kIn);
        hero.g.scale.setScalar(lerp(1, 0.55, kIn));
        if (kIn <= 0) hero.g.rotation.set(0, t * 0.8, 0);
      } else {
        hero.g.position.lerpVectors(tmpV, H1, kOut);
        hero.g.quaternion.copy(tmpQ).slerp(new THREE.Quaternion(), kOut);
        hero.g.scale.setScalar(lerp(0.55, 1, kOut));
      }
      platelets.pts.visible = sep > 0.5;
      plSeeds.forEach(([r, a, u, tw], i) => {
        const y = lv.redTop + TUBE.band + 0.02 + u * Math.max(0, TUBE.full - TUBE.red - TUBE.band - 0.04);
        const on = y < lv.goldTop - 0.01 ? 1 : 0;
        platelets.put(i, r * Math.cos(a + t * 0.3), y, r * Math.sin(a + t * 0.3), new THREE.Color(1.0, 0.92, 0.7), on * (1.2 + 0.8 * Math.sin(t * 5 + tw)) * p(t, 31.0, 0.5));
      });
      platelets.commit();

      // ------------------------------------------------------ syringe
      syr.g.visible = (seg === 'lab' && t > 31.5) || seg === 'inject';
      if (seg === 'lab') {
        const kd = p(t, 31.6, 0.55, E.outCubic), kl = p(t, 32.9, 0.3, E.inCubic);
        const tipY = H1.y + lerp(lv.goldTop + 1.4, lv.redTop + TUBE.band + 0.05, kd) + 1.2 * kl;
        syr.g.quaternion.identity();
        syr.g.scale.setScalar(1);
        syr.g.position.set(H1.x, tipY + 0.63, H1.z);
        syr.setFill(0.3 * p(t, T.draw, 0.7, E.inOutSine));
      } else if (seg === 'inject') {
        const target = V(0, 0.02, 0.2), body = V(0, -0.55, 0.83).normalize();
        const kin = p(t, 33.6, 0.7, E.outCubic), kback = p(t, 36.2, 0.6, E.inCubic);
        const tip = target.clone().addScaledVector(body, lerp(0.9, 0, kin) + 1.2 * kback);
        syr.g.quaternion.setFromUnitVectors(up, body);
        syr.g.scale.setScalar(0.65);
        syr.g.position.copy(tip).sub(syr.tip.clone().multiplyScalar(0.65).applyQuaternion(syr.g.quaternion));
        syr.setFill(lerp(0.3, 0.04, p(t, 34.5, 1.4, E.inOutSine)));
      }

      // ------------------------------------------------------ injection
      probe.g.visible = seg === 'inject';
      probe.fanMat.uniforms.uT.value = t;
      probe.fanMat.uniforms.uO.value = p(t, 33.35, 0.5) * (1 - p(t, 36.9, 0.6));
      const tipNow = V(0, 0.02, 0.2);
      dotSeeds.forEach((d, i) => {
        const k = p(t, 34.6 + d.delay, 0.9, E.outCubic);
        if (seg !== 'inject' || k <= 0) { goldDots.put(i, 0, -99, 0, ringMat.color, 0); return; }
        const cs = capScale;
        const target = d.onPlate ? V(d.px, -0.02, d.pz)
          : V(d.s * COND.x + d.dir.x * (COND.r + CART) * COND.sx * cs, COND.y - 0.06 * w + d.dir.y * (COND.r + CART) * COND.sy * cs, COND.z + d.dir.z * (COND.r + CART) * COND.sz * cs);
        const x = lerp(tipNow.x, target.x, k), y = lerp(tipNow.y, target.y, k), z = lerp(tipNow.z, target.z, k);
        const wob = 0.04 * Math.sin(k * Math.PI);
        goldDots.put(i, x + wob * Math.sin(i), y + wob, z, new THREE.Color(1.0, 0.78, 0.35), (k < 1 ? 2.2 : 1.0 + 0.4 * Math.sin(t * 3 + d.tw)) * (1 - p(t, 37.3, 0.4)));
      });
      goldDots.commit();

      // ------------------------------------------------------ post
      const kin = p(t, 36.6, 1.15, E.inExpo);
      bloom.strength = 0.4 + 0.3 * (seg === 'lab' ? 0.5 : 0) + 1.9 * kin;
      bloom.radius = 0.5;
      bloom.enabled = true;
      renderer.toneMappingExposure = 1 + 1.4 * kin;
      grain.uniforms.uGrain.value = 0.03;
      grain.uniforms.uVig.value = 0.32;
    }

    function renderB(t) {
      const cp = track(t, [[T.cut, [0.8, 2.3, 7.3]], [T.head, [-0.45, 2.45, 7.0]], [41.1, [0.35, 2.62, 4.4]], [42.1, [0.25, 2.6, 4.2]], [43.2, [1.3, 2.2, 5.8]], [44.6, [0, 1.62, 6.6]], [T.total, [0, 1.58, 6.15]]]);
      const ct = track(t, [[T.cut, [0, 2.45, -1.3]], [T.head, [0, 2.5, -1.4]], [41.1, [0.02, 2.45, 0]], [42.1, [0.02, 2.45, 0]], [43.2, [0, 2.0, 0]], [44.6, [0, 1.36, 0]], [T.total, [0, 1.34, 0]]]);
      camB.position.set(...cp);
      camB.lookAt(...ct);
      const arrive = (i) => T.cards + i * 0.4;
      cards.forEach((g) => {
        const i = g.userData.i, k = p(t, arrive(i), 0.75, E.outExpo);
        let d = 0;
        for (let j = i + 1; j < cards.length; j++) d += p(t, arrive(j), 0.75, E.outExpo);
        const kx = p(t, T.head + (cards.length - 1 - i) * 0.04, 0.8, E.inCubic);
        const bob = Math.sin(t * 1.1 + i) * 0.012;
        g.position.set(lerp(0.4, 0, k), lerp(0, 1.3, k) + d * 0.47 + bob + kx * 4.5 + 0.35, lerp(2.4, 0, k) - d * 0.5 - kx * 1.2);
        g.rotation.set(lerp(1.15, 0, k) - 0.03 * d - kx * 0.5, lerp(-0.3, 0, k) + 0.04 * Math.sin(t * 0.7 + i), 0);
        g.visible = k > 0 && kx < 1;
      });
      const homeP = LP.head.userData.home;
      const kd = p(t, T.head, 1.4, E.outCubic);
      LP.head.visible = t >= T.head;
      LP.head.position.set(homeP.x, lerp(homeP.y + 7, homeP.y, kd) + Math.sin(t * 1.3) * 0.02 * (1 - p(t, T.build, 1)), homeP.z);
      LP.head.rotation.set(0.12 * (1 - p(t, T.build, 2)), (1 - kd) * 4.2 + 0.42 * Math.sin(t * 0.7 - 1.2) * (1 - p(t, T.build, 2.2, E.inOutCubic)), 0);
      rig.assemble(t, T.build);
      bloom.strength = 1.8 * (1 - p(t, T.cut, 0.9, E.outCubic));
      bloom.enabled = bloom.strength > 0.002;
      renderer.toneMappingExposure = 1 + 1.4 * (1 - p(t, T.cut, 0.9, E.outCubic));
      grain.uniforms.uGrain.value = 0.02;
      grain.uniforms.uVig.value = 0.12;
    }

    return {
      duration: T.total,
      cover: 45.9,
      cues: [{ t: T.bell, sfx: 'doorbell' }, { t: T.lock, sfx: 'doorbell' }],
      bed: null,
      score: composeScore,
      ready: labelsDrawn.then(() => { texturesDrawn = true; }),
      render(t) {
        const inK = t < T.cut;
        renderPass.scene = inK ? K : B;
        renderPass.camera = inK ? camK : camB;
        grain.uniforms.uTime.value = Math.round(t * 30);
        if (inK) renderK(t); else renderB(t);
        if (texturesDrawn) composer.render();

        typeK.style.display = inK ? '' : 'none';
        typeB.style.display = inK ? 'none' : '';
        if (inK) {
          rise(tk.hook.words, t, T.crack + 0.2, { stagger: 0.14, out: 3.4 });
          rise(tk.cart.words, t, 5.0, { out: 8.6 });
          rise(tk.cartSub.words, t, 5.6, { y: 90, out: 8.6 });
          rise(tk.wear.words, t, 9.8, { stagger: 0.12, out: 14.6 });
          rise(tk.wearSub.words, t, 10.6, { y: 90, out: 14.6 });
          rise(tk.weight.words, t, 15.3, { out: 16.75 });
          rise(tk.weightX.words, t, 17.0, { stagger: 0.1, out: 20.2 });
          rise(tk.weightSub.words, t, 17.6, { y: 90, out: 20.2 });
          rise(tk.ladder.words, t, 20.9, { out: 26.4 });
          rise(tk.prp.words, t, 27.8, { stagger: 0.1, out: 32.9 });
          rise(tk.prpSub.words, t, 28.6, { y: 90, out: 32.9 });
          rise(tk.sonar.words, t, 33.8, { out: 36.9 });
          rise(tk.prpNote.words, t, 35.4, { y: 90, out: 36.9 });
        } else {
          rise(home.words, t, 38.3, { stagger: 0.1, out: T.head + 0.1 });
          rise(tagline.words, t, T.lock + 0.6, { stagger: 0.1 });
          rise(note.words, t, T.lock + 1.1, { y: 90 });
        }
        strip.render(t, T.lock + 1.4);
        set(goldFlash, { o: Math.max(env(t, 27.0, 0.45, T.lab, 0.45, E.inCubic, E.outCubic), env(t, 32.95, 0.25, T.inject, 0.4, E.inCubic, E.outCubic)) });
        set(white, { o: env(t, 37.0, 0.7, T.cut, 0.9, E.inCubic, E.outCubic) });
      },
    };
  },
});
