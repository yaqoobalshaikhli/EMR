// Builds assets/brand/figure-white.png: the logo's figure (head + arms/heart),
// without the wordmark, as a white shape on a transparent background.
// That is the form the Design guideline asks for inside the pink tab and on
// the end card. Run once whenever the source logo changes:
//
//   node scripts/extract-figure.mjs [source.png] [--crop-bottom 0.635]
//
// The source is a dark logo on a light background; darkness becomes opacity.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const src = args.find((a) => !a.startsWith('--')) || path.resolve(root, '../../custom/branding/logo.png');
const cropArg = args.indexOf('--crop-bottom');
// Share of the source height that holds the figure; below it sits the wordmark.
const cropBottom = cropArg >= 0 ? Number(args[cropArg + 1]) : 0.635;
const out = path.join(root, 'assets/brand/figure-white.png');

const dataUrl = 'data:image/png;base64,' + readFileSync(src).toString('base64');
const browser = await chromium.launch();
const page = await browser.newPage();
const png = await page.evaluate(async ({ dataUrl, cropBottom }) => {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const w = img.naturalWidth;
  const h = Math.round(img.naturalHeight * cropBottom);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = '#fff';
  g.fillRect(0, 0, w, h);
  g.drawImage(img, 0, 0);
  const id = g.getImageData(0, 0, w, h);
  const d = id.data;
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      const a = Math.max(0, Math.min(255, Math.round((255 - lum) * 1.04)));
      d[i] = d[i + 1] = d[i + 2] = 255;
      d[i + 3] = a;
      if (a > 24) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  g.putImageData(id, 0, 0);
  const pad = 8;
  const cw = maxX - minX + 1 + pad * 2, ch = maxY - minY + 1 + pad * 2;
  const o = document.createElement('canvas');
  o.width = cw; o.height = ch;
  o.getContext('2d').drawImage(c, minX - pad, minY - pad, cw, ch, 0, 0, cw, ch);
  return { url: o.toDataURL('image/png'), w: cw, h: ch };
}, { dataUrl, cropBottom });
await browser.close();
writeFileSync(out, Buffer.from(png.url.split(',')[1], 'base64'));
console.log(`figure → ${path.relative(root, out)} (${png.w}×${png.h})`);
