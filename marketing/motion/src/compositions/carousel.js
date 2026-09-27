/* Feed carousel slides, 1080×1350 PNG (Design guideline → Layouts → Feed
 * template): pink tab top right, series pill top left, one pink element,
 * trust strip along the bottom, swipe arrow on slide 1 only.
 * Slide types: hook · myth · statement · quote · cta · badge · rows · voice
 * · art · list. A single-image post is a carousel with one slide. */
(function () {
  'use strict';
  const TX = window.TX;
  const { el, px } = TX;

  /** A real photo, or, when the file is missing, a plain placeholder frame. */
  function photo(parent, src, size, position) {
    if (!src) {
      const ph = el('div', 'center', parent);
      px(ph, { ...size, background: '#E6E7F1' });
      TX.svg(ph, TX.icon('user', '#9A9CB8', 2.4)).setAttribute('width', 180);
      return null;
    }
    const img = el('img', '', parent);
    img.src = src;
    img.alt = '';
    px(img, { ...size, objectFit: 'cover', objectPosition: position, display: 'block' });
    return img;
  }

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
    // The doctor's ID badge on the pink lanyard: a real photo, name and role.
    // The lanyard is the slide's one pink element.
    badge(L, s, ctx) {
      const W = ctx.w;
      TX.svg(L, `<svg class="abs" width="1080" height="270" viewBox="0 0 1080 270" style="left:0;top:0">
          <path d="M468 -10 L527 236 M612 -10 L553 236" stroke="#EE396B" stroke-width="28" stroke-linecap="round" fill="none"/>
          <rect x="516" y="222" width="48" height="52" rx="12" fill="#C9CBDF"/>
        </svg>`);
      const card = el('div', 'card', L);
      px(card, { left: (W - 600) / 2, top: 258, width: 600, height: 740, overflow: 'hidden', boxShadow: '0 40px 80px -30px rgba(0,0,0,.6)' });
      photo(card, s.photo, { width: 600, height: 560 }, '50% 18%');
      const id = el('div', 'center', card);
      px(id, { height: 180, flexDirection: 'column', gap: 2 });
      el('div', 't-sub', id, s.name);
      const role = el('div', 't-body', id, s.role);
      role.style.color = 'rgba(24,25,67,.7)';
      TX.text(L, s.text, 'col centered t-hook-s', { top: 1040 });
    },
    // A title, then rows of blue icon + text (credentials, ways to reach us).
    rows(L, s, ctx, light) {
      let y = s.top || 290;
      if (s.title) {
        const t = TX.text(L, s.title, 'col t-hook-s', { top: y });
        y += t.el.offsetHeight + 56;
      }
      s.rows.forEach((r) => {
        const row = el('div', 'abs', L);
        px(row, { right: 80, left: 80, top: y, display: 'flex', alignItems: 'center', gap: 28 });
        const ic = el('div', 'center', row);
        px(ic, { width: 104, height: 104, borderRadius: 30, background: light ? 'rgba(27,156,206,.12)' : 'rgba(255,254,255,.1)', flex: 'none' });
        TX.svg(ic, TX.icon(r.icon, '#1B9CCE', 3)).setAttribute('width', 60);
        TX.words(el('div', 't-sub', row), r.text);
        y += 140;
      });
      if (s.note) TX.text(L, s.note, 'col t-body dim', { top: y + 24 });
    },
    // A close crop of the doctor, a question, and the answer in their own words.
    voice(L, s) {
      const ring = el('div', 'abs', L);
      px(ring, { right: 80, top: 250, width: 270, height: 270, borderRadius: '50%', overflow: 'hidden', border: '7px solid #FFFEFF', background: '#FFFEFF' });
      const img = photo(ring, s.photo, { width: '100%', height: '100%' }, '50% 30%');
      if (img) px(img, { transform: `scale(${s.zoom || 1.7})`, transformOrigin: s.origin || '51% 36%' });
      const q = TX.text(L, s.label, 'col t-sub', { top: 570 });
      const a = TX.text(L, `«${s.quote}»`, 'col t-hook-s', { top: 0 });
      px(a.el, { top: q.el.offsetTop + q.el.offsetHeight + 30 });
    },
    // An illustration drawn in code (src/art.js) with its text; the flag option
    // adds the small Iraqi flag, well away from the tab.
    art(L, s) {
      const box = el('div', 'abs', L);
      px(box, { left: s.artLeft == null ? 90 : s.artLeft, right: s.artRight == null ? 90 : s.artRight, top: s.artTop == null ? 210 : s.artTop, height: s.artHeight || 620 });
      box.innerHTML = TX.art[s.art]();
      const t = TX.text(L, s.text, `col ${s.textClass || 't-hook-s'}`, { top: s.textTop == null ? 870 : s.textTop });
      if (s.small) {
        const sm = TX.text(L, s.small, 'col t-sub dim', { top: 0 });
        px(sm.el, { top: t.el.offsetTop + t.el.offsetHeight + 24 });
      }
      if (s.flag) {
        const f = el('div', 'abs', L);
        px(f, { left: 80, top: s.flagTop || 300, width: 138, height: 92, borderRadius: 10, overflow: 'hidden', boxShadow: '0 10px 24px -10px rgba(0,0,0,.7)' });
        f.innerHTML = TX.art.flag();
      }
    },
    // A title, a short list with blue dots, a caveat and the reviewer's name.
    list(L, s) {
      const t = TX.text(L, s.title, 'col t-hook-s', { top: 270 });
      let y = t.el.offsetTop + t.el.offsetHeight + 40;
      s.items.forEach((it) => {
        const row = el('div', 'abs', L);
        px(row, { right: 80, left: 80, top: y, display: 'flex', alignItems: 'center', gap: 22 });
        const dot = el('div', '', row);
        px(dot, { width: 20, height: 20, borderRadius: '50%', background: '#1B9CCE', flex: 'none' });
        TX.words(el('div', 't-sub', row), it);
        y += 86;
      });
      if (s.small) TX.text(L, s.small, 'col t-body dim', { top: y + 24 });
      if (s.signed) TX.text(L, s.signed, 'col t-strip dim', { top: y + 100 });
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
        if (light) { L.style.background = '#FFFEFF'; L.style.color = '#181943'; L.classList.add('light-layer'); }
        else {
          const f = TX.field(L);
          f.render(3);
        }
        SLIDES[s.type](L, s, ctx, light);
        chrome(L, ctx, light, s.series === false ? null : P.series, ctx.brand.trustStrip);
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
