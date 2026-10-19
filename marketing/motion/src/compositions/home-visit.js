/* «نجيك للبيت» — the home-visit beat of the Home Lab Packages Reel, in photos.
 *
 * The reel is 34.3 s. Seconds 3.65–9.85 (after the testimonials, before the
 * packages) used to be a flat illustration of a visit. This template renders
 * that stretch with two AI-generated stills instead, in the same card layout:
 *
 *   knock  a technician, seen from behind, knocks at a steel door with the
 *          pink kit bag in his hand; the TabeebX lockup is composited onto
 *          the bag in perspective (an image generator can't draw our logo)
 *   hands  a home blood draw, hands and forearms only: no face in frame
 *
 * Render only the stretch with `--from 3.65 --to 9.85`, and the whole
 * soundtrack with `--audio`; then cut both into the reel (see README).
 * The background is a clean frame from the reel itself (params.plate), so the
 * cuts in and out are seamless. Photos live in assets/shots/, kept out of git.
 * The score and every cue below follow the reel's own clock (0–34.3 s). */
(function () {
  'use strict';
  const TX = window.TX;
  const { E, p, set, el, px, lerp, clamp } = TX;

  const T0 = 3.65, T1 = 9.85, TOTAL = 34.3;
  const PINK = '#EE396B';
  // Local clock (seconds after T0)
  const K = { title: 0.22, card: 0.5, chip1: 1.0, knocks: [1.4, 1.8, 2.2], swap: [3.1, 3.55], chip2: 3.35, out: 5.55 };
  const CARD = { x: 150, y: 575, w: 780, h: 960, r: 64 };

  // Camera: card px per photo px, and the photo point that sits at the card centre.
  const SHOT = {
    knock: { from: { cx: 540, cy: 1045, z: 0.722 }, to: { cx: 565, cy: 1040, z: 0.765 } },
    hands: { from: { cx: 540, cy: 1100, z: 0.722 }, to: { cx: 525, cy: 1030, z: 0.82 } },
  };
  const FIST = [815, 640]; // knuckles on the door, in knock.jpg pixels
  // Front face of the pink bag in knock.jpg: TL, TR, BR, BL.
  const BAG = [[124, 1423], [373, 1445], [368, 1713], [115, 1667]];
  // Upper back of the navy scrubs (between the shoulder blades), in knock.jpg pixels.
  const BACK = [[352, 810], [525, 820], [525, 990], [350, 1000]];

  /** CSS matrix3d that maps a w×h box (origin top left) onto four points. */
  function quad(w, h, pts) {
    const src = [[0, 0], [w, 0], [w, h], [0, h]];
    const A = [], b = [];
    for (let i = 0; i < 4; i++) {
      const [x, y] = src[i], [u, v] = pts[i];
      A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
      A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
    }
    for (let c = 0; c < 8; c++) { // Gaussian elimination with partial pivoting
      let m = c;
      for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[m][c])) m = r;
      [A[c], A[m]] = [A[m], A[c]]; [b[c], b[m]] = [b[m], b[c]];
      for (let r = c + 1; r < 8; r++) {
        const f = A[r][c] / A[c][c];
        for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k];
        b[r] -= f * b[c];
      }
    }
    const h8 = new Array(8);
    for (let r = 7; r >= 0; r--) {
      let s = b[r];
      for (let k = r + 1; k < 8; k++) s -= A[r][k] * h8[k];
      h8[r] = s / A[r][r];
    }
    const [m0, m1, m2, m3, m4, m5, m6, m7] = h8;
    return `matrix3d(${m0},${m3},0,${m6},${m1},${m4},0,${m7},0,0,1,0,${m2},${m5},0,1)`;
  }

  /** The TabeebX lockup in one flat colour, from the traced logo parts. */
  function lockup(parent, color) {
    const [fx, fy] = [TX.logo.wordBox[0], TX.logo.figureBox[1]];
    const w = TX.logo.wordBox[2], h = TX.logo.wordBox[1] + TX.logo.wordBox[3] - fy;
    const paths = TX.logo.order.map((k) => `<path d="${TX.logo.parts[k].d}" fill="${color}"/>`).join('');
    return TX.svg(parent, `<svg viewBox="${fx} ${fy} ${w} ${h}" width="${w}" height="${h}">${paths}</svg>`);
  }

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
   * swell into the door, a gentle groove under the packages, then a rise into
   * the doorbell on the call to action (the renderer rings it, cue below). */
  function composeScore() {
    const k = TX.score.kit(TOTAL);
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
    k.pad(['F3', 'C4', 'E4', 'A4', 'C5'], 6.7, 9.8, { attack: 0.6, release: 0.7, vol: 0.065, from: 1200, to: 3000, send: 0.5 });
    k.sub('F1', 6.75, 9.7, 0.05);
    ['A4', 'C5', 'E5'].forEach((n, i) => k.piano(n, 7.0 + i * 0.2, { vel: 0.09, decay: 2.6, pan: 0.2 }));
    // The packages: four chords on the beat, a bass line, a soft kick and ticks.
    const b0 = 9.75, stop = 29.9;
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
      if (n % 2 === 0) ['G5', 'E5', 'C5'].forEach((nm, i) => k.piano(nm, at + (i + 1) * beat, { vel: 0.05, decay: 2, pan: 0.3 }));
    }
    k.whoosh(17.15, 0.8, 0.1, 0.5, -0.5);
    k.whoosh(23.4, 0.8, 0.1, -0.5, 0.5);
    // The call to action: rise, then the chord the doorbell rings over.
    k.riser(29.2, 30.4, 0.2);
    k.impact(30.45, 0.5);
    k.pad(['C2', 'G2', 'C3', 'G3', 'D4', 'E4'], 30.4, 34.3, { attack: 0.3, release: 2.0, vol: 0.075, from: 900, to: 2400 });
    k.sub('C2', 30.45, 34.0, 0.065);
    k.shimmer(30.6, 0.045, 16, 1.0);
    ['G5', 'E5', 'C6'].forEach((n, i) => k.piano(n, 31.2 + i * 0.25, { vel: 0.06, decay: 2.5, pan: -0.2 + i * 0.2 }));
    return k.render();
  }

  // ---------------------------------------------------------------- cues
  const cues = [];
  [0.05, 0.28, 0.5, 0.75, 1.0, 1.22, 1.5].forEach((t) => cues.push({ t, sfx: 'pop', gain: 0.45 }));
  cues.push({ t: T0 + K.title, sfx: 'whoosh', gain: 0.55 });
  cues.push({ t: T0 + K.chip1, sfx: 'pop', gain: 0.55 });
  K.knocks.forEach((t) => cues.push({ t: T0 + t, sfx: 'knock', gain: 1 }));
  cues.push({ t: T0 + K.swap[0] - 0.05, sfx: 'whoosh', gain: 0.5 });
  cues.push({ t: T0 + K.chip2, sfx: 'pop', gain: 0.55 });
  [11.25, 11.6, 11.9, 17.65, 17.95, 23.9, 24.2].forEach((t) => cues.push({ t, sfx: 'tick', gain: 0.8 }));
  cues.push({ t: 30.45, sfx: 'doorbell' });
  [30.7, 30.95].forEach((t) => cues.push({ t, sfx: 'tick', gain: 0.8 }));
  cues.push({ t: 31.2, sfx: 'pop', gain: 0.5 });
  cues.push({ t: 31.7, sfx: 'pop', gain: 0.5 });

  // -------------------------------------------------------------- template
  TX.register('home-visit', {
    size: [1080, 1920],
    fps: 30,
    build(stage, P, ctx) {
      const field = TX.field(stage);
      // Background: a clean frame of the reel, drifting a few pixels so it breathes.
      const plate = el('img', 'abs', stage);
      if (P.plate) plate.src = P.plate;
      px(plate, { left: 0, top: 0, width: 1080, height: 1920, display: P.plate ? '' : 'none' });
      // The reel's floating logo, lifted out of the plate so it can follow the reel's own path:
      // it sits 25 px right and 18 px low when this stretch begins (3.65 s), and home by 9.35 s.
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

      // TabeebX on the bag, printed on the front face and moving with the camera.
      const face = el('div', 'abs', knock);
      px(face, { left: 0, top: 0, width: 250, height: 270, transformOrigin: '0 0', transform: quad(250, 270, BAG), mixBlendMode: 'normal', opacity: 0.93, filter: 'blur(0.5px) drop-shadow(0 1px 0 rgba(70,10,30,.35))' });
      const mark = lockup(face, '#FFFEFF');
      px(mark, { position: 'absolute', left: 50, top: 32, width: 150, height: 'auto' });
      mark.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      // The same lockup on the back of the scrubs: white on navy, a touch softer so it sits in the cloth.
      const back = el('div', 'abs', knock);
      px(back, { left: 0, top: 0, width: 175, height: 177, transformOrigin: '0 0', transform: quad(175, 177, BACK), opacity: 0.88, filter: 'blur(0.6px)' });
      const backMark = lockup(back, '#FFFEFF');
      px(backMark, { position: 'absolute', left: 0, top: 0, width: 175, height: 'auto' });

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
        duration: TOTAL,
        cues,
        score: composeScore,
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
          // Logo: from where the reel has it at the cut-in to its resting place
          const home = E.inOutSine(clamp((s - 0.2) / 5.2));
          set(logo, { x: 25 * (1 - home), y: (18 - 2 * clamp(s / 0.25)) * (1 - home) });

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
          const a = clamp((s - K.card) / (K.swap[1] - K.card)); // knock camera: whole time it is on screen
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
