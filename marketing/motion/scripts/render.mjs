// Render campaign jobs to Instagram-ready files.
//
//   node scripts/render.mjs all                 every job in content/campaign.json
//   node scripts/render.mjs launch               jobs whose id contains "launch"
//   node scripts/render.mjs launch --from 19.2 --to 30.2 --suffix broll
//   node scripts/render.mjs all --draft          stamp every video "مسودة · DRAFT"
//   node scripts/render.mjs --list
//
// Videos: 1080×1920 (or the template's size), H.264 High, 30 fps, AAC 48 kHz,
// BT.709 — Instagram's preferred upload format. Stills: PNG.
// Needs ffmpeg with libx264 on PATH, or FFMPEG=/path/to/ffmpeg.
import { chromium } from 'playwright';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdirSync, readFileSync, existsSync, statSync, createReadStream, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { mix, writeWav, doorbell } from './audio.mjs';
import { lintCampaign } from './lint-copy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';

// ------------------------------------------------------------------ args
const argv = process.argv.slice(2);
const flag = (name, def = null) => {
  const i = argv.indexOf('--' + name);
  if (i < 0) return def;
  const v = argv[i + 1];
  return v == null || v.startsWith('--') ? true : v;
};
const valueFlags = new Set(['from', 'to', 'suffix', 'jobs', 'out', 'crf', 'frames']);
const targets = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && valueFlags.has(argv[i - 1].slice(2))));
const outDir = path.resolve(root, flag('out', 'out'));
const parallel = Number(flag('jobs', 2));
const crf = String(flag('crf', 16));

const campaign = JSON.parse(readFileSync(path.join(root, 'content/campaign.json'), 'utf8'));
// A job may reuse another job's template and params ("extends") and render only
// part of it ("range": [from, to]), e.g. the launch Reel's door beat as B-roll.
for (const j of campaign.jobs) {
  if (!j.extends) continue;
  const base = campaign.jobs.find((b) => b.id === j.extends);
  if (!base) { console.error(`${j.id}: extends unknown job ${j.extends}`); process.exit(1); }
  j.template = base.template;
  j.params = { ...base.params, ...(j.params || {}) };
}
if (flag('list')) {
  for (const j of campaign.jobs) console.log(`${j.id.padEnd(34)} ${j.template.padEnd(18)} ${j.when || ''}`);
  process.exit(0);
}
let jobs = campaign.jobs;
if (targets.length && !targets.includes('all')) jobs = jobs.filter((j) => targets.some((t) => j.id.includes(t)));
if (!jobs.length) { console.error('No job matches', targets.join(' ')); process.exit(1); }

// Copy rules run before anything renders. Unfilled placeholders force a draft stamp.
const report = lintCampaign(campaign, jobs.map((j) => j.id));
for (const w of report.warnings) console.warn('  ⚠', w);
if (report.errors.length) {
  for (const e of report.errors) console.error('  ✖', e);
  console.error('Copy check failed. Fix content/campaign.json (see README → Copy rules).');
  process.exit(1);
}

// ---------------------------------------------------------------- server
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.join(root, rel);
  if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;

mkdirSync(outDir, { recursive: true });
const tmpDir = path.join(outDir, '.tmp');
mkdirSync(tmpDir, { recursive: true });

const browser = await chromium.launch();

async function renderJob(job) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error(`[${job.id}] page error:`, e.message));
  await page.goto(`${base}/src/stage.html`);
  const draft = !!(flag('draft') || job.draft || report.placeholders.has(job.id));
  const info = await page.evaluate(([j, b, o]) => window.__setup(j, b, o), [job, campaign.brand, { draft, draftLabel: job.draftLabel }]);
  const clip = { x: 0, y: 0, width: info.w, height: info.h };
  const started = Date.now();

  if (info.kind === 'still') {
    const dir = path.join(outDir, job.id);
    mkdirSync(dir, { recursive: true });
    for (let i = 0; i < info.pages; i++) {
      await page.evaluate((t) => window.__render(t), i);
      await page.screenshot({ path: path.join(dir, `${job.id}-${String(i + 1).padStart(2, '0')}.png`), clip, type: 'png' });
    }
    console.log(`✓ ${job.id}: ${info.pages} PNG${draft ? ' (draft)' : ''} in ${((Date.now() - started) / 1000).toFixed(1)}s`);
    await page.close();
    return;
  }

  // --frames 1.9,4,12.5 → PNG stills at those times, for a quick look without encoding.
  if (flag('frames')) {
    const dir = path.join(outDir, 'frames');
    mkdirSync(dir, { recursive: true });
    for (const tt of String(flag('frames')).split(',').map(Number)) {
      await page.evaluate((x) => window.__render(x), tt);
      await page.screenshot({ path: path.join(dir, `${job.id}@${tt.toFixed(2)}.png`), clip, type: 'png' });
    }
    console.log(`✓ ${job.id}: frames → ${path.relative(root, dir)}`);
    await page.close();
    return;
  }

  const from = Number(flag('from', job.range ? job.range[0] : 0));
  const to = Math.min(Number(flag('to', job.range ? job.range[1] : info.duration)), info.duration);
  const suffix = flag('suffix') ? `-${flag('suffix')}` : '';
  const name = `${job.id}${suffix}`;
  const frames = Math.round((to - from) * info.fps);

  const wav = path.join(tmpDir, `${name}.wav`);
  writeWav(wav, mix({ from, to, cues: info.cues, bed: info.bed }));

  const out = path.join(outDir, `${name}.mp4`);
  const ff = spawn(FFMPEG, [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'image2pipe', '-framerate', String(info.fps), '-c:v', 'png', '-i', '-',
    '-i', wav,
    '-map', '0:v', '-map', '1:a',
    // Lossless PNG frames and accurate rounding keep brand hex values within ±1 after encoding.
    '-vf', 'scale=out_color_matrix=bt709:out_range=tv:flags=bicubic+accurate_rnd+full_chroma_int,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', crf, '-profile:v', 'high', '-level', '4.2',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-r', String(info.fps), '-g', String(info.fps * 2),
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
    '-shortest', '-movflags', '+faststart', out,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = once(ff, 'exit');

  // Lossless PNG straight from the compositor; optimizeForSpeed trades file size for time.
  const cdp = await page.context().newCDPSession(page);
  const shot = { format: 'png', optimizeForSpeed: true, clip: { ...clip, scale: 1 } };
  for (let f = 0; f < frames; f++) {
    const t = from + f / info.fps;
    await page.evaluate((x) => window.__render(x), t);
    const { data } = await cdp.send('Page.captureScreenshot', shot);
    if (!ff.stdin.write(Buffer.from(data, 'base64'))) await once(ff.stdin, 'drain');
  }
  await cdp.detach();
  ff.stdin.end();
  const [code] = await done;
  if (code !== 0) throw new Error(`ffmpeg exited ${code} for ${name}`);

  if (info.cover != null && !suffix && !job.range) {
    await page.evaluate((x) => window.__render(x), info.cover);
    await page.screenshot({ path: path.join(outDir, `${name}-cover.png`), clip, type: 'png' });
  }
  console.log(`✓ ${name}.mp4  ${(to - from).toFixed(1)}s ${info.w}×${info.h}${draft ? ' (draft)' : ''} in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  await page.close();
}

// The doorbell on its own, for editors cutting real footage in CapCut or Premiere.
writeWav(path.join(outDir, 'tabeebx-doorbell.wav'), doorbell());

const queue = [...jobs];
const workers = Array.from({ length: Math.max(1, parallel) }, async () => {
  while (queue.length) {
    const job = queue.shift();
    try { await renderJob(job); } catch (e) { console.error(`✖ ${job.id}:`, e.message); process.exitCode = 1; }
  }
});
await Promise.all(workers);
await browser.close();
server.close();
rmSync(tmpDir, { recursive: true, force: true });
