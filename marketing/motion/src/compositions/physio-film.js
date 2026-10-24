/* «العلاج يجيك» — home physiotherapy, a Reel built from AI stills.
 *
 * The script is content/scripts/97-physio-at-home.md. Each shot is an AI-generated
 * photograph (assets/shots/physio/, kept out of git) moved by a slow camera; the
 * grade turns from cool and grey to warm at the doorbell, so the film's mood is
 * the story: waiting in pain, then care arriving. The voice-over's lines are on
 * screen as captions, so the film works muted and a voice can be laid over it later.
 *
 *    0.0–8.0   pain and the road: a man rising, traffic, the stairs (cool, grey)
 *    8.0–13.0  the doorbell, the door, a physiotherapist: «نجيك للبيت» (warm)
 *   13.0–21.0  care at home: a male and a female physiotherapist, «أخصائية» / «أخصائي»
 *   21.0–31.0  first steps, then a courtyard and a lifted child
 *   31.0–34.0  both physiotherapists at a door, the logo
 *   34.0–36.0  the call to action and the doorbell
 * Two plans: the full film (11 photographs, 37 s) when shots 8, 9 and 10 exist, and a
 * short one (8 photographs, 31 s) that ends on the first steps, so a film can be made
 * before every photograph is. One pink element per frame. */
(function () {
  'use strict';
  const TX = window.TX;
  const { E, p, env, set, el, px, lerp, clamp } = TX;

  const FADE = 0.28;
  const BELL = 8.0;

  // id: the photo; t0–t1: when it plays; zoom: [from, to]; at: transform origin (%); pan: px [x0, y0, x1, y1];
  // grade: 0 = cool and grey, 1 = warm, [from, to] across the shot; cut: no cross-fade into this shot.
  const COMMON = [
    { id: 's1', t0: 0.0, t1: 3.6, zoom: [1.05, 1.17], at: [50, 42], pan: [0, 14, -14, -8], grade: 0, cut: true },
    { id: 's2', t0: 3.6, t1: 6.0, zoom: [1.06, 1.14], at: [50, 52], pan: [10, 0, -12, 0], grade: 0 },
    { id: 's3', t0: 6.0, t1: 8.0, zoom: [1.07, 1.19], at: [50, 55], pan: [0, 10, 0, -12], grade: 0 },
    { id: 's4a', t0: 8.0, t1: 10.0, zoom: [1.10, 1.24], at: [63, 49], pan: [0, 0, 0, 0], grade: [0.25, 0.7], cut: true },
    { id: 's4b', t0: 10.0, t1: 13.0, zoom: [1.04, 1.13], at: [50, 38], pan: [0, 8, 0, -8], grade: 1 },
    { id: 's5', t0: 13.0, t1: 17.0, zoom: [1.05, 1.14], at: [48, 55], pan: [28, 0, -28, 0], grade: 1 },
    { id: 's6', t0: 17.0, t1: 21.0, zoom: [1.06, 1.13], at: [50, 55], pan: [-18, 0, 18, 0], grade: 1 },
  ];
  const CAPS_COMMON = [
    [0.25, 3.5, 'رجلك توجعك؟\nوالطريگ... *أوجع.*', 1130, 't-hook'],
    [3.9, 5.9, 'زحمة · طابور · درج', 1290, 't-sub'],
    [6.2, 7.9, 'تأجّل... وتأجّل...\nوالوجع يكبر.', 1220, 't-sub'],
    [10.2, 11.7, 'بس شنو لو العلاج\nهو اللي يجيك؟', 1230, 't-sub'],
    [11.8, 13.0, '*نجيك للبيت*', 1250, 't-hook'],
    [13.2, 16.8, 'أخصائية أو أخصائي علاج طبيعي\nيوصل لبيتك.', 1170, 't-sub'],
    [17.2, 20.9, 'يفحصك، يعلّمك التمارين الصح\nويمشي وياك خطوة بخطوة.', 1170, 't-sub'],
    [21.2, 23.9, '*خطوة بخطوة.*', 1250, 't-hook'],
  ];

  /** The film's timeline: the full one, or the short one that ends on the first steps. */
  function plan(full) {
    const shots = COMMON.slice();
    const caps = CAPS_COMMON.slice();
    let END;
    if (full) {
      END = 34.0;
      shots.push(
        { id: 's7', t0: 21.0, t1: 24.0, zoom: [1.12, 1.02], at: [50, 50], pan: [0, 0, 0, 0], grade: 1 },
        { id: 's8', t0: 24.0, t1: 28.0, zoom: [1.03, 1.13], at: [50, 50], pan: [24, 0, -24, 0], grade: 1 },
        { id: 's9', t0: 28.0, t1: 31.0, zoom: [1.04, 1.11], at: [50, 45], pan: [0, 10, 0, -6], grade: 1 },
        { id: 's10', t0: 31.0, t1: END + FADE, zoom: [1.10, 1.02], at: [50, 52], pan: [0, 0, 0, 0], grade: 1 },
      );
      caps.push(
        [24.3, 27.9, 'والخطوة اللي كنت تخاف منها...\nتصير عادية.', 1210, 't-sub'],
        [28.2, 30.9, 'ترجع تمشي... وتشيل ولدك\nوتلعب ويا عيالك.', 1210, 't-sub'],
      );
    } else {
      END = 28.0;
      shots.push(
        { id: 's7', t0: 21.0, t1: 24.6, zoom: [1.12, 1.02], at: [50, 50], pan: [0, 0, 0, 0], grade: 1 },
        // the same photograph, closer: the man's face and the hand at his elbow
        { id: 's7', t0: 24.6, t1: END + FADE, zoom: [1.38, 1.52], at: [62, 30], pan: [0, 0, 0, 0], grade: 1 },
      );
      caps.push([24.9, 27.7, 'والخطوة اللي كنت تخاف منها...\nتصير عادية.', 1210, 't-sub']);
    }
    return { full, shots, caps, END, TOTAL: END + 3.0, BELL2: END + 0.25 };
  }

  // ------------------------------------------------------------------ score
  /* Night in A minor (a drone, a clock, a riser into the bell), then C major from
   * the door on: a pulse, piano, a swell on the first steps, and a held chord. The
   * brand's doorbell (E5 → C5) rings over it at 8.0 and at the end, so the score
   * keeps the fifth octave clear there. */
  function composeScore(pl) {
    const { END, TOTAL, full } = pl;
    const peak = 21.0, hold = full ? 28.0 : 25.2, last = END - 0.2;
    const k = TX.score.kit(TOTAL);
    // Pain: a dark bed, a clock, then tension into the bell.
    k.air(0, 8.2, 0.035, 420);
    k.pad(['A2', 'E3', 'G3'], 0.0, 8.0, { attack: 1.6, release: 0.8, vol: 0.06, from: 220, to: 700 });
    k.sub('A1', 0.2, 7.9, 0.05);
    for (let t = 0.5; t < 7.7; t += 0.9) k.tick(t, 0.04, t % 1.8 < 0.9 ? -0.2 : 0.2);
    k.riser(5.6, 8.0, 0.15);
    // The door: warmth arrives, C major.
    k.impact(10.0, 0.24, 0);
    k.shimmer(10.05, 0.04, 12, 0.9);
    k.whoosh(9.55, 0.9, 0.1, -0.5, 0.5);
    const beat = 0.62;
    const bars = [
      { pad: ['C3', 'G3', 'D4', 'E4'], bass: ['C3', 'G3', 'C4', 'G3'], sub: 'C2' },
      { pad: ['A2', 'E3', 'G3', 'C4'], bass: ['A2', 'E3', 'A3', 'E3'], sub: 'A1' },
      { pad: ['F2', 'C3', 'E3', 'A3'], bass: ['F2', 'C3', 'F3', 'C3'], sub: 'F1' },
      { pad: ['G2', 'D3', 'F3', 'B3'], bass: ['G2', 'D3', 'G3', 'D3'], sub: 'G1' },
    ];
    const groove = hold + 0.4;
    for (let n = 0; n * 4 * beat + 10.0 < groove; n++) {
      const bar = bars[n % 4], at = 10.0 + n * 4 * beat, to = Math.min(at + 4 * beat, groove);
      k.pad(bar.pad, at, to, { attack: 0.5, release: 0.8, vol: 0.058, from: 900, to: 2400, send: 0.5 });
      k.sub(bar.sub, at, Math.min(to - 0.2, groove), 0.04);
      for (let e = 0; e < 8; e++) {
        const t = at + (e * beat) / 2;
        if (t >= groove) break;
        if (t >= 13.0) k.piano(bar.bass[e % 4], t, { vel: e % 2 ? 0.05 : 0.07, decay: 0.9, pan: -0.2, send: 0.3 });
        if (e % 2 && t >= 14.2) k.tick(t, 0.018, 0.3);
        if (e % 4 === 0 && t >= 17.0) k.kick(t, 0.22);
      }
    }
    // «أخصائية / أخصائي»: a note on each; the first steps: the music opens.
    ['G4', 'C5'].forEach((n, i) => k.piano(n, [13.4, 15.2][i], { vel: 0.1, decay: 2.4, pan: 0.2 }));
    k.riser(19.2, peak, 0.16);
    k.impact(peak, 0.22, 0);
    ['E5', 'G5', 'C6', 'E6'].forEach((n, i) => k.piano(n, peak + 0.2 + i * 0.28, { vel: 0.1 - i * 0.012, decay: 3, pan: -0.2 + i * 0.15 }));
    k.pad(['C3', 'G3', 'E4', 'G4', 'D5'], peak, hold, { attack: 0.9, release: 1.2, vol: 0.07, from: 1000, to: 4200, send: 0.55 });
    if (full) { // the courtyard and the child
      k.whoosh(23.6, 0.8, 0.09, 0.4, -0.4);
      k.shimmer(24.3, 0.04, 12, 1.0);
      ['G4', 'C5', 'E5', 'G5'].forEach((n, i) => k.piano(n, 24.6 + i * 0.22, { vel: 0.1, decay: 3.2, pan: 0.2 }));
    } else {
      k.shimmer(24.6, 0.04, 12, 1.0);
      ['G4', 'C5', 'E5', 'G5'].forEach((n, i) => k.piano(n, 24.9 + i * 0.22, { vel: 0.1, decay: 3.2, pan: 0.2 }));
    }
    k.pad(['C3', 'G3', 'C4', 'E4', 'G4'], hold, last + 0.3, { attack: 1.0, release: 1.4, vol: 0.075, from: 1400, to: 3000, send: 0.55 });
    k.sub('C2', hold, last, 0.06);
    // The close: the bell, a rise, and the home chord.
    k.riser(END - 1.4, END + 0.2, 0.14);
    k.impact(END + 0.25, 0.45, 0);
    k.shimmer(END + 0.4, 0.045, 16, 1.0);
    ['G5', 'E5', 'C6'].forEach((n, i) => k.piano(n, END + 0.9 + i * 0.25, { vel: 0.06, decay: 2.4, pan: -0.2 + i * 0.2 }));
    return k.render();
  }

  function composeCues(pl) {
    const c = [
      { t: BELL, sfx: 'doorbell' },
      { t: 10.0, sfx: 'whoosh', gain: 0.4 },
      { t: 13.4, sfx: 'pop', gain: 0.5 }, { t: 15.2, sfx: 'pop', gain: 0.5 }, { t: 19.6, sfx: 'pop', gain: 0.5 },
      { t: 21.0, sfx: 'whoosh', gain: 0.4 },
      { t: pl.BELL2, sfx: 'doorbell' },
      { t: pl.BELL2 + 0.75, sfx: 'tick', gain: 0.6 }, { t: pl.BELL2 + 1.0, sfx: 'tick', gain: 0.6 },
    ];
    if (pl.full) c.push({ t: 31.2, sfx: 'pop', gain: 0.45 });
    return c;
  }

  // -------------------------------------------------------------- template
  TX.register('physio-film', {
    size: [1080, 1920],
    fps: 30,
    build(stage, P, ctx) {
      const W = ctx.w;
      const photos = P.photos || {};
      const pl = plan(!!(photos.s8 && photos.s9 && photos.s10));
      const { END, TOTAL, BELL2 } = pl;
      const SHOTS = pl.shots, CAPS = pl.caps;
      const field = TX.field(stage);

      // The photographs, each in its own layer, with a cool or warm grade.
      const shots = SHOTS.map((s) => {
        const layer = el('div', 'layer', stage);
        px(layer, { overflow: 'hidden', background: '#10102E' });
        const img = el('img', '', layer);
        if (photos[s.id]) img.src = photos[s.id];
        px(img, { position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: `${s.at[0]}% ${s.at[1]}%`, display: photos[s.id] ? 'block' : 'none' });
        const tint = el('div', 'layer', layer);
        return { s, layer, img, tint };
      });
      // Light over the whole film: a vignette, the top where the tab sits, and the bottom where captions sit.
      const shade = el('div', 'layer', stage);
      px(shade, { background: 'radial-gradient(120% 90% at 50% 45%, rgba(10,10,40,0) 55%, rgba(10,10,40,.5) 100%), linear-gradient(to bottom, rgba(10,10,40,.55) 0px, rgba(10,10,40,0) 340px), linear-gradient(to top, rgba(10,10,40,.82) 0px, rgba(10,10,40,.55) 520px, rgba(10,10,40,0) 900px)' });

      // Rings where the doorbell is pressed (the finger, in shot 4a).
      const bellRings = TX.C.rings(stage, 2);
      // Captions
      const caps = CAPS.map(([a, b, text, top, cls]) => {
        const t = TX.text(stage, text, `col centered ${cls}`, { top });
        t.el.style.textShadow = '0 3px 24px rgba(0,0,0,.65)';
        return { a, b, t };
      });
      // Pills: «أخصائية» then «أخصائي», and «بخصوصية»
      const pill = (text, icon, top) => {
        const e = el('div', 'pill', stage);
        TX.svg(e, TX.icon(icon, '#1B9CCE'));
        el('span', '', e, text);
        px(e, { top, left: (W - 330) / 2, width: 330, justifyContent: 'center' });
        return e;
      };
      const pills = [
        // each label sits on the person it names: the male physiotherapist is on screen first
        { e: pill('أخصائي', 'mars', 1400), a: 13.55, b: 17.0 },
        { e: pill('أخصائية', 'venus', 1400), a: 17.35, b: 19.5 },
        { e: pill('بخصوصية', 'heart', 1400), a: 19.7, b: 21.0 },
      ];

      // The logo and the close
            const tab = TX.C.tab(stage, ctx);
      const lockup = el('div', 'abs', stage);
      px(lockup, { left: 0, width: W, top: 1200, textAlign: 'center' });
      const logoSvg = (() => {
        const [fx, fy] = [TX.logo.wordBox[0], TX.logo.figureBox[1]];
        const w = TX.logo.wordBox[2], h = TX.logo.wordBox[1] + TX.logo.wordBox[3] - fy;
        const paths = TX.logo.order.map((k) => `<path d="${TX.logo.parts[k].d}" fill="${TX.logo.parts[k].color === '#181943' ? '#FFFEFF' : TX.logo.parts[k].color}"/>`).join('');
        return TX.svg(lockup, `<svg viewBox="${fx} ${fy} ${w} ${h}" width="150" height="${(150 * h) / w}">${paths}</svg>`);
      })();
      const tag = TX.text(stage, 'علاج طبيعي بالبيت', 'col centered t-sub', { top: 1385 });
      tag.el.style.textShadow = '0 3px 24px rgba(0,0,0,.65)';

      // End card
      const endLayer = el('div', 'layer', stage);
      px(endLayer, { background: '#181943' });
      TX.field(endLayer).render(3);
      const rings = TX.C.rings(stage, 2);
      const hero = { w: 292, h: 340, r: 76, cx: W / 2, cy: 640, at: END, dur: 1.0 };
      const cta1 = TX.text(stage, 'اكتب *«علاج طبيعي»*', 'col centered t-hook-s', { top: 900 });
      const cta2 = TX.text(stage, 'على الواتس اب', 'col centered t-hook-s', { top: 1010 });
      const num = el('div', 'abs', stage, P.phone || '07802610170');
      px(num, { left: 0, width: W, top: 1150, textAlign: 'center', direction: 'ltr', fontSize: 84, fontWeight: '900', letterSpacing: '0.02em' });
      const close = TX.text(stage, 'لا تصدگنا. شوف بعينك.', 'col centered t-sub dim', { top: 1290 });
      const foot = TX.text(stage, 'النتائج تختلف من شخص لشخص.', 'col centered t-strip dim', { top: 1420 });
      const strip = TX.C.strip(stage, ctx, ctx.brand.trustStrip);
      stage.appendChild(tab.el); // the tab above the end card, with the rings behind it
      stage.insertBefore(rings.el, tab.el);

      const warm = (g) => {
        const sat = lerp(0.5, 1.08, g), br = lerp(0.86, 1.02, g), ct = lerp(1.06, 1.02, g);
        return `saturate(${sat.toFixed(3)}) brightness(${br.toFixed(3)}) contrast(${ct.toFixed(3)})`;
      };
      const tintColor = (g) => (g < 0.5
        ? `rgba(24,44,110,${(0.30 * (1 - g * 2) + 0.05).toFixed(3)})`
        : `rgba(255,168,84,${(0.10 * (g * 2 - 1) + 0.02).toFixed(3)})`);

      return {
        duration: TOTAL,
        cues: composeCues(pl),
        score: () => composeScore(pl),
        cover: 11.9,
        render(t) {
          field.render(t);
          const ending = t >= END - 0.05;

          // Shots
          shots.forEach((o, i) => {
            const { s } = o;
            const next = SHOTS[i + 1];
            const nextFull = next ? next.t0 + (next.cut ? 0.02 : FADE) : TOTAL + 1;
            const on = t >= s.t0 - 0.001 && t < nextFull;
            o.layer.style.display = on && !ending ? '' : 'none';
            if (!on || ending) return;
            const k = clamp((t - s.t0) / (s.t1 - s.t0));
            const z = lerp(s.zoom[0], s.zoom[1], E.inOutSine(k));
            const x = lerp(s.pan[0], s.pan[2], E.inOutSine(k)), y = lerp(s.pan[1], s.pan[3], E.inOutSine(k));
            o.img.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${z.toFixed(4)})`;
            const g = Array.isArray(s.grade) ? lerp(s.grade[0], s.grade[1], k) : s.grade;
            o.img.style.filter = warm(g);
            o.tint.style.background = tintColor(g);
            o.layer.style.opacity = (s.cut ? 1 : clamp((t - s.t0) / FADE)).toFixed(3);
          });
          shade.style.display = ending ? 'none' : '';

          // The doorbell's rings, on the macro of the finger
          bellRings.el.style.display = ending ? 'none' : '';
          bellRings.render(t, [BELL + 0.05, BELL + 0.05 + ctx.bell.second], 675, 945, 40);

          // Captions
          caps.forEach(({ a, b, t: tt }) => {
            const on = t >= a - 0.01 && t < b + 0.4 && !ending;
            tt.el.style.display = on ? '' : 'none';
            if (!on) return;
            TX.animWords(tt.words, t, { at: a, stagger: 0.07, dur: 0.5, y: 24, blur: 6, out: b, outDur: 0.3, outY: 14 });
          });
          pills.forEach(({ e, a, b }) => {
            const k = p(t, a, 0.45, E.outBack), ko = p(t, b - 0.2, 0.2, E.inCubic);
            set(e, { y: (1 - k) * 30, s: lerp(0.85, 1, k), o: Math.min(k, 1 - ko) * (ending ? 0 : 1) });
          });

          // Logo and tag on the two physiotherapists at the door
          const lk = pl.full ? p(t, 31.3, 0.7, E.outQuint) : 0, lo = p(t, END - 0.35, 0.3, E.inCubic);
          set(lockup, { y: (1 - lk) * 24, o: pl.full ? Math.min(lk, 1 - lo) : 0 });
          tag.el.style.display = pl.full && !ending ? '' : 'none';
          if (pl.full) TX.animWords(tag.words, t, { at: 31.6, stagger: 0.09, dur: 0.5, y: 18, blur: 4, out: END - 0.35, outDur: 0.3 });

          // The tab (always), growing into the hero on the end card
          tab.render(t, 0.1, t >= END - 0.05 ? hero : null);

          // End card
          endLayer.style.display = ending ? '' : 'none';
          rings.render(t, ending ? [BELL2 + 0.02, BELL2 + 0.02 + ctx.bell.second] : [], hero.cx, hero.cy, 150);
          const e0 = BELL2 - 0.25;
          [cta1, cta2, close, foot].forEach((b) => b.el.style.display = ending ? '' : 'none');
          num.style.display = ending ? '' : 'none';
          strip.el.style.display = ending ? '' : 'none';
          if (ending) {
            TX.animWords(cta1.words, t, { at: e0 + 0.5, stagger: 0.09, dur: 0.55, y: 36 });
            TX.animWords(cta2.words, t, { at: e0 + 0.7, stagger: 0.09, dur: 0.55, y: 36 });
            set(num, { y: (1 - p(t, e0 + 1.0, 0.6, E.outQuint)) * 24, o: p(t, e0 + 1.0, 0.4, E.linear) });
            TX.animWords(close.words, t, { at: e0 + 1.35, stagger: 0.08, dur: 0.5, y: 14, blur: 3 });
            TX.animWords(foot.words, t, { at: e0 + 1.6, stagger: 0.04, dur: 0.4, y: 8, blur: 2 });
            strip.render(t, e0 + 1.4);
          }
        },
      };
    },
  });
})();
