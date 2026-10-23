/* The TabeebX cast: six real-looking people for the films.
 *
 * Bodies, faces and motion are Microsoft Rocketbox avatars (MIT licence,
 * assets/cast/LICENSE). scripts/build-cast.mjs copies the ones src/cast.json
 * lists into assets/cast, and this module dresses them as it loads them:
 *   - a face from another avatar, laid over the body's own head map, with the
 *     neck, ears and hands toned to match it
 *   - a hijab grown round the head and skinned to it
 *   - field jackets in TabeebX navy with TabeebX patches, and a TabeebX ID
 *     card on the white coats in place of the hospital one
 *   - a held pose from a motion clip, a smile, and a prop in the hand
 *
 *   const noor = await loadPerson('noor');
 *   scene.add(noor.group);   // metres, feet on y = 0, facing +z
 *   noor.pose(2.4);          // any moment of her clip
 *
 * They are stock people, not TabeebX staff: never present them as real
 * doctors or nurses. */
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const ROOT = new URL('../assets/cast/', import.meta.url);
const NAVY = '#181943', PINK = '#EE396B';
const { smoothstep: sm, lerp } = THREE.MathUtils;
const lum = (d, k) => 0.3 * d[k] + 0.59 * d[k + 1] + 0.11 * d[k + 2];

// ---------------------------------------------------------------- files
async function imageOf(url) {
  const img = new Image();
  img.src = url;
  await img.decode();
  return img;
}
function canvasFrom(img, w = img.naturalWidth || img.width, h = img.naturalHeight || img.height) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.getContext('2d', { willReadFrequently: true }).drawImage(img, 0, 0, w, h);
  return c;
}
function clipOf(j) {
  const times = Float32Array.from({ length: j.frames }, (_, i) => i / j.fps);
  return new THREE.AnimationClip('pose', -1, j.tracks.map((t) => new (t.q ? THREE.QuaternionKeyframeTrack : THREE.VectorKeyframeTrack)(t.n, times, t.v)));
}

/** Where the files come from: assets/cast, as scripts/build-cast.mjs writes it. */
export const source = {
  avatar: (dir) => new URL(`avatars/${dir.split('/').pop()}.fbx`, ROOT).href,
  // one map of the avatar in `dir` as a canvas, e.g. image('Professions/Medical_Male_01', 'm152_body_color')
  image: async (dir, file) => canvasFrom(await imageOf(new URL(`tex/${file}.${/_opacity_/.test(file) ? 'png' : 'jpg'}`, ROOT).href)),
  clip: async (name) => clipOf(await (await fetch(new URL(`anims/${name}.json`, ROOT))).json()),
};
let roster = null;
/** src/cast.json: who is who, and what they wear and do. */
export const cast = () => (roster ||= fetch(new URL('./cast.json', import.meta.url)).then((r) => r.json()));

// ------------------------------------------------------------- the face
// Every head map shares one layout: the face centred at (0.5, 0.337) from the
// top left, eyes, teeth and tongue in the lower-left atlas, modelled hair round
// the rest.
const FACE = [0.5, 0.337], FACE_R = [0.149, 0.151];
const inAtlas = (u, ty) => ty > 0.58 && u < 0.36;
const skin = (r, g, b) => (r > g && g >= b ? 1 : 0) * sm((r - b) / Math.max(r, 1), 0.06, 0.16) * sm(0.3 * r + 0.59 * g + 0.11 * b, 40, 70);

/** Lays the face painted in `face` over the head map `head`; returns the new skin tone over the old, per channel. */
function swapFace(head, face, keepHair) {
  const W = head.width, H = head.height;
  const hx = head.getContext('2d', { willReadFrequently: true }), hi = hx.getImageData(0, 0, W, H), hd = hi.data;
  const sd = (face.width === W ? face : canvasFrom(face, W, H)).getContext('2d', { willReadFrequently: true }).getImageData(0, 0, W, H).data;
  // the tones compared on the cheeks and forehead
  const hs = [0, 0, 0], ss = [0, 0, 0];
  for (let row = 0; row < H; row += 2) for (let col = 0; col < W; col += 2) {
    const k = (row * W + col) * 4;
    if (Math.hypot(((col + 0.5) / W - FACE[0]) / FACE_R[0], ((row + 0.5) / H - FACE[1]) / FACE_R[1]) > 0.75 || lum(hd, k) < 80 || lum(sd, k) < 80) continue;
    for (let c = 0; c < 3; c++) { hs[c] += hd[k + c]; ss[c] += sd[k + c]; }
  }
  const ratio = hs.map((v, c) => (v ? ss[c] / v : 1));
  for (let row = 0; row < H; row++) for (let col = 0; col < W; col++) {
    const u = (col + 0.5) / W, ty = (row + 0.5) / H, k = (row * W + col) * 4, atlas = inAtlas(u, ty);
    // the atlas is the new face's where it has one, else the body's own with only its skin toned;
    // keepHair keeps the body's hair round the new face (for bodies whose hair is modelled in the head)
    const t = atlas ? skin(hd[k], hd[k + 1], hd[k + 2]) : 1;
    let w = !keepHair ? 1 : atlas ? 1 - t : 1 - sm(Math.hypot((u - FACE[0]) / FACE_R[0], (ty - FACE[1]) / FACE_R[1]), 0.9, 1.08);
    if (sd[k] + sd[k + 1] + sd[k + 2] < 30) w = 0; // nothing painted there
    for (let c = 0; c < 3; c++) hd[k + c] = Math.min(255, hd[k + c] * (1 + (ratio[c] - 1) * t)) * (1 - w) + sd[k + c] * w;
  }
  hx.putImageData(hi, 0, 0);
  return ratio;
}

// ---------------------------------------------------------- the clothes
// Where the TabeebX marks go on each body map, in pixels of a 2048 px map.
const MARKS = {
  m152: { card: [1090, 1868, 1215, 1927] },
  m153: { card: [1391, 1972, 1517, 2032] },
  f153: { card: [1162, 28, 1280, 92] },
  // the field jacket: navy, its back patch (upside down in the map) and the chest and sleeve badges
  m154: { navy: true, patch: [812, 586, 1220, 663], badges: [[1175, 1054], [1748, 1110]] },
  f154: { navy: true, patch: [816, 587, 1219, 664], badges: [[1173, 1053], [1747, 1113]] },
};
const JACKET = [21, 23, 60]; // TabeebX navy, as fabric: darker than the flat brand colour, which the studio lights would wash out

let marks = null;
const markImages = () => (marks ||= Promise.all(['tabeebx-logo.svg', 'tabeebx-figure-white.svg'].map((f) => imageOf(new URL(`../assets/brand/${f}`, import.meta.url).href))).then(([logo, figure]) => ({ logo, figure })));

function roundRect(x, x0, y0, w, h, r) {
  x.beginPath();
  x.moveTo(x0 + r, y0); x.arcTo(x0 + w, y0, x0 + w, y0 + h, r); x.arcTo(x0 + w, y0 + h, x0, y0 + h, r);
  x.arcTo(x0, y0 + h, x0, y0, r); x.arcTo(x0, y0, x0 + w, y0, r); x.closePath();
}
function wordmark(x, cx, cy, size) {
  x.font = `700 ${size}px Cairo`; x.textBaseline = 'middle'; x.textAlign = 'left'; x.direction = 'ltr';
  const a = x.measureText('Tabeeb').width, b = x.measureText('X').width;
  x.fillStyle = NAVY; x.fillText('Tabeeb', cx - (a + b) / 2, cy);
  x.fillStyle = PINK; x.fillText('X', cx - (a + b) / 2 + a, cy);
}
/** A TabeebX staff card: pink band with the figure, the wordmark, two lines. No photo. */
function idCard(x, [x0, y0, x1, y1], { figure }) {
  const w = x1 - x0, h = y1 - y0;
  x.save();
  roundRect(x, x0, y0, w, h, h * 0.1); x.fillStyle = '#FCFCFE'; x.fill(); x.clip();
  x.fillStyle = PINK; x.fillRect(x0, y0, w * 0.3, h);
  const fh = h * 0.7; x.drawImage(figure, x0 + w * 0.15 - fh * 0.475, y0 + (h - fh) / 2, fh * 0.95, fh);
  wordmark(x, x0 + w * 0.64, y0 + h * 0.33, h * 0.26);
  x.fillStyle = '#B9BBCB'; x.fillRect(x0 + w * 0.38, y0 + h * 0.6, w * 0.52, h * 0.07); x.fillRect(x0 + w * 0.38, y0 + h * 0.76, w * 0.36, h * 0.07);
  x.restore();
}
/** The back patch: white, with the wordmark. The map holds it upside down. */
function backPatch(x, [x0, y0, x1, y1]) {
  x.save();
  x.fillStyle = '#F1F1F4'; x.fillRect(x0, y0, x1 - x0, y1 - y0);
  x.translate((x0 + x1) / 2, (y0 + y1) / 2); x.rotate(Math.PI);
  wordmark(x, 0, 0, (y1 - y0) * 0.66);
  x.restore();
}
/** A round TabeebX badge: the logo on white in a pink ring. */
function badge(x, cx, cy, r, { logo }) {
  x.save();
  x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fillStyle = '#FFFFFF'; x.fill();
  x.lineWidth = r * 0.16; x.strokeStyle = PINK; x.beginPath(); x.arc(cx, cy, r * 0.92, 0, Math.PI * 2); x.stroke();
  const s = r * 1.15; x.drawImage(logo, cx - s / 2, cy - s / 2, s, s);
  x.restore();
}

/** Tones the bare skin by `ratio`, turns field jackets navy and swaps their marks for TabeebX ones. */
async function dressBody(body, prefix, ratio) {
  const W = body.width, H = body.height, s = W / 2048, mark = MARKS[prefix] || {};
  const x = body.getContext('2d', { willReadFrequently: true });
  if (ratio || mark.navy) {
    const im = x.getImageData(0, 0, W, H), d = im.data;
    // the jacket's own blue, to shade the navy by
    let ref = 0, n = 0;
    if (mark.navy) for (let k = 0; k < d.length; k += 64) if (d[k + 2] - Math.max(d[k], d[k + 1]) > 70) { ref += lum(d, k); n++; }
    ref = n ? ref / n : 1;
    for (let k = 0; k < d.length; k += 4) {
      const r = d[k], g = d[k + 1], b = d[k + 2];
      const t = ratio ? skin(r, g, b) : 0;
      if (t) for (let c = 0; c < 3; c++) d[k + c] = Math.min(255, d[k + c] * (1 + (ratio[c] - 1) * t));
      const w = mark.navy ? sm(b - Math.max(r, g), 25, 70) : 0;
      if (w) { const f = Math.min(2.2, Math.max(0.3, lum(d, k) / ref)); for (let c = 0; c < 3; c++) d[k + c] = lerp(d[k + c], Math.min(255, JACKET[c] * f), w); }
    }
    x.putImageData(im, 0, 0);
  }
  if (!mark.card && !mark.patch) return;
  const img = await markImages(), px = (v) => v * s;
  if (mark.card) idCard(x, mark.card.map(px), img);
  if (mark.patch) backPatch(x, mark.patch.map(px));
  for (const [cx, cy] of mark.badges || []) badge(x, px(cx), px(cy), px(58), img);
}

function material(part, color, normal) {
  const tex = (c, srgb) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const o = { name: part, map: tex(color, true), normalMap: normal ? tex(normal) : null };
  if (part === 'opacity') return new THREE.MeshPhysicalMaterial({ ...o, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.7 });
  if (part === 'head') return new THREE.MeshPhysicalMaterial({ ...o, roughness: 0.5, sheen: 0.25, sheenRoughness: 0.6 });
  return new THREE.MeshPhysicalMaterial({ ...o, roughness: part === 'body' ? 0.75 : 0.45, sheen: 0.4, sheenRoughness: 0.6 });
}

// ------------------------------------------------------------ the hijab
/** A hijab round the head of `mesh` (bind space: Z up, centimetres), skinned to its skeleton. */
function hijab(mesh, color) {
  const g = mesh.geometry, mats = [].concat(mesh.material);
  const headIdx = mats.findIndex((m) => m.name === 'head'), bodyIdx = mats.findIndex((m) => m.name === 'body');
  const P = g.attributes.position, U = g.attributes.uv, SI = g.attributes.skinIndex, SW = g.attributes.skinWeight;
  const at = (k) => (g.index ? g.index.getX(k) : k);
  const V3 = THREE.Vector3;
  // anything in the head map outside the face-and-neck unwrap and the eye atlas is modelled hair
  const hair = (u, ty) => !inAtlas(u, ty) && !(ty < 0.56 || (ty < 0.88 && Math.abs(u - 0.5) < 0.1 + (0.88 - ty) * 0.8));
  const cuv = (k) => [(U.getX(at(k)) + U.getX(at(k + 1)) + U.getX(at(k + 2))) / 3, 1 - (U.getY(at(k)) + U.getY(at(k + 1)) + U.getY(at(k + 2))) / 3];
  const tri = (idx) => {
    const pos = [], uv = [], src = [];
    for (const gr of g.groups) if (gr.materialIndex === idx) for (let k = gr.start; k < gr.start + gr.count; k += 3) {
      const [u, ty] = cuv(k);
      if (idx === headIdx && (hair(u, ty) || inAtlas(u, ty))) continue;
      for (let q = 0; q < 3; q++) { const i = at(k + q); pos.push(P.getX(i), P.getY(i), P.getZ(i)); uv.push(U.getX(i), U.getY(i)); src.push(i); }
    }
    const bg = new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    bg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    const m = new THREE.Mesh(bg, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
    m.updateMatrixWorld(true);
    return { m, src };
  };
  const head = tri(headIdx), body = tri(bodyIdx);
  // modelled hair (a ponytail, a bun) folds away to a point under the cloth
  const folded = new Set();
  for (const gr of g.groups) if (gr.materialIndex === headIdx) for (let k = gr.start; k < gr.start + gr.count; k += 3) { const [u, ty] = cuv(k); if (hair(u, ty)) [at(k), at(k + 1), at(k + 2)].forEach((i) => folded.add(i)); }
  if (folded.size) { const f = [...folded], x0 = P.getX(f[0]), y0 = P.getY(f[0]), z0 = P.getZ(f[0]); f.forEach((i) => P.setXYZ(i, x0, y0, z0)); P.needsUpdate = true; }
  // the head's frame: its top, the skull centre, which way the face looks along Y, the neck's axis
  const hp = head.m.geometry.attributes.position, hu = head.m.geometry.attributes.uv;
  const zTop = new THREE.Box3().setFromBufferAttribute(hp).max.z;
  let fx = 0, fy = 0, fn = 0;
  for (let i = 0; i < hp.count; i++) if (Math.hypot((hu.getX(i) - 0.5) / 0.15, (hu.getY(i) - 0.663) / 0.15) < 0.5) { fx += hp.getX(i); fy += hp.getY(i); fn++; }
  const band = (z, dz) => { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (let i = 0; i < hp.count; i++) if (Math.abs(hp.getZ(i) - z) < dz) { x0 = Math.min(x0, hp.getX(i)); x1 = Math.max(x1, hp.getX(i)); y0 = Math.min(y0, hp.getY(i)); y1 = Math.max(y1, hp.getY(i)); } return [(x0 + x1) / 2, (y0 + y1) / 2]; };
  const ch = new V3(fx / fn, band(zTop - 11, 2)[1], zTop - 11);
  const fwd = Math.sign(fy / fn - ch.y) || -1;
  const [nax, nay] = band(zTop - 25, 1.5);
  const rc = new THREE.Raycaster(); rc.far = 60;
  const hit = (obj, o, d, far) => { rc.set(o, d); const h = rc.intersectObject(obj, false); return h.length ? h[far ? h.length - 1 : 0] : null; };
  const FC = [FACE[0], 1 - FACE[1]], FR = FACE_R;
  // a grid of columns round the head, rows from the crown to under the chin, then round the neck
  const A = 120, rowsHead = 44, rowsNeck = 7, R = rowsHead + rowsNeck, zNeckBase = zTop - 27.5;
  const grid = new Float32Array(A * R * 3), alpha = new Float32Array(A * R).fill(1), guv = new Float32Array(A * R * 2).fill(0.1);
  for (let i = 0; i < A; i++) {
    const a = (i / A) * Math.PI * 2, cx = Math.sin(a), cy = Math.cos(a) * fwd; // column 0 looks out of the face
    const front = Math.max(0, Math.cos(a)), back = Math.max(0, -Math.cos(a));
    let last = null;
    for (let r = 0; r < R; r++) {
      let p;
      if (r < rowsHead) {
        const phi = lerp(Math.PI / 2, -0.98, r / (rowsHead - 1));
        const d = new V3(Math.cos(phi) * cx, Math.cos(phi) * cy, Math.sin(phi)).normalize();
        let h = hit(head.m, ch, d);
        // a ray through the lips hits the inside of the head, and one past the chin misses: both count as face
        if (front > 0.3 && (!h || (h.point.y - ch.y) * fwd < 0)) h = { point: ch.clone().addScaledVector(d, 9), uv: new THREE.Vector2(FC[0], FC[1]) };
        const base = h ? h.point.clone() : ch.clone().addScaledVector(d, 10);
        let off = 0.9 + (1.8 * back * sm(phi, -0.2, 0.7) + 0.5 * (1 - front)) * Math.cos(phi) ** 0.5 - 0.4 * sm(phi, 0.9, 1.5);
        off += 0.28 * Math.sin(a * 11) * (1 - sm(phi, -0.7, -0.2)); // folds under the chin
        if (h && h.uv) {
          const e = Math.hypot((h.uv.x - FC[0]) / FR[0], (h.uv.y - FC[1]) / FR[1]);
          alpha[i * R + r] = sm(e, 0.9, 1.0);
          off = lerp(0.45, off, sm(e, 1.0, 1.45)); // the hem sits close round the face
          guv.set(front > 0.2 ? [h.uv.x, h.uv.y] : [0.1, h.uv.y], (i * R + r) * 2);
        }
        p = base.addScaledVector(d, off);
      } else { // round the neck, loosening towards the shoulders
        const t = (r - rowsHead + 1) / rowsNeck, z = lerp(last.z, zNeckBase, t), o = new V3(nax, nay, z), d = new V3(cx, cy, 0);
        const h = hit(head.m, o, d, true) || hit(body.m, o, d, true);
        const rr = h ? Math.hypot(h.point.x - nax, h.point.y - nay) : 6;
        const want = Math.max(rr + 1.2 + 1.6 * t, Math.hypot(last.x - nax, last.y - nay) * (1 - t) + (rr + 2.8) * t) + 0.35 * Math.sin(a * 11 + 0.6) * (0.5 + t);
        p = new V3(nax + cx * want, nay + cy * want, z);
      }
      grid.set([p.x, p.y, p.z], (i * R + r) * 3); last = p;
    }
  }
  // relax the cloth: each point eases towards its neighbours, the hem round the face stays put
  for (let it = 0; it < 24; it++) {
    const G = grid.slice();
    for (let i = 0; i < A; i++) for (let r = 1; r < R - 1; r++) {
      const q = i * R + r;
      if (alpha[q] < 0.999 || alpha[q - 1] < 0.999 || alpha[q + 1] < 0.999) continue;
      const l = ((i + A - 1) % A) * R + r, rt = ((i + 1) % A) * R + r;
      for (let k = 0; k < 3; k++) grid[q * 3 + k] += 0.5 * ((G[l * 3 + k] + G[rt * 3 + k] + G[(q - 1) * 3 + k] + G[(q + 1) * 3 + k]) / 4 - G[q * 3 + k]);
    }
  }
  // each point moves like the nearest vertex of the head or body
  const n = A * R, si = new Float32Array(n * 4), sw = new Float32Array(n * 4);
  const cand = []; for (const src of [head, body]) for (let q = 0; q < src.src.length; q += 3) cand.push(src.src[q]);
  const cp = Float32Array.from(cand.flatMap((i) => [P.getX(i), P.getY(i), P.getZ(i)]));
  for (let q = 0; q < n; q++) {
    let best = 1e9, bi = cand[0];
    for (let c = 0; c < cand.length; c++) { const dx = cp[c * 3] - grid[q * 3], dy = cp[c * 3 + 1] - grid[q * 3 + 1], dz = cp[c * 3 + 2] - grid[q * 3 + 2], dd = dx * dx + dy * dy + dz * dz; if (dd < best) { best = dd; bi = cand[c]; } }
    si.set([SI.getX(bi), SI.getY(bi), SI.getZ(bi), SI.getW(bi)], q * 4); sw.set([SW.getX(bi), SW.getY(bi), SW.getZ(bi), SW.getW(bi)], q * 4);
  }
  const idx = [];
  for (let i = 0; i < A; i++) for (let r = 0; r < R - 1; r++) { const a1 = i * R + r, b1 = ((i + 1) % A) * R + r; idx.push(a1, a1 + 1, b1, b1, a1 + 1, b1 + 1); }
  const hg = new THREE.BufferGeometry();
  hg.setAttribute('position', new THREE.BufferAttribute(grid, 3)); hg.setAttribute('uv', new THREE.BufferAttribute(guv, 2));
  hg.setAttribute('skinIndex', new THREE.BufferAttribute(si, 4)); hg.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4));
  hg.setIndex(idx); hg.computeVertexNormals();
  // the face opening, and a soft shade in the fold round it, drawn in the head's UV space
  const S = 1024, ex = FC[0] * S, ey = (1 - FC[1]) * S;
  const cv = document.createElement('canvas'); cv.width = cv.height = S;
  const x = cv.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, S, S); x.fillStyle = '#000';
  x.beginPath(); x.ellipse(ex, ey, FR[0] * S, FR[1] * S, 0, 0, Math.PI * 2); x.fill();
  const cc = document.createElement('canvas'); cc.width = cc.height = S;
  const y = cc.getContext('2d');
  y.fillStyle = color; y.fillRect(0, 0, S, S);
  y.save(); y.translate(ex, ey); y.scale(FR[0] * S, FR[1] * S);
  const gr = y.createRadialGradient(0, 0, 0.95, 0, 0, 1.3);
  gr.addColorStop(0, 'rgba(0,0,0,0.35)'); gr.addColorStop(0.35, 'rgba(0,0,0,0.12)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  y.fillStyle = gr; y.beginPath(); y.arc(0, 0, 1.35, 0, Math.PI * 2); y.fill(); y.restore();
  const map = new THREE.CanvasTexture(cc); map.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshPhysicalMaterial({ map, alphaMap: new THREE.CanvasTexture(cv), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.92, sheen: 0.6, sheenRoughness: 0.55, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#fff'), 0.25) });
  const shell = new THREE.SkinnedMesh(hg, mat);
  shell.bind(mesh.skeleton, mesh.bindMatrix);
  shell.castShadow = true; shell.frustumCulled = false;
  mesh.parent.add(shell);
  return shell;
}

// ------------------------------------------------------------- the props
// Each is built in metres round the point the hand holds: +y up, +z along its length.
function paint(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
const phys = (o) => new THREE.MeshPhysicalMaterial(o);
const box = (w, h, d, r, mat, parent, y = 0) => { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat); m.position.y = y; m.castShadow = true; parent.add(m); return m; };
/** A handle: half a ring standing along z, its top at y = 0. */
function handle(mat, parent, r = 0.055) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.011, 12, 40, Math.PI), mat);
  m.rotation.y = Math.PI / 2; m.position.y = -r; m.castShadow = true; parent.add(m);
  return m;
}
/** The same round label on both sides of a case `w` wide, centred at height y. */
function sideLabels(tex, w, y, r, parent) {
  for (const s of [-1, 1]) {
    const m = new THREE.Mesh(new THREE.CircleGeometry(r, 48), phys({ map: tex, roughness: 0.5 }));
    m.position.set(s * (w / 2 + 0.001), y, 0); m.rotation.y = s * Math.PI / 2; parent.add(m);
  }
}
/** The home-visit doctor's bag: navy leather, a steel frame, the TabeebX badge. */
function bag({ logo }) {
  const g = new THREE.Group(), leather = phys({ color: '#1b1f52', roughness: 0.55, clearcoat: 0.3, clearcoatRoughness: 0.45, sheen: 0.3 });
  handle(leather, g);
  box(0.1, 0.022, 0.36, 0.009, phys({ color: '#d7dae3', metalness: 1, roughness: 0.28 }), g, -0.065);
  box(0.16, 0.22, 0.38, 0.035, leather, g, -0.185);
  sideLabels(paint(256, 256, (x, w, h) => { x.fillStyle = '#fff'; x.beginPath(); x.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2); x.fill(); x.drawImage(logo, w * 0.15, h * 0.15, w * 0.7, h * 0.7); }), 0.16, -0.18, 0.045, g);
  return g;
}
/** The sample kit: a white case with a pink band and handle. */
function kit({ logo }) {
  const g = new THREE.Group(), pinkMat = phys({ color: PINK, roughness: 0.4, clearcoat: 0.5 });
  handle(pinkMat, g, 0.045);
  box(0.11, 0.24, 0.34, 0.03, phys({ color: '#F3F4F8', roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.2 }), g, -0.165);
  box(0.114, 0.028, 0.344, 0.01, pinkMat, g, -0.09);
  const label = paint(512, 256, (x, w, h) => {
    x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, w, h);
    x.drawImage(logo, w * 0.06, h * 0.14, h * 0.72, h * 0.72);
    wordmark(x, w * 0.64, h * 0.42, h * 0.3);
    x.fillStyle = '#9A9CB0'; x.font = `500 ${h * 0.14}px Cairo`; x.textAlign = 'center'; x.fillText('LAB · تحاليل', w * 0.64, h * 0.74);
  });
  for (const s of [-1, 1]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.1), phys({ map: label, roughness: 0.5 }));
    m.position.set(s * 0.0555, -0.19, 0); m.rotation.y = s * Math.PI / 2; g.add(m);
  }
  return g;
}
/** A phone with the TabeebX app open; its screen faces +y. */
function phone({ figure }) {
  const g = new THREE.Group();
  box(0.072, 0.008, 0.15, 0.004, phys({ color: '#15161c', roughness: 0.3, clearcoat: 1 }), g);
  const screen = paint(330, 700, (x, w, h) => {
    x.fillStyle = '#F6F7FB'; x.fillRect(0, 0, w, h);
    x.fillStyle = PINK; x.fillRect(0, 0, w, h * 0.2);
    x.drawImage(figure, w * 0.08, h * 0.05, h * 0.1 * 0.95, h * 0.1);
    x.fillStyle = '#FFFFFF'; x.font = `700 ${h * 0.05}px Cairo`; x.textBaseline = 'middle'; x.direction = 'ltr'; x.fillText('TabeebX', w * 0.3, h * 0.1);
    for (let i = 0; i < 4; i++) {
      roundRect(x, w * 0.07, h * (0.25 + i * 0.18), w * 0.86, h * 0.14, 14); x.fillStyle = '#FFFFFF'; x.fill();
      x.fillStyle = i === 0 ? PINK : NAVY; x.beginPath(); x.arc(w * 0.2, h * (0.32 + i * 0.18), h * 0.035, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#C9CBD8'; x.fillRect(w * 0.32, h * (0.3 + i * 0.18), w * 0.48, h * 0.014); x.fillRect(w * 0.32, h * (0.335 + i * 0.18), w * 0.3, h * 0.014);
    }
  });
  const s = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.142), new THREE.MeshBasicMaterial({ map: screen }));
  s.rotation.x = -Math.PI / 2; s.position.y = 0.0042; g.add(s);
  return g;
}
const PROPS = { bag, kit, phone };

/** Puts `prop` in the hand on `side` (R or L) as the pose holds it, then hangs it on the hand so it follows. */
function hold(p, prop, side) {
  const at = (n) => p.bones[`Bip01_${side}_${n}`].getWorldPosition(new THREE.Vector3());
  const hand = at('Hand'), knuckles = at('Finger1').add(at('Finger3')).multiplyScalar(0.5), thumb = at('Finger0');
  const along = knuckles.clone().sub(hand).normalize();
  if (prop.userData.flat) { // lies in the palm, screen up, long side along the fingers
    const up = new THREE.Vector3().crossVectors(along, thumb.clone().sub(hand)).normalize().multiplyScalar(side === 'R' ? -1 : 1);
    const z = along.clone().sub(up.clone().multiplyScalar(along.dot(up))).normalize(), x = new THREE.Vector3().crossVectors(up, z);
    prop.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, up, z));
    prop.position.copy(hand.lerp(knuckles, 0.75)).addScaledVector(up, 0.02);
  } else { // hangs from the curled fingers, straight down, its length front to back
    prop.position.copy(knuckles).addScaledVector(along, 0.025).add(new THREE.Vector3(side === 'R' ? -0.02 : 0.02, 0.01, 0));
  }
  p.group.add(prop); p.group.updateMatrixWorld(true);
  p.bones[`Bip01_${side}_Hand`].attach(prop);
}

// ------------------------------------------------------------ a person
// Blend shapes worth their memory: speech (visemes), smiles, blinks.
const KEEP_SHAPES = /AA_VI_|MouthSmile|CheekRaiser|EyeBlink/;

/** Loads and dresses one person from src/cast.json. */
export async function loadPerson(key) {
  const all = await cast(), spec = all.people[key];
  if (!spec) throw new Error('No such person in src/cast.json: ' + key);
  const mgr = new THREE.LoadingManager();
  // The FBX names its .tga maps; this module brings its own, so the loader gets stand-ins.
  mgr.addHandler(/\.tga$/i, { path: '', setPath(v) { this.path = v; return this; }, load: () => new THREE.Texture() });
  const [root, clip] = await Promise.all([new FBXLoader(mgr).loadAsync(source.avatar(spec.body)), source.clip(spec.clip)]);

  // the parts, named by their material: head, body, opacity (hair cards and lashes), and props like the stethoscope
  const meshes = [];
  root.traverse((o) => { if (o.isMesh) meshes.push(o); });
  const parts = new Map(), partOf = (mat) => /^[a-z]\d+_(\w+)$/i.exec(mat.name)?.[1];
  for (const m of meshes) for (const mat of [].concat(m.material)) { const k = /^([a-z]\d+)_(\w+)$/i.exec(mat.name); if (k) parts.set(k[2], k[1]); }
  const prefix = parts.get('head') || parts.get('body');
  const maps = {};
  await Promise.all([...parts.keys()].map(async (part) => {
    const file = `${parts.get(part)}_${part}`;
    maps[part] = { color: await source.image(spec.body, `${file}_color`), normal: part === 'opacity' ? null : await source.image(spec.body, `${file}_normal`) };
  }));
  let ratio = null;
  if (spec.head) {
    const dir = all.heads[spec.head];
    const [face, faceNormal] = await Promise.all([source.image(dir, `${spec.head}_head_color`), spec.keepHair ? null : source.image(dir, `${spec.head}_head_normal`)]);
    ratio = swapFace(maps.head.color, face, spec.keepHair);
    if (faceNormal) maps.head.normal = faceNormal;
  }
  if (maps.body) await dressBody(maps.body.color, prefix, ratio);
  const made = new Map([...parts.keys()].map((part) => [part, material(part, maps[part].color, maps[part].normal)]));
  const hideHair = spec.hideHair || spec.hijab;
  for (const m of meshes) {
    const dress = (mat) => made.get(partOf(mat)) || mat;
    m.material = Array.isArray(m.material) ? m.material.map(dress) : dress(m.material);
    for (const mat of [].concat(m.material)) if (mat.name === 'opacity' && hideHair) mat.visible = false;
    m.castShadow = true; m.frustumCulled = false;
  }
  const body = meshes.find((m) => m.isSkinnedMesh && [].concat(m.material).some((mat) => mat.name === 'head'));
  // most of the 180 blend shapes are left out: each one costs a full copy of the mesh on the GPU
  const shapes = body.geometry.morphAttributes.position || [];
  if (shapes.length) {
    const keep = shapes.map((a, i) => (KEEP_SHAPES.test(a.name) ? i : -1)).filter((i) => i >= 0);
    for (const k of Object.keys(body.geometry.morphAttributes)) body.geometry.morphAttributes[k] = keep.map((i) => body.geometry.morphAttributes[k][i]);
    body.updateMorphTargets();
  }
  if (spec.hijab) hijab(body, spec.hijab);

  const face = (name, v) => { const i = body.morphTargetDictionary?.['blendShape1.' + name]; if (i != null) body.morphTargetInfluences[i] = v; };
  const smile = (v) => { face('AK_44_MouthSmileLeft', v); face('AK_45_MouthSmileRight', v); face('AU_06_CheekRaiser', v * 0.6); };
  smile(spec.smile || 0);

  const mixer = new THREE.AnimationMixer(root);
  mixer.clipAction(clip).play();
  const group = new THREE.Group();
  root.scale.multiplyScalar(0.01); // centimetres to metres
  group.add(root);
  const bones = {};
  root.traverse((o) => { if (o.isBone) bones[o.name] = o; });
  const pose = (t) => { mixer.setTime(t); group.updateMatrixWorld(true); };
  pose(spec.t || 0);
  const person = { key, spec, group, body, bones, pose, smile, face };
  if (spec.prop) {
    const prop = PROPS[spec.prop](await markImages());
    prop.userData.flat = spec.prop === 'phone';
    hold(person, prop, spec.hand || 'R');
  }
  return person;
}
