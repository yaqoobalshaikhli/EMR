/* Package stories: one 1080×1920 image per lab package — its name and what it is
 * for — to post as Instagram, TikTok and Facebook stories. One layout serves all
 * three: nothing sits in the top 250 px or the bottom 350 px (where the apps draw
 * their own bars and reply fields) and a margin keeps TikTok's side buttons clear.
 * The wording is the reel's: the names and purposes of its package cards. */
(function () {
  'use strict';
  const TX = window.TX;
  const { el, px } = TX;
  const PINK = '#EE396B', BLUE = '#1B9CCE', WHITE = '#FFFEFF';

  /** The TabeebX lockup in its official colours; the wordmark is white on navy. */
  function lockup(parent, width) {
    const [fx, fy] = [TX.logo.wordBox[0], TX.logo.figureBox[1]];
    const w = TX.logo.wordBox[2], h = TX.logo.wordBox[1] + TX.logo.wordBox[3] - fy;
    const paths = TX.logo.order.map((k) => `<path d="${TX.logo.parts[k].d}" fill="${TX.logo.parts[k].color === '#181943' ? WHITE : TX.logo.parts[k].color}"/>`).join('');
    const svg = TX.svg(parent, `<svg viewBox="${fx} ${fy} ${w} ${h}" width="${width}" height="${(width * h) / w}">${paths}</svg>`);
    return svg;
  }

  const WA = '<svg viewBox="0 0 48 48" width="64" height="64"><circle cx="24" cy="24" r="23" fill="#25D366"/><path d="M24 11.5a12.4 12.4 0 0 0-10.6 18.8L11.6 36.5l6.4-1.7A12.4 12.4 0 1 0 24 11.5z" fill="none" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"/><path d="M19.6 18.6c-.5 1.2-.4 2.9 1.5 5.3 1.9 2.3 3.8 3.4 5.6 3.5 1.3.1 2.3-.7 2.5-1.7l-2.6-1.3-1.3 1c-1.4-.6-2.9-2-3.5-3.6l.9-1.2-1.2-2.7c-.8-.2-1.5.1-1.9.7z" fill="#fff"/></svg>';

  function backdrop(stage) {
    const L = el('div', 'layer', stage);
    px(L, {
      background: 'radial-gradient(70% 38% at 50% 22%, rgba(34,110,190,.40), rgba(24,25,67,0) 70%), radial-gradient(85% 42% at 18% 96%, rgba(238,57,107,.30), rgba(24,25,67,0) 72%), radial-gradient(70% 36% at 88% 78%, rgba(88,52,150,.32), rgba(24,25,67,0) 70%), #181943',
    });
    // a very faint grid, and two rings, as in the reel
    const grid = el('div', 'layer', L);
    px(grid, { backgroundImage: 'linear-gradient(rgba(255,254,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,254,255,.035) 1px, transparent 1px)', backgroundSize: '54px 54px' });
    [[1180, 'rgba(255,254,255,.07)', '2px solid'], [820, 'rgba(255,254,255,.06)', '2px dashed']].forEach(([d, c, b]) => {
      const r = el('div', 'abs', L);
      px(r, { left: 540 - d / 2, top: 900 - d / 2, width: d, height: d, borderRadius: '50%', border: `${b} ${c}` });
    });
    // corner marks
    [[60, 96, 'top left'], [1020, 1824, 'bottom right']].forEach(([x, y, at]) => {
      const m = el('div', 'abs', L);
      const s = at === 'top left' ? { borderTop: '4px solid rgba(255,254,255,.45)', borderLeft: '4px solid rgba(255,254,255,.45)' } : { borderBottom: '4px solid rgba(255,254,255,.45)', borderRight: '4px solid rgba(255,254,255,.45)' };
      px(m, { left: at === 'top left' ? x : x - 90, top: at === 'top left' ? y : y - 90, width: 90, height: 90, ...s });
    });
    return L;
  }

  TX.register('package-story', {
    size: [1080, 1920],
    kind: 'still',
    build(stage, P, ctx) {
      const pages = P.packages.map((pk, i) => {
        const page = el('div', 'layer', stage);
        backdrop(page);
        const accent = i % 2 === 0 ? PINK : BLUE; // one accent per frame, alternating as in the reel

        // Everything lives in one column between the two unsafe bands.
        const col = el('div', 'abs', page);
        px(col, { left: 90, right: 90, top: 262, height: 1300, display: 'flex', flexDirection: 'column', alignItems: 'center' });

        const logoWrap = el('div', '', col);
        px(logoWrap, { height: 131, flex: 'none', display: 'flex', alignItems: 'center' });
        lockup(logoWrap, 130);

        const eyebrow = el('div', '', col, P.eyebrow);
        px(eyebrow, { marginTop: 20, fontSize: 44, fontWeight: '700', color: 'rgba(255,254,255,.72)' });

        // icon in a glowing ring
        const ring = el('div', '', col);
        px(ring, {
          marginTop: 20, width: 188, height: 188, flex: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'radial-gradient(circle at 50% 38%, rgba(255,254,255,.14), rgba(255,254,255,.04))',
          border: '3px solid rgba(255,254,255,.22)', boxShadow: `0 0 80px -6px ${accent}66, inset 0 0 40px rgba(255,254,255,.05)`,
        });
        const ic = TX.svg(ring, TX.icon(pk.icon, WHITE, 3));
        ic.setAttribute('width', 130); ic.setAttribute('height', 130);

        const title = el('div', '', col);
        px(title, { marginTop: 28, textAlign: 'center', fontSize: 108, fontWeight: '900', lineHeight: '1.18', color: WHITE });
        pk.title.split('\n').forEach((ln) => { const l = el('div', '', title, ln); px(l, { whiteSpace: 'nowrap' }); });

        const bar = el('div', '', col);
        px(bar, { marginTop: 18, flex: 'none', width: 200, height: 12, borderRadius: 6, background: accent, boxShadow: `0 0 26px ${accent}99` });

        // what it is for
        const card = el('div', '', col);
        px(card, {
          marginTop: 24, width: '100%', height: 276, flex: 'none', boxSizing: 'border-box', padding: '0 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: 50, textAlign: 'center',
          background: 'rgba(255,254,255,.07)', border: '2px solid rgba(255,254,255,.16)', boxShadow: '0 30px 70px -34px rgba(0,0,0,.7)',
        });
        const lab = el('div', '', card, P.label);
        px(lab, { fontSize: 34, fontWeight: '700', color: BLUE, letterSpacing: '0.01em' });
        const body = el('div', '', card, pk.use);
        px(body, { marginTop: 10, fontSize: pk.use.length > 46 ? 46 : 52, fontWeight: '700', lineHeight: '1.4', color: WHITE });

        // call to action
        const cta = el('div', '', col);
        px(cta, { marginTop: 34, flex: 'none', width: '100%', textAlign: 'center' });
        const line = el('div', '', cta, P.cta);
        px(line, { fontSize: 42, fontWeight: '700', color: WHITE });
        const num = el('div', '', cta);
        px(num, { marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, direction: 'ltr' });
        const wa = el('div', '', num); wa.innerHTML = WA;
        const digits = el('div', '', num, P.phone);
        px(digits, { fontSize: 66, fontWeight: '900', color: WHITE, letterSpacing: '0.02em' });

        return page;
      });
      return {
        pages: pages.length,
        render(i) { pages.forEach((pg, j) => { pg.style.display = j === Math.round(i) ? '' : 'none'; }); },
      };
    },
  });
})();
