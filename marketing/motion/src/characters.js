/* The TabeebX cast: stylised 3D people built from simple solids, so any film
 * can pose and animate them. Each wears the campaign's pink lanyard with a
 * TabeebX badge. Faces are toy-like (dot eyes, a smile) so they can never pass
 * for a real patient, nurse or doctor.
 *   const c = buildCharacter(ROSTER.hakeem);  scene.add(c.group);
 *   c.arms.r.shoulder.rotation.z = -1.2;       // every joint is a Group     */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { V, glossy, canvasTexture, lathe, mesh, buildTube } from './three-kit.js';

const TX = window.TX;
const PINK = '#EE396B', BLUE = '#1B9CCE', NAVY = '#181943';

// ----------------------------------------------------------------- roster
/* Looks only; names and copy live with the job in content/campaign.json.
 * pose: [shoulder forward, shoulder outward, elbow forward, elbow up] per arm. */
export const ROSTER = {
  hakeem: {
    sex: 'm', skin: '#D9A07A', hair: { style: 'short', color: '#1E1714' }, beard: true, moustache: true,
    coat: true, top: '#1F3470', trousers: '#1F3470', shoes: '#2A2C3F', props: ['stethoscope', 'lanyard', 'pocket'],
    pose: { l: [0.02, 0.12, -0.25, 0], r: [-0.12, 0.1, -0.55, 0] }, turn: -0.3,
  },
  ameen: {
    sex: 'm', skin: '#E3B08A', hair: { style: 'wavy', color: '#241A15' }, coat: false, jacket: true,
    top: '#1C2A5E', trousers: '#2B3A6E', shoes: '#F2F3F8', props: ['lanyard', 'bag'],
    pose: { l: [0, 1.2, 0, 1.45], r: [0.04, 0.2, -0.12, 0] }, turn: -0.25,
  },
  salem: {
    sex: 'm', skin: '#E0AC88', hair: { style: 'senior', color: '#BDBFC8' }, moustache: true, glasses: true,
    coat: true, top: '#6CA9C9', trousers: '#3D4254', shoes: '#3A2A22', props: ['lanyard', 'clipboard', 'pocket'],
    pose: { l: [0.35, 0.2, -1.75, 0], r: [0.02, 0.12, -0.2, 0] }, turn: -0.35,
  },
  noor: {
    sex: 'f', skin: '#E6B592', hijab: '#1F2E68', coat: true, top: '#1B9CCE', trousers: '#26336A', shoes: '#F2F3F8',
    props: ['stethoscope', 'lanyard', 'tablet'],
    pose: { l: [0.35, 0.2, -1.75, 0], r: [0.02, 0.12, -0.2, 0] }, turn: -0.35,
  },
  amal: {
    sex: 'f', skin: '#DDA47F', hijab: '#F4A9BE', coat: false, top: '#1B9CCE', trousers: '#1B9CCE', shoes: '#F2F3F8',
    props: ['lanyard', 'phone', 'heart'], scrubs: true,
    pose: { l: [0.02, 0.12, -0.22, 0], r: [0.1, 0.15, -2.05, 0] }, turn: 0.3,
  },
  sara: {
    sex: 'f', skin: '#E8BC9A', hair: { style: 'bun', color: '#2B1D17' }, coat: true, top: '#F4A9BE', trousers: '#2B3A6E',
    shoes: '#2A2C3F', props: ['lanyard', 'tube'],
    pose: { l: [0.02, 0.12, -0.22, 0], r: [0.0, 0.2, -2.35, 0] }, turn: 0.3,
  },
};

// -------------------------------------------------------------- materials
const cloth = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.82, sheen: 0.45, sheenRoughness: 0.6, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.35), ...o });
const skinMat = (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.55, clearcoat: 0.12, clearcoatRoughness: 0.6, sheen: 0.4, sheenColor: new THREE.Color('#ffd6c2') });
const hairMat = (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.45, clearcoat: 0.45, clearcoatRoughness: 0.35 });
const capsule = (r, len, mat, parent, pos) => mesh(new THREE.CapsuleGeometry(r, len, 10, 24), mat, parent, pos);
const ball = (r, mat, parent, pos, scale) => { const m = mesh(new THREE.SphereGeometry(r, 40, 28), mat, parent, pos); if (scale) m.scale.set(...scale); return m; };

/** The badge on the lanyard: the TabeebX figure, drawn from the traced logo. */
function badgeTexture() {
  return canvasTexture(200, 280, (g, w, h) => {
    g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, w, h);
    g.fillStyle = PINK; g.fillRect(0, 0, w, 26);
    const [fx, fy, fw, fh] = TX.logo.figureBox, s = 120 / fh;
    g.save(); g.translate(w / 2 - (fw * s) / 2, 50); g.scale(s, s); g.translate(-fx, -fy);
    for (const k of ['head', 'arms', 'torso', 'legL', 'legR']) { g.fillStyle = TX.logo.parts[k].color; g.fill(new Path2D(TX.logo.parts[k].d)); }
    g.restore();
    g.fillStyle = NAVY; g.font = '700 34px Cairo'; g.textAlign = 'center'; g.fillText('TabeebX', w / 2, 232);
  });
}
/** A small screen: the TabeebX header and one line of content. */
const screenTexture = (kind) => canvasTexture(256, 480, (g, w, h) => {
  g.fillStyle = '#F2F3F8'; g.fillRect(0, 0, w, h);
  g.fillStyle = NAVY; g.fillRect(0, 0, w, 70);
  g.fillStyle = '#FFFEFF'; g.font = '700 30px Cairo'; g.textAlign = 'center'; g.fillText('TabeebX', w / 2, 46);
  if (kind === 'chart') {
    g.strokeStyle = PINK; g.lineWidth = 7; g.lineJoin = 'round'; g.beginPath();
    [[20, 200], [70, 200], [95, 150], [125, 250], [150, 190], [236, 190]].forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.stroke();
    for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? 'rgba(27,156,206,.35)' : 'rgba(24,25,67,.15)'; g.fillRect(24, 300 + i * 40, w - 48 - (i % 2) * 60, 16); }
  } else {
    [[30, 110, w - 90, 70, '#FFFFFF'], [60, 200, w - 90, 70, BLUE], [30, 290, w - 110, 70, '#FFFFFF']].forEach(([x, y, bw, bh, c]) => { g.fillStyle = c; g.beginPath(); g.roundRect(x, y, bw, bh, 22); g.fill(); });
  }
});

// ------------------------------------------------------------------ build
/** A face surface: features sit on this ellipsoid (the head, or the face framed by a hijab). */
function faceZ(face, x, y) {
  const u = x / face.rx, v = (y - face.cy) / face.ry;
  return face.cz + face.rz * Math.sqrt(Math.max(0, 1 - u * u - v * v));
}
function buildArm(side, spec, mats) {
  const shoulder = new THREE.Group();
  shoulder.position.set(side * (spec.sex === 'f' ? 0.215 : 0.228), 1.3, -0.005);
  capsule(0.058, 0.18, mats.skin, shoulder, [0, -0.13, 0]);
  const sleeve = spec.scrubs ? { len: 0.1, y: -0.075 } : { len: 0.2, y: -0.13 };
  capsule(0.068, sleeve.len, mats.sleeve, shoulder, [0, sleeve.y, 0]);
  const elbow = new THREE.Group(); elbow.position.y = -0.27; shoulder.add(elbow);
  capsule(0.051, 0.17, mats.skin, elbow, [0, -0.12, 0]);
  if (!spec.scrubs) capsule(0.061, 0.15, mats.sleeve, elbow, [0, -0.09, 0]);
  const hand = new THREE.Group(); hand.position.y = -0.27; elbow.add(hand);
  ball(0.05, mats.skin, hand, [0, 0, 0], [0.85, 1.08, 0.7]);
  capsule(0.018, 0.035, mats.skin, hand, [-side * 0.035, 0.012, 0.022]).rotation.z = side * 0.6;
  const [sx, sz, bx, bz] = spec.pose[side > 0 ? 'l' : 'r'];
  shoulder.rotation.set(sx, 0, side * sz);
  elbow.rotation.set(bx, 0, side * bz);
  return { shoulder, elbow, hand };
}

export function buildCharacter(spec) {
  const g = new THREE.Group();
  const f = spec.sex === 'f';
  const mats = {
    skin: skinMat(spec.skin),
    top: cloth(spec.top),
    trousers: cloth(spec.trousers),
    coat: cloth('#F7F8FB', { side: THREE.DoubleSide }),
    shoes: glossy(spec.shoes, { roughness: 0.4, clearcoat: 0.6 }),
    hair: spec.hair ? hairMat(spec.hair.color) : null,
    hijab: spec.hijab ? cloth(spec.hijab, { side: THREE.DoubleSide }) : null,
    dark: new THREE.MeshPhysicalMaterial({ color: '#1C1822', roughness: 0.2, clearcoat: 1 }),
    white: new THREE.MeshBasicMaterial({ color: '#FFFFFF' }),
    lip: new THREE.MeshPhysicalMaterial({ color: '#9A4150', roughness: 0.5 }),
    blush: new THREE.MeshBasicMaterial({ color: '#F28CA0', transparent: true, opacity: 0.32, depthWrite: false }),
  };
  mats.sleeve = spec.coat ? mats.coat : mats.top;
  const sh = f ? 0.93 : 1; // narrower shoulders

  // Legs, shoes, hips
  for (const s of [-1, 1]) {
    capsule(0.078, 0.56, mats.trousers, g, [s * 0.095, 0.43, 0]);
    ball(0.07, mats.shoes, g, [s * 0.098, 0.045, 0.035], [0.85, 0.62, 1.5]);
  }
  ball(0.2, mats.trousers, g, [0, 0.76, 0], [0.86 * sh, 0.45, 0.6]);
  // Torso (the scrubs, shirt or jacket), shaped by a lathe and flattened front to back
  const torso = mesh(lathe([[0, 0.7], [0.15, 0.71], [0.172, 0.8], [0.168, 0.95], [0.182, 1.08], [0.198 * sh, 1.2], [0.194 * sh, 1.28], [0.158 * sh, 1.34], [0.09, 1.37], [0, 1.38]], 48), spec.jacket ? cloth(spec.top, { roughness: 0.6 }) : mats.top, g);
  torso.scale.z = 0.7;
  if (!spec.jacket && !spec.hijab) { // a V neck
    const v = mesh(new THREE.CircleGeometry(0.06, 3), mats.skin, g, [0, 1.3, 0.128]);
    v.rotation.set(-0.35, 0, -Math.PI / 2); v.scale.set(1.3, 0.75, 1);
  }
  if (spec.jacket) { // a zip down the front, and the TabeebX pink on the collar
    mesh(new THREE.BoxGeometry(0.012, 0.56, 0.01), glossy('#C9CCDA', { metalness: 0.6, roughness: 0.3 }), g, [0, 1.03, 0.137]);
    const collar = mesh(new THREE.TorusGeometry(0.075, 0.018, 10, 30), cloth(PINK), g, [0, 1.36, 0.0]);
    collar.rotation.x = Math.PI / 2; collar.scale.set(1.2, 0.8, 1);
    for (const s of [-1, 1]) mesh(new RoundedBoxGeometry(0.1, 0.012, 0.01, 1, 0.004), cloth(PINK), g, [s * 0.1, 1.17, 0.138]).rotation.y = s * 0.3;
  }
  if (spec.coat) { // an open white coat: a lathe with a gap down the front
    const hem = [[0.232, 0.47], [0.214, 0.62], [0.19, 0.8], [0.183, 0.9], [0.194, 1.05], [0.21 * sh, 1.2], [0.206 * sh, 1.28], [0.17 * sh, 1.345], [0.1, 1.375], [0.058, 1.385]];
    const coat = mesh(new THREE.LatheGeometry(hem.map(([r, y]) => new THREE.Vector2(r, y)), 48, 0.3, Math.PI * 2 - 0.6), mats.coat, g);
    coat.scale.z = 0.72;
    for (const s of [-1, 1]) { // lapels, and a pocket each side at the hip
      if (!spec.hijab) mesh(new THREE.BoxGeometry(0.05, 0.2, 0.012), mats.coat, g, [s * 0.075, 1.24, 0.14]).rotation.set(-0.12, 0, s * 0.35);
      const pk = mesh(new RoundedBoxGeometry(0.1, 0.09, 0.01, 2, 0.004), mats.coat, g, [s * 0.14, 0.72, 0.125]);
      pk.rotation.y = s * 0.55;
    }
  }
  // Neck and head (a little large, for a friendly silhouette)
  capsule(0.055, 0.1, mats.skin, g, [0, 1.42, 0]);
  const head = new THREE.Group(); head.position.set(0, 1.625, 0.01); head.scale.setScalar(1.12); g.add(head);
  ball(0.2, mats.skin, head, [0, 0, 0], [0.96, 1.02, 0.94]);
  let face = { cx: 0, cy: 0, cz: 0, rx: 0.192, ry: 0.204, rz: 0.188 };
  if (spec.hijab) { // the hijab wraps the head; the face is an oval set into it
    ball(0.224, mats.hijab, head, [0, 0.012, -0.004], [0.97, 1.04, 0.96]);
    ball(0.2, mats.hijab, head, [0, 0.05, -0.07], [0.98, 1.0, 0.95]);
    face = { cx: 0, cy: -0.025, cz: 0.105, rx: 0.15, ry: 0.185, rz: 0.142 };
    ball(1, mats.skin, head, [0, face.cy, face.cz], [face.rx, face.ry, face.rz]);
    const rim = mesh(new THREE.TorusGeometry(1, 0.075, 12, 64), mats.hijab, head, [0, face.cy - 0.004, face.cz + 0.02]);
    rim.scale.set(face.rx * 1.02, face.ry * 1.02, 0.25);
    // The drape falls from under the chin over the shoulders to mid-chest, close to the body.
    const drape = mesh(lathe([[0.15, -0.08], [0.162, -0.16], [0.18, -0.23], [0.195, -0.28], [0.197, -0.34], [0.19, -0.42], [0.178, -0.5]], 48), mats.hijab, head);
    drape.scale.z = 0.8;
  } else {
    for (const s of [-1, 1]) ball(0.045, mats.skin, head, [s * 0.188, -0.01, 0], [0.5, 0.9, 0.7]);
  }
  const fz = (x, y) => faceZ(face, x, y);
  const ex = spec.hijab ? 0.058 : 0.068;
  // Eyes with a catch-light, brows, nose, smile, cheeks
  const browMat = mats.hair || new THREE.MeshPhysicalMaterial({ color: '#2B1D17', roughness: 0.5 });
  for (const s of [-1, 1]) {
    const x = s * ex, y = 0.022;
    const eye = ball(0.028, mats.dark, head, [x, y, fz(x, y) - 0.008], [1, 1.38, 0.55]);
    eye.rotation.y = s * 0.35;
    ball(0.009, mats.white, head, [x + 0.01, y + 0.015, fz(x, y) + 0.005]);
    if (f) { // lashes: a short dark sweep at the outer corner
      const lash = capsule(0.0045, 0.018, mats.dark, head, [x + s * 0.026, y + 0.03, fz(x + s * 0.026, y + 0.03) + 0.002]);
      lash.rotation.set(0, s * 0.4, -s * 0.9);
    }
    const by = spec.hijab ? 0.07 : 0.078;
    const brow = capsule(0.0085, 0.04, browMat, head, [x, by, fz(x, by) + 0.002]);
    brow.rotation.set(0, s * 0.3, Math.PI / 2 - s * 0.07); // inner ends a touch high: kind, not stern
    const cx = s * (spec.hijab ? 0.088 : 0.1);
    const blush = mesh(new THREE.CircleGeometry(0.028, 24), mats.blush, head, [cx, -0.03, fz(cx, -0.03) + 0.003]);
    blush.lookAt(head.localToWorld(V(cx * 3, -0.03, 1)));
  }
  ball(0.024, skinMat(new THREE.Color(spec.skin).multiplyScalar(0.93)), head, [0, -0.018, fz(0, -0.018) + 0.006], [0.9, 0.8, 0.9]);
  const smile = mesh(new THREE.TorusGeometry(0.032, 0.0075, 10, 28, Math.PI * 0.72), mats.lip, head, [0, -0.052, fz(0, -0.08)]);
  smile.rotation.set(-0.2, 0, -Math.PI / 2 - Math.PI * 0.36);
  if (spec.beard) { // a trimmed beard along the jaw, clear of the mouth
    const beard = mesh(new THREE.SphereGeometry(0.2, 64, 40, Math.PI / 2 - 1.52, 3.04, Math.PI * 0.5, Math.PI * 0.45), mats.hair, head);
    beard.scale.set(0.99, 1.04, 0.97);
    beard.rotation.x = 0.5;
  }
  if (spec.moustache) {
    for (const s of [-1, 1]) {
      const m = capsule(0.012, 0.034, mats.hair, head, [s * 0.021, -0.041, fz(s * 0.021, -0.041) + 0.004]);
      m.rotation.set(0, s * 0.2, Math.PI / 2 + s * 0.3);
    }
  }
  // Hair: a cap whose hairline sits high at the front and low at the nape
  const hair = spec.hair && spec.hair.style;
  if (hair === 'short' || hair === 'wavy' || hair === 'bun') {
    const cap = mesh(new THREE.SphereGeometry(0.212, 48, 24, 0, Math.PI * 2, 0, hair === 'bun' ? 1.5 : 1.35), mats.hair, head, [0, 0.006, -0.004]);
    cap.scale.set(0.99, 1.03, 0.97);
    cap.rotation.x = hair === 'bun' ? -0.5 : -0.42;
    const blob = (pos, r, sc, rot = [0, 0, 0]) => { const m = ball(r, mats.hair, head, pos, sc); m.rotation.set(...rot); return m; };
    if (hair === 'short') blob([0, 0.155, 0.05], 0.12, [1.3, 0.62, 1.05], [0.25, 0, 0.05]);
    if (hair === 'wavy') {
      for (let i = -2; i <= 2; i++) {
        const ph = i * 0.36, th = 0.62;
        blob([0.205 * Math.sin(th) * Math.sin(ph), 0.205 * Math.cos(th), 0.205 * Math.sin(th) * Math.cos(ph) - 0.02], 0.058, [1.1, 0.7, 1], [0.6, ph, 0]);
      }
      blob([0, 0.19, -0.02], 0.11, [1.4, 0.6, 1.3]);
    }
    if (hair === 'bun') {
      blob([0, 0.16, -0.15], 0.078, null);
      blob([0, 0.115, -0.12], 0.05, [1.2, 0.5, 1]); // the band under the bun
      blob([-0.05, 0.15, 0.1], 0.12, [1.05, 0.38, 0.62], [0.35, 0, 0.42]); // a side-swept fringe
      for (const s of [-1, 1]) blob([s * 0.17, -0.02, 0.02], 0.05, [0.45, 1.3, 0.7]); // over the ears
    }
  } else if (hair === 'senior') { // soft tufts around the back and over the ears
    const band = mesh(new THREE.SphereGeometry(0.204, 48, 16, Math.PI / 2 + 0.95, Math.PI * 2 - 1.9, Math.PI * 0.36, Math.PI * 0.2), mats.hair, head);
    band.scale.set(0.99, 1.03, 0.97);
    for (let i = 0; i <= 14; i++) {
      const ph = -2.2 + (i / 14) * 4.4 + Math.PI, th = 1.35 + 0.12 * Math.sin(i * 2.1);
      const m = ball(0.042, mats.hair, head, [0.196 * Math.sin(th) * Math.sin(ph), 0.196 * Math.cos(th) + 0.02, 0.196 * Math.sin(th) * Math.cos(ph) - 0.005], [0.8, 1.1, 0.7]);
      m.rotation.y = ph;
    }
  }
  if (spec.glasses) {
    const frame = glossy('#2A2C3F', { roughness: 0.3 });
    for (const s of [-1, 1]) {
      const x = s * ex, y = 0.022, z = fz(x, y) + 0.018;
      mesh(new THREE.TorusGeometry(0.042, 0.0055, 10, 40), frame, head, [x, y, z]).rotation.y = s * 0.25;
      const arm = mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.16, 8), frame, head, [s * 0.15, y + 0.01, z - 0.08]);
      arm.rotation.set(Math.PI / 2, 0, 0); arm.rotation.y = s * 0.25;
    }
    mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.04, 8), frame, head, [0, 0.03, fz(0, 0.03) + 0.02]).rotation.z = Math.PI / 2;
  }
  // Arms
  const arms = { l: buildArm(1, spec, mats), r: buildArm(-1, spec, mats) };
  g.add(arms.l.shoulder, arms.r.shoulder);

  // Props
  const P = spec.props;
  // Under a hijab the lanyard and the stethoscope come out from below the drape's hem.
  const hem = spec.hijab ? 1.625 - 0.5 * 1.12 : null;
  if (P.includes('lanyard')) {
    const cord = cloth(PINK, { roughness: 0.5 });
    const top = hem ? [0.055, hem + 0.02, 0.13] : [0.07, 1.37, 0.06];
    const bz = hem ? 0.135 : 0.165, by = hem ? 0.965 : 1.085;
    for (const s of [-1, 1]) {
      const curve = new THREE.CatmullRomCurve3([V(s * top[0], top[1], top[2]), V(s * 0.045, (top[1] + by) / 2 + 0.02, bz + 0.005), V(s * 0.012, by + 0.055, bz - 0.005)]);
      mesh(new THREE.TubeGeometry(curve, 16, 0.009, 8), cord, g);
    }
    const badge = mesh(new RoundedBoxGeometry(0.075, 0.105, 0.008, 2, 0.006), [0, 1, 2, 3, 4, 5].map((i) => (i === 4 ? new THREE.MeshBasicMaterial({ map: badgeTexture() }) : glossy('#FFFFFF'))), g, [0, by, bz]);
    badge.rotation.x = -0.08;
  }
  if (P.includes('stethoscope')) {
    const tubeMat = glossy(NAVY, { roughness: 0.35 }), metal = new THREE.MeshPhysicalMaterial({ color: '#C8CDD8', metalness: 0.9, roughness: 0.2 });
    const tube = (pts) => mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((q) => V(...q))), 24, 0.011, 8), tubeMat, g);
    let piece;
    if (hem) { // two tubes from under the hem, joining above the chest piece
      tube([[-0.07, hem + 0.02, 0.13], [-0.085, hem - 0.05, 0.14], [-0.1, hem - 0.1, 0.14]]);
      tube([[-0.14, hem + 0.02, 0.11], [-0.125, hem - 0.05, 0.13], [-0.1, hem - 0.1, 0.14]]);
      tube([[-0.1, hem - 0.1, 0.14], [-0.1, hem - 0.14, 0.142], [-0.1, hem - 0.17, 0.145]]);
      piece = [-0.1, hem - 0.185, 0.15];
    } else {
      tube([[-0.11, 1.18, 0.15], [-0.13, 1.34, 0.08], [-0.09, 1.4, -0.02], [0, 1.41, -0.06], [0.09, 1.4, -0.02], [0.13, 1.34, 0.08], [0.12, 1.2, 0.15]]);
      tube([[0.12, 1.2, 0.15], [0.1, 1.08, 0.165], [0.07, 0.99, 0.17]]);
      ball(0.012, metal, g, [-0.11, 1.18, 0.155]);
      piece = [0.07, 0.975, 0.175];
    }
    mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.018, 28), metal, g, piece).rotation.x = Math.PI / 2;
  }
  if (P.includes('pocket')) {
    const pocket = mesh(new RoundedBoxGeometry(0.1, 0.09, 0.012, 2, 0.004), mats.coat, g, [0.12, 1.15, 0.148]);
    pocket.rotation.y = 0.35;
    mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.08, 10), glossy(BLUE), g, [0.105, 1.2, 0.152]).rotation.z = 0.08;
  }
  if (P.includes('heart')) mesh(new THREE.SphereGeometry(0.018, 16, 12), glossy(PINK), g, [0.11, 1.2, 0.142]).scale.set(1.1, 1, 0.5);
  /* Held props sit at the posed hand, set square to the body, then ride on the
   * hand from there: animate the arm and the prop follows. */
  g.updateMatrixWorld(true);
  const hold = (hand, obj, offset, rot) => {
    const at = g.worldToLocal(hand.getWorldPosition(V(0, 0, 0)));
    obj.position.copy(at).add(V(...offset));
    obj.rotation.set(...rot);
    g.add(obj);
    hand.attach(obj);
    return obj;
  };
  const screenMats = (kind) => [0, 1, 2, 3, 4, 5].map((i) => (i === 4 ? new THREE.MeshBasicMaterial({ map: screenTexture(kind) }) : glossy('#23243A')));
  if (P.includes('bag')) { // the TabeebX home-visit bag
    const bag = new THREE.Group();
    mesh(new RoundedBoxGeometry(0.3, 0.2, 0.14, 4, 0.04), glossy(NAVY, { roughness: 0.45, clearcoat: 0.5 }), bag, [0, -0.12, 0]);
    const handle = mesh(new THREE.TorusGeometry(0.05, 0.012, 10, 24, Math.PI), glossy('#2A2C3F'), bag, [0, -0.02, 0]);
    handle.rotation.y = 0;
    for (const [w, h] of [[0.08, 0.024], [0.024, 0.08]]) mesh(new THREE.BoxGeometry(w, h, 0.01), mats.white, bag, [0, -0.12, 0.072]);
    mesh(new THREE.BoxGeometry(0.302, 0.018, 0.142), glossy(PINK), bag, [0, -0.19, 0]);
    hold(arms.r.hand, bag, [0, 0.02, 0], [0, -(spec.turn || 0) + 0.5, 0]);
  }
  if (P.includes('tablet')) hold(arms.l.hand, mesh(new RoundedBoxGeometry(0.2, 0.27, 0.014, 3, 0.02), screenMats('chart')), [-0.05, 0.1, 0.03], [-0.5, 0, 0.1]);
  if (P.includes('clipboard')) {
    const cb = mesh(new RoundedBoxGeometry(0.2, 0.27, 0.012, 2, 0.01), glossy('#8A5B3A', { roughness: 0.5 }));
    mesh(new THREE.PlaneGeometry(0.17, 0.22), new THREE.MeshBasicMaterial({ map: screenTexture('chart') }), cb, [0, -0.01, 0.007]);
    mesh(new RoundedBoxGeometry(0.07, 0.03, 0.02, 2, 0.006), glossy('#C8CDD8', { metalness: 0.8, roughness: 0.25 }), cb, [0, 0.125, 0.008]);
    hold(arms.l.hand, cb, [-0.05, 0.1, 0.03], [-0.5, 0, 0.1]);
  }
  if (P.includes('phone')) hold(arms.r.hand, mesh(new RoundedBoxGeometry(0.08, 0.155, 0.012, 3, 0.012), screenMats('chat')), [0.01, 0.07, 0.02], [-0.3, 0.2, 0]);
  if (P.includes('tube')) {
    const tube = buildTube({
      glass: new THREE.MeshPhysicalMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.25, roughness: 0.05, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide }),
      blood: glossy('#8E1426', { roughness: 0.25 }), band: new THREE.MeshPhysicalMaterial({ color: '#F4F2EE', transparent: true }),
      gold: new THREE.MeshPhysicalMaterial({ color: '#F3B544', transparent: true, opacity: 0.9 }),
    });
    tube.fill(1, 1);
    mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.16, 24), glossy(PINK), tube.g, [0, 1.13, 0]);
    tube.g.scale.setScalar(0.17);
    hold(arms.r.hand, tube.g, [0, -0.02, 0.03], [0, 0, 0.1]);
  }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { group: g, head, arms, spec };
}
