// Cut the founder's read-through into one clean clip per film line, matched in loudness to each other (the mix sets the voice against the music).
//   node scripts/voice-lines.mjs [assets/voice/physio-recording.m4a] [content/voice/physio-takes.json] [assets/voice/physio]
// The recording and the clips are private (assets/voice/ is git-ignored). The takes file says where each line is.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SR, loudness, writeWav } from './audio.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [rec = 'assets/voice/physio-recording.m4a', takes = 'content/voice/physio-takes.json', outDir = 'assets/voice/physio'] = process.argv.slice(2);
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const cfg = JSON.parse(readFileSync(path.resolve(root, takes), 'utf8'));

// One pass over the whole recording: out the rumble and the hiss above speech, and a gentle compressor
// so a soft word and a loud one sit closer. Mono, 48 kHz.
const dec = spawnSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-i', path.resolve(root, rec), '-ac', '1', '-ar', String(SR),
  '-af', 'highpass=f=80,lowpass=f=15000,acompressor=threshold=0.05:ratio=2.5:attack=8:release=140:makeup=1.5', '-f', 'f32le', '-'],
{ maxBuffer: 1 << 30 });
if (dec.status !== 0) { console.error(String(dec.stderr)); process.exit(1); }
const src = new Float32Array(dec.stdout.buffer.slice(dec.stdout.byteOffset, dec.stdout.byteOffset + dec.stdout.length));
const at = (s) => Math.round(s * SR);
const piece = (a, b) => src.slice(at(a), at(b));

const XF = at(0.015);
function join(parts) { // equal-power crossfade of 15 ms between pieces cut out of a silence
  let out = parts[0];
  for (let i = 1; i < parts.length; i++) {
    const p = parts[i], n = out.length - XF + p.length, r = new Float32Array(n);
    r.set(out.subarray(0, out.length - XF));
    for (let j = 0; j < XF; j++) {
      const f = j / XF;
      r[out.length - XF + j] = out[out.length - XF + j] * Math.cos(f * Math.PI / 2) + p[j] * Math.sin(f * Math.PI / 2);
    }
    r.set(p.subarray(XF), out.length);
    out = r;
  }
  return out;
}

mkdirSync(path.resolve(root, outDir), { recursive: true });
const meta = {};
for (const ln of cfg.lines) {
  const [a, b] = ln.range;
  let cuts = [[a, b]];
  for (const [from, to, keep] of (ln.squeeze || [])) {
    const last = cuts.pop();
    cuts.push([last[0], from + keep / 2], [to - keep / 2, last[1]]);
  }
  let x = join(cuts.map(([s, e]) => piece(s, e)));
  const fi = at(0.01), fo = at(0.03);
  for (let i = 0; i < fi; i++) x[i] *= i / fi;
  for (let i = 0; i < fo; i++) x[x.length - 1 - i] *= i / fo;
  const g = Math.pow(10, (cfg.lufs - loudness({ L: x, R: x })) / 20);
  let peak = 0;
  for (let i = 0; i < x.length; i++) { x[i] *= g; peak = Math.max(peak, Math.abs(x[i])); }
  writeWav(path.resolve(root, outDir, `${ln.id}.wav`), { L: x, R: x });
  meta[ln.id] = { dur: +(x.length / SR).toFixed(3), peakDb: +(20 * Math.log10(peak)).toFixed(1) };
  console.log(`${ln.id}  ${meta[ln.id].dur.toFixed(2)} s  peak ${meta[ln.id].peakDb} dBFS`);
}
writeFileSync(path.resolve(root, outDir, 'lines.json'), JSON.stringify(meta, null, 1));
