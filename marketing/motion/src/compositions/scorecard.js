/* Monthly وعد TabeebX scorecard — first Sunday of every month from Sun 1 Nov.
 * Each promise: its target, what we actually hit (x of y), kept or missed,
 * and for a miss, what we changed. Misses are shown, never hidden. */
(function () {
  'use strict';
  const TX = window.TX;
  const { E, p, set, el, px, lerp } = TX;
  const C = 2 * Math.PI * 180;

  TX.register('scorecard', {
    size: [1080, 1920],
    fps: 30,
    build(stage, P, ctx) {
      const field = TX.field(stage);
      const n = P.promises.length;
      const T0 = 2.6, SEG = 5.0;
      const tClose = T0 + n * SEG, tEnd = tClose + 3.0, total = tEnd + 3.7;

      const h1 = TX.text(stage, P.hook[0], 'col centered t-sub dim', { top: 720 });
      const h2 = TX.text(stage, P.hook[1], 'col centered t-hook', { top: 800 });

      const blocks = P.promises.map((pr, i) => {
        const L = el('div', 'layer', stage);
        const idx = TX.text(L, `${TX.ar(i + 1)} من ${TX.ar(n)}`, 'col t-sub blue', { top: 440 });
        const title = TX.text(L, pr.title, 'col t-sub', { top: 510 });
        title.el.style.fontSize = '60px';
        const ringWrap = el('div', 'abs', L);
        px(ringWrap, { left: (ctx.w - 420) / 2, top: 700, width: 420, height: 420 });
        const svg = TX.svg(ringWrap, `<svg width="420" height="420" viewBox="0 0 420 420">
            <circle cx="210" cy="210" r="180" fill="none" stroke="rgba(255,254,255,.12)" stroke-width="30"/>
            <circle class="arc" cx="210" cy="210" r="180" fill="none" stroke="#1B9CCE" stroke-width="30" stroke-linecap="round" transform="rotate(-90 210 210)" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${C.toFixed(2)}"/>
          </svg>`);
        const arc = svg.querySelector('.arc');
        const big = el('div', 'abs', ringWrap, '٠');
        px(big, { left: 0, right: 0, top: 88, textAlign: 'center', fontSize: 170, fontWeight: 700, lineHeight: 1.2 });
        const ofEl = el('div', 'abs t-sub dim', ringWrap, `من ${TX.ar(pr.of)}`);
        px(ofEl, { left: 0, right: 0, top: 290, textAlign: 'center' });
        const kept = pr.hit / pr.of >= (P.threshold || 0.95);
        const verdict = el('div', 'abs center', L);
        px(verdict, { top: 1170, height: 84, left: 0, right: 0 });
        const chip = el('div', 'center', verdict);
        px(chip, { height: 84, padding: '0 36px 6px', borderRadius: 999, gap: 14, fontSize: 40, fontWeight: 700, background: kept ? '#1B9CCE' : 'transparent', border: kept ? 'none' : '5px solid rgba(255,254,255,.85)' });
        if (kept) TX.svg(chip, '<svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="#FFFEFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 25l9 9 21-21"/></svg>');
        el('span', '', chip, kept ? P.verdicts[0] : P.verdicts[1]);
        const fix = !kept && pr.fix ? TX.text(L, `${P.fixLabel} ${pr.fix}`, 'col centered t-body', { top: 1290 }) : null;
        return { L, idx, title, ringWrap, arc, big, verdict, fix, pr, at: T0 + i * SEG };
      });

      const close = TX.text(stage, P.closing, 'col centered t-hook-s', { top: 780 });
      const rings = TX.C.rings(stage, 2);
      const tab = TX.C.tab(stage, ctx);
      const pill = TX.C.pill(stage, ctx, P.series, 'seal');
      const end = TX.C.endCard(stage, ctx, tab, tEnd);
      const hits0 = [0.05, 0.05 + ctx.bell.second];

      const cues = [{ t: 0.05, sfx: 'doorbell' }, ...end.cues, { t: tClose - 0.05, sfx: 'whoosh' }];
      blocks.forEach((b) => {
        cues.push({ t: b.at - 0.05, sfx: 'whoosh', gain: 0.7 });
        for (let s = 0; s < 1.2; s += 0.08) cues.push({ t: b.at + 1.0 + s, sfx: 'tick', gain: 0.7 });
        cues.push({ t: b.at + 2.3, sfx: 'blip' });
      });

      return {
        duration: total,
        cues,
        bed: { from: 1.0, to: tEnd + 1.2, gain: 0.85 },
        cover: 1.8,
        render(t) {
          field.render(t);
          TX.animWords(h1.words, t, { at: 0.12, stagger: 0.06, dur: 0.5, y: 20, out: T0 - 0.35, outDur: 0.3 });
          TX.animWords(h2.words, t, { at: 0.35, stagger: 0.14, dur: 0.6, y: 60, blur: 14, scaleFrom: 1.12, out: T0 - 0.35, outDur: 0.3 });

          blocks.forEach((b) => {
            const u = t - b.at;
            const on = u >= -0.05 && u < SEG;
            b.L.style.display = on ? '' : 'none';
            if (!on) return;
            const out = SEG - 0.4;
            TX.animWords(b.idx.words, u, { at: 0, dur: 0.4, y: 10, blur: 2, out, outDur: 0.3 });
            TX.animWords(b.title.words, u, { at: 0.15, stagger: 0.06, out, outDur: 0.3 });
            const kr = p(u, 0.6, 0.5, E.outBack);
            const kx = p(u, out, 0.3, E.inCubic);
            set(b.ringWrap, { s: 0.8 + 0.2 * kr, o: TX.clamp(kr * 1.4) * (1 - kx) });
            const kc = p(u, 1.0, 1.2, E.inOutCubic);
            b.arc.setAttribute('stroke-dashoffset', (C * (1 - kc * (b.pr.hit / b.pr.of))).toFixed(2));
            b.big.textContent = TX.ar(Math.round(lerp(0, b.pr.hit, kc)));
            const kv = p(u, 2.3, 0.5, E.outBack);
            set(b.verdict, { s: 0.7 + 0.3 * kv, o: TX.clamp(kv * 1.5) * (1 - kx) });
            if (b.fix) TX.animWords(b.fix.words, u, { at: 2.7, stagger: 0.05, dur: 0.5, y: 16, blur: 4, out, outDur: 0.3 });
          });

          TX.animWords(close.words, t, { at: tClose + 0.1, stagger: 0.1, dur: 0.6, y: 40, out: tEnd - 0.3, outDur: 0.3 });

          tab.render(t, 0.05);
          rings.render(t, t < 3 ? hits0 : [], tab.base.cx, tab.base.cy, 70);
          pill.render(t, 0.35, tEnd - 0.3);
          end.render(t);
        },
      };
    },
  });
})();
