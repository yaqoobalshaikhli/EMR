// Original, synthesized audio for the campaign, so nothing needs licensing:
//  - the doorbell: a soft two-note chime (Design guideline → asset 4), the
//    first and last sound of every Reel;
//  - a quiet warm pad that sits under text-only videos;
//  - small interface sounds (pop, tick, whoosh, blip) for motion accents.
// Everything is generated at 48 kHz stereo and mixed from a cue list the
// template returns, so sound and picture share one clock.
import { writeFileSync } from 'node:fs';

export const SR = 48000;
// Offset of the second note; src/stage.html uses the same value for the rings.
export const BELL_SECOND = 0.38;

const TAU = Math.PI * 2;

function buffer(seconds) {
  const n = Math.max(1, Math.round(seconds * SR));
  return { L: new Float32Array(n), R: new Float32Array(n) };
}

function noise(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2 - 1;
  };
}

/** Small Schroeder reverb: four combs into two all-passes, per channel. */
function reverb(input, wet, spreadMs) {
  const combs = [29.7, 37.1, 41.1, 43.7].map((ms) => Math.round(((ms + spreadMs) / 1000) * SR));
  const aps = [5.0, 1.7].map((ms) => Math.round(((ms + spreadMs * 0.3) / 1000) * SR));
  const out = new Float32Array(input.length);
  const cb = combs.map((d) => ({ d, buf: new Float32Array(d), i: 0, lp: 0 }));
  const ab = aps.map((d) => ({ d, buf: new Float32Array(d), i: 0 }));
  for (let n = 0; n < input.length; n++) {
    const x = input[n];
    let s = 0;
    for (const c of cb) {
      const y = c.buf[c.i];
      c.lp = y * 0.62 + c.lp * 0.38; // damping
      c.buf[c.i] = x + c.lp * 0.78;
      c.i = (c.i + 1) % c.d;
      s += y;
    }
    s *= 0.25;
    for (const a of ab) {
      const y = a.buf[a.i];
      const v = s + y * 0.7;
      a.buf[a.i] = v;
      a.i = (a.i + 1) % a.d;
      s = y - v * 0.7;
    }
    out[n] = x * (1 - wet) + s * wet;
  }
  return out;
}

function onePoleLP(x, cutoff) {
  const a = Math.exp((-TAU * cutoff) / SR);
  let y = 0;
  for (let i = 0; i < x.length; i++) { y = x[i] * (1 - a) + y * a; x[i] = y; }
  return x;
}

function normalize(b, peak) {
  let m = 0;
  for (let i = 0; i < b.L.length; i++) m = Math.max(m, Math.abs(b.L[i]), Math.abs(b.R[i]));
  const g = m > 0 ? peak / m : 1;
  for (let i = 0; i < b.L.length; i++) { b.L[i] *= g; b.R[i] *= g; }
  return b;
}

// ------------------------------------------------------------ doorbell
/** E5 then C5, a descending major third: "the doctor is at your door". */
export function doorbell() {
  const b = buffer(1.9);
  const mono = new Float32Array(b.L.length);
  // [ratio, amplitude, decay seconds]: a soft struck bar, not a harsh bell.
  const partials = [[1, 1, 1.25], [2, 0.26, 0.5], [3, 0.08, 0.3], [4.16, 0.05, 0.18], [5.43, 0.025, 0.11]];
  const notes = [{ f: 659.26, t: 0, a: 1 }, { f: 523.25, t: BELL_SECOND, a: 0.92 }];
  for (const note of notes) {
    const i0 = Math.round(note.t * SR);
    for (let i = i0; i < mono.length; i++) {
      const tt = (i - i0) / SR;
      const att = Math.min(1, tt / 0.005);
      let v = 0;
      for (const [r, a, d] of partials) v += a * Math.sin(TAU * note.f * r * tt) * Math.exp(-tt / d);
      mono[i] += v * att * note.a;
    }
  }
  onePoleLP(mono, 5200);
  b.L = reverb(mono, 0.22, 0);
  b.R = reverb(mono, 0.22, 1.9);
  // fade the tail so it never clicks
  const fade = Math.round(0.25 * SR);
  for (let i = 0; i < fade; i++) {
    const g = 1 - i / fade;
    b.L[b.L.length - fade + i] *= g;
    b.R[b.R.length - fade + i] *= g;
  }
  return normalize(b, 0.7);
}

// -------------------------------------------------------------- sfx
function pop() {
  const b = buffer(0.3);
  for (let i = 0; i < b.L.length; i++) {
    const t = i / SR;
    // Pitch falls from 1300 Hz to 480 Hz; phase is the integral of that curve.
    const ph = TAU * (480 * t + 820 * 0.02 * (1 - Math.exp(-t / 0.02)));
    const v = Math.sin(ph) * Math.exp(-t / 0.055) * Math.min(1, t / 0.002);
    b.L[i] = b.R[i] = v;
  }
  return normalize(b, 0.2);
}

function tick() {
  const b = buffer(0.06);
  const rnd = noise(7);
  let prev = 0;
  for (let i = 0; i < b.L.length; i++) {
    const t = i / SR;
    const n = rnd();
    const hp = n - prev; prev = n;
    const v = hp * Math.exp(-t / 0.0025) * 0.6 + Math.sin(TAU * 2100 * t) * Math.exp(-t / 0.006) * 0.5;
    b.L[i] = v * 0.9; b.R[i] = v;
  }
  return normalize(b, 0.07);
}

function whoosh() {
  const b = buffer(0.75);
  const rnd = noise(11);
  let z1 = 0, z2 = 0;
  for (let i = 0; i < b.L.length; i++) {
    const t = i / SR, k = t / 0.75;
    const fc = 300 + 2400 * k * k;
    // state-variable band-pass
    const f = 2 * Math.sin((Math.PI * fc) / SR), q = 0.5;
    const x = rnd();
    const hp = x - z2 - q * z1;
    z1 += f * hp; z2 += f * z1;
    const v = z1 * Math.sin(Math.PI * k);
    b.L[i] = v * (1 - 0.3 * k); b.R[i] = v * (0.7 + 0.3 * k);
  }
  return normalize(b, 0.1);
}

function blip() {
  const b = buffer(0.5);
  for (let i = 0; i < b.L.length; i++) {
    const t = i / SR;
    const v = (Math.sin(TAU * 880 * t) + 0.3 * Math.sin(TAU * 1760 * t)) * Math.exp(-t / 0.12) * Math.min(1, t / 0.003);
    b.L[i] = b.R[i] = v;
  }
  b.L = reverb(b.L, 0.25, 0); b.R = reverb(b.R, 0.25, 1.3);
  return normalize(b, 0.16);
}

const SFX = { doorbell, pop, tick, whoosh, blip };
const cache = {};
export const sfx = (name) => (cache[name] ||= SFX[name]());

// ---------------------------------------------------------------- pad
const CHORDS = [
  [130.81, 196.0, 246.94, 293.66, 329.63], // Cmaj9
  [110.0, 164.81, 196.0, 246.94, 261.63], // Am9
  [87.31, 130.81, 164.81, 196.0, 220.0], // Fmaj9
  [98.0, 146.83, 196.0, 261.63, 293.66], // Gsus
];

/** A quiet, warm bed: detuned soft voices through a gentle low-pass. */
export function pad(seconds, seed = 1) {
  const b = buffer(seconds);
  const chordLen = 4.0, xf = 1.4;
  const rnd = noise(seed);
  const det = CHORDS.map((c) => c.map(() => [1 + (rnd() * 3) / 1200, 1 - (rnd() * 3) / 1200]));
  for (let i = 0; i < b.L.length; i++) {
    const t = i / SR;
    const ci = Math.floor(t / chordLen);
    let l = 0, r = 0;
    for (const which of [ci - 1, ci]) {
      if (which < 0) continue;
      const start = which * chordLen;
      const local = t - start;
      if (local > chordLen + xf) continue;
      const env = Math.min(1, local / xf) * (local > chordLen ? 1 - (local - chordLen) / xf : 1);
      const c = CHORDS[which % CHORDS.length], d = det[which % CHORDS.length];
      for (let v = 0; v < c.length; v++) {
        const f = c[v];
        const s1 = Math.sin(TAU * f * d[v][0] * t) + 0.18 * Math.sin(TAU * 2 * f * d[v][0] * t);
        const s2 = Math.sin(TAU * f * d[v][1] * t + 1.3) + 0.18 * Math.sin(TAU * 2 * f * d[v][1] * t);
        const amp = (v === 0 ? 0.9 : 0.55) * env;
        l += (s1 * 0.62 + s2 * 0.38) * amp;
        r += (s1 * 0.38 + s2 * 0.62) * amp;
      }
    }
    const trem = 0.88 + 0.12 * Math.sin(TAU * 0.13 * t);
    const fadeIn = Math.min(1, t / 1.6), fadeOut = Math.min(1, (seconds - t) / 1.6);
    const g = trem * fadeIn * Math.max(0, fadeOut);
    b.L[i] = l * g; b.R[i] = r * g;
  }
  onePoleLP(b.L, 1500); onePoleLP(b.R, 1500);
  return normalize(b, 0.13);
}

// ---------------------------------------------------------------- mix
/**
 * Mix a template's cues into one track covering [from, to].
 * cues: [{ t, sfx, gain? }]; bed: { from, to, gain } or null.
 * The bed ducks under the doorbell so the brand sound is never masked.
 */
export function mix({ from = 0, to, cues = [], bed = null }) {
  const out = buffer(to - from);
  const n = out.L.length;
  const bells = cues.filter((c) => c.sfx === 'doorbell').map((c) => c.t);
  if (bed) {
    const p = pad(bed.to - bed.from, 3);
    const g0 = bed.gain == null ? 1 : bed.gain;
    for (let i = 0; i < p.L.length; i++) {
      const t = bed.from + i / SR;
      const j = Math.round((t - from) * SR);
      if (j < 0 || j >= n) continue;
      let duck = 1;
      for (const bt of bells) {
        const a = ramp(t, bt - 0.25, bt - 0.05), z = 1 - ramp(t, bt + 1.3, bt + 1.8);
        duck = Math.min(duck, 1 - 0.7 * Math.min(a, z));
      }
      out.L[j] += p.L[i] * g0 * duck;
      out.R[j] += p.R[i] * g0 * duck;
    }
  }
  for (const c of cues) {
    const s = sfx(c.sfx);
    const g = c.gain == null ? 1 : c.gain;
    const j0 = Math.round((c.t - from) * SR);
    for (let i = 0; i < s.L.length; i++) {
      const j = j0 + i;
      if (j < 0 || j >= n) continue;
      out.L[j] += s.L[i] * g;
      out.R[j] += s.R[i] * g;
    }
  }
  // Master: peak-normalise to -1 dBFS. The doorbell is usually the peak, so
  // the sonic logo lands at the same level in every video.
  return normalize(out, 0.89);
}

function ramp(t, a, b) {
  if (t <= a) return 0;
  if (t >= b) return 1;
  return (t - a) / (b - a);
}

/** 16-bit PCM WAV. */
export function writeWav(file, { L, R }) {
  const n = L.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(L[i] * 32767))), 44 + i * 4);
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(R[i] * 32767))), 46 + i * 4);
  }
  writeFileSync(file, buf);
}
