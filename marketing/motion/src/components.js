/* Brand components: the fixed assets every template reuses. */
(function () {
  'use strict';
  const TX = window.TX;
  const { E, p, lerp, set, el, px } = TX;
  const C = (TX.C = {});

  /** Safe zones per canvas (Design guideline → Layouts). */
  TX.layout = (w, h) => {
    if (h / w > 1.7) {
      // Reel / Story 1080×1920: no text in the top 250 px or the bottom 350 px.
      return { fmt: '9x16', tab: { top: 250, right: 64 }, pill: { top: 284, left: 64 }, safeTop: 250, safeBottom: h - 350, stripY: h - 350 - 62 };
    }
    // Feed post / carousel slide 1080×1350: tab and text 64 px from every edge.
    return { fmt: '4x5', tab: { top: 64, right: 64 }, pill: { top: 98, left: 64 }, safeTop: 64, safeBottom: h - 64, stripY: h - 64 - 40 };
  };

  // ------------------------------------------------------------- icons
  const ICONS = {
    eye: '<path d="M4 24c5-9 12-14 20-14s15 5 20 14c-5 9-12 14-20 14S9 33 4 24z"/><circle cx="24" cy="24" r="6"/>',
    badge: '<rect x="9" y="12" width="30" height="31" rx="6"/><path d="M19 7h10v9H19z"/><circle cx="24" cy="25" r="4.5"/><path d="M16 38c1.6-4 4.5-6 8-6s6.4 2 8 6"/>',
    truefalse: '<path d="M5 25l6 6 12-14"/><path d="M29 17l13 13M42 17L29 30"/>',
    family: '<path d="M6 22L24 7l18 15"/><path d="M10 19v21h28V19"/><path d="M24 36.5s-7-4.3-7-9a3.8 3.8 0 0 1 7-2.1 3.8 3.8 0 0 1 7 2.1c0 4.7-7 9-7 9z"/>',
    chat: '<path d="M9 9h30a5 5 0 0 1 5 5v15a5 5 0 0 1-5 5H23l-9 7v-7H9a5 5 0 0 1-5-5V14a5 5 0 0 1 5-5z"/><circle class="dot" cx="16" cy="21.5" r="1.9"/><circle class="dot" cx="24" cy="21.5" r="1.9"/><circle class="dot" cx="32" cy="21.5" r="1.9"/>',
    seal: '<circle cx="24" cy="19" r="12"/><path d="M17.5 29.5L14 42l10-5 10 5-3.5-12.5"/><path d="M18.5 19.5l4 4 7-8"/>',
    clock: '<circle cx="24" cy="24" r="18"/><path d="M24 24l-6.5 4.2M24 24v14"/>',
    door: '<path d="M11 43V21a13 13 0 0 1 26 0v22z"/><path d="M24 8v35"/><circle class="dot" cx="20" cy="29" r="1.6"/><circle class="dot" cx="28" cy="29" r="1.6"/>',
    steps: '<path d="M5 39h10v-9h10v-9h10v-9h9"/><path d="M36 6l8 6-8 6"/>',
    message: '<path d="M8 8h32a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H22l-9 7v-7H8a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z"/><path d="M13 17h22M13 25h14"/>',
    heart: '<path d="M24 41S7 31 7 18.5A8.5 8.5 0 0 1 24 13a8.5 8.5 0 0 1 17 5.5C41 31 24 41 24 41z"/>',
    home: '<path d="M6 22L24 7l18 15"/><path d="M10 19v21h28V19"/><path d="M20 40V29h8v11"/>',
    phone: '<rect x="13" y="4" width="22" height="40" rx="5"/><path d="M21 38h6"/>',
    calendar: '<rect x="6" y="9" width="36" height="33" rx="5"/><path d="M6 18h36M15 5v8M33 5v8"/>',
    kit: '<rect x="6" y="15" width="36" height="25" rx="5"/><path d="M17 15v-5h14v5M24 22v11M18.5 27.5h11"/>',
    user: '<circle cx="24" cy="15" r="8"/><path d="M8 42c2-9 8.5-14 16-14s14 5 16 14"/>',
    // Home services (door-reel): what comes to the door.
    stethoscope: '<path d="M8 6h6M24 6h6"/><path d="M11 6v10a8 8 0 0 0 16 0V6"/><path d="M19 24v6a9 9 0 0 0 18 0v-5"/><circle cx="37" cy="21" r="4.5"/>',
    syringe: '<path d="M30.5 10.5l7 7-18 18-7-7z"/><path d="M16 32l-8 8M34 14l6-6M36.5 4.5l7 7M28.3 8.3l11.4 11.4"/><path d="M22 19l2.5 2.5M18 23l2.5 2.5"/>',
    tubes: '<path d="M10 6h12M13 6v28a3 3 0 0 0 6 0V6"/><path d="M26 12h12M29 12v22a3 3 0 0 0 6 0V12"/><path d="M13 22h6M29 25h6"/><path d="M7 43h34"/>',
    ultrasound: '<path d="M19 4h10v6H19z"/><path d="M24 10L3 31a30 30 0 0 0 42 0z"/><path d="M11.3 22.7a18 18 0 0 0 25.4 0"/><path d="M17 29a10 10 0 0 0 14 0"/>',
    xray: '<rect x="7" y="6" width="34" height="36" rx="6"/><path d="M19 18l10 12"/><circle cx="17.3" cy="19.4" r="2.6"/><circle cx="20.7" cy="16.6" r="2.6"/><circle cx="27.3" cy="31.4" r="2.6"/><circle cx="30.7" cy="28.6" r="2.6"/>',
    ecg: '<rect x="5" y="8" width="38" height="28" rx="5"/><path d="M9 23h8l3-7 5 13 3-6h11"/><path d="M18 43h12M24 36v7"/>',
    pulse: '<path d="M3 26h10l4 -9l6 18l5 -22l5 18l3 -5h9"/>',
    physio: '<circle cx="24" cy="8" r="4"/><path d="M24 14v14"/><path d="M13 11l11 8 11-8"/><path d="M24 28l-8 13"/><path d="M24 28l9 5-2 9"/>',
  };
  TX.icon = (name, color = '#1B9CCE', sw = 3.2) =>
    `<svg viewBox="0 0 48 48" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${(ICONS[name] || ICONS.eye).replace(/class="dot"/g, `fill="${color}" stroke="none"`)}</svg>`;

  // ------------------------------------------------------------ the tab
  /**
   * The pink tab with the white figure. render(t, at) pops it in at `at`;
   * render(t, at, hero) grows it into a centred hero (the end card).
   */
  C.tab = (stage, ctx) => {
    const L = ctx.L;
    const e = el('div', 'tab', stage);
    const img = el('img', '', e);
    img.src = ctx.brand.figure;
    img.alt = '';
    const base = { w: 124, h: 144, r: 32, cx: ctx.w - L.tab.right - 62, cy: L.tab.top + 72 };
    const geo = (g) => px(e, { left: g.cx - g.w / 2, top: g.cy - g.h / 2, width: g.w, height: g.h, borderRadius: g.r });
    geo(base);
    return {
      el: e,
      base,
      render(t, at = 0.1, hero = null) {
        if (hero && t >= hero.at) {
          const kx = p(t, hero.at, hero.dur, E.inOutCubic);
          const ky = p(t, hero.at, hero.dur, E.inOutQuint);
          const ks = p(t, hero.at, hero.dur, E.inOutCubic);
          geo({
            w: lerp(base.w, hero.w, ks), h: lerp(base.h, hero.h, ks), r: lerp(base.r, hero.r, ks),
            cx: lerp(base.cx, hero.cx, kx), cy: lerp(base.cy, hero.cy, ky),
          });
          set(e, { o: 1 });
          return;
        }
        geo(base);
        const k = p(t, at, 0.7, E.spring);
        set(e, { s: 0.5 + 0.5 * k, o: p(t, at, 0.16, E.linear) });
      },
    };
  };

  /** Rings that spread from a point when the doorbell sounds: sound made visible. */
  C.rings = (stage, count = 2) => {
    const holder = el('div', 'abs', stage);
    // Pin the empty holder to the top left: in an RTL stage its static position is
    // the right edge, which pushed every ring a full frame width off screen.
    px(holder, { left: 0, top: 0 });
    const rings = [];
    for (let i = 0; i < count * 2; i++) {
      const r = el('div', 'abs', holder);
      px(r, { border: '4px solid rgba(255,254,255,.9)', borderRadius: '50%' });
      rings.push(r);
    }
    return {
      el: holder,
      /** hits: times of each chime; (cx, cy): centre; base: starting radius. */
      render(t, hits, cx, cy, base = 80) {
        rings.forEach((r, i) => {
          const hit = hits[Math.floor(i / 2)];
          const delay = (i % 2) * 0.16;
          const k = hit == null ? 0 : TX.clamp((t - hit - delay) / 1.25);
          const rad = base + k * 300;
          px(r, { left: cx - rad, top: cy - rad, width: rad * 2, height: rad * 2 });
          const o = k <= 0 || k >= 1 ? 0 : (1 - E.outQuad(k)) * 0.55;
          set(r, { o });
        });
      },
    };
  };

  // --------------------------------------------------------- series pill
  C.pill = (stage, ctx, text, icon) => {
    const e = el('div', 'pill', stage);
    TX.svg(e, TX.icon(icon, '#1B9CCE'));
    el('span', '', e, text);
    px(e, { top: ctx.L.pill.top, left: ctx.L.pill.left });
    return {
      el: e,
      render(t, at = 0.35, out = null) {
        const k = p(t, at, 0.65, E.outQuint);
        const ko = out == null ? 0 : p(t, out, 0.35, E.inCubic);
        set(e, { x: (1 - k) * -36, o: k * (1 - ko) });
      },
    };
  };

  // --------------------------------------------------------- trust strip
  C.strip = (stage, ctx, text) => {
    const e = el('div', 'strip t-strip', stage, text);
    px(e, { top: ctx.L.stripY });
    return {
      el: e,
      render(t, at = 0.6, out = null) {
        const k = p(t, at, 0.6);
        const ko = out == null ? 0 : p(t, out, 0.3, E.inCubic);
        set(e, { o: k * (1 - ko), y: (1 - k) * 10 });
      },
    };
  };

  // ---------------------------------------------------------------- clock
  /** Analogue clock drawn in brand lines; hands are set in minutes after 12:00. */
  C.clock = (parent, size, opts = {}) => {
    const ticks = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const r1 = i % 3 === 0 ? 76 : 82, r2 = 90;
      return `<line x1="${100 + r1 * Math.sin(a)}" y1="${100 - r1 * Math.cos(a)}" x2="${100 + r2 * Math.sin(a)}" y2="${100 - r2 * Math.cos(a)}" stroke="${opts.tick || '#1B9CCE'}" stroke-width="${i % 3 === 0 ? 5 : 3}" stroke-linecap="round"/>`;
    }).join('');
    const svg = TX.svg(parent, `<svg viewBox="0 0 200 200" width="${size}" height="${size}">
      <circle cx="100" cy="100" r="97" fill="none" stroke="${opts.ring || 'rgba(255,254,255,.9)'}" stroke-width="5"/>
      ${ticks}
      <line class="hh" x1="100" y1="100" x2="100" y2="52" stroke="${opts.hands || '#FFFEFF'}" stroke-width="8" stroke-linecap="round"/>
      <line class="mh" x1="100" y1="100" x2="100" y2="26" stroke="${opts.hands || '#FFFEFF'}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="100" cy="100" r="7" fill="${opts.hands || '#FFFEFF'}"/>
    </svg>`);
    const hh = svg.querySelector('.hh'), mh = svg.querySelector('.mh');
    return {
      el: svg,
      setTime(minutes) {
        hh.setAttribute('transform', `rotate(${((minutes / 720) * 360).toFixed(3)} 100 100)`);
        mh.setAttribute('transform', `rotate(${(((minutes % 60) / 60) * 360).toFixed(3)} 100 100)`);
      },
    };
  };

  // ----------------------------------------------------------- end card
  /**
   * Last seconds of every Reel: the tab grows into the hero, the closing
   * line lands on the doorbell, then the ritual time and the trust strip.
   * Returns cue times so the audio mix rings exactly when the rings spread.
   */
  C.endCard = (stage, ctx, tab, at) => {
    const W = ctx.w, H = ctx.h, B = ctx.brand;
    const hero = { w: 292, h: 340, r: 76, cx: W / 2, cy: 700, at, dur: 1.0 };
    const rings = C.rings(stage, 2);
    stage.insertBefore(rings.el, tab.el); // rings spread from behind the tab
    const l1 = TX.text(stage, B.closingLine[0], 'col centered t-hook', { top: 930 });
    const l2 = TX.text(stage, B.closingLine[1], 'col centered t-hook', { top: 1068 });
    const ritual = TX.text(stage, B.ritual, 'col centered t-sub dim', { top: 1236 });
    const strip = C.strip(stage, ctx, B.trustStrip);
    const bell = at + 1.05; // first chime as the tab settles
    const hits = [bell, bell + ctx.bell.second];
    return {
      at,
      cues: [{ t: bell, sfx: 'doorbell' }],
      render(t) {
        if (t < at - 0.01) {
          [l1, l2, ritual].forEach((b) => b.words.forEach((w) => set(w, { o: 0 })));
          set(strip.el, { o: 0 });
          rings.render(t, [], 0, 0);
          return;
        }
        tab.render(t, 0, hero);
        rings.render(t, hits, hero.cx, hero.cy, 150);
        TX.animWords(l1.words, t, { at: hits[0] - 0.05, stagger: 0.09, dur: 0.6, y: 40 });
        TX.animWords(l2.words, t, { at: hits[1] - 0.05, stagger: 0.09, dur: 0.6, y: 40 });
        TX.animWords(ritual.words, t, { at: hits[1] + 0.55, stagger: 0.06, dur: 0.5, y: 20, blur: 4 });
        strip.render(t, hits[1] + 0.8);
      },
    };
  };
})();
