// Copies the TabeebX cast out of the Microsoft Rocketbox avatar library (MIT)
// into assets/cast, in web-friendly form. Run it again after editing src/cast.json.
//
//   git clone --depth 1 https://github.com/microsoft/Microsoft-Rocketbox /somewhere/rocketbox
//   FFMPEG=/path/to/ffmpeg node scripts/build-cast.mjs /somewhere/rocketbox/Assets
//
// What it writes:
//   assets/cast/avatars/<Name>.fbx   the rigged avatar with its 180 facial blend shapes
//   assets/cast/tex/*.jpg|png        colour maps at 2048 px, normal maps at 1024 px (no specular)
//   assets/cast/anims/<clip>.json    motion clips, resampled to 15 fps and cut to 12 s
import { chromium } from 'playwright';
import http from 'node:http';
import { once } from 'node:events';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync, statSync, createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.resolve(process.argv[2] || path.join(root, '.cast-src'));
const out = path.join(root, 'assets/cast');
const ffmpeg = process.env.FFMPEG || 'ffmpeg';
const cast = JSON.parse(readFileSync(path.join(root, 'src/cast.json'), 'utf8'));
for (const d of ['avatars', 'tex', 'anims']) mkdirSync(path.join(out, d), { recursive: true });

const conv = (from, to, size, extra = []) => {
  if (existsSync(to) && statSync(to).mtimeMs > statSync(from).mtimeMs) return;
  execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', from, '-vf', `scale=${size}:${size}:flags=lanczos`, ...extra, to]);
};
const textures = (dir, only) => {
  for (const f of readdirSync(dir)) {
    const m = /^(\w+?)_(\w+?)_(color|normal)(?:_\w+)?\.tga$/i.exec(f);
    if (!m || (only && !only(m[2]))) continue;
    const base = `${m[1]}_${m[2]}_${m[3]}`;
    if (m[3] === 'normal') conv(path.join(dir, f), path.join(out, 'tex', base + '.jpg'), 1024, ['-q:v', '3']);
    else if (m[2] === 'opacity') conv(path.join(dir, f), path.join(out, 'tex', base + '.png'), 1024, ['-pix_fmt', 'rgba']);
    else conv(path.join(dir, f), path.join(out, 'tex', base + '.jpg'), 2048, ['-q:v', '3']);
  }
};

// Avatars: the facial export, which carries the blend shapes for smiles and speech.
for (const [key, p] of Object.entries(cast.people)) {
  const name = path.basename(p.body);
  copyFileSync(path.join(src, 'Avatars', p.body, 'Export', `${name}_facial.fbx`), path.join(out, 'avatars', `${name}.fbx`));
  textures(path.join(src, 'Avatars', p.body, 'Textures'));
  console.log('✓', key, name);
}
// Faces worn on other bodies: head maps only.
for (const [prefix, dir] of Object.entries(cast.heads)) {
  textures(path.join(src, 'Avatars', dir, 'Textures'), (part) => part === 'head');
  console.log('✓ head', prefix);
}

// Motion: parsed by three's FBXLoader in Chromium, then stored as compact JSON.
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = rel.startsWith('/@src/') ? path.join(src, rel.slice(6)) : path.join(root, rel);
  if (!existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': file.endsWith('.js') ? 'text/javascript' : file.endsWith('.html') ? 'text/html' : 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;
writeFileSync(path.join(root, 'out', '.cast-build.html'), `<!doctype html><script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script>
<script type="module">
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
window.convert = async (url, fps, maxT) => {
  const clip = (await new FBXLoader().loadAsync(url)).animations[0];
  const dur = Math.min(clip.duration, maxT), n = Math.floor(dur * fps) + 1, tracks = [];
  for (const tr of clip.tracks) {
    const [node, prop] = tr.name.split('.');
    if (prop === 'scale' || (prop === 'position' && !/^Bip01(_Pelvis)?$/.test(node))) continue;
    const it = tr.createInterpolant(), v = [];
    for (let i = 0; i < n; i++) for (const x of it.evaluate(i / fps)) v.push(Math.round(x * 1e4) / 1e4);
    tracks.push({ n: tr.name, q: prop === 'quaternion' ? 1 : 0, v });
  }
  return JSON.stringify({ fps, frames: n, tracks });
};
window.ready = true;
</script>`);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${base}/out/.cast-build.html`);
await page.waitForFunction(() => window.ready);
for (const clip of cast.clips) {
  const json = await page.evaluate(([u]) => window.convert(u, 15, 12), [`${base}/@src/Animations/all_animations_max_motextr_static/${clip}.max.fbx`]);
  writeFileSync(path.join(out, 'anims', `${clip}.json`), json);
  console.log('✓ clip', clip, (json.length / 1024).toFixed(0) + ' KB');
}
await browser.close();
server.close();
