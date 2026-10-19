/* «نجيك للبيت» — the home-visit beat of the Home Lab Packages Reel, in photos.
 *
 * The reel is about 34 s. Seconds 3.65–9.95 (after the testimonials, before the
 * packages) used to be a flat illustration of a visit. This template renders
 * that stretch with two AI-generated stills instead, in the same card layout:
 *
 *   knock  a technician in navy scrubs, seen from behind, knocks at a steel door
 *          with a navy kit bag hanging from his hand; the TabeebX logo, in its
 *          official colours, is printed into the back of the scrubs and onto the
 *          bag in code (scripts/embed-logo.mjs), shaded by the cloth's own folds
 *          and light (an image generator can't draw our logo)
 *   hands  a home blood draw, hands and forearms only: no face in frame
 *
 * Render only the stretch with `--from 3.65 --to 9.95`, and the whole
 * soundtrack with `--audio`; then cut both into the reel (scripts/splice-home-lab-reel.sh).
 * The background is a clean frame from the reel itself (params.plate) and the
 * reel's floating logo is lifted out of it (params.logo), so the cuts line up.
 * Photos live in assets/shots/, kept out of git.
 * The score and every cue follow the reel's own clock; params.timeline holds the
 * times of the packages and the call to action that come after this stretch. */
(function () {
  'use strict';
  const TX = window.TX;
  const { E, p, set, el, px, lerp, clamp } = TX;

  const T0 = 3.65, T1 = 9.95;
  const PINK = '#EE396B';
  // Local clock (seconds after T0)
  const K = { title: 0.22, card: 0.5, chip1: 1.0, knocks: [1.4, 1.8, 2.2], swap: [3.1, 3.55], chip2: 3.35, out: 5.55 };
  const CARD = { x: 150, y: 575, w: 780, h: 960, r: 64 };
  // The reel's floating logo, relative to its resting place in the plate: where the reel has it
  // when this stretch begins (3.65 s) and where the packages block starts it (the next cut).
  const LOGO = { from: [27, 20], then: [26, 17], to: [4, -14] };

  // What comes after this stretch, on the reel's clock (defaults fit the reel with the packages
  // block of the second upload: header at 10.1 s, one card every 2.5 s, the doorbell at 30.2 s).
  const TIMELINE = {
    total: 34.05,
    header: 10.1,
    cards: [11.05, 13.55, 16.05, 18.55, 21.05, 23.55, 26.05],
    exit: 29.6,
    bell: 30.2,
    cta: { ticks: [30.45, 30.7], pops: [30.95, 31.45] },
  };

  // Camera: card px per photo px, and the photo point that sits at the card centre.
  const SHOT = {
    knock: { from: { cx: 540, cy: 965, z: 0.722 }, to: { cx: 525, cy: 945, z: 0.76 } },
    hands: { from: { cx: 540, cy: 1100, z: 0.722 }, to: { cx: 525, cy: 1030, z: 0.82 } },
  };
  const FIST = [812, 445]; // knuckles on the door, in knock.jpg pixels
  /** Builds one photo layer sized like the photo (1080×1920), moved by a camera. */
  function photoLayer(parent, src) {
    const box = el('div', 'abs', parent);
    px(box, { left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0' });
    if (src) {
      const img = el('img', '', box);
      img.src = src;
      px(img, { position: 'absolute', left: 0, top: 0, width: 1080, height: 1920 });
    }
    return box;
  }
  function camera(box, c) {
    box.style.transform = `translate(${(CARD.w / 2 - c.cx * c.z).toFixed(2)}px, ${(CARD.h / 2 - c.cy * c.z).toFixed(2)}px) scale(${c.z.toFixed(4)})`;
  }
  const mixCam = (a, b, k) => ({ cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), z: lerp(a.z, b.z, k) });

  function chip(parent, text) {
    const e = el('div', 'abs', parent);
    px(e, {
      left: 0, width: CARD.w, top: CARD.h - 52, height: 104, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: '5',
    });
    const pill = el('div', '', e, text);
    px(pill, {
      padding: '0 62px', height: 104, lineHeight: '98px', borderRadius: 52, border: `3px solid ${PINK}`,
      background: 'rgba(14,15,48,.80)', color: '#FFFEFF', fontWeight: '700', fontSize: 52, whiteSpace: 'nowrap',
    });
    return e;
  }

  // ------------------------------------------------------------------ score
  /* The reel's own clock. C major, 97 bpm: soft pulse under the testimonials, a
   * swell into the door, a gentle groove under the packages with a rising note as
   * each card lands, then a rise into the doorbell on the call to action (the
   * renderer rings it, cue below). */
  function composeScore(TL) {
    const k = TX.score.kit(TL.total);
    const beat = 0.62;
    // Testimonials: a bed, and a note for each bubble that lands.
    k.air(0, 3.9, 0.03, 500);
    k.pad(['C3', 'G3', 'E4', 'B4'], 0.0, 3.9, { attack: 0.9, release: 0.8, vol: 0.055, from: 500, to: 1500 });
    k.sub('C2', 0.1, 3.8, 0.04);
    ['E5', 'G5', 'C6', 'G5', 'E5', 'D5', 'C5'].forEach((n, i) => k.piano(n, [0.05, 0.28, 0.5, 0.75, 1.0, 1.22, 1.5][i] + 0.04, { vel: 0.07 + 0.01 * (i % 3), decay: 1.8, pan: -0.3 + i * 0.1 }));
    ['C4', 'E4', 'G4', 'C5'].forEach((n, i) => k.piano(n, 2.2 + i * 0.3, { vel: 0.05, decay: 1.8 }));
    // Into the visit: rise, land at the title, knock to a pulse.
    k.riser(2.9, 3.85, 0.14);
    k.impact(3.85, 0.26, 0);
    k.pad(['C3', 'G3', 'D4', 'E4', 'A4'], 3.85, 6.7, { attack: 0.5, release: 0.7, vol: 0.065, from: 800, to: 2600, send: 0.5 });
    k.sub('A1', 3.9, 6.6, 0.05);
    k.whoosh(6.6, 0.9, 0.12, -0.5, 0.5);
    k.shimmer(6.75, 0.04, 10, 0.8);
    k.pad(['F3', 'C4', 'E4', 'A4', 'C5'], 6.7, 10.1, { attack: 0.6, release: 0.7, vol: 0.065, from: 1200, to: 3000, send: 0.5 });
    k.sub('F1', 6.75, 10.0, 0.05);
    ['A4', 'C5', 'E5'].forEach((n, i) => k.piano(n, 7.0 + i * 0.2, { vel: 0.09, decay: 2.6, pan: 0.2 }));
    // The packages: four chords on the beat, a bass line, a soft kick and ticks, and a note per card.
    const b0 = TL.header - 0.1, stop = TL.exit;
    const bars = [
      { pad: ['C4', 'G4', 'D5', 'E5'], bass: ['C3', 'G3', 'C4', 'G3'], sub: 'C2' },
      { pad: ['A3', 'E4', 'G4', 'C5'], bass: ['A2', 'E3', 'A3', 'E3'], sub: 'A1' },
      { pad: ['F3', 'C4', 'E4', 'A4'], bass: ['F2', 'C3', 'F3', 'C3'], sub: 'F1' },
      { pad: ['G3', 'D4', 'F4', 'B4'], bass: ['G2', 'D3', 'G3', 'D3'], sub: 'G1' },
    ];
    for (let n = 0; n * 4 * beat + b0 < stop; n++) {
      const bar = bars[n % 4], at = b0 + n * 4 * beat;
      k.pad(bar.pad, at, Math.min(at + 4 * beat, stop + 0.4), { attack: 0.5, release: 0.8, vol: 0.05, from: 1400, to: 2600, send: 0.5 });
      k.sub(bar.sub, at, Math.min(at + 4 * beat - 0.3, stop), 0.04);
      for (let e = 0; e < 8; e++) {
        const t = at + (e * beat) / 2;
        if (t >= stop) break;
        k.piano(bar.bass[e % 4], t, { vel: e % 2 ? 0.05 : 0.07, decay: 0.9, pan: -0.2, send: 0.3 });
        if (e % 2 && n > 0) k.tick(t, 0.02, 0.3);
        if (e % 4 === 0 && n > 0) k.kick(t, 0.24);
      }
    }
    ['G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5'].forEach((nm, i) => TL.cards[i] != null && k.piano(nm, TL.cards[i] + 0.04, { vel: 0.11, decay: 2.6, pan: 0.2 }));
    TL.cards.slice(1).forEach((t) => k.whoosh(t - 0.2, 0.6, 0.07, 0.4, -0.4));
    // The call to action: rise, then the chord the doorbell rings over.
    k.riser(TL.bell - 1.1, TL.bell - 0.05, 0.2);
    k.impact(TL.bell, 0.5);
    k.pad(['C2', 'G2', 'C3', 'G3', 'D4', 'E4'], TL.bell - 0.05, TL.total, { attack: 0.3, release: 2.0, vol: 0.075, from: 900, to: 2400 });
    k.sub('C2', TL.bell, TL.total - 0.3, 0.065);
    k.shimmer(TL.bell + 0.15, 0.045, 16, 1.0);
    ['G5', 'E5', 'C6'].forEach((n, i) => k.piano(n, TL.bell + 0.95 + i * 0.25, { vel: 0.06, decay: 2.5, pan: -0.2 + i * 0.2 }));
    return k.render();
  }

  // ---------------------------------------------------------------- cues
  function composeCues(TL) {
    const cues = [];
    [0.05, 0.28, 0.5, 0.75, 1.0, 1.22, 1.5].forEach((t) => cues.push({ t, sfx: 'pop', gain: 0.45 }));
    cues.push({ t: T0 + K.title, sfx: 'whoosh', gain: 0.55 });
    cues.push({ t: T0 + K.chip1, sfx: 'pop', gain: 0.55 });
    K.knocks.forEach((t) => cues.push({ t: T0 + t, sfx: 'knock', gain: 1 }));
    cues.push({ t: T0 + K.swap[0] - 0.05, sfx: 'whoosh', gain: 0.5 });
    cues.push({ t: T0 + K.chip2, sfx: 'pop', gain: 0.55 });
    cues.push({ t: TL.header, sfx: 'whoosh', gain: 0.35 });
    TL.cards.forEach((t) => cues.push({ t: t + 0.05, sfx: 'tick', gain: 0.9 }));
    cues.push({ t: TL.bell, sfx: 'doorbell' });
    TL.cta.ticks.forEach((t) => cues.push({ t, sfx: 'tick', gain: 0.8 }));
    TL.cta.pops.forEach((t) => cues.push({ t, sfx: 'pop', gain: 0.5 }));
    return cues;
  }

  // -------------------------------------------------------------- template
  TX.register('home-visit', {
    size: [1080, 1920],
    fps: 30,
    build(stage, P, ctx) {
      const TL = { ...TIMELINE, ...(P.timeline || {}) };
      const field = TX.field(stage);
      // Background: a clean frame of the reel, drifting a few pixels so it breathes.
      const plate = el('img', 'abs', stage);
      if (P.plate) plate.src = P.plate;
      px(plate, { left: 0, top: 0, width: 1080, height: 1920, display: P.plate ? '' : 'none' });
      // The reel's floating logo, lifted out of the plate so it can follow the reel's own path.
      const logo = el('img', 'abs', stage);
      if (P.logo) logo.src = P.logo;
      px(logo, { left: 466, top: 202, width: 124, height: 122, display: P.logo ? '' : 'none' });

      // Title, as in the reel: pink Cairo Black, sized to the card.
      const title = el('div', 'abs', stage, P.title);
      px(title, { left: 0, width: 1080, top: 378, textAlign: 'center', color: PINK, fontWeight: '900', fontSize: 150, lineHeight: '170px', whiteSpace: 'nowrap' });

      const wrap = el('div', 'abs', stage);
      px(wrap, { left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h });
      const card = el('div', 'abs', wrap);
      px(card, {
        left: 0, top: 0, width: CARD.w, height: CARD.h, borderRadius: CARD.r, overflow: 'hidden',
        background: '#10102E', boxShadow: '0 30px 80px -24px rgba(0,0,0,.65), 0 0 0 2px rgba(255,254,255,.16)',
      });
      const shotA = el('div', 'abs', card);
      const shotB = el('div', 'abs', card);
      px(shotA, { left: 0, top: 0, width: CARD.w, height: CARD.h });
      px(shotB, { left: 0, top: 0, width: CARD.w, height: CARD.h });
      const knock = photoLayer(shotA, P.knock && P.knock.photo);
      const hands = photoLayer(shotB, P.hands && P.hands.photo);

      // Rings where the knuckles hit the door.
      const rings = [];
      K.knocks.forEach(() => {
        for (let j = 0; j < 2; j++) {
          const r = el('div', 'abs', knock);
          px(r, { border: '5px solid rgba(255,254,255,.85)', borderRadius: '50%' });
          rings.push(r);
        }
      });
      const chipA = chip(wrap, P.chips[0]);
      const chipB = chip(wrap, P.chips[1]);

      return {
        duration: TL.total,
        cues: composeCues(TL),
        score: () => composeScore(TL),
        render(t) {
          const s = t - T0;
          const inSeg = t >= T0 - 0.01 && t <= T1 + 0.01;
          field.render(t);
          const vis = inSeg ? '' : 'none';
          [plate, logo, title, wrap].forEach((e) => { e.style.display = (e === plate && !P.plate) || (e === logo && !P.logo) ? 'none' : vis; });
          if (!inSeg) return;

          // Plate: a slow drift of a few pixels that is zero at both cuts, so the corner marks line up with the reel's
          const env = Math.sin(Math.PI * clamp(s / (T1 - T0)));
          plate.style.transform = `translate(${(Math.sin(t * 0.9) * 4 * env).toFixed(2)}px, ${(Math.cos(t * 0.75) * 3.5 * env).toFixed(2)}px)`;
          // Logo: from where the reel has it at the cut-in to where the packages block starts it
          const early = clamp(s / 0.2), home = E.inOutSine(clamp((s - 0.2) / (T1 - 0.15 - T0 - 0.2)));
          const ax = lerp(LOGO.from[0], LOGO.then[0], early), ay = lerp(LOGO.from[1], LOGO.then[1], early);
          set(logo, { x: lerp(ax, LOGO.to[0], home), y: lerp(ay, LOGO.to[1], home) });

          const kOut = p(t, T0 + K.out, 0.4, E.inCubic);
          // Title words in, out with the card
          set(title, { y: (1 - p(s, K.title, 0.6, E.outQuint)) * 46 - kOut * 26, o: p(s, K.title, 0.4, E.linear) * (1 - kOut), blur: (1 - p(s, K.title, 0.5)) * 10 });

          // Card in with a soft overshoot; a small jolt on every knock
          let jolt = 0, kick = 0;
          K.knocks.forEach((kt) => {
            const d = s - kt;
            if (d > 0 && d < 0.3) { jolt += Math.sin(d * 64) * 5 * (1 - d / 0.3); kick += Math.max(0, 1 - d / 0.12) * 0.008; }
          });
          const kc = p(s, K.card, 0.75, E.soft);
          set(wrap, { x: jolt, y: (1 - kc) * 70 + kOut * 30, s: lerp(0.9, 1, kc) + kick - kOut * 0.04, o: p(s, K.card, 0.3, E.linear) * (1 - kOut) });

          // Shots: A (knock) then B (hands), crossing over with a short slide
          const sw = p(s, K.swap[0], K.swap[1] - K.swap[0], E.inOutCubic);
          const a = clamp((s - K.card) / (K.swap[1] - K.card));
          camera(knock, mixCam(SHOT.knock.from, SHOT.knock.to, E.inOutSine(clamp(a))));
          const b = clamp((s - K.swap[0]) / (K.out + 0.4 - K.swap[0]));
          camera(hands, mixCam(SHOT.hands.from, SHOT.hands.to, E.inOutSine(b)));
          set(shotA, { x: -80 * sw, o: 1 - sw });
          set(shotB, { x: 80 * (1 - sw), s: lerp(1.05, 1, sw), o: sw });
          shotA.style.zIndex = 1; shotB.style.zIndex = 2;

          // Rings
          const [fx, fy] = FIST;
          rings.forEach((r, i) => {
            const kt = K.knocks[Math.floor(i / 2)], d = s - kt - (i % 2) * 0.1;
            const k = clamp(d / 0.55);
            const rad = 26 + k * 150;
            px(r, { left: fx - rad, top: fy - rad, width: rad * 2, height: rad * 2 });
            set(r, { o: k <= 0 || k >= 1 ? 0 : (1 - E.outQuad(k)) * 0.8 });
          });

          // Chips
          const c1 = p(s, K.chip1, 0.55, E.outBack), c1o = p(s, K.swap[0], 0.25, E.inCubic);
          set(chipA, { y: (1 - c1) * 40, s: lerp(0.8, 1, c1), o: p(s, K.chip1, 0.2, E.linear) * (1 - c1o) });
          const c2 = p(s, K.chip2, 0.55, E.outBack);
          set(chipB, { y: (1 - c2) * 40, s: lerp(0.8, 1, c2), o: p(s, K.chip2, 0.2, E.linear) });
        },
      };
    },
  });
})();
