// Print the TabeebX logo into a photo, in code: warped onto the cloth in perspective,
// shaded by the photo's own light (folds, shadow, grain), so it sits in the garment instead of on it.
//
//   node scripts/embed-logo.mjs assets/shots/knock_plain.png assets/shots/knock.jpg [content/home-visit-prints.json]
//
// For each print in the config: the logo (official colours, wordmark reversed to white) is mapped
// through a homography onto the quad; the cloth's luminance gives (1) a fold shade, (2) a small
// displacement so the print follows the folds, (3) micro-texture that the print keeps, and
// (4) how much light falls there; the ink is a little uneven. Deterministic: same input, same output.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [src, out, cfgPath = path.join(root, 'content/home-visit-prints.json')] = process.argv.slice(2);
if (!src || !out) { console.error('usage: embed-logo.mjs PHOTO OUT [CONFIG]'); process.exit(1); }
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
const photo = readFileSync(src).toString('base64');
const mime = src.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
const logoJs = readFileSync(path.join(root, 'src/logo.js'), 'utf8');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<canvas id=c></canvas>');
await page.evaluate(() => { window.TX = {}; });
await page.addScriptTag({ content: logoJs });

const dataUrl = await page.evaluate(async ({ photo, mime, prints }) => {
  const TX = window.TX;
  const load = (url) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
  const img = await load(`data:${mime};base64,${photo}`);
  const W = img.width, H = img.height;
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const ctxOf = (c) => c.getContext('2d', { willReadFrequently: true });
  const base = canvas(W, H); const bx = ctxOf(base); bx.drawImage(img, 0, 0);
  const px = bx.getImageData(0, 0, W, H);
  const blurred = (sigma) => { const c = canvas(W, H), x = ctxOf(c); x.filter = `blur(${sigma}px)`; x.drawImage(base, 0, 0); return x.getImageData(0, 0, W, H).data; };
  const lum = (d, i) => (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
  const bigD = blurred(16), midD = blurred(1.6), smoothD = blurred(4);

  // The logo, official colours, as an image (the wordmark is navy in the artwork; reversed to white here).
  const [fx, fy] = [TX.logo.wordBox[0], TX.logo.figureBox[1]];
  const lw = TX.logo.wordBox[2], lh = TX.logo.wordBox[1] + TX.logo.wordBox[3] - fy;
  const paths = TX.logo.order.map((k) => `<path d="${TX.logo.parts[k].d}" fill="${TX.logo.parts[k].color === '#181943' ? '#FFFEFF' : TX.logo.parts[k].color}"/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${fx} ${fy} ${lw} ${lh}" width="${lw}" height="${lh}">${paths}</svg>`;
  const logoImg = await load('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));

  // Solve the homography that takes a unit-square point (u, v) to photo pixels (and invert it).
  const solve = (A, b) => {
    const n = b.length;
    for (let c = 0; c < n; c++) {
      let m = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[m][c])) m = r;
      [A[c], A[m]] = [A[m], A[c]]; [b[c], b[m]] = [b[m], b[c]];
      for (let r = c + 1; r < n; r++) { const f = A[r][c] / A[c][c]; for (let k = c; k < n; k++) A[r][k] -= f * A[c][k]; b[r] -= f * b[c]; }
    }
    const x = new Array(n); for (let r = n - 1; r >= 0; r--) { let s = b[r]; for (let k = r + 1; k < n; k++) s -= A[r][k] * x[k]; x[r] = s / A[r][r]; } return x;
  };
  const homography = (from, to) => { // maps `from` points to `to` points: [h0..h7]
    const A = [], b = [];
    for (let i = 0; i < 4; i++) {
      const [x, y] = from[i], [u, v] = to[i];
      A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
      A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
    }
    return solve(A, b);
  };
  const apply = (h, x, y) => { const d = h[6] * x + h[7] * y + 1; return [(h[0] * x + h[1] * y + h[2]) / d, (h[3] * x + h[4] * y + h[5]) / d]; };
  // Deterministic value noise for the ink.
  const hash = (x, y) => { let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263); n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };

  const out = bx.getImageData(0, 0, W, H);
  for (const pr of prints) {
    const q = pr.quad;
    const pw = Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]), ph = Math.hypot(q[3][0] - q[0][0], q[3][1] - q[0][1]);
    // Logo raster, about twice the size it is printed, softened a touch like ink in cloth.
    const rw = Math.round(pw * 2), rh = Math.round(rw * lh / lw);
    const lc = canvas(rw, rh), lx = ctxOf(lc); lx.filter = 'blur(0.5px)'; lx.drawImage(logoImg, 0, 0, rw, rh);
    const ld = lx.getImageData(0, 0, rw, rh).data;
    const sample = (u, v) => { // bilinear, premultiplied
      const x = u * (rw - 1), y = v * (rh - 1); if (x < 0 || y < 0 || x > rw - 1 || y > rh - 1) return [0, 0, 0, 0];
      const x0 = Math.floor(x), y0 = Math.floor(y), tx = x - x0, ty = y - y0, r = [0, 0, 0, 0];
      for (const [dx, dy, w] of [[0, 0, (1 - tx) * (1 - ty)], [1, 0, tx * (1 - ty)], [0, 1, (1 - tx) * ty], [1, 1, tx * ty]]) {
        const k = ((Math.min(y0 + dy, rh - 1)) * rw + Math.min(x0 + dx, rw - 1)) * 4, a = ld[k + 3] / 255;
        r[0] += ld[k] * a * w; r[1] += ld[k + 1] * a * w; r[2] += ld[k + 2] * a * w; r[3] += a * w;
      }
      return r;
    };
    const toUnit = homography(q, [[0, 0], [1, 0], [1, 1], [0, 1]]); // photo px → logo (u, v)
    const xs = q.map((p) => p[0]), ys = q.map((p) => p[1]);
    const x0 = Math.floor(Math.min(...xs)) - 6, x1 = Math.ceil(Math.max(...xs)) + 6, y0 = Math.floor(Math.min(...ys)) - 6, y1 = Math.ceil(Math.max(...ys)) + 6;
    const bigAt = (x, y) => lum(bigD, (y * W + x) * 4);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = (y * W + x) * 4;
      // Fold displacement: the print slides along the cloth's luminance gradient (folds tilt the surface).
      const gx = lum(smoothD, (y * W + x + 2) * 4) - lum(smoothD, (y * W + x - 2) * 4);
      const gy = lum(smoothD, ((y + 2) * W + x) * 4) - lum(smoothD, ((y - 2) * W + x) * 4);
      const k = pr.fold * 14; // px of shift per unit of luminance gradient
      // 2×2 supersampling for clean edges
      let r = 0, g = 0, b = 0, a = 0;
      for (const [ox, oy] of [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]]) {
        const [u, v] = apply(toUnit, x + ox - gx * k, y + oy - gy * k);
        const s = sample(u, v); r += s[0]; g += s[1]; b += s[2]; a += s[3];
      }
      r /= 4; g /= 4; b /= 4; a /= 4; if (a < 0.002) continue;
      r /= a; g /= a; b /= a; // un-premultiply
      const big = Math.max(lum(bigD, i), 0.01), mid = lum(midD, i), raw = lum(px.data, i);
      const fold = Math.min(1.45, Math.max(0.5, 1 + pr.fold * (mid / big - 1)));      // the cloth's folds, as a gain
      const light = pr.floor + (1 - pr.floor) * Math.pow(Math.min(1, big / pr.lit), 0.8); // how much light falls here
      const micro = 1 + (pr.micro == null ? 0.35 : pr.micro) * ((raw - mid) / big);                                      // weave and grain the print keeps
      const ink = 1 - pr.ink * (0.5 * hash(x >> 1, y >> 1) + 0.5 * hash(x >> 3, y >> 3));  // uneven ink, soft
      const gain = fold * light * micro * ink;
      const al = Math.min(1, a * pr.alpha);
      out.data[i] = Math.min(255, out.data[i] * (1 - al) + r * gain * al);
      out.data[i + 1] = Math.min(255, out.data[i + 1] * (1 - al) + g * gain * al);
      out.data[i + 2] = Math.min(255, out.data[i + 2] * (1 - al) + b * gain * al);
    }
  }
  bx.putImageData(out, 0, 0);
  return base.toDataURL('image/jpeg', 0.95);
}, { photo, mime, prints: cfg.prints });

writeFileSync(out, Buffer.from(dataUrl.split(',')[1], 'base64'));
await browser.close();
console.log(`✓ ${path.relative(process.cwd(), out)}: ${cfg.prints.length} prints`);
