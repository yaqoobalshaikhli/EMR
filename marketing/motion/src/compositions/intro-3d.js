/* «شنو هو طبيب اكس؟»: the TabeebX intro in 3D, 44 s, 1080×1920. No faces, no names.
 * Script and voice-over: content/scripts/95-what-is-tabeebx.md.
 *
 * Three words carry the three services, all around one Baghdadi house at night:
 *   0.0–4.8   the house, the doorbell; «شنو هو طبيب اكس؟ بثلاث كلمات...» and
 *             three cards: نسمعك · نجيك · نفحصك.
 *   4.8–13.0  نسمعك: a speech bubble rises from the shanasheel and the
 *             specialties gather round it in the sky.
 *  13.0–23.7  نجيك: the logo's pink head rolls up and rings the doorbell, the
 *             door opens, and a 24-hour dial shows the two visit times.
 *  23.7–33.8  نفحصك: inside, five sample tubes drop into a rack, one per family
 *             package; a result flies onto a phone.
 *  33.8–44.0  the studio: the three cards again, then the logo locks on the doorbell. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {
  W, H, V, track, glossy, canvasTexture, radial, lathe, mesh, sparkles, buildLogo, buildDoor, archPath, DOOR,
  TUBE, buildTube, makeRenderer, makePost, makeStudio, logoRig, makeCards,
} from '../three-kit.js';

const TX = window.TX;
const { E, p, env, lerp, clamp, el, set } = TX;
const NAVY = '#181943', PINK = '#EE396B', BLUE = '#1B9CCE';
const T = {
  bell: 0.4, cards: 2.3, cardsOut: 4.4,
  bubble: 5.0, ring: 6.4, listenOut: 12.4,
  roll: [13.6, 15.4], open: 16.0, dial: 17.0, sweep: [18.2, 21.6], push: 22.5, inside: 24.0,
  tubes: 25.1, count: [27.6, 29.0], report: [29.6, 30.6], white: 32.9,
  cut: 33.8, recap: 34.2, head: 36.6, build: 37.6, total: 44.0,
};
T.lock = T.build + 3.2;
T.arrive = T.roll[1] + 0.05; // the doorbell rings as the head reaches the door
const ROOM = V(40, 0, 0);
const HEAD_R = 0.536; // the logo's head, in scene units at full size
const glowColor = (hex, k) => new THREE.Color(hex).multiplyScalar(k);

// ------------------------------------------------------------- the house
/** Yellow Baghdad brick, 2×2 scene units per tile of the texture. */
function brickTexture() {
  const rng = TX.rng(7);
  const tex = canvasTexture(512, 512, (g, w, h) => {
    g.fillStyle = '#8A6A45'; g.fillRect(0, 0, w, h);
    const bw = 128, bh = 41;
    for (let row = 0; row * bh < h; row++) {
      for (let x = (row % 2) * -bw / 2; x < w; x += bw) {
        const k = 0.86 + rng() * 0.2;
        g.fillStyle = `rgb(${Math.round(203 * k)},${Math.round(160 * k)},${Math.round(100 * k)})`;
        g.fillRect(x + 3, row * bh + 3, bw - 6, bh - 6);
      }
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(0.5, 0.5);
  return tex;
}
/** Warm light behind wooden lattice, for the windows and the shanasheel. */
const latticeTexture = (w, h, step) => canvasTexture(w, h, (g) => {
  const gr = g.createRadialGradient(w / 2, h * 0.55, 0, w / 2, h * 0.55, h * 0.7);
  gr.addColorStop(0, '#FFE2B0'); gr.addColorStop(1, '#D98A3E');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#4A2A16'; g.lineWidth = 7;
  for (let x = -h; x < w + h; x += step) {
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x + h, h); g.stroke();
    g.beginPath(); g.moveTo(x + h, 0); g.lineTo(x, h); g.stroke();
  }
});
function buildHouse() {
  const g = new THREE.Group();
  const brick = new THREE.MeshStandardMaterial({ map: brickTexture(), roughness: 0.88 });
  const plain = new THREE.MeshStandardMaterial({ color: '#9C7A50', roughness: 0.9 });
  const front = new THREE.Shape();
  front.moveTo(-3.5, 0); front.lineTo(3.5, 0); front.lineTo(3.5, 8.4); front.lineTo(-3.5, 8.4); front.lineTo(-3.5, 0);
  front.holes.push(archPath(DOOR.wo / 2 - 0.01, DOOR.ho));
  mesh(new THREE.ShapeGeometry(front, 48), brick, g);
  for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.3, 8.4, 6), plain, g, [s * 3.35, 4.2, -3]);
  mesh(new THREE.BoxGeometry(7.3, 0.14, 0.45), glossy('#E9E1D0', { roughness: 0.5, clearcoat: 0.2 }), g, [0, 8.42, 0.05]);
  mesh(new THREE.BoxGeometry(7.0, 0.55, 0.3), plain, g, [0, 8.75, -0.1]);
  // The shanasheel: a wooden bay over the door, its lattice lit from inside.
  const wood = glossy('#6E3F22', { roughness: 0.55, clearcoat: 0.3, clearcoatRoughness: 0.4 });
  const bay = new THREE.Group(); bay.position.set(0, 5.05, 0); g.add(bay);
  mesh(new THREE.BoxGeometry(4.7, 0.26, 1.3), wood, bay, [0, 0, 0.62]);
  mesh(new THREE.BoxGeometry(4.9, 0.3, 1.42), wood, bay, [0, 2.55, 0.66]);
  for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.14, 2.3, 1.2), wood, bay, [s * 2.28, 1.27, 0.62]);
  const glowMat = new THREE.MeshBasicMaterial({ map: latticeTexture(512, 256, 46), toneMapped: false, color: new THREE.Color(1.25, 1.1, 0.95) });
  const bayGlow = mesh(new THREE.PlaneGeometry(4.45, 2.28), glowMat, bay, [0, 1.27, 1.18]);
  for (let i = 0; i < 27; i++) mesh(new THREE.BoxGeometry(0.06, 2.3, 0.06), wood, bay, [-2.2 + (4.4 * i) / 26, 1.27, 1.26]);
  for (const y of [0.55, 1.95]) mesh(new THREE.BoxGeometry(4.45, 0.07, 0.07), wood, bay, [0, y, 1.3]);
  for (const x of [-1.6, 0, 1.6]) mesh(new THREE.BoxGeometry(0.24, 0.42, 0.9), wood, bay, [x, -0.3, 0.45]).rotation.x = -0.35;
  // Arched windows either side of the door.
  const winMat = new THREE.MeshBasicMaterial({ map: latticeTexture(256, 512, 38), toneMapped: false, color: new THREE.Color(1.1, 0.95, 0.85) });
  const winGeo = new THREE.ShapeGeometry(archPath(0.5, 2.0, new THREE.Shape()), 24);
  const uv = winGeo.attributes.uv; // ShapeGeometry uses raw x/y as UVs; map them to 0..1
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + 0.5) / 1.0, uv.getY(i) / 2.0);
  const frameGeo = new THREE.ShapeGeometry(archPath(0.62, 2.14, new THREE.Shape()), 24);
  for (const s of [-1, 1]) {
    mesh(frameGeo, glossy('#E9E1D0', { roughness: 0.5, clearcoat: 0.2 }), g, [s * 2.35, 1.3, 0.01]);
    mesh(winGeo, winMat, g, [s * 2.35, 1.37, 0.02]);
  }
  // The door, set into the wall; its lit room glows through when it opens.
  const door = buildDoor({ wall: false });
  door.room.scale.set(0.7, 0.7, 1);
  g.add(door.group);
  return { g, door, bayGlow, glowMat, winMat };
}
/** A leaf of a date palm: a bent strip with leaflets cut out of a canvas. */
const frondTexture = () => canvasTexture(128, 512, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  g.strokeStyle = '#3E7A45'; g.lineCap = 'round';
  g.lineWidth = 6; g.beginPath(); g.moveTo(w / 2, h); g.lineTo(w / 2, 0); g.stroke();
  g.lineWidth = 5;
  for (let y = h - 20; y > 10; y -= 13) {
    const len = (w / 2 - 6) * (0.35 + 0.65 * Math.sin((Math.PI * (h - y)) / h));
    g.beginPath(); g.moveTo(w / 2, y); g.lineTo(w / 2 - len, y - 26); g.stroke();
    g.beginPath(); g.moveTo(w / 2, y); g.lineTo(w / 2 + len, y - 26); g.stroke();
  }
});
function buildPalm() {
  const g = new THREE.Group();
  const pts = [];
  for (let i = 0; i <= 44; i++) pts.push([lerp(0.26, 0.17, i / 44) + 0.028 * Math.max(0, Math.sin(i * 2.3)), (i / 44) * 6.6]);
  const trunk = mesh(lathe(pts, 20), new THREE.MeshStandardMaterial({ color: '#6B4A33', roughness: 0.92 }), g);
  trunk.rotation.z = 0.06;
  const crown = new THREE.Group(); crown.position.set(-0.4, 6.55, 0); g.add(crown);
  const leafMat = new THREE.MeshStandardMaterial({ map: frondTexture(), alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.7 });
  const rng = TX.rng(3);
  for (let k = 0; k < 13; k++) {
    const len = 2.4 + rng() * 0.6, geo = new THREE.PlaneGeometry(0.7, len, 1, 14);
    geo.translate(0, len / 2, 0);
    const pos = geo.attributes.position, droop = 0.25 + rng() * 0.75;
    for (let i = 0; i < pos.count; i++) { const y = pos.getY(i), u = y / len; pos.setXYZ(i, pos.getX(i), y * Math.cos(u * droop), -y * Math.sin(u * droop) * 1.2); }
    geo.computeVertexNormals();
    const f = mesh(geo, leafMat, crown);
    f.rotation.set(-0.3 - rng() * 0.5, (k / 13) * Math.PI * 2 + rng() * 0.3, 0, 'YXZ');
  }
  for (const s of [-1, 1]) {
    const dates = new THREE.Group(); dates.position.set(s * 0.25 - 0.4, 6.25, 0.15); g.add(dates);
    for (let i = 0; i < 16; i++) mesh(new THREE.SphereGeometry(0.06, 10, 8), glossy('#B5652A', { roughness: 0.45, clearcoat: 0.6 }), dates, [(rng() - 0.5) * 0.3, -rng() * 0.45, (rng() - 0.5) * 0.3]);
  }
  return g;
}
function buildLamp() {
  const g = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: '#1E2040', roughness: 0.4, metalness: 0.7 });
  mesh(new THREE.CylinderGeometry(0.06, 0.09, 4.6, 16), metal, g, [0, 2.3, 0]);
  mesh(new THREE.BoxGeometry(0.7, 0.06, 0.06), metal, g, [-0.32, 4.55, 0]);
  mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.42, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.7, 0.9), toneMapped: false }), g, [-0.62, 4.3, 0]);
  mesh(new THREE.ConeGeometry(0.3, 0.22, 6), metal, g, [-0.62, 4.62, 0]);
  const light = new THREE.PointLight('#ffc27a', 9, 9, 2); light.position.set(-0.62, 4.15, 0); g.add(light);
  return g;
}

// ------------------------------------------------------- نسمعك: the sky
function buildBubble() {
  const g = new THREE.Group();
  mesh(new RoundedBoxGeometry(1.9, 1.2, 0.34, 6, 0.3), glossy('#FFFFFF', { roughness: 0.25 }), g);
  const tail = mesh(new THREE.ConeGeometry(0.22, 0.5, 4), glossy('#FFFFFF', { roughness: 0.25 }), g, [0.5, -0.72, 0]);
  tail.rotation.z = 0.5;
  const dots = [-0.42, 0, 0.42].map((x) => mesh(new THREE.SphereGeometry(0.11, 20, 14), glossy(PINK), g, [x, 0, 0.2]));
  return { g, dots };
}
const tileFace = (text) => canvasTexture(640, 220, (g, w, h) => {
  g.fillStyle = '#FFFEFF'; g.font = '700 92px Cairo'; g.direction = 'rtl';
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 8);
});

// ------------------------------------------------------ نجيك: the dial
const dialFace = () => canvasTexture(512, 512, (g, w, h) => {
  g.fillStyle = '#FFFEFF'; g.font = '700 58px Cairo'; g.textAlign = 'center'; g.textBaseline = 'middle';
  [['٠', 0], ['٦', 90], ['١٢', 180], ['١٨', 270]].forEach(([s, a]) => {
    const r = 172, t = ((a - 90) * Math.PI) / 180;
    g.fillText(s, w / 2 + r * Math.cos(t), h / 2 + r * Math.sin(t) + 4);
  });
});
function buildDial() {
  const g = new THREE.Group();
  const face = mesh(new THREE.CircleGeometry(1.7, 96), new THREE.MeshPhysicalMaterial({ color: '#12143A', roughness: 0.2, clearcoat: 1, transparent: true, opacity: 0.9 }), g);
  mesh(new THREE.PlaneGeometry(3.3, 3.3), new THREE.MeshBasicMaterial({ map: dialFace(), transparent: true, toneMapped: false }), g, [0, 0, 0.012]);
  mesh(new THREE.TorusGeometry(1.74, 0.07, 16, 128), glossy('#E9ECF4', { roughness: 0.2, metalness: 0.3 }), g);
  for (let i = 0; i < 24; i++) {
    const major = i % 6 === 0, a = (i / 24) * Math.PI * 2;
    const tk = mesh(new THREE.BoxGeometry(0.035, major ? 0.24 : 0.13, 0.02), new THREE.MeshBasicMaterial({ color: major ? '#FFFEFF' : '#8E91B8' }), g, [1.5 * Math.sin(a), 1.5 * Math.cos(a), 0.02]);
    tk.rotation.z = -a;
  }
  const handGeo = new THREE.BoxGeometry(0.05, 1.32, 0.03); handGeo.translate(0, 0.66, 0);
  const hand = mesh(handGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.6, 1.7), toneMapped: false }), g, [0, 0, 0.05]);
  mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 24), glossy('#E9ECF4'), g, [0, 0, 0.06]).rotation.x = Math.PI / 2;
  // Arcs of the 24-hour ring, drawn as far as the hand has swept: [from hour, to hour, colour].
  const arcs = [[2, 4, PINK], [12, 24, BLUE]].map(([h0, h1, c]) => ({ h0, h1, mat: new THREE.MeshBasicMaterial({ color: glowColor(c, 1.6), toneMapped: false }), m: null, drawn: -1 }));
  const setArcs = (hours) => arcs.forEach((a) => {
    const k = clamp((hours - a.h0) / (a.h1 - a.h0)), deg = Math.round(k * (a.h1 - a.h0) * 15);
    if (deg === a.drawn) return;
    if (a.m) { g.remove(a.m); a.m.geometry.dispose(); a.m = null; }
    a.drawn = deg;
    if (deg < 1) return;
    const len = (deg * Math.PI) / 180, start = (a.h0 * 15 * Math.PI) / 180;
    a.m = mesh(new THREE.TorusGeometry(1.62, 0.075, 12, Math.max(4, deg), len), a.mat, g, [0, 0, 0.04]);
    a.m.rotation.z = Math.PI / 2 - start - len; // clockwise from the top, like a clock
  });
  return { g, hand, setArcs, face };
}

// ------------------------------------------------------ نفحصك: the room
const tagFace = (text, color) => canvasTexture(560, 118, (g, w, h) => {
  g.fillStyle = color; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 54); g.fill();
  g.fillStyle = '#FFFEFF'; g.font = '700 62px Cairo'; g.direction = 'rtl';
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 6);
});
const reportFace = (P) => canvasTexture(400, 520, (g, w, h) => {
  g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, w, h);
  g.fillStyle = NAVY; g.fillRect(0, 0, w, 92);
  g.fillStyle = '#FFFEFF'; g.font = '700 46px Cairo'; g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(P.resultCard, w / 2, 50);
  for (let i = 0; i < 6; i++) {
    g.fillStyle = i % 3 === 0 ? 'rgba(27,156,206,.55)' : 'rgba(24,25,67,.18)';
    g.fillRect(40, 140 + i * 50, w - 80 - (i % 2) * 90, 16);
  }
  g.strokeStyle = PINK; g.lineWidth = 16; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(150, 452); g.lineTo(190, 490); g.lineTo(260, 410); g.stroke();
});
const phoneScreen = (P) => canvasTexture(512, 1040, (g, w, h) => {
  g.fillStyle = '#F2F3F8'; g.fillRect(0, 0, w, h);
  g.fillStyle = NAVY; g.fillRect(0, 0, w, 150);
  g.fillStyle = '#FFFEFF'; g.font = '700 52px Cairo'; g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(P.phoneTitle, w / 2, 86);
  // the result, as an attachment
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.roundRect(60, 200, w - 100, 300, 34); g.fill();
  g.fillStyle = 'rgba(238,57,107,.12)'; g.beginPath(); g.roundRect(84, 224, w - 148, 170, 24); g.fill();
  g.strokeStyle = PINK; g.lineWidth = 14; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(w / 2 - 50, 312); g.lineTo(w / 2 - 12, 348); g.lineTo(w / 2 + 56, 270); g.stroke();
  g.fillStyle = NAVY; g.font = '700 40px Cairo'; g.fillText(P.resultCard, w / 2 + 20, 444);
  // the doctor's note
  g.fillStyle = BLUE; g.beginPath(); g.roundRect(40, 540, w - 100, 190, 34); g.fill();
  g.fillStyle = '#FFFEFF'; g.font = '700 38px Cairo';
  const words = P.phoneNote.split(' '), mid = Math.ceil(words.length / 2);
  g.fillText(words.slice(0, mid).join(' '), w / 2 - 10, 600);
  g.fillText(words.slice(mid).join(' '), w / 2 - 10, 664);
});

// ------------------------------------------------------------------ score
/* A minor at night, C major once the door opens and the family is home
 * (src/score.js). The doorbell (E5 → C5) is mixed on top by the renderer: at
 * the start, when the head reaches the door, and on the logo lock. */
function composeScore() {
  const k = TX.score.kit(T.total);
  // Night: a quiet bed; the three cards each get a note.
  k.air(0, 13.2, 0.028, 420);
  k.pad(['A2', 'E3', 'G3', 'C4'], 0.2, 4.9, { attack: 2.0, release: 1.2, vol: 0.05, from: 260, to: 800 });
  k.sub('A1', 0.4, 4.6, 0.05);
  ['A4', 'C5', 'E5'].forEach((n, i) => { k.piano(n, T.cards + i * 0.4, { vel: 0.15, decay: 2.4 }); k.whoosh(T.cards + i * 0.4 - 0.2, 0.45, 0.04, 0.3, -0.3); });
  // نسمعك: air and light; the bubble rises, the specialties arrive one note each.
  k.whoosh(T.cardsOut, 0.8, 0.08, 0, 0);
  k.pad(['F3', 'C4', 'A4', 'E5'], 4.8, T.listenOut, { attack: 1.4, release: 1.2, vol: 0.055, from: 900, to: 2400 });
  k.sub('F1', 5.0, 12.2, 0.045);
  k.riser(T.bubble, T.ring, 0.08);
  for (let t = T.ring; t < 8.2; t += 0.3) k.tick(t, 0.012, 0.2);
  ['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6'].forEach((n, i) => k.piano(n, T.ring + i * 0.12, { vel: 0.07, decay: 1.6, pan: -0.5 + i * 0.14 }));
  k.shimmer(8.0, 0.035, 14, 1.0);
  [9.0, 9.9, 10.8, 11.7].forEach((t, i) => k.ping(t, 0.03 + (i % 2) * 0.01));
  // نجيك: down to the street; the head rolls up, rings, the door opens; the dial ticks round.
  k.whoosh(12.4, 1.3, 0.1, 0, 0);
  k.pad(['C3', 'G3', 'E4', 'G4'], 12.3, 23.3, { attack: 0.9, release: 0.6, vol: 0.055, from: 600, to: 2600 });
  k.sub('C2', 13.2, 22.2, 0.05);
  k.whoosh(T.roll[0], T.roll[1] - T.roll[0] + 0.1, 0.06, 0.7, 0);
  for (let t = T.roll[0] + 0.3; t < T.roll[1]; t += 0.45) k.kick(t, 0.1);
  k.impact(T.open, 0.25, 0);
  k.shimmer(T.open + 0.1, 0.04, 14, 1.0);
  for (let t = T.sweep[0]; t < T.sweep[1]; t += 0.24) k.tick(t, 0.022, 0.1);
  const at = (h) => T.sweep[0] + (T.sweep[1] - T.sweep[0]) * (h / 24); // close enough on the eased sweep's mid-section
  k.piano('E5', at(2.6), { vel: 0.15, decay: 2.2 }); k.piano('A5', at(2.6) + 0.05, { vel: 0.12, decay: 2.2 });
  k.piano('C5', at(12.2), { vel: 0.14, decay: 2.6 }); k.piano('G5', at(12.2) + 0.05, { vel: 0.11, decay: 2.6 });
  k.riser(21.9, T.inside - 0.15, 0.27);
  k.whoosh(22.9, 1.0, 0.1, 0, 0);
  k.shimmer(T.inside - 0.3, 0.05, 16, 0.7);
  // نفحصك: the warm room, felt piano; a clink per tube, the counter climbs, the result arrives.
  k.impact(T.inside - 0.1, 0.22, 0);
  k.pad(['F3', 'C4', 'A4', 'C5'], 23.8, 32.8, { attack: 0.8, release: 1.0, vol: 0.055, from: 800, to: 2200 });
  k.sub('F1', 24.0, 32.6, 0.045);
  ['C4', 'E4', 'G4', 'A4', 'C5'].forEach((n, i) => { const t = T.tubes + i * 0.45 + 0.42; k.clink(t, 0.07); k.piano(n, t, { vel: 0.1, decay: 1.8 }); });
  for (let i = 0; i < 16; i++) k.tick(T.count[0] + (T.count[1] - T.count[0]) * Math.pow(i / 15, 0.7), 0.016, 0);
  k.piano('C6', T.count[1], { vel: 0.1, decay: 2 });
  k.whoosh(T.report[0], T.report[1] - T.report[0], 0.08, -0.4, 0.6);
  k.piano('G5', T.report[1] + 0.05, { vel: 0.12, decay: 1.6 }); k.piano('C6', T.report[1] + 0.2, { vel: 0.12, decay: 2.2 });
  k.riser(31.9, T.cut - 0.05, 0.2);
  // The studio: C major, a note per card, then the logo.
  k.impact(T.cut, 0.2, 0);
  k.shimmer(T.cut, 0.05, 18, 0.9);
  k.pad(['C4', 'G4', 'D5', 'E5'], T.cut, 36.8, { attack: 0.35, release: 0.9, vol: 0.05, from: 1400, to: 2600, send: 0.5 });
  k.sub('C2', 33.9, 36.6, 0.045);
  ['G4', 'C5', 'E5'].forEach((n, i) => k.piano(n, T.recap + i * 0.4, { vel: 0.18, decay: 3, pan: 0.2 }));
  k.whoosh(T.head + 0.05, 1.0, 0.08, 0, 0);
  k.pad(['F2', 'C3', 'A3', 'E4', 'G4'], T.head, T.build + 0.3, { attack: 0.8, release: 0.8, vol: 0.06, from: 600, to: 1500 });
  k.pad(['G2', 'D3', 'G3', 'C4', 'D4'], T.build, 39.5, { attack: 1.0, release: 0.5, vol: 0.07, from: 600, to: 1800 });
  k.pad(['G2', 'D3', 'G3', 'B3', 'D4'], 39.5, T.lock - 0.05, { attack: 0.4, release: 0.1, vol: 0.08, from: 1800, to: 3200 });
  k.sub('G1', T.build + 0.1, T.lock - 0.1, 0.055);
  [0, 0.35, 0.7, 0.8].forEach((dt, i) => k.tom(T.build + dt, 0.3 + i * 0.02, [-0.3, 0.1, -0.4, 0.4][i]));
  ['G5', 'A5', 'C6', 'D6', 'E6', 'G6', 'A6'].forEach((n, i) => k.piano(n, T.build + 2.0 + i * 0.06, { vel: 0.06, decay: 1.2, pan: -0.4 + i * 0.13 }));
  k.riser(T.lock - 2.0, T.lock, 0.22);
  k.impact(T.lock, 0.8);
  k.pad(['C2', 'G2', 'C3', 'G3', 'D4', 'E4'], T.lock, 42.8, { attack: 0.25, release: 1.2, vol: 0.08, from: 900, to: 2400 });
  k.sub('C2', T.lock, 42.6, 0.07);
  k.shimmer(T.lock + 0.1, 0.045, 16, 1.1);
  return k.render();
}

// ---------------------------------------------------------------- template
TX.register('intro-3d', {
  size: [W, H],
  fps: 30,
  build(stage, P, ctx) {
    const { renderer, envTex } = makeRenderer(stage);
    const rng = TX.rng(95);

    // ================================= scene D: Baghdad at night, and the room
    const D = new THREE.Scene();
    D.background = canvasTexture(540, 960, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, '#07081E'); gr.addColorStop(0.45, '#141650'); gr.addColorStop(0.78, '#2B2566'); gr.addColorStop(1, '#4A3470');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
    D.fog = new THREE.Fog('#1A1A52', 30, 70);
    D.environment = envTex;
    D.environmentIntensity = 0.25;
    const camD = new THREE.PerspectiveCamera(40, W / H, 0.05, 150);
    D.add(new THREE.HemisphereLight('#5a6bbf', '#0b0c26', 0.4));
    const moonLight = new THREE.DirectionalLight('#9fb4ff', 0.6); moonLight.position.set(-5, 10, 8); D.add(moonLight);
    const bayLight = new THREE.PointLight('#ffb866', 5, 7, 2); bayLight.position.set(0, 6.3, 2.6); D.add(bayLight);
    const doorSpot = new THREE.SpotLight('#ffe2b8', 0, 16, 0.62, 0.85, 2); doorSpot.position.set(0, 3.3, -1.4); doorSpot.target.position.set(0, 0, 4); D.add(doorSpot, doorSpot.target);
    const roomKey = new THREE.PointLight('#ffcf94', 9, 12, 2); roomKey.position.copy(ROOM).add(V(0.8, 3.4, 2.2)); D.add(roomKey);
    const roomFill = new THREE.SpotLight('#fff1dd', 40, 14, 0.6, 0.8, 2); roomFill.position.copy(ROOM).add(V(-2, 5, 5)); roomFill.target.position.copy(ROOM).add(V(0, 1.2, 0)); D.add(roomFill, roomFill.target);

    const ground = mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: '#16173D', roughness: 0.5, metalness: 0.15 }), D);
    ground.rotation.x = -Math.PI / 2;
    mesh(new THREE.BoxGeometry(30, 0.12, 2.2), new THREE.MeshStandardMaterial({ color: '#4E4D68', roughness: 0.8 }), D, [0, 0.06, 1.1]);
    const house = buildHouse(); D.add(house.g);
    const palm = buildPalm(); palm.position.set(-3.9, 0, 3.0); D.add(palm);
    const lamp = buildLamp(); lamp.position.set(3.7, 0, 3.2); D.add(lamp);
    const stars = sparkles(260, 0.16); D.add(stars.pts);
    stars.pts.material.fog = false;
    for (let i = 0; i < 260; i++) {
      const a = rng() * Math.PI * 2, e = 0.12 + rng() * 1.2, r = 55;
      stars.put(i, r * Math.cos(e) * Math.sin(a), 6 + r * Math.sin(e), -Math.abs(r * Math.cos(e) * Math.cos(a)) - 10, new THREE.Color(0.8, 0.85, 1), 0.35 + rng() * 0.65);
    }
    stars.commit();
    const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: radial('rgba(235,240,255,1)', 'rgba(160,180,255,0)'), color: new THREE.Color(1.6, 1.6, 1.7), depthWrite: false, fog: false }));
    moon.position.set(-9, 20, -30); moon.scale.setScalar(6); D.add(moon);

    // The hook's three cards, in front of the house.
    const hookCards = makeCards(D, P.words);
    // The doorbell rings out from the door; later the head rings it.
    const ringMat = new THREE.MeshBasicMaterial({ color: glowColor(PINK, 2.2), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const rings = [0, 1, 2, 3].map(() => mesh(new THREE.TorusGeometry(1, 0.012, 8, 160), ringMat.clone(), D));
    const head = buildLogo().parts.head;
    head.castShadow = false; D.add(head);
    const headLight = new THREE.PointLight(PINK, 0, 3, 2); D.add(headLight);

    // نسمعك
    const bubble = buildBubble(); D.add(bubble.g);
    const bubbleGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radial('rgba(140,200,255,1)', 'rgba(140,200,255,0)'), color: new THREE.Color(1.2, 1.4, 1.8), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    D.add(bubbleGlow);
    const tileGeo = new RoundedBoxGeometry(1.3, 0.46, 0.07, 4, 0.08);
    const tileMat = glossy('#1E2063', { roughness: 0.34, clearcoat: 0.7, clearcoatRoughness: 0.12, envMapIntensity: 0.6, emissive: new THREE.Color(BLUE), emissiveIntensity: 0.12 });
    const tiles = P.specialties.map((s) => {
      const g = new THREE.Group();
      mesh(tileGeo, tileMat, g);
      mesh(new THREE.PlaneGeometry(1.24, 0.426), new THREE.MeshBasicMaterial({ map: tileFace(s), transparent: true, toneMapped: false }), g, [0, 0, 0.037]);
      D.add(g);
      return g;
    });
    const lineMat = new THREE.MeshBasicMaterial({ color: glowColor(BLUE, 2.0), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const lineGeo = new THREE.CylinderGeometry(0.012, 0.012, 1, 6); lineGeo.translate(0, 0.5, 0);
    const lines = tiles.map(() => mesh(lineGeo, lineMat.clone(), D));
    const packets = sparkles(tiles.length * 3, 0.14); D.add(packets.pts);

    // نجيك
    const dial = buildDial(); D.add(dial.g);

    // نفحصك: the room, far from the street
    const room = new THREE.Group(); room.position.copy(ROOM); D.add(room);
    const wallMat = new THREE.MeshStandardMaterial({ color: '#E9DCC6', roughness: 0.9 });
    mesh(new THREE.PlaneGeometry(14, 7), wallMat, room, [0, 3.5, -2.2]);
    mesh(new THREE.PlaneGeometry(6, 7), wallMat, room, [-4.2, 3.5, 0.8]).rotation.y = Math.PI / 2;
    const floor = mesh(new THREE.PlaneGeometry(14, 10), new THREE.MeshStandardMaterial({ color: '#6E4A30', roughness: 0.55, metalness: 0.05 }), room, [0, 0, 2.5]);
    floor.rotation.x = -Math.PI / 2;
    const nightWin = mesh(new THREE.ShapeGeometry(archPath(0.75, 2.4, new THREE.Shape()), 24), new THREE.MeshBasicMaterial({ color: '#2A2A6E' }), room, [-1.7, 2.1, -2.19]);
    mesh(new THREE.ShapeGeometry(archPath(0.86, 2.56, new THREE.Shape()), 24), new THREE.MeshStandardMaterial({ color: '#6E3F22', roughness: 0.6 }), room, [-1.7, 2.02, -2.195]);
    nightWin.renderOrder = 1;
    const woodTop = glossy('#8A5B3A', { roughness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.3 });
    mesh(new RoundedBoxGeometry(4.4, 0.12, 2.1, 3, 0.04), woodTop, room, [0.4, 1.0, 0.2]);
    for (const [x, z] of [[-1.6, -0.7], [2.4, -0.7], [-1.6, 1.1], [2.4, 1.1]]) mesh(new THREE.BoxGeometry(0.1, 1.0, 0.1), woodTop, room, [x, 0.5, z]);
    // table lamp
    mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.06, 20), glossy('#E9E1D0'), room, [2.2, 1.09, -0.5]);
    mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 10), glossy('#E9E1D0'), room, [2.2, 1.44, -0.5]);
    mesh(new THREE.CylinderGeometry(0.24, 0.36, 0.34, 24, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.6, 0.95), side: THREE.DoubleSide, toneMapped: false }), room, [2.2, 1.9, -0.5]);
    // the rack and the five tubes, right to left as Arabic reads
    const mats = {
      glass: new THREE.MeshPhysicalMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.22, roughness: 0.05, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide }),
      blood: new THREE.MeshPhysicalMaterial({ color: '#8E1426', roughness: 0.25, clearcoat: 0.6, emissive: new THREE.Color('#3a0008'), emissiveIntensity: 0.4 }),
      band: new THREE.MeshPhysicalMaterial({ color: '#F4F2EE', roughness: 0.4, transparent: true }),
      gold: new THREE.MeshPhysicalMaterial({ color: '#F3B544', roughness: 0.2, clearcoat: 0.8, transparent: true, opacity: 0.9 }),
    };
    mesh(new RoundedBoxGeometry(2.1, 0.3, 0.5, 4, 0.06), glossy('#F4F6FA', { roughness: 0.3 }), room, [0, 1.21, 0.2]);
    const capColors = [PINK, BLUE, '#F58BA8', '#6CC3E6', NAVY];
    const slotX = (i) => 0.76 - i * 0.38;
    const tubes = P.packages.map((pk, i) => {
      const t = buildTube(mats);
      t.g.scale.setScalar(0.62);
      mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.16, 28), glossy(capColors[i], { roughness: 0.3 }), t.g, [0, 1.13, 0]);
      room.add(t.g);
      const tag = mesh(new THREE.PlaneGeometry(1.1, 0.232), new THREE.MeshBasicMaterial({ map: tagFace(pk, capColors[i]), transparent: true, toneMapped: false }), room);
      mesh(new THREE.CircleGeometry(0.1, 20), new THREE.MeshBasicMaterial({ color: '#2A2C3F' }), room, [slotX(i), 1.365, 0.2]).rotation.x = -Math.PI / 2;
      return { t, tag, i };
    });
    const phone = new THREE.Group(); phone.position.copy(ROOM).add(V(1.55, 1.9, 0.5)); phone.rotation.set(-0.08, -0.32, 0); D.add(phone);
    mesh(new RoundedBoxGeometry(0.74, 1.48, 0.07, 4, 0.09), glossy('#12132E', { roughness: 0.25 }), phone);
    const screen = mesh(new THREE.PlaneGeometry(0.66, 1.34), new THREE.MeshBasicMaterial({ map: phoneScreen(P), transparent: true, toneMapped: false }), phone, [0, 0, 0.037]);
    mesh(new THREE.BoxGeometry(0.5, 0.05, 0.3), glossy('#E9E1D0'), phone, [0, -0.76, -0.08]);
    const report = mesh(new RoundedBoxGeometry(0.5, 0.65, 0.012, 2, 0.01), [0, 1, 2, 3, 4, 5].map((f) => (f === 4 ? new THREE.MeshBasicMaterial({ map: reportFace(P), toneMapped: false }) : new THREE.MeshStandardMaterial({ color: '#FFFFFF' }))), D);

    // ================================= scene B: the studio, the recap, the logo
    const { scene: B, camera: camB, sweep } = makeStudio(envTex);
    const recapCards = makeCards(B, P.words);
    const rig = logoRig(B, sweep);
    const LP = rig.parts;

    const { composer, renderPass, bloom, grain } = makePost(renderer, D, camD);

    // ============================================== type, over the canvas
    const layer = () => el('div', 'layer', stage);
    const masked = (parent, text, cls, pos) => TX.text(parent, text, `col centered mask ${cls}`, pos);
    const rise = (words, t, at, o = {}) => TX.animWords(words, t, { at, stagger: o.stagger == null ? 0.08 : o.stagger, dur: o.dur || 0.8, y: o.y || 140, blur: 0, ease: E.outExpo, out: o.out, outDur: 0.45, outY: o.y || 140 });
    const typeD = layer();
    const td = {
      hook: masked(typeD, P.hook, 't-hook-s', { top: 290 }),
      hookSub: masked(typeD, P.hookSub, 't-sub', { top: 420 }),
      listen: masked(typeD, P.listen, 't-hook', { top: 300 }),
      listenSub: masked(typeD, P.listenSub, 't-sub', { top: 1580 }),
      come: masked(typeD, P.come, 't-hook', { top: 300 }),
      comeSub: masked(typeD, P.comeSub, 't-sub', { top: 450 }),
      vip: masked(typeD, P.vip, 't-sub', { top: 1500 }),
      regular: masked(typeD, P.regular, 't-sub', { top: 1590 }),
      test: masked(typeD, P.test, 't-hook', { top: 300 }),
      testSub: masked(typeD, P.testSub, 't-sub', { top: 450 }),
      result: masked(typeD, P.result, 't-sub', { top: 1580 }),
    };
    Object.values(td).forEach((b) => { b.el.style.textShadow = '0 4px 30px rgba(5,6,26,.75)'; });
    const counter = el('div', 'col centered t-hook', typeD);
    Object.assign(counter.style, { position: 'absolute', left: 0, right: 0, top: '1610px', textAlign: 'center', color: '#FFFEFF', textShadow: '0 4px 30px rgba(5,6,26,.75)' });
    const typeB = layer();
    typeB.style.color = NAVY;
    const recap = masked(typeB, P.recap, 't-hook-s', { top: 300 });
    const tagline = masked(typeB, P.tagline, 't-hook-s', { top: 1300 });
    tagline.el.style.fontSize = '66px';
    const ritual = masked(typeB, ctx.brand.ritual, 't-sub', { top: 1400 });
    ritual.el.style.color = BLUE;
    const strip = TX.C.strip(stage, ctx, ctx.brand.trustStrip);
    strip.el.style.color = 'rgba(24,25,67,.55)';
    const warm = layer(); warm.style.background = '#FFE7B8';
    const white = layer(); white.style.background = '#FFF9F0';

    const hits = [T.bell, T.bell + ctx.bell.second, T.arrive, T.arrive + ctx.bell.second];
    const up = V(0, 1, 0);
    let texturesDrawn = false;

    /** The 93-style stack: each card flies up into place and pushes the earlier ones back. */
    function stackCards(cards, t, first, gap, out, offset) {
      const arrive = (i) => first + i * gap;
      cards.forEach((g) => {
        const i = g.userData.i, k = p(t, arrive(i), 0.75, E.outExpo);
        let d = 0;
        for (let j = i + 1; j < cards.length; j++) d += p(t, arrive(j), 0.75, E.outExpo);
        const kx = p(t, out + (cards.length - 1 - i) * 0.04, 0.8, E.inCubic);
        const bob = Math.sin(t * 1.1 + i) * 0.012;
        g.position.set(offset.x + lerp(0.4, 0, k), offset.y + lerp(0, 1.3, k) + d * 0.47 + bob + kx * 4.5, offset.z + lerp(2.4, 0, k) - d * 0.5 - kx * 1.2);
        g.rotation.set(lerp(1.15, 0, k) - 0.03 * d - kx * 0.5, lerp(-0.3, 0, k) + 0.04 * Math.sin(t * 0.7 + i), 0);
        g.visible = k > 0 && kx < 1;
      });
    }

    function renderD(t) {
      const inRoom = t >= T.inside;
      // ------------------------------------------------------ camera
      let cp, ct;
      if (!inRoom) {
        const CP = [[0, [0.9, 4.2, 20.5]], [4.4, [0.5, 4.4, 18.6]], [6.4, [0.3, 10.2, 15.6]], [12.4, [0.6, 10.0, 14.8]], [14.0, [5.8, 2.1, 10.2]], [16.6, [4.6, 2.3, 9.4]], [18.0, [2.6, 6.6, 13.8]], [T.push, [2.2, 6.3, 13.2]]];
        const CT = [[0, [0, 5.4, 0]], [4.4, [0, 5.4, 0]], [6.4, [0, 11.2, 1.8]], [12.4, [0, 11.2, 1.8]], [14.0, [1.2, 1.4, 0.8]], [16.6, [0, 2.0, 0.4]], [18.0, [0, 7.4, 2.2]], [T.push, [0, 7.3, 2.2]]];
        cp = track(t, CP);
        ct = track(t, CT);
        if (t > T.push) { // through the open door, into the warm light
          const k = E.inExpo(clamp((t - T.push) / (T.inside - T.push))), c0 = track(T.push, CP), t0 = track(T.push, CT);
          cp = [lerp(c0[0], 0, k), lerp(c0[1], 1.9, k), lerp(c0[2], -0.8, k)];
          ct = [lerp(t0[0], 0, k), lerp(t0[1], 1.8, k), lerp(t0[2], -3, k)];
        }
      } else {
        cp = track(t, [[T.inside, [40.6, 3.4, 6.4]], [26.0, [40.3, 3.05, 5.7]], [T.report[0], [40.3, 3.0, 5.6]], [T.report[1], [41.2, 2.3, 4.6]], [T.cut, [41.3, 2.25, 4.3]]]);
        ct = track(t, [[T.inside, [40, 2.35, 0]], [26.0, [40, 2.35, 0.1]], [T.report[0], [40.1, 2.35, 0.1]], [T.report[1], [41.35, 1.85, 0.4]], [T.cut, [41.45, 1.88, 0.45]]]);
      }
      camD.position.set(...cp);
      camD.lookAt(...ct);

      // ------------------------------------------------------ night
      const ko = p(t, T.open, 1.3, E.inOutCubic);
      house.door.leaves[0].rotation.y = 1.32 * ko;
      house.door.leaves[1].rotation.y = -1.32 * ko;
      house.door.leakMat.opacity = (0.75 + 0.25 * Math.sin(t * 4.3)) * (1 - p(t, T.open - 0.1, 0.5)) * p(t, 0.3, 1.0);
      doorSpot.intensity = 26 * ko;
      house.glowMat.color.setRGB(1.25, 1.1, 0.95).multiplyScalar(1 + 0.05 * Math.sin(t * 2.1));
      stackCards(hookCards.cards, t, T.cards, 0.4, T.cardsOut, V(0, 1.4, 8.2));

      // The doorbell rings: from the door at the start, from the head when it arrives.
      rings.forEach((r, i) => {
        const hit = hits[(i >> 1) + (t >= T.arrive - 0.1 ? 2 : 0)], k = clamp((t - hit - (i % 2) * 0.16) / 1.4);
        r.visible = !inRoom && k > 0 && k < 1;
        r.position.copy(t >= T.arrive - 0.1 ? head.position : V(0, 2.0, 0.3));
        r.lookAt(camD.position);
        r.scale.setScalar((t >= T.arrive - 0.1 ? 0.35 : 0.8) + k * 1.8);
        r.material.opacity = (1 - E.outQuad(k)) * 0.85;
      });

      // ------------------------------------------------------ نسمعك
      const kb = p(t, T.bubble, 1.4, E.outCubic), kbOut = p(t, T.listenOut - 0.3, 0.6, E.inCubic);
      bubble.g.visible = bubbleGlow.visible = t > T.bubble && t < T.listenOut + 0.4;
      const bPos = V(0, lerp(6.4, 11.3, kb) + 0.06 * Math.sin(t * 1.4), lerp(1.3, 1.8, kb));
      bubble.g.position.copy(bPos);
      bubble.g.scale.setScalar(Math.max(0.001, lerp(0.15, 1, kb) * (1 - kbOut)));
      bubble.g.lookAt(camD.position.x, bPos.y, camD.position.z);
      bubble.dots.forEach((d, i) => { d.position.y = 0.08 * Math.max(0, Math.sin(t * 7 - i * 0.9)); });
      bubbleGlow.position.copy(bPos).add(V(0, 0, -0.4));
      bubbleGlow.scale.setScalar(3.4 * kb * (1 - kbOut));
      bubbleGlow.material.opacity = 0.35;
      const spin = 0.16 * (t - T.ring);
      tiles.forEach((g, i) => {
        const k = p(t, T.ring + i * 0.12, 0.8, E.outBack) * (1 - kbOut);
        const a = (i / tiles.length) * Math.PI * 2 + spin;
        const ring = V(bPos.x + 2.0 * Math.sin(a), bPos.y + 0.75 * Math.cos(a) - 0.1, bPos.z + 1.1 * Math.cos(a));
        g.position.lerpVectors(bPos, ring, k);
        g.scale.setScalar(Math.max(0.001, k));
        g.lookAt(camD.position);
        g.visible = !inRoom && k > 0.002;
        const ln = lines[i], dir = ring.clone().sub(bPos), len = dir.length();
        ln.visible = g.visible && t > 7.6;
        ln.position.copy(bPos);
        ln.quaternion.setFromUnitVectors(up, dir.normalize());
        ln.scale.set(1, len * k, 1);
        ln.material.opacity = (0.35 + 0.25 * Math.sin(t * 4 - i)) * p(t, 7.6, 0.6) * (1 - kbOut);
        for (let j = 0; j < 3; j++) {
          const u = (t * 0.55 + j / 3 + i * 0.13) % 1, on = ln.visible ? p(t, 8.0, 0.5) * (1 - kbOut) : 0;
          const q = bPos.clone().lerp(ring, u);
          packets.put(i * 3 + j, q.x, q.y, q.z, new THREE.Color(0.6, 0.85, 1.0), on * 1.6 * Math.sin(Math.PI * u));
        }
      });
      packets.commit();

      // ------------------------------------------------------ نجيك
      const kr = p(t, T.roll[0], T.roll[1] - T.roll[0], E.outCubic), kinD = p(t, T.open + 0.8, 0.9, E.inCubic);
      head.visible = !inRoom && t > T.roll[0] && kinD < 1;
      const hs = 0.42 * (1 - kinD), rad = HEAD_R * hs; // it rolls on the pavement, then into the light
      const hx = lerp(9.5, 0, kr);
      head.position.set(hx, 0.12 + rad, 1.0 - 2.6 * kinD);
      head.scale.set(0.01 * hs, -0.01 * hs, 0.01 * hs);
      head.rotation.set(0, 0, (9.5 - hx) / (HEAD_R * 0.42));
      headLight.position.copy(head.position).add(V(0, 0.3, 0.5));
      headLight.intensity = head.visible ? 3 * (1 - kinD) : 0;
      const kd = p(t, T.dial, 1.0, E.outBack), kdOut = p(t, T.push - 0.3, 0.5, E.inCubic);
      dial.g.visible = !inRoom && t > T.dial && kdOut < 1;
      dial.g.position.set(0, lerp(5.2, 7.25, clamp(kd)), 3.2);
      dial.g.scale.setScalar(Math.max(0.001, kd * (1 - kdOut)));
      dial.g.lookAt(camD.position.x * 0.3, dial.g.position.y, camD.position.z);
      const sweepK = p(t, T.sweep[0], T.sweep[1] - T.sweep[0], E.inOutSine);
      dial.hand.rotation.z = -sweepK * Math.PI * 2;
      dial.setArcs(sweepK * 24);

      // ------------------------------------------------------ نفحصك
      room.visible = phone.visible = inRoom;
      tubes.forEach(({ t: tube, tag, i }) => {
        const k = p(t, T.tubes + i * 0.45, 0.5, E.inQuad), bounce = 0.03 * Math.sin(Math.PI * clamp((t - T.tubes - i * 0.45 - 0.5) / 0.2));
        tube.g.visible = k > 0;
        tube.g.position.set(slotX(i), lerp(3.4, 1.12, k) + bounce, 0.2);
        tube.fill(0);
        const kt = p(t, T.tubes + i * 0.45 + 0.4, 0.5, E.outBack) * (1 - p(t, T.report[0] - 0.4, 0.4, E.inCubic));
        tag.visible = kt > 0.001;
        tag.position.set(0, 3.12 - i * 0.27, 0.35); // one pill per tube, in its cap's colour
        tag.scale.setScalar(Math.max(0.001, kt));
        tag.lookAt(ROOM.x + 0.3, 2.9, 6.0);
      });
      const kf = p(t, T.report[0], T.report[1] - T.report[0], E.inOutCubic);
      report.visible = inRoom && t > T.report[0] - 0.3 && kf < 1;
      const from = ROOM.clone().add(V(0.1, 2.6, 0.5)), to = phone.position.clone().add(V(0, 0.05, 0.08));
      report.position.lerpVectors(from, to, kf).add(V(0, 0.6 * Math.sin(Math.PI * kf), 0));
      report.scale.setScalar(Math.max(0.001, lerp(1, 0.45, kf) * p(t, T.report[0] - 0.3, 0.3, E.outBack)));
      report.quaternion.copy(phone.quaternion);
      report.rotateZ(0.5 * Math.sin(Math.PI * kf));
      screen.material.opacity = p(t, T.report[1] - 0.05, 0.35);
      screen.material.color.setScalar(lerp(0.25, 1, p(t, T.report[1] - 0.05, 0.35)));

      // ------------------------------------------------------ post
      const kin = p(t, T.push, T.inside - T.push, E.inExpo), kw = p(t, T.white, T.cut - T.white, E.inExpo);
      bloom.strength = 0.35 + 1.8 * kin * (1 - p(t, T.inside, 0.5)) + 1.9 * kw;
      bloom.radius = 0.5;
      bloom.enabled = true;
      renderer.toneMappingExposure = 1 + 1.2 * kin * (1 - p(t, T.inside, 0.6)) + 1.4 * kw;
      grain.uniforms.uGrain.value = 0.028;
      grain.uniforms.uVig.value = inRoom ? 0.26 : 0.3;
    }

    function renderB(t) {
      const cp = track(t, [[T.cut, [0.8, 2.3, 7.3]], [T.head, [-0.45, 2.45, 7.0]], [37.5, [0.35, 2.62, 4.4]], [38.5, [0.25, 2.6, 4.2]], [39.6, [1.3, 2.2, 5.8]], [41.0, [0, 1.62, 6.6]], [T.total, [0, 1.58, 6.15]]]);
      const ct = track(t, [[T.cut, [0, 2.45, -1.3]], [T.head, [0, 2.5, -1.4]], [37.5, [0.02, 2.45, 0]], [38.5, [0.02, 2.45, 0]], [39.6, [0, 2.0, 0]], [41.0, [0, 1.36, 0]], [T.total, [0, 1.34, 0]]]);
      camB.position.set(...cp);
      camB.lookAt(...ct);
      stackCards(recapCards.cards, t, T.recap, 0.4, T.head, V(0, 0.35, 0));
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
      cover: 42.6,
      cues: [{ t: T.bell, sfx: 'doorbell' }, { t: T.arrive, sfx: 'doorbell' }, { t: T.lock, sfx: 'doorbell' }],
      bed: null,
      score: composeScore,
      ready: Promise.all([hookCards.ready, recapCards.ready]).then(() => { texturesDrawn = true; }),
      render(t) {
        const inD = t < T.cut;
        renderPass.scene = inD ? D : B;
        renderPass.camera = inD ? camD : camB;
        grain.uniforms.uTime.value = Math.round(t * 30);
        if (inD) renderD(t); else renderB(t);
        if (texturesDrawn) composer.render();

        typeD.style.display = inD ? '' : 'none';
        typeB.style.display = inD ? 'none' : '';
        if (inD) {
          rise(td.hook.words, t, 0.9, { stagger: 0.12, out: T.cardsOut });
          rise(td.hookSub.words, t, 1.7, { y: 90, out: T.cardsOut });
          rise(td.listen.words, t, 6.6, { out: T.listenOut - 0.1 });
          rise(td.listenSub.words, t, 7.4, { y: 90, out: T.listenOut - 0.1 });
          rise(td.come.words, t, 13.6, { out: T.push - 0.2 });
          rise(td.comeSub.words, t, T.dial - 0.4, { y: 90, out: T.push - 0.2 });
          rise(td.vip.words, t, T.sweep[0] + 0.45, { y: 90, out: T.push - 0.2 });
          rise(td.regular.words, t, T.sweep[0] + 1.75, { y: 90, out: T.push - 0.2 });
          rise(td.test.words, t, T.inside + 0.3, { out: T.white - 0.1 });
          rise(td.testSub.words, t, T.inside + 0.9, { y: 90, out: T.report[0] - 0.2 });
          rise(td.result.words, t, T.report[1] + 0.2, { y: 90, out: T.white - 0.1 });
          const kc = p(t, T.count[0], T.count[1] - T.count[0], E.outCubic);
          const shown = t >= T.count[0] && t < T.report[0] + 0.2;
          counter.style.opacity = shown ? String(p(t, T.count[0], 0.3) * (1 - p(t, T.report[0] - 0.2, 0.35))) : '0';
          counter.innerHTML = `<span style="color:${PINK}">${TX.ar(Math.round(Number(P.count) * kc))}</span> ${P.countLabel}`;
        } else {
          rise(recap.words, t, T.recap + 0.3, { stagger: 0.1, out: T.head + 0.1 });
          rise(tagline.words, t, T.lock + 0.6, { stagger: 0.1 });
          rise(ritual.words, t, T.lock + 1.2, { y: 90 });
        }
        strip.render(t, T.lock + 1.5);
        set(warm, { o: env(t, T.push + 0.7, 0.5, T.inside, 0.5, E.inCubic, E.outCubic) });
        set(white, { o: env(t, T.white, 0.7, T.cut, 0.9, E.inCubic, E.outCubic) });
      },
    };
  },
});
