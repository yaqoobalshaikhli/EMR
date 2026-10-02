/* Feed carousel slides, 1080×1350 PNG (Design guideline → Layouts → Feed
 * template): pink tab top right, series pill top left, one pink element,
 * trust strip along the bottom, swipe arrow on slide 1 only.
 * Slide types: hook · myth · statement · quote · cta · badge · rows · voice
 * · art · list, and the infographics: pictogram · bars · donut · reading ·
 * timeline · iceberg · report · artery · compare. A single-image post is a
 * carousel with one slide.
 * `pulse: true` runs one heartbeat line along the bottom of every slide. It
 * meets the edges at the same height, so the slides join into one strip
 * whichever way the app lays them out. */
(function () {
  'use strict';
  const TX = window.TX;
  const { el, px } = TX;
  const NAVY = '#181943', PINK = '#EE396B', BLUE = '#1B9CCE', WHITE = '#FFFEFF';
  // Infographics keep their content above this line: the heartbeat runs below it.
  const PULSE_Y = 1196;

  function pulse(L) {
    TX.svg(L, `<svg class="abs" style="left:0;top:0" width="1080" height="1350" viewBox="0 0 1080 1350">
      <path d="M0 ${PULSE_Y}H468q16 -26 32 0h22l9 12l16 -92l16 112l10 -32h30q28 -44 56 0H1080" fill="none" stroke="${BLUE}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`);
  }
  /** The source of a figure, small and dim, under the chart. */
  const source = (L, text, top) => text && TX.text(L, text, 'col t-strip dim', { top });
  const bottom = (b) => b.el.offsetTop + b.el.offsetHeight;
  /** Colours for the quiet parts of a chart on a white or a navy slide. */
  const quiet = (light, a) => (light ? `rgba(24,25,67,${a})` : `rgba(255,254,255,${a * 1.4})`);

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
    hook(L, s, ctx, light, P) {
      const h = TX.text(L, s.text, 'col t-hook', { top: 330 });
      h.el.style.fontSize = '84px';
      if (s.small) {
        const sm = TX.text(L, s.small, 'col t-sub dim', { top: 0 });
        L.style.display = '';
        px(sm.el, { top: h.el.offsetTop + h.el.offsetHeight + 40 });
      }
      if (s.swipe) {
        const a = el('div', 'abs t-hook', L, '←');
        px(a, { left: 64, bottom: P.pulse ? 210 : 110, color: '#FFFEFF' });
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
    // `numbered` makes them steps: a number on each icon, a line joining them.
    rows(L, s, ctx, light) {
      let y = s.top || 290;
      if (s.title) {
        const t = TX.text(L, s.title, 'col t-hook-s', { top: y });
        y += t.el.offsetHeight + 56;
      }
      const line = s.numbered ? el('div', 'abs', L) : null; // behind the icons
      const centers = [];
      s.rows.forEach((r, i) => {
        const row = el('div', 'abs', L);
        px(row, { right: 80, left: 80, top: y, display: 'flex', alignItems: 'center', gap: 28 });
        const ic = el('div', 'center', row);
        const box = s.numbered ? (light ? '#E3F0F8' : '#2F3056') : light ? 'rgba(27,156,206,.12)' : 'rgba(255,254,255,.1)';
        px(ic, { width: 104, height: 104, borderRadius: 30, background: box, flex: 'none', position: 'relative' });
        TX.svg(ic, TX.icon(r.icon, '#1B9CCE', 3)).setAttribute('width', 60);
        if (s.numbered) {
          const n = el('div', 'abs center', ic, TX.ar(i + 1));
          px(n, { right: -12, top: -12, width: 44, height: 44, borderRadius: '50%', background: light ? NAVY : WHITE, color: light ? WHITE : NAVY, fontSize: 26, fontWeight: '700' });
        }
        TX.words(el('div', s.rowClass || 't-sub', row), r.text);
        centers.push(y + row.offsetHeight / 2);
        y += Math.max(140, row.offsetHeight + 36);
      });
      if (line && centers.length > 1) px(line, { left: 946, width: 4, top: centers[0], height: centers[centers.length - 1] - centers[0], background: 'rgba(27,156,206,.55)' });
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
      if (s.body) TX.text(L, s.body, 'col t-body dim', { top: s.bodyTop || 400 });
      const c = TX.text(L, s.cta, 'col t-sub', { top: s.ctaTop || 640 });
      if (s.signed) TX.text(L, s.signed, 'col t-strip dim', { top: Math.max((s.ctaTop || 640) + 100, bottom(c) + 30) });
      TX.text(L, s.closing || '', 'col t-hook-s', { top: 890 });
    },

    // ---------------------------------------------------------- infographics
    // People as a grid of figures, the first `mark` of them pink (read from the right).
    pictogram(L, s, ctx, light) {
      const t = TX.text(L, s.title, 'col t-sub', { top: s.top || 270 });
      const cols = s.cols || 20, total = s.total || 100, rows = Math.ceil(total / cols);
      const gw = 880, cw = gw / cols, rh = s.rowH || 96, gy = bottom(t) + 36;
      let figs = '';
      for (let i = 0; i < total; i++) {
        const cx = gw - ((i % cols) + 0.5) * cw, y = Math.floor(i / cols) * rh, f = i < s.mark ? PINK : quiet(light, 0.14);
        figs += `<circle cx="${cx}" cy="${y + 13}" r="12" fill="${f}"/><rect x="${cx - 15}" y="${y + 30}" width="30" height="${rh - 44}" rx="14" fill="${f}"/>`;
      }
      TX.svg(L, `<svg class="abs" style="left:100px;top:${gy}px" width="${gw}" height="${rows * rh}">${figs}</svg>`);
      const txt = TX.text(L, s.text, 'col t-hook-s', { top: gy + rows * rh + 30 });
      source(L, s.source, bottom(txt) + 20);
    },
    // A funnel of bars, each a share of 100; `rest` paints what is missing in pink.
    bars(L, s, ctx, light) {
      const t = TX.text(L, s.title, 'col t-sub', { top: s.top || 270 });
      const x0 = 80, w = 920;
      let y = bottom(t) + 40;
      s.rows.forEach((r) => {
        const head = el('div', 'abs', L);
        px(head, { left: x0, width: w, top: y, height: 62, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '700', fontSize: 42, lineHeight: '1.3' });
        TX.words(el('div', '', head), r.label);
        const v = el('div', '', head, TX.ar(r.value));
        px(v, { fontSize: 50, color: BLUE });
        const fill = (r.value / 100) * w;
        TX.svg(L, `<svg class="abs" style="left:${x0}px;top:${y + 72}px" width="${w}" height="40">
          <rect width="${w}" height="40" rx="20" fill="${quiet(light, 0.08)}"/>
          ${r.rest ? `<rect width="${w - fill + 40}" height="40" rx="20" fill="${PINK}"/>` : ''}
          <rect x="${w - fill}" width="${fill}" height="40" rx="20" fill="${r.value === 100 ? (light ? NAVY : WHITE) : BLUE}"/>
        </svg>`);
        if (r.rest) {
          const lab = el('div', 'abs center', L, r.rest);
          px(lab, { left: x0, width: w - fill, top: y + 72, height: 40, color: WHITE, fontSize: 26, fontWeight: '700' });
        }
        y += s.rowH || 128;
      });
      const txt = TX.text(L, s.text, 'col t-sub', { top: y + 12 });
      source(L, s.source, bottom(txt) + 16);
    },
    // One share as a pink arc round a ring, with the figure in the middle.
    donut(L, s, ctx, light) {
      const t = TX.text(L, s.title, 'col t-sub', { top: s.top || 270 });
      const R = 210, sw = 64, cy = bottom(t) + 40 + R + sw / 2, C = 2 * Math.PI * R;
      TX.svg(L, `<svg class="abs" style="left:${540 - R - sw}px;top:${cy - R - sw}px" width="${2 * (R + sw)}" height="${2 * (R + sw)}">
        <g transform="translate(${R + sw} ${R + sw}) rotate(-90)">
          <circle r="${R}" fill="none" stroke="${quiet(light, 0.1)}" stroke-width="${sw}"/>
          <circle r="${R}" fill="none" stroke="${PINK}" stroke-width="${sw}" stroke-linecap="round" stroke-dashoffset="${-sw / 2}" stroke-dasharray="${((C * s.value) / 100 - sw).toFixed(1)} ${C.toFixed(1)}"/>
        </g>
      </svg>`);
      // the round caps add half a stroke at each end; the dash is shortened to match the share
      const mid = el('div', 'abs', L);
      px(mid, { left: 340, width: 400, top: cy - 112, textAlign: 'center' });
      const n = el('div', '', mid, s.center);
      px(n, { fontSize: 136, fontWeight: '700', lineHeight: '1.15' });
      const lb = el('div', 't-body', mid, s.label);
      lb.style.color = light ? 'rgba(24,25,67,.62)' : 'rgba(255,254,255,.7)';
      const txt = TX.text(L, s.text, 'col centered t-hook-s', { top: cy + R + sw / 2 + 40 });
      const src = source(L, s.source, bottom(txt) + 20);
      if (src) src.el.classList.add('centered');
    },
    // A blood-pressure monitor whose screen shows question marks: the reading nobody took.
    reading(L, s, ctx, light) {
      const top = s.top || 250;
      const dev = el('div', 'abs', L);
      px(dev, { left: 250, top, width: 580, height: 500, borderRadius: 64, background: light ? NAVY : WHITE, boxShadow: '0 40px 80px -40px rgba(0,0,0,.55)' });
      const scr = el('div', 'abs', dev);
      px(scr, { left: 50, top: 50, width: 480, height: 300, borderRadius: 28, background: '#DDEBF3', color: NAVY, direction: 'ltr', padding: '10px 36px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' });
      [['SYS', s.sys || '؟؟؟', 128], ['DIA', s.dia || '؟؟', 104]].forEach(([k, v, size], i) => {
        const row = el('div', '', scr);
        px(row, { flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: i ? '2px solid rgba(24,25,67,.12)' : 'none' });
        const lab = el('div', '', row, k);
        px(lab, { fontSize: 30, fontWeight: '700', color: 'rgba(24,25,67,.55)' });
        const val = el('div', '', row, v);
        px(val, { fontSize: size, fontWeight: '700', lineHeight: '1.2', letterSpacing: '6px' });
      });
      const unit = el('div', 'abs', dev, 'mmHg');
      px(unit, { left: 54, top: 380, fontSize: 30, fontWeight: '500', color: light ? 'rgba(255,254,255,.6)' : 'rgba(24,25,67,.55)' });
      const btn = el('div', 'abs', dev);
      px(btn, { right: 60, top: 372, width: 92, height: 92, borderRadius: '50%', background: BLUE });
      const txt = TX.text(L, s.text, 'col t-hook-s', { top: top + 500 + 60 });
      source(L, s.source, bottom(txt) + 20);
    },
    // Time running from right to left: quiet years, then the first sign.
    timeline(L, s, ctx, light) {
      const t = TX.text(L, s.title, 'col t-hook-s', { top: s.top || 270 });
      const y = bottom(t) + 150, n = s.points.length, x1 = 930, x0 = 150;
      const xs = s.points.map((_, i) => x1 - (i * (x1 - x0)) / (n - 1));
      const fg = light ? NAVY : WHITE;
      let g = `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${quiet(light, 0.18)}" stroke-width="8" stroke-linecap="round"/>`;
      xs.forEach((x, i) => {
        if (i < n - 1) g += `<circle cx="${x}" cy="${y}" r="28" fill="${BLUE}"/><path d="M${x - 11} ${y}l7 8l15 -16" fill="none" stroke="${WHITE}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
        else g += `<circle cx="${x}" cy="${y}" r="36" fill="${light ? WHITE : NAVY}" stroke="${fg}" stroke-width="7"/><path d="M${x} ${y - 16}v18" stroke="${fg}" stroke-width="7" stroke-linecap="round"/><circle cx="${x}" cy="${y + 15}" r="4.5" fill="${fg}"/>`;
      });
      TX.svg(L, `<svg class="abs" style="left:0;top:0" width="1080" height="1350">${g}</svg>`);
      xs.forEach((x, i) => {
        if (s.above && s.above[i]) { const a = el('div', 'abs t-body dim', L, s.above[i]); px(a, { left: x - 90, width: 180, top: y - 96, textAlign: 'center', fontSize: 32 }); }
        const b = el('div', 'abs', L, s.points[i]);
        px(b, { left: x - 100, width: 200, top: y + 46, textAlign: 'center', fontSize: i === n - 1 ? 36 : 32, fontWeight: i === n - 1 ? 700 : 500 });
        if (i < n - 1) b.className += ' dim';
      });
      const txt = TX.text(L, s.text, 'col t-sub', { top: y + 140 });
      source(L, s.source, bottom(txt) + 20);
    },
    // The tip you see in the mirror, and the readings under the water.
    iceberg(L, s, ctx, light) {
      const t = TX.text(L, s.title, 'col t-hook-s', { top: s.top || 260 });
      const wl = bottom(t) + 180;
      TX.svg(L, `<svg class="abs" style="left:0;top:0" width="1080" height="1350">
        <defs><linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BLUE}" stop-opacity=".28"/><stop offset="1" stop-color="${BLUE}" stop-opacity=".04"/></linearGradient></defs>
        <rect x="0" y="${wl}" width="1080" height="${PULSE_Y - 70 - wl}" fill="url(#sea)"/>
        <path d="M432 ${wl}L476 ${wl - 78}L512 ${wl - 92}L548 ${wl - 132}L596 ${wl - 70}L640 ${wl}Z" fill="${WHITE}"/>
        <path d="M432 ${wl}L330 ${wl + 110}L292 ${wl + 280}L392 ${wl + 420}L640 ${wl + 450}L790 ${wl + 330}L812 ${wl + 150}L640 ${wl}Z" fill="${WHITE}" fill-opacity=".14" stroke="${WHITE}" stroke-opacity=".45" stroke-width="3"/>
        <path d="M0 ${wl}q45 -14 90 0t90 0t90 0t90 0t90 0t90 0t90 0t90 0t90 0t90 0t90 0t90 0" fill="none" stroke="${BLUE}" stroke-width="5"/>
      </svg>`);
      const up = TX.text(L, s.above, 'col t-body', { top: wl - 140 });
      px(up.el, { left: 660 });
      s.chips.forEach((c, i) => {
        const chip = el('div', 'abs', L);
        px(chip, { left: 360, width: 380, top: wl + 80 + i * 108, height: 80, borderRadius: 24, border: '3px dashed rgba(255,254,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', boxSizing: 'border-box', fontWeight: '700', fontSize: 38 });
        el('span', '', chip, c);
        const q = el('span', '', chip, '؟');
        px(q, { color: BLUE, fontSize: 48 });
      });
    },
    // A lab result sheet whose values are all still question marks.
    report(L, s, ctx, light) {
      const top = s.top || 260;
      const card = el('div', 'card', L);
      px(card, { left: 120, width: 840, top, padding: '34px 48px 22px', boxSizing: 'border-box', background: light ? '#F2F4F9' : WHITE, boxShadow: light ? 'none' : '0 40px 80px -40px rgba(0,0,0,.6)' });
      const head = el('div', '', card);
      px(head, { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 18, borderBottom: `5px solid ${BLUE}` });
      el('div', 't-sub', head, s.title).style.fontSize = '46px';
      s.rows.forEach((r, i) => {
        const row = el('div', '', card);
        px(row, { display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 112, borderBottom: i < s.rows.length - 1 ? '2px solid rgba(24,25,67,.1)' : 'none' });
        const lab = el('div', '', row, r.label);
        px(lab, { fontSize: 40, fontWeight: '700' });
        const v = el('div', '', row, r.value);
        px(v, { fontSize: 64, fontWeight: '700', color: BLUE, minWidth: 120, textAlign: 'left' });
      });
      const txt = TX.text(L, s.text, `col ${s.textClass || 't-sub'}`, { top: top + card.offsetHeight + 56 });
      source(L, s.source, bottom(txt) + 20);
    },
    // Cross-sections of an artery, left to right in time, the plaque in pink.
    artery(L, s, ctx, light) {
      const t = TX.text(L, s.title, 'col t-hook-s', { top: s.top || 270 });
      const cy = bottom(t) + 200, xs = [840, 540, 240], occ = s.stages || [0, 0.4, 0.75];
      let g = '';
      xs.forEach((x, i) => {
        const o = occ[i], r = 88 * (1 - 0.72 * o), d = 88 * o * 0.42;
        g += `<circle cx="${x}" cy="${cy}" r="116" fill="${light ? '#E9EBF3' : 'rgba(255,254,255,.12)'}" stroke="${quiet(light, 0.22)}" stroke-width="6"/>
          <circle cx="${x}" cy="${cy}" r="88" fill="${PINK}"/>
          <circle cx="${x - d}" cy="${cy - d}" r="${r}" fill="#D3E9F5"/>`;
        if (i < 2) g += `<path d="M${x - 138} ${cy}h-24m10 -10l-10 10l10 10" fill="none" stroke="${BLUE}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
      });
      TX.svg(L, `<svg class="abs" style="left:0;top:0" width="1080" height="1350">${g}</svg>`);
      xs.forEach((x, i) => {
        const b = el('div', 'abs', L, s.labels[i]);
        px(b, { left: x - 140, width: 280, top: cy + 140, textAlign: 'center', fontSize: 36, fontWeight: '700' });
      });
      const txt = TX.text(L, s.text, 'col t-sub', { top: cy + 240 });
      source(L, s.source, bottom(txt) + 20);
    },
    // Two people, same age, same food: the one who checked and the one who didn't.
    compare(L, s, ctx, light) {
      const t = TX.text(L, s.title, 'col t-hook-s', { top: s.top || 270 });
      const top = bottom(t) + 50, h = s.h || 480;
      [[s.yes, 560, true], [s.no, 80, false]].forEach(([side, left, yes]) => {
        const c = el('div', 'abs', L);
        px(c, { left, top, width: 440, height: h, borderRadius: 40, padding: '40px 36px', boxSizing: 'border-box', background: yes ? WHITE : 'transparent', color: yes ? NAVY : WHITE, border: yes ? 'none' : '4px dashed rgba(255,254,255,.4)' });
        const head = el('div', '', c, side.title);
        px(head, { fontSize: 46, fontWeight: '700', marginBottom: 30 });
        side.items.forEach((it) => {
          const row = el('div', '', c);
          px(row, { display: 'flex', alignItems: 'center', gap: 18, marginBottom: 26, fontSize: 36, fontWeight: '500', lineHeight: '1.3', color: yes ? NAVY : 'rgba(255,254,255,.75)' });
          const mark = el('div', 'center', row, yes ? '' : '؟');
          px(mark, { width: 44, height: 44, borderRadius: '50%', flex: 'none', background: yes ? BLUE : 'rgba(255,254,255,.14)', color: WHITE, fontSize: 30, fontWeight: '700' });
          if (yes) TX.svg(mark, `<svg width="26" height="26" viewBox="0 0 26 26"><path d="M5 13l5 6l11 -12" fill="none" stroke="${WHITE}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
          el('div', '', row, it);
        });
      });
      TX.text(L, s.text, 'col t-hook-s', { top: top + h + 40 });
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
        if (P.pulse) pulse(L);
        SLIDES[s.type](L, s, ctx, light, P);
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
