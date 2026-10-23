/* A series name set as lettering for other designs: the series icon and the
 * name in Cairo Black, one page per colour. Render it with --alpha and every
 * page is a PNG on a transparent background, ready to drop on a photo, a
 * story or a slide. */
(function () {
  'use strict';
  const TX = window.TX;
  const { el, px } = TX;

  TX.register('wordmark', {
    size: [1080, 360],
    kind: 'still',
    build(stage, P) {
      const layers = P.colors.map((color) => {
        const L = el('div', 'layer', stage);
        const row = el('div', 'abs center', L);
        px(row, { inset: 0, gap: 26, direction: 'rtl' });
        const ic = TX.svg(row, TX.icon(P.icon, color, 4.2));
        ic.setAttribute('width', 150);
        ic.setAttribute('height', 150);
        const name = el('div', '', row, P.text);
        px(name, { color, fontSize: 136, fontWeight: '900', lineHeight: '1.25', whiteSpace: 'nowrap' });
        return L;
      });
      return {
        pages: layers.length,
        render(i) { layers.forEach((L, j) => { L.style.display = j === Math.round(i) ? '' : 'none'; }); },
      };
    },
  });
})();
