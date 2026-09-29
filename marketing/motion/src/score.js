/* Scoring kit: instruments built on the Web Audio API and rendered offline, so a
 * film's music comes out of the same page as its picture, sample-exact and
 * repeatable (every noise and detune comes from a seeded generator). A template
 * composes with it and returns { L, R } at 48 kHz from its score(); the
 * renderer mixes that under the doorbell and the other cues (scripts/audio.mjs).
 *   const k = TX.score.kit(30.5);
 *   k.pad(['C3', 'G3', 'E4'], 2, 6);  k.piano('E5', 7.2);  k.impact(26.3);
 *   return k.render();                                                      */
(function () {
  'use strict';
  const TX = window.TX;
  const SR = 48000;
  /** 'A4' → 440 Hz; also 'C#3', 'Bb2'. Numbers pass through as Hz. */
  const NOTE = (name) => {
    if (typeof name === 'number') return name;
    const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
    if (!m) throw new Error('Bad note: ' + name);
    const semis = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    return 440 * Math.pow(2, (semis + (Number(m[3]) - 4) * 12) / 12);
  };

  function kit(seconds, { seed = 5, fadeOut = 0.9 } = {}) {
    const ctx = new OfflineAudioContext({ numberOfChannels: 2, length: Math.ceil(seconds * SR), sampleRate: SR });
    const rng = TX.rng(seed);
    const rand = (a, b) => a + (b - a) * rng();

    // A hall: decorrelated noise per channel, bright early and darker as it decays (RT60 ≈ 2.5 s).
    const irLen = Math.round(3.2 * SR);
    const ir = ctx.createBuffer(2, irLen, SR);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < irLen; i++) {
        const t = i / SR;
        lp += (rng() * 2 - 1 - lp) * (0.22 + 0.72 * Math.exp(-t * 1.5));
        d[i] = t < 0.02 ? 0 : lp * Math.exp(-t * 2.8);
      }
    }
    const verb = ctx.createConvolver();
    verb.buffer = ir;
    const bus = ctx.createGain();
    const wet = ctx.createGain(); wet.gain.value = 0.6;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.knee.value = 10; comp.ratio.value = 2.5;
    comp.attack.value = 0.02; comp.release.value = 0.35;
    const master = ctx.createGain();
    master.gain.setValueAtTime(1, 0);
    master.gain.setValueAtTime(1, seconds - fadeOut);
    master.gain.linearRampToValueAtTime(0, seconds);
    verb.connect(wet); wet.connect(bus); bus.connect(comp); comp.connect(master); master.connect(ctx.destination);

    /** Send a voice to the mix: dry, plus some of it into the hall, at a place in the stereo field. */
    function out(node, send = 0.3, pan = 0) {
      const p = ctx.createStereoPanner(); p.pan.value = pan;
      node.connect(p); p.connect(bus);
      if (send > 0) { const s = ctx.createGain(); s.gain.value = send; p.connect(s); s.connect(verb); }
    }
    const noiseBuf = ctx.createBuffer(1, SR * 4, SR);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = rng() * 2 - 1;
    function noise(t0, t1) {
      const n = ctx.createBufferSource(); n.buffer = noiseBuf; n.loop = true;
      n.start(t0, rand(0, 3)); n.stop(t1);
      return n;
    }
    function osc(type, f, t0, t1) {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = f;
      o.start(t0); o.stop(t1);
      return o;
    }
    /** Attack to vol, hold until t1, release to silence. Returns when it is silent. */
    function envelope(param, t0, att, t1, rel, vol) {
      const hold = Math.max(t0 + att, t1);
      param.setValueAtTime(0, t0);
      param.linearRampToValueAtTime(vol, t0 + att);
      param.setValueAtTime(vol, hold);
      param.linearRampToValueAtTime(0, hold + rel);
      return hold + rel;
    }

    return {
      /** String-like pad: three detuned, slowly drifting saws per note, through a filter that opens. */
      pad(notes, t0, t1, o = {}) {
        const att = o.attack == null ? 1.6 : o.attack, rel = o.release == null ? 2 : o.release;
        const g = ctx.createGain();
        const end = envelope(g.gain, t0, att, t1, rel, o.vol || 0.05) + 0.05;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.7;
        lp.frequency.setValueAtTime(o.from || 500, t0);
        lp.frequency.exponentialRampToValueAtTime(o.to || 1800, Math.max(t0 + 0.1, t1));
        lp.connect(g);
        notes.forEach((nm, i) => {
          const f = NOTE(nm);
          const v = ctx.createGain(); v.gain.value = i === 0 ? 1 : 0.75;
          v.connect(lp);
          [-9, 0, 9].forEach((cents, j) => {
            const s = osc('sawtooth', f, t0, end);
            s.detune.value = cents + rand(-2, 2);
            const lfo = osc('sine', rand(0.12, 0.45), t0, end);
            const depth = ctx.createGain(); depth.gain.value = rand(2, 5);
            lfo.connect(depth); depth.connect(s.detune);
            const p = ctx.createStereoPanner(); p.pan.value = (j - 1) * 0.55;
            s.connect(p); p.connect(v);
          });
        });
        out(g, o.send == null ? 0.6 : o.send);
      },
      /** Felt piano: stretched sine partials with a two-stage decay, a soft hammer, two strings per note. */
      piano(nm, t, o = {}) {
        const f = NOTE(nm), vel = o.vel || 0.2, dec = o.decay || 2.6;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.5;
        lp.frequency.value = Math.min(9000, (o.bright || 2200) * (0.7 + vel * 1.5));
        const partials = [[1, 1, 1], [1, 0.7, 1.1], [2, 0.38, 0.55], [3, 0.14, 0.34], [4, 0.07, 0.24], [5, 0.03, 0.16]];
        partials.forEach(([n, a, d], i) => {
          const detune = i === 1 ? Math.pow(2, 1.2 / 1200) : 1; // the second string, a touch sharp
          const s = osc('sine', f * n * Math.sqrt(1 + 0.00035 * n * n) * detune, t, t + 0.3 + dec * d + 0.1);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(a * vel, t + 0.007);
          g.gain.setTargetAtTime(a * vel * 0.4, t + 0.007, 0.07); // the prompt sound…
          g.gain.setTargetAtTime(0, t + 0.3, (dec * d) / 6.9); // …then the long aftersound
          s.connect(g); g.connect(lp);
        });
        const hammer = noise(t, t + 0.06), hf = ctx.createBiquadFilter(); hf.type = 'lowpass'; hf.frequency.value = 1100;
        const hg = ctx.createGain(); hg.gain.setValueAtTime(vel * 0.2, t); hg.gain.setTargetAtTime(0, t, 0.01);
        hammer.connect(hf); hf.connect(hg); hg.connect(lp);
        out(lp, o.send == null ? 0.45 : o.send, o.pan || 0);
      },
      /** Sub bass: a pure low sine that swells in and out. */
      sub(nm, t0, t1, vol = 0.2) {
        const g = ctx.createGain();
        const end = envelope(g.gain, t0, 1.0, t1, 1.2, vol);
        osc('sine', NOTE(nm), t0, end + 0.05).connect(g);
        out(g, 0);
      },
      /** A heartbeat: lub, then a softer, higher dub. The octave keeps it audible on phone speakers. */
      heart(t, vol = 0.4) {
        [[0, 1, 95], [0.21, 0.6, 115]].forEach(([dt, a, f0]) => {
          const t0 = t + dt;
          const g = ctx.createGain(); g.gain.setValueAtTime(0, t0);
          g.gain.linearRampToValueAtTime(vol * a, t0 + 0.006); g.gain.setTargetAtTime(0, t0 + 0.006, 0.05);
          [1, 2].forEach((mul) => {
            const s = osc('sine', f0 * mul, t0, t0 + 0.5);
            s.frequency.exponentialRampToValueAtTime(f0 * mul * 0.5, t0 + 0.12);
            const m = ctx.createGain(); m.gain.value = mul === 1 ? 1 : 0.3;
            s.connect(m); m.connect(g);
          });
          out(g, 0.15);
        });
      },
      /** Soft kick: a round, low pulse. */
      kick(t, vol = 0.4) {
        const s = osc('sine', 140, t, t + 0.7);
        s.frequency.exponentialRampToValueAtTime(48, t + 0.12);
        const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.setTargetAtTime(0, t + 0.02, 0.11);
        s.connect(g);
        out(g, 0.08);
      },
      /** A tom-like hit with a little skin noise. */
      tom(t, vol = 0.35, pan = 0) {
        const s = osc('sine', 125, t, t + 1);
        s.frequency.exponentialRampToValueAtTime(66, t + 0.25);
        const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.setTargetAtTime(0, t + 0.02, 0.17);
        s.connect(g);
        const n = noise(t, t + 0.12), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 850; bp.Q.value = 1.1;
        const ng = ctx.createGain(); ng.gain.setValueAtTime(vol * 0.3, t); ng.gain.setTargetAtTime(0, t, 0.025);
        n.connect(bp); bp.connect(ng);
        out(g, 0.3, pan); out(ng, 0.35, pan);
      },
      /** A short, bright tick for the off-beats. */
      tick(t, vol = 0.03, pan = 0) {
        const n = noise(t, t + 0.05), hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 6500;
        const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.setTargetAtTime(0, t, 0.012);
        n.connect(hp); hp.connect(g);
        out(g, 0.2, pan);
      },
      /** A landing: a deep swept boom, an optional crack, a long hall tail. */
      impact(t, vol = 0.8, crack = 1) {
        const s = osc('sine', 82, t, t + 4);
        s.frequency.exponentialRampToValueAtTime(32, t + 0.9);
        const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.setTargetAtTime(0, t + 0.05, 0.6);
        s.connect(g);
        const h = osc('sine', 164, t, t + 3);
        h.frequency.exponentialRampToValueAtTime(64, t + 0.9);
        const hg = ctx.createGain(); hg.gain.setValueAtTime(vol * 0.35, t); hg.gain.setTargetAtTime(0, t + 0.03, 0.45);
        h.connect(hg);
        out(g, 0.3); out(hg, 0.35);
        if (crack > 0) {
          const n = noise(t, t + 1.2), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1300;
          const ng = ctx.createGain(); ng.gain.setValueAtTime(vol * 0.45 * crack, t); ng.gain.setTargetAtTime(0, t, 0.08);
          n.connect(lp); lp.connect(ng);
          out(ng, 0.7);
        }
      },
      /** Tension: noise and a tone that climb together and stop dead on t1. */
      riser(t0, t1, vol = 0.2) {
        const n = noise(t0, t1 + 0.02), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.4;
        bp.frequency.setValueAtTime(300, t0); bp.frequency.exponentialRampToValueAtTime(6500, t1);
        const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(vol, t1 - 0.015); g.gain.linearRampToValueAtTime(0, t1);
        n.connect(bp); bp.connect(g);
        const s = osc('sine', 196, t0, t1 + 0.02);
        s.frequency.exponentialRampToValueAtTime(1175, t1);
        const sg = ctx.createGain(); sg.gain.setValueAtTime(0.0001, t0);
        sg.gain.exponentialRampToValueAtTime(vol * 0.2, t1 - 0.015); sg.gain.linearRampToValueAtTime(0, t1);
        s.connect(sg);
        out(g, 0.45); out(sg, 0.45);
      },
      /** Air moving past, left to right by default. */
      whoosh(t, dur = 0.9, vol = 0.16, from = -0.7, to = 0.7) {
        const n = noise(t, t + dur), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.8;
        bp.frequency.setValueAtTime(350, t); bp.frequency.exponentialRampToValueAtTime(3000, t + dur * 0.55);
        bp.frequency.exponentialRampToValueAtTime(600, t + dur);
        const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.55); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        const p = ctx.createStereoPanner(); p.pan.setValueAtTime(from, t); p.pan.linearRampToValueAtTime(to, t + dur);
        n.connect(bp); bp.connect(g); g.connect(p);
        out(p, 0.3);
      },
      /** A bed of air: quiet, low, filtered noise, like a night outside. */
      air(t0, t1, vol = 0.03, cutoff = 500) {
        const g = ctx.createGain();
        const end = envelope(g.gain, t0, 1.2, t1, 1.0, vol);
        const n = noise(t0, end + 0.05), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cutoff;
        n.connect(lp); lp.connect(g);
        out(g, 0.3);
      },
      /** Light catching glass: short, high, bell-like partials scattered in the hall. */
      shimmer(t, vol = 0.05, count = 12, spread = 0.7) {
        for (let i = 0; i < count; i++) {
          const f = rand(2200, 5800), t0 = t + rng() * spread, d = rand(0.2, 0.6);
          const g = ctx.createGain(); g.gain.setValueAtTime(0, t0);
          g.gain.linearRampToValueAtTime(vol * rand(0.4, 1), t0 + 0.003); g.gain.setTargetAtTime(0, t0 + 0.003, d / 3);
          osc('sine', f, t0, t0 + d * 2.5).connect(g);
          out(g, 0.75, rand(-0.6, 0.6));
        }
      },
      /** A joint cracking: two sharp clicks over a small, dull knock. */
      crack(t, vol = 0.3) {
        [[0, 1], [0.016, 0.6]].forEach(([dt, a]) => {
          const n = noise(t + dt, t + dt + 0.03), hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1400;
          const g = ctx.createGain(); g.gain.setValueAtTime(vol * a, t + dt); g.gain.setTargetAtTime(0, t + dt, 0.004);
          n.connect(hp); hp.connect(g);
          out(g, 0.25);
        });
        const s = osc('sine', 190, t, t + 0.3);
        s.frequency.exponentialRampToValueAtTime(85, t + 0.07);
        const g = ctx.createGain(); g.gain.setValueAtTime(vol * 0.9, t); g.gain.setTargetAtTime(0, t, 0.03);
        s.connect(g);
        out(g, 0.2);
      },
      /** Bone on bone: rough, band-passed noise that swells once per step (`rate` per second). */
      grind(t0, t1, rate, vol = 0.1) {
        const n = noise(t0, t1), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 850; bp.Q.value = 2.2;
        const len = Math.max(2, Math.round((t1 - t0) * 200)), curve = new Float32Array(len);
        for (let i = 0; i < len; i++) {
          const tt = (i / (len - 1)) * (t1 - t0);
          const fade = Math.min(1, tt / 0.4, (t1 - t0 - tt) / 0.4);
          curve[i] = vol * fade * Math.pow(0.5 - 0.5 * Math.cos(2 * Math.PI * rate * tt), 3);
        }
        const g = ctx.createGain(); g.gain.setValueCurveAtTime(curve, t0, t1 - t0);
        n.connect(bp); bp.connect(g);
        out(g, 0.3);
      },
      /** A centrifuge: a motor whine that spins up, holds, and winds down. */
      spin(t0, t1, vol = 0.12) {
        const up = Math.min(0.7, (t1 - t0) / 3);
        const s = osc('sawtooth', 35, t0, t1 + 0.05), w = osc('sine', 140, t0, t1 + 0.05);
        [[s, 1], [w, 4]].forEach(([o, m]) => {
          o.frequency.setValueAtTime(35 * m, t0);
          o.frequency.exponentialRampToValueAtTime(190 * m, t0 + up);
          o.frequency.setValueAtTime(190 * m, t1 - up);
          o.frequency.exponentialRampToValueAtTime(30 * m, t1);
        });
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100;
        const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(vol, t0 + up); g.gain.setValueAtTime(vol, t1 - up); g.gain.linearRampToValueAtTime(0, t1);
        const wg = ctx.createGain(); wg.gain.value = 0.25;
        s.connect(lp); lp.connect(g); w.connect(wg); wg.connect(g);
        out(g, 0.2);
      },
      /** Glass on glass: a sample tube set into its rack. */
      clink(t, vol = 0.06) {
        [[2630, 1, 0.12], [3950, 0.55, 0.08], [5210, 0.3, 0.05]].forEach(([f, a, d]) => {
          const g = ctx.createGain(); g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(vol * a, t + 0.002); g.gain.setTargetAtTime(0, t + 0.002, d / 3);
          osc('sine', f * (1 + rand(-0.01, 0.01)), t, t + d * 3).connect(g);
          out(g, 0.45, rand(-0.3, 0.3));
        });
      },
      /** An ultrasound ping: a short, clean, high blip in the hall. */
      ping(t, vol = 0.06) {
        [[1650, 1], [3300, 0.25]].forEach(([f, a]) => {
          const g = ctx.createGain(); g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(vol * a, t + 0.004); g.gain.setTargetAtTime(0, t + 0.004, 0.07);
          osc('sine', f, t, t + 0.6).connect(g);
          out(g, 0.6);
        });
      },
      async render() {
        const buf = await ctx.startRendering();
        return { L: buf.getChannelData(0), R: buf.getChannelData(1) };
      },
    };
  }

  TX.score = { kit, NOTE, SR };
})();
