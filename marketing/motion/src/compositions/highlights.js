/* Profile highlight covers: navy circles with dashed borders (Design guideline
 * → Profile): شوف بعينك · دكاترتنا · وعدنا · سؤالكم · لأهلك. Instagram crops a
 * centred circle, so the ring sits inside the square. */
(function () {
  'use strict';
  const TX = window.TX;
  const { el, px } = TX;

  TX.register('highlights', {
    size: [1080, 1080],
    kind: 'still',
    build(stage, P) {
      const layers = P.covers.map((c) => {
        const L = el('div', 'layer', stage);
        TX.field(L).render(4);
        TX.svg(L, `<svg class="abs" width="1080" height="1080" viewBox="0 0 1080 1080" style="left:0;top:0">
            <circle cx="540" cy="540" r="470" fill="none" stroke="rgba(255,254,255,.85)" stroke-width="14" stroke-dasharray="46 30" stroke-linecap="round"/>
          </svg>`);
        const ic = el('div', 'abs center', L);
        px(ic, { inset: 0 });
        TX.svg(ic, TX.icon(c.icon, '#1B9CCE', 2.6)).setAttribute('width', 440);
        return L;
      });
      return {
        pages: layers.length,
        render(i) { layers.forEach((L, j) => { L.style.display = j === Math.round(i) ? '' : 'none'; }); },
      };
    },
  });
})();
