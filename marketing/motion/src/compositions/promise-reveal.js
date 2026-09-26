/* Sun 4 Oct payoff — وعد TabeebX, motion edition (Reel / story, ~28 s).
 * The audience's own complaints become numbered promises; each number counts
 * up so the eye lands on it. Numbers come from the baseline week (Sat 3 Oct);
 * until they are filled in, placeholders keep the render stamped DRAFT. */
(function () {
  'use strict';
  const TX = window.TX;
  const { E, p, set, el, px, lerp } = TX;
  const AR = '٠١٢٣٤٥٦٧٨٩';
  const toNum = (s) => {
    const w = String(s).replace(/[٠-٩]/g, (d) => AR.indexOf(d));
    return /^\d+$/.test(w) ? Number(w) : null;
  };

  TX.register('promise-reveal', {
    size: [1080, 1920],
    fps: 30,
    build(stage, P, ctx) {
      const field = TX.field(stage);
      const n = P.promises.length;
      const T0 = 2.6, SEG = 5.2;
      const tMonthly = T0 + n * SEG, tTried = tMonthly + 4.6, tEnd = tTried + 1.9;
      const total = tEnd + 3.7;

      // hook
      const h1 = TX.text(stage, P.hook[0], 'col centered t-hook-s', { top: 700 });
      const h2 = TX.text(stage, P.hook[1], 'col centered t-hook', { top: 810 });

      // one block per promise
      const blocks = P.promises.map((pr, i) => {
        const L = el('div', 'layer', stage);
        const idx = TX.text(L, `${TX.ar(i + 1)} من ${TX.ar(n)}`, 'col t-sub blue', { top: 440 });
        const l1 = TX.text(L, P.labels[0], 'col t-sub dim', { top: 520 });
        const q = TX.text(L, `«${pr.complaint}»`, 'col t-sub', { top: 590 });
        q.el.style.fontSize = '60px';
        const bar = el('div', 'abs', L);
        px(bar, { right: 80, top: 775, height: 8, borderRadius: 8, background: '#1B9CCE' });
        const l2 = TX.text(L, P.labels[1], 'col t-sub dim', { top: 815 });
        const heroRow = el('div', 'col', L);
        px(heroRow, { top: 945, display: 'flex', alignItems: 'baseline', gap: 26, justifyContent: 'flex-start' });
        const target = toNum(pr.n);
        // The hero is the number; a promise without one ("بكل زيارة") shows its words instead.
        const num = el('div', 'pink', heroRow, pr.n == null ? pr.hero || '' : String(pr.n));
        px(num, { fontSize: pr.n == null ? 110 : 220, fontWeight: 700, lineHeight: pr.n == null ? 1.3 : 1 });
        const unit = el('div', 't-sub', heroRow, pr.unit || '');
        const sentence = TX.text(L, String(pr.promise).replace('{n}', pr.n == null ? '' : pr.n), 'col t-sub', { top: 1215 });
        sentence.el.style.color = 'rgba(255,254,255,.86)';
        return { L, idx, l1, q, bar, l2, heroRow, num, unit, target, sentence, raw: pr.n, at: T0 + i * SEG };
      });

      // monthly scorecard announcement
      const M = el('div', 'layer', stage);
      const m1 = TX.text(M, P.monthly[0], 'col t-sub', { top: 470 });
      m1.el.style.fontSize = '60px';
      const sheet = el('div', 'card', M);
      px(sheet, { left: 140, width: 800, top: 690, height: 420, padding: '34px 44px' });
      const sheetHead = el('div', 't-sub', sheet, P.monthly[1]);
      px(sheetHead, { fontSize: 44, borderBottom: '4px solid #E6E7F1', paddingBottom: 14, marginBottom: 18 });
      const checks = [];
      for (let i = 0; i < n; i++) {
        const row = el('div', '', sheet);
        px(row, { display: 'flex', alignItems: 'center', gap: 22, height: 88 });
        const box = el('div', 'center', row);
        px(box, { width: 58, height: 58, borderRadius: 16, border: '5px solid #1B9CCE', flex: 'none' });
        const lineEl = el('div', 't-body', row, `الوعد ${TX.ar(i + 1)}`);
        lineEl.style.color = 'rgba(24,25,67,.8)';
        const fill = el('div', '', row);
        px(fill, { flex: 1, height: 10, borderRadius: 10, background: '#E6E7F1' });
        checks.push(row);
      }
      const m2 = TX.text(M, P.monthly[2], 'col t-sub', { top: 1170 });

      const tried = TX.text(stage, P.closing, 'col centered t-hook-s', { top: 800 });

      const rings = TX.C.rings(stage, 2);
      const tab = TX.C.tab(stage, ctx);
      const pill = TX.C.pill(stage, ctx, P.series, 'seal');
      const end = TX.C.endCard(stage, ctx, tab, tEnd);
      const hits0 = [0.05, 0.05 + ctx.bell.second];

      const cues = [{ t: 0.05, sfx: 'doorbell' }, ...end.cues, { t: tMonthly - 0.05, sfx: 'whoosh' }, { t: tMonthly + 0.9, sfx: 'pop' }];
      blocks.forEach((b) => {
        cues.push({ t: b.at - 0.05, sfx: 'whoosh', gain: 0.7 });
        if (b.target != null) {
          for (let s = 0; s < 0.9; s += 0.07) cues.push({ t: b.at + 2.0 + s, sfx: 'tick', gain: 0.8 });
          cues.push({ t: b.at + 2.95, sfx: 'blip' });
        }
      });

      return {
        duration: total,
        cues,
        bed: { from: 1.0, to: tEnd + 1.2, gain: 0.85 },
        cover: 1.8,
        render(t) {
          field.render(t);
          TX.animWords(h1.words, t, { at: 0.12, stagger: 0.12, dur: 0.55, y: 40, out: T0 - 0.35, outDur: 0.3 });
          TX.animDots(h1.el, t, 0.8);
          TX.animWords(h2.words, t, { at: 0.4, stagger: 0.12, dur: 0.6, y: 60, blur: 14, scaleFrom: 1.12, out: T0 - 0.35, outDur: 0.3 });

          blocks.forEach((b) => {
            const u = t - b.at;
            const on = u >= -0.05 && u < SEG;
            b.L.style.display = on ? '' : 'none';
            if (!on) return;
            const out = SEG - 0.4;
            TX.animWords(b.idx.words, u, { at: 0, dur: 0.4, y: 10, blur: 2, out, outDur: 0.3 });
            TX.animWords(b.l1.words, u, { at: 0.1, stagger: 0.06, out, outDur: 0.3 });
            TX.animWords(b.q.words, u, { at: 0.3, stagger: 0.06, out, outDur: 0.3 });
            const kb = p(u, 1.55, 0.6, E.outExpo) * (1 - p(u, out, 0.3));
            px(b.bar, { width: 160 * kb });
            set(b.bar, { o: kb > 0.01 ? 1 : 0 });
            TX.animWords(b.l2.words, u, { at: 1.7, stagger: 0.06, out, outDur: 0.3 });
            const kh = p(u, 1.95, 0.5, E.outBack);
            const kx = p(u, out, 0.3, E.inCubic);
            set(b.heroRow, { s: 0.7 + 0.3 * kh, o: TX.clamp(kh * 1.5) * (1 - kx), y: kx * -20 });
            b.heroRow.style.transformOrigin = '100% 60%';
            if (b.target != null) {
              const kc = p(u, 2.0, 0.9, E.outCubic);
              b.num.textContent = TX.ar(Math.round(lerp(0, b.target, kc)));
            }
            TX.animWords(b.sentence.words, u, { at: 2.5, stagger: 0.05, out, outDur: 0.3 });
          });

          const um = t - tMonthly;
          const mOn = um >= -0.05 && um < 4.6;
          M.style.display = mOn ? '' : 'none';
          if (mOn) {
            TX.animWords(m1.words, um, { at: 0.1, stagger: 0.07, out: 4.2, outDur: 0.3 });
            const ks = p(um, 0.7, 0.7, E.outBack);
            set(sheet, { s: 0.85 + 0.15 * ks, o: TX.clamp(ks * 1.4) * (1 - p(um, 4.2, 0.3)) });
            checks.forEach((r, i) => set(r, { o: p(um, 1.1 + i * 0.15, 0.4), x: (1 - p(um, 1.1 + i * 0.15, 0.5, E.outCubic)) * 30 }));
            TX.animWords(m2.words, um, { at: 1.9, stagger: 0.06, out: 4.2, outDur: 0.3 });
            TX.animDots(m2.el, um, 2.6);
          }

          TX.animWords(tried.words, t, { at: tTried + 0.05, stagger: 0.12, dur: 0.6, y: 40, out: tEnd - 0.3, outDur: 0.3 });
          TX.animDots(tried.el, t, tTried + 0.6);

          tab.render(t, 0.05);
          rings.render(t, t < 3 ? hits0 : [], tab.base.cx, tab.base.cy, 70);
          pill.render(t, 0.35, tEnd - 0.3);
          end.render(t);
        },
      };
    },
  });
})();
