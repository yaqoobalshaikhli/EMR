/* Feed carousel slides, 1080×1350 PNG (Design guideline → Layouts → Feed
 * template): pink tab top right, series pill top left, one pink element,
 * trust strip along the bottom, swipe arrow on slide 1 only.
 * Slide types: hook · myth · statement · quote · cta. */
(function () {
  'use strict';
  const TX = window.TX;
  const { el, px } = TX;

  function chrome(layer, ctx, light, series, strip) {
    const tab = TX.C.tab(layer, ctx);
    tab.render(9, 0);
    if (series) {
      const pill = TX.C.pill(layer, ctx, series, TX.seriesIcon(series));
      if (light) px(pill.el, { background: '#181943', color: '#FFFEFF' });
    }
    const s = TX.C.strip(layer, ctx, strip);
    if (light) s.el.style.color = 'rgba(24,25,67,.7)';
  }

  const SLIDES = {
    hook(L, s) {
      const h = TX.text(L, s.text, 'col t-hook', { top: 330 });
      h.el.style.fontSize = '84px';
      if (s.small) {
        const sm = TX.text(L, s.small, 'col t-sub dim', { top: 0 });
        L.style.display = '';
        px(sm.el, { top: h.el.offsetTop + h.el.offsetHeight + 40 });
      }
      if (s.swipe) {
        const a = el('div', 'abs t-hook', L, '←');
        px(a, { left: 64, bottom: 110, color: '#FFFEFF' });
      }
    },
    myth(L, s) {
      const c = TX.text(L, s.claim, 'col t-hook-s', { top: 290 });
      const ex = TX.text(L, s.explain, 'col t-body', { top: 0 });
      px(ex.el, { top: Math.max(600, c.el.offsetTop + c.el.offsetHeight + 50) });
      ex.el.style.color = 'rgba(24,25,67,.78)';
      const st = el('div', 'abs center', L, s.stamp);
      px(st, { left: 110, top: 880, height: 190, padding: '0 56px 12px', border: '12px solid #EE396B', borderRadius: 36, color: '#EE396B', fontSize: 120, fontWeight: 700, transform: 'rotate(-9deg)' });
    },
    statement(L, s) {
      TX.text(L, s.text, 'col t-hook-s', { top: s.top || 330 });
    },
    quote(L, s) {
      TX.text(L, s.label1, 'col t-sub dim', { top: 290 });
      TX.text(L, `«${s.quote}»`, 'col t-sub', { top: 370 });
      const bar = el('div', 'abs', L);
      px(bar, { right: 80, top: 640, width: 140, height: 8, borderRadius: 8, background: '#1B9CCE' });
      TX.text(L, s.label2, 'col t-sub dim', { top: 690 });
      TX.text(L, s.promise, 'col t-hook-s', { top: 770 });
    },
    cta(L, s) {
      TX.text(L, s.lead, 'col t-sub', { top: 300 });
      if (s.body) TX.text(L, s.body, 'col t-body dim', { top: 400 });
      TX.text(L, s.cta, 'col t-sub', { top: s.ctaTop || 640 });
      if (s.signed) TX.text(L, s.signed, 'col t-strip dim', { top: (s.ctaTop || 640) + 100 });
      TX.text(L, s.closing || '', 'col t-hook-s', { top: 890 });
    },
  };

  TX.register('carousel', {
    size: [1080, 1350],
    kind: 'still',
    build(stage, P, ctx) {
      const layers = P.slides.map((s) => {
        const L = el('div', 'layer', stage);
        const light = s.bg === 'white';
        if (light) { L.style.background = '#FFFEFF'; L.style.color = '#181943'; }
        else {
          const f = TX.field(L);
          f.render(3);
        }
        SLIDES[s.type](L, s, ctx);
        chrome(L, ctx, light, P.series, ctx.brand.trustStrip);
        return L;
      });
      return {
        pages: layers.length,
        render(i) {
          layers.forEach((L, j) => { L.style.display = j === Math.round(i) ? '' : 'none'; });
        },
      };
    },
  });
})();
