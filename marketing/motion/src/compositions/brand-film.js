/* TabeebX brand film — «منو بالباب؟», 33 s, 1080×1920.
 *
 * No faces and no names. One brand element carries the film: the pink dot of
 * the logo's head. It rings as the doorbell, waits beside the door, and comes
 * home as the head of the TabeebX figure in the closing logo.
 *   0.0–3.6   the pink dot rings: "who's at the door?"
 *   2.9–8.0   a Baghdadi door draws itself and swings open onto light: "your doctor."
 *   7.6–14.9  "and the whole clinic with him": seven services flip in, their icons draw on
 *  14.7–20.1  the clinic queue, the traffic, the waiting room: struck out and dropped
 *  19.9–25.4  "send us a message... and we reach your door" + the WhatsApp link
 *  24.9–33.0  the logo assembles on a white plate, the wordmark rises, the doorbell rings
 * In transparent mode (render --alpha) the navy field and vignette drop out so
 * the film can sit over other footage; nothing else changes. */
(function () {
  'use strict';
  const TX = window.TX;
  const { E, p, env, set, el, px, lerp, clamp } = TX;

  const T = { open: [0, 3.6], door: [2.9, 8.0], clinic: [7.6, 14.9], relief: [14.7, 20.1], ask: [19.9, 25.4], logo: [24.9, 33.0] };
  const TOTAL = 33.0;
  const LIGHT = '#FFF3DC';
  const DOT = 120; // the logo's head at its closing size, in px

  const layer = (stage) => el('div', 'layer', stage);
  function show(e, t, a, b) {
    const on = t >= a && t < b;
    e.style.display = on ? '' : 'none';
    return on;
  }
  const masked = (parent, text, cls, pos) => TX.text(parent, text, `col centered mask ${cls}`, pos);
  /** Words rise out of their line's mask, then leave upward the same way: crisp, no blur. */
  function rise(words, t, at, o = {}) {
    const y = o.y || 140;
    TX.animWords(words, t, { at, stagger: o.stagger == null ? 0.07 : o.stagger, dur: o.dur || 0.75, y, blur: 0, ease: E.outExpo, out: o.out, outDur: o.outDur || 0.4, outY: y });
  }
  /** Make an icon's strokes drawable; returns draw(k) for 0 → 1. */
  function drawable(svg) {
    const strokes = [...svg.querySelectorAll('path,circle,rect,line')].filter((n) => n.getAttribute('stroke') !== 'none');
    strokes.forEach((n) => { n.setAttribute('pathLength', '1'); n.style.strokeDasharray = '1 1'; });
    const fills = [...svg.querySelectorAll('[stroke="none"]')];
    return (k) => {
      strokes.forEach((n) => { n.style.strokeDashoffset = (1 - k).toFixed(4); });
      fills.forEach((n) => { n.style.opacity = clamp(k * 2 - 1).toFixed(3); });
      svg.style.opacity = clamp(k * 12).toFixed(3);
    };
  }
  /** Stage-space box around a block's words, measured before any transform. */
  function wordsBox(stage, ctx, block) {
    const sr = stage.getBoundingClientRect(), k = sr.width / ctx.w;
    let l = Infinity, r = -Infinity, top = Infinity, bottom = -Infinity;
    block.querySelectorAll('.word').forEach((w) => {
      const b = w.getBoundingClientRect();
      l = Math.min(l, b.left); r = Math.max(r, b.right); top = Math.min(top, b.top); bottom = Math.max(bottom, b.bottom);
    });
    return { right: (sr.right - r) / k, width: (r - l) / k, top: (top - sr.top) / k, height: (bottom - top) / k };
  }

  // ---------------------------------------------------------------- the door
  const DK = 520 / 440; // door drawn in a 440×640 box, shown at 520×756
  function buildDoor(parent) {
    const wrap = el('div', 'abs', parent);
    px(wrap, { left: 280, top: 660, width: 520, height: 756, perspective: '1800px', transformOrigin: '50% 60%' });
    const rng = TX.rng(7);
    let motes = '';
    for (let i = 0; i < 26; i++) {
      motes += `<circle class="mote" cx="${(60 + rng() * 320).toFixed(1)}" cy="600" r="${(1.6 + rng() * 3).toFixed(1)}" fill="#FFFEFF" data-y="${rng().toFixed(3)}" data-v="${(0.1 + rng() * 0.2).toFixed(3)}"/>`;
    }
    const back = TX.svg(wrap, `<svg class="abs" width="520" height="756" viewBox="0 0 440 640" style="left:0;top:0">
        <defs>
          <radialGradient id="bf-glow" cx="50%" cy="62%" r="65%">
            <stop offset="0" stop-color="#FFF9F0"/><stop offset=".5" stop-color="#FBEFFF" stop-opacity=".7"/><stop offset="1" stop-color="#FFFEFF" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="bf-spill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="${LIGHT}" stop-opacity=".5"/><stop offset="1" stop-color="${LIGHT}" stop-opacity="0"/>
          </linearGradient>
          <clipPath id="bf-arch"><path d="M36 640V222A184 184 0 0 1 404 222V640z"/></clipPath>
        </defs>
        <path class="spill" d="M36 640H404L540 800H-100z" fill="url(#bf-spill)" opacity="0"/>
        <g clip-path="url(#bf-arch)">
          <rect class="light" x="0" y="0" width="440" height="640" fill="url(#bf-glow)" opacity="0"/>
          <g class="motes">${motes}</g>
        </g>
      </svg>`);
    const studs = (x0, x1) => {
      let s = '';
      for (let y = 300; y <= 580; y += 70) for (let x = x0; x <= x1; x += 52) s += `<circle cx="${x}" cy="${y}" r="5" fill="#1B9CCE"/>`;
      return s;
    };
    const leaf = (side) => {
      const x = side === 'L' ? 36 : 220;
      const d = el('div', 'abs', wrap);
      px(d, { left: x * DK, top: 38 * DK, width: 184 * DK, height: 602 * DK, transformOrigin: side === 'L' ? '0% 50%' : '100% 50%' });
      d.innerHTML = `<svg width="${(184 * DK).toFixed(1)}" height="${(602 * DK).toFixed(1)}" viewBox="${x} 38 184 602" style="display:block;overflow:visible">
          <defs><linearGradient id="bf-leaf${side}" x1="${side === 'L' ? 0 : 1}" y1="0" x2="${side === 'L' ? 1 : 0}" y2="1">
            <stop offset="0" stop-color="#2A2E78"/><stop offset="1" stop-color="#1B1D52"/></linearGradient></defs>
          <path d="${side === 'L' ? 'M36 640V222A184 184 0 0 1 220 38V640z' : 'M404 640V222A184 184 0 0 0 220 38V640z'}" fill="url(#bf-leaf${side})" stroke="rgba(255,254,255,.85)" stroke-width="3"/>
          ${side === 'L' ? studs(70, 190) : studs(250, 370)}
          <circle cx="${side === 'L' ? 196 : 244}" cy="420" r="9" fill="#FFFEFF"/>
        </svg>`;
      return d;
    };
    const leafL = leaf('L'), leafR = leaf('R');
    const top = TX.svg(wrap, `<svg class="abs" width="520" height="756" viewBox="0 0 440 640" style="left:0;top:0">
        <defs><filter id="bf-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter></defs>
        <g class="leak">
          <line x1="220" y1="52" x2="220" y2="636" stroke="${LIGHT}" stroke-width="12" filter="url(#bf-soft)" opacity=".7"/>
          <line x1="220" y1="64" x2="220" y2="636" stroke="${LIGHT}" stroke-width="2.5"/>
          <ellipse cx="220" cy="652" rx="200" ry="20" fill="${LIGHT}" opacity=".3" filter="url(#bf-soft)"/>
          <rect x="40" y="633" width="360" height="7" rx="3.5" fill="${LIGHT}"/>
        </g>
        <path class="fr" d="M20 640V220A200 200 0 0 1 220 20" fill="none" stroke="#FFFEFF" stroke-width="9" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>
        <path class="fr" d="M420 640V220A200 200 0 0 0 220 20" fill="none" stroke="#FFFEFF" stroke-width="9" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>
        <path class="fl" d="M220 646H-70" fill="none" stroke="rgba(255,254,255,.45)" stroke-width="3" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>
        <path class="fl" d="M220 646H510" fill="none" stroke="rgba(255,254,255,.45)" stroke-width="3" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>
      </svg>`);
    return {
      wrap, leafL, leafR,
      light: back.querySelector('.light'), spill: back.querySelector('.spill'), leak: top.querySelector('.leak'),
      frames: [...top.querySelectorAll('.fr')], floors: [...top.querySelectorAll('.fl')],
      motes: [...back.querySelectorAll('.mote')].map((m) => ({ m, y: +m.dataset.y, v: +m.dataset.v })),
    };
  }

  // ---------------------------------------------------------------- the logo
  /** The logo as stacked part layers (one SVG per shape) so each can move alone. */
  function buildLogo(parent, s) {
    const L = TX.logo;
    const box = el('div', 'abs', parent);
    px(box, { width: 1080 * s, height: 1080 * s });
    const partDiv = (host, key) => {
      const d = el('div', 'abs', host);
      px(d, { left: 0, top: 0, width: 1080 * s, height: 1080 * s });
      d.innerHTML = `<svg width="${1080 * s}" height="${1080 * s}" viewBox="0 0 1080 1080" style="display:block"><path fill="${L.parts[key].color}" fill-rule="evenodd" d="${L.parts[key].d}"/></svg>`;
      return d;
    };
    const parts = {};
    ['arms', 'torso', 'legL', 'legR', 'head'].forEach((k) => { parts[k] = partDiv(box, k); });
    // Letters rise out of a line at the wordmark's baseline.
    const base = L.wordBox[1] + L.wordBox[3] + 3;
    const wordClip = el('div', 'abs', box);
    px(wordClip, { left: 0, top: 0, width: 1080 * s, height: 1080 * s, clipPath: `inset(0 0 ${(100 - (base / 1080) * 100).toFixed(2)}% 0)` });
    const letters = L.order.filter((k) => /^l\d$/.test(k)).map((k) => partDiv(wordClip, k));
    // A band of light that crosses only the figure (masked by its shapes).
    const fig = ['head', 'arms', 'torso', 'legL', 'legR'].map((k) => `<path fill="#000" fill-rule="evenodd" d="${L.parts[k].d}"/>`).join('');
    const maskUrl = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080">${fig}</svg>`)}")`;
    const shine = el('div', 'abs', box);
    px(shine, { left: 0, top: 0, width: 1080 * s, height: 1080 * s, WebkitMaskImage: maskUrl, maskImage: maskUrl, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' });
    const origin = (x, y) => `${((x / 1080) * 100).toFixed(2)}% ${((y / 1080) * 100).toFixed(2)}%`;
    parts.arms.style.transformOrigin = origin(544, 446);
    parts.legL.style.transformOrigin = origin(441, 628);
    parts.legR.style.transformOrigin = origin(647, 628);
    return { box, parts, letters, shine };
  }

  TX.register('brand-film', {
    size: [1080, 1920],
    fps: 30,
    build(stage, P, ctx) {
      const W = ctx.w;
      const field = TX.field(stage);
      const vignette = layer(stage);
      vignette.style.background = 'radial-gradient(120% 80% at 50% 45%, rgba(10,10,36,0) 55%, rgba(10,10,36,.55) 100%)';
      if (TX.alpha) vignette.style.display = 'none';

      // ------------------------------------------------ 0. the pink dot
      const s0 = layer(stage);
      const hook = masked(s0, P.hook, 't-hook', { top: 990 });

      // ------------------------------------------------ 1. the door
      const s1 = layer(stage);
      const door = buildDoor(s1);
      const bellPlate = el('div', 'abs', s1);
      px(bellPlate, { left: 836, top: 1040, width: 60, height: 100, borderRadius: 20, border: '3px solid rgba(255,254,255,.85)', background: 'rgba(34,36,106,.9)' });
      const answer = masked(s1, P.answer, 't-hook', { top: 470 });
      const rays = el('div', 'abs', stage);
      px(rays, {
        left: W / 2 - 900, top: 1113 - 900, width: 1800, height: 1800, mixBlendMode: 'screen',
        background: 'repeating-conic-gradient(from 0deg, rgba(255,243,220,.15) 0deg 4deg, rgba(255,243,220,0) 4deg 13deg)',
        WebkitMaskImage: 'radial-gradient(closest-side, #000 8%, rgba(0,0,0,.5) 38%, transparent 72%)',
        maskImage: 'radial-gradient(closest-side, #000 8%, rgba(0,0,0,.5) 38%, transparent 72%)',
      });

      // ------------------------------------------------ 2. the whole clinic
      const s2 = layer(stage);
      const glow = el('div', 'layer', s2);
      glow.style.background = 'radial-gradient(45% 30% at 50% 55%, rgba(255,243,220,.26), rgba(255,243,220,0) 70%)';
      const title = masked(s2, P.title, 't-hook-s', { top: 430 });
      const CW = 445, CH = 170, GAP = 24, n = P.services.length;
      const cards = P.services.map((sv, i) => {
        const alone = i === n - 1 && n % 2 === 1;
        const left = alone ? (W - CW) / 2 : i % 2 === 0 ? W - 80 - CW : 80; // reading order: right, then left
        const top = 600 + Math.floor(i / 2) * (CH + GAP);
        const holder = el('div', 'abs', s2);
        px(holder, { left, top, width: CW, height: CH, perspective: '1200px' });
        const c = el('div', 'layer', holder);
        px(c, {
          borderRadius: 40, padding: '0 26px', display: 'flex', alignItems: 'center', gap: 20, transformOrigin: '50% 0%',
          background: 'linear-gradient(160deg, rgba(255,254,255,.16), rgba(255,254,255,.05))',
          border: '1.5px solid rgba(255,254,255,.22)', boxShadow: '0 30px 60px -28px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.18)',
        });
        const ic = el('div', 'center', c);
        px(ic, { width: 94, height: 94, borderRadius: 26, background: 'rgba(27,156,206,.16)', flex: 'none' });
        const svg = TX.svg(ic, TX.icon(sv.icon, '#1B9CCE', 3));
        svg.setAttribute('width', 58);
        const lb = el('div', 'mask', c);
        px(lb, { fontWeight: '700', fontSize: 46, lineHeight: '1.2', whiteSpace: 'nowrap' }); // strings: px() would add 'px' to numbers
        return { c, draw: drawable(svg), words: TX.words(lb, sv.text) };
      });
      const where = masked(s2, P.where, 't-sub dim', { top: 600 + Math.ceil(n / 2) * (CH + GAP) + 26 });

      // ------------------------------------------------ 3. what stays behind
      const s3 = layer(stage);
      const pains = P.pains.map((txt, i) => masked(s3, txt, 't-hook-s', { top: 600 + i * 150 }));
      const strikes = pains.map(() => {
        const s = el('div', 'abs', s3);
        px(s, { height: 10, borderRadius: 5, background: '#1B9CCE' });
        return s;
      });
      const relief = masked(s3, P.relief, 't-hook', { top: 1040 });

      // ------------------------------------------------ 4. one message
      const s4 = layer(stage);
      s4.style.transformOrigin = '540px 880px';
      const ask = masked(s4, P.ask, 't-hook-s', { top: 440 });
      const bubble = el('div', 'abs center', s4);
      px(bubble, { left: (W - 460) / 2, top: 600, width: 460, height: 230, borderRadius: 76, background: '#FFFEFF', gap: 26, boxShadow: '0 30px 70px -30px rgba(0,0,0,.55)' });
      const btail = el('div', 'abs', bubble);
      px(btail, { width: 64, height: 64, right: 86, bottom: -22, transform: 'rotate(45deg)', borderRadius: 10, background: '#FFFEFF' });
      const typing = [0, 1, 2].map(() => {
        const d = el('div', '', bubble);
        px(d, { width: 30, height: 30, borderRadius: '50%', background: '#181943', position: 'relative' });
        return d;
      });
      // The message's route to the door: dots laid along the same curve the bubble flies.
      const route = TX.svg(s4, `<svg class="abs" width="1080" height="1920" viewBox="0 0 1080 1920" style="left:0;top:0">
          <path d="M540 715 C 330 820, 330 960, 540 1030" fill="none" stroke="none"/>
        </svg>`);
      const routePath = route.querySelector('path'), routeLen = routePath.getTotalLength();
      const routeDots = [];
      for (let d = 0; d <= routeLen; d += 20) {
        const pt = routePath.getPointAtLength(d);
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', pt.x.toFixed(1)); c.setAttribute('cy', pt.y.toFixed(1));
        c.setAttribute('r', '3.4'); c.setAttribute('fill', 'rgba(255,254,255,.6)');
        route.appendChild(c);
        routeDots.push({ c, f: d / routeLen });
      }
      const home = el('div', 'abs', s4);
      px(home, { left: (W - 180) / 2, top: 940, width: 180, height: 180 });
      const homeSvg = TX.svg(home, TX.icon('home', '#FFFEFF', 2.6));
      homeSvg.setAttribute('width', 180);
      const drawHome = drawable(homeSvg);
      const knockRings = TX.C.rings(s4, 1);
      const arrive = masked(s4, P.arrive, 't-hook-s', { top: 1180 });
      const chipRow = el('div', 'abs center', s4);
      px(chipRow, { left: 0, right: 0, top: 1320, height: 104 });
      const chip = el('div', 'center', chipRow);
      px(chip, { height: 104, padding: '0 44px 6px 40px', borderRadius: 999, background: '#FFFEFF', color: '#181943', gap: 18, fontWeight: '700', fontSize: 42, whiteSpace: 'nowrap', boxShadow: '0 24px 50px -24px rgba(0,0,0,.5)' });
      TX.svg(chip, TX.icon('chat', '#1B9CCE', 3.2)).setAttribute('width', 54);
      el('span', '', chip, P.cta);

      // ------------------------------------------------ 5. the logo
      const s5 = layer(stage);
      s5.style.transformOrigin = '540px 900px';
      const logoRings = TX.C.rings(s5, 2);
      const PL = { left: 200, top: 520, w: 680, h: 700 };
      const plateHold = el('div', 'abs', s5);
      px(plateHold, { left: PL.left, top: PL.top, width: PL.w, height: PL.h, perspective: '1600px' });
      const plate = el('div', 'layer', plateHold);
      px(plate, { borderRadius: 88, background: '#FFFEFF', overflow: 'hidden', boxShadow: '0 60px 120px -40px rgba(0,0,0,.6), 0 18px 40px -20px rgba(0,0,0,.35)' });
      const LS = 1.12;
      const logo = buildLogo(plate, LS);
      const lgLeft = PL.w / 2 - 540 * LS, lgTop = PL.h / 2 - 521.6 * LS;
      px(logo.box, { left: lgLeft, top: lgTop });
      const H0 = TX.logo.parts.head.bbox;
      const headAt = { x: PL.left + lgLeft + (H0[0] + H0[2] / 2) * LS, y: PL.top + lgTop + (H0[1] + H0[3] / 2) * LS };
      const tagline = masked(s5, P.tagline, 't-hook-s', { top: 1290 });
      tagline.el.style.fontSize = '68px';
      const ritual = masked(s5, ctx.brand.ritual, 't-sub dim', { top: 1395 });
      const strip = TX.C.strip(stage, ctx, ctx.brand.trustStrip);

      // ------------------------------------------------ the dot, the flash
      const openRings = TX.C.rings(stage, 2);
      const dot = el('div', 'abs', stage);
      px(dot, { width: DOT, height: DOT, borderRadius: '50%', background: '#EE396B', boxShadow: '0 0 60px rgba(238,57,107,.35)' });
      const flash = el('div', 'layer', stage);
      flash.style.background = 'radial-gradient(75% 55% at 50% 58%, rgba(255,248,238,.95), rgba(255,248,238,.4) 45%, rgba(255,254,255,0) 82%)';

      // Measure the strike lines while nothing is transformed.
      const strikeGeo = pains.map((b) => wordsBox(stage, ctx, b.el));

      const hits0 = [0.45, 0.45 + ctx.bell.second];
      const lock = 28.15;
      const hitsL = [lock, lock + ctx.bell.second];
      const cardAt = (i) => 8.1 + i * 0.2;
      const strikeAt = (i) => 16.35 + i * 0.35;
      const cues = [
        { t: 0.05, sfx: 'thump' }, { t: hits0[0], sfx: 'doorbell' },
        { t: 2.75, sfx: 'whoosh', gain: 0.6 }, { t: 3.1, sfx: 'shimmer', gain: 0.6 },
        { t: 4.55, sfx: 'tick', gain: 2.4 }, { t: 4.6, sfx: 'whoosh', gain: 0.9 }, { t: 5.15, sfx: 'pop' },
        { t: 6.8, sfx: 'whoosh' }, { t: 7.7, sfx: 'blip', gain: 0.7 },
        ...cards.map((_, i) => ({ t: cardAt(i) + 0.05, sfx: 'pop', gain: 0.55 + 0.1 * (i % 3) })),
        { t: 10.2, sfx: 'blip', gain: 0.7 }, { t: 14.15, sfx: 'whoosh', gain: 0.8 },
        ...pains.map((_, i) => ({ t: strikeAt(i), sfx: 'tick', gain: 2.2 })),
        { t: 17.45, sfx: 'whoosh', gain: 0.5 }, { t: 17.9, sfx: 'pop' }, { t: 17.95, sfx: 'shimmer', gain: 0.6 },
        { t: 19.6, sfx: 'whoosh', gain: 0.8 }, { t: 20.35, sfx: 'pop', gain: 0.8 },
        { t: 21.55, sfx: 'blip' }, { t: 21.6, sfx: 'whoosh', gain: 0.6 },
        { t: 22.3, sfx: 'tick', gain: 2.4 }, { t: 22.48, sfx: 'tick', gain: 2.4 }, { t: 23.25, sfx: 'pop' },
        { t: 23.35, sfx: 'riser' }, { t: 24.95, sfx: 'thump' }, { t: 25.5, sfx: 'whoosh', gain: 0.7 },
        { t: 26.2, sfx: 'pop', gain: 0.5 }, { t: 26.45, sfx: 'pop', gain: 0.5 }, { t: 26.8, sfx: 'pop', gain: 0.5 },
        { t: 27.35, sfx: 'shimmer' }, { t: lock, sfx: 'doorbell' }, { t: lock, sfx: 'impact' },
      ];
      for (let s = 20.6; s < 21.45; s += 0.13) cues.push({ t: s, sfx: 'tick', gain: 0.6 });

      return {
        duration: TOTAL,
        cues,
        bed: { from: 0.8, to: 31.8, gain: 0.8 },
        cover: 29.6,
        render(t) {
          field.render(t);

          // 0 — the pink dot rings: "who's at the door?"
          if (show(s0, t, T.open[0], T.open[1])) rise(hook.words, t, 1.0, { stagger: 0.12, out: 2.6 });
          set(openRings.el, { o: t < 3 ? 1 : 0 });
          openRings.render(t, hits0, 540, 830, DOT / 2);

          // 1 — the door draws itself, opens onto light: "your doctor."
          const ko = p(t, 4.6, 1.1, E.inOutCubic);
          const kfly = p(t, 6.8, 0.8, E.inExpo);
          if (show(s1, t, T.door[0], T.door[1])) {
            const kf = p(t, 3.0, 1.0, E.inOutCubic);
            door.frames.forEach((f) => f.setAttribute('stroke-dashoffset', (1 - kf).toFixed(4)));
            door.floors.forEach((f) => f.setAttribute('stroke-dashoffset', (1 - p(t, 3.3, 0.9, E.outCubic)).toFixed(4)));
            const kl = p(t, 3.55, 0.55, E.outCubic);
            const leafT = (side) => `rotateY(${(side * 78 * ko).toFixed(2)}deg)`;
            door.leafL.style.transform = leafT(1);
            door.leafR.style.transform = leafT(-1);
            [door.leafL, door.leafR].forEach((l) => { l.style.opacity = kl.toFixed(3); l.style.filter = `brightness(${(1 - 0.45 * ko).toFixed(3)})`; });
            door.light.setAttribute('opacity', (0.08 + 0.92 * ko).toFixed(3));
            door.spill.setAttribute('opacity', ko.toFixed(3));
            door.leak.setAttribute('opacity', ((0.75 + 0.25 * Math.sin(t * 4.2)) * p(t, 3.7, 0.6) * (1 - p(t, 4.6, 0.35))).toFixed(3));
            door.motes.forEach((d) => {
              const u = (d.y + t * d.v) % 1;
              d.m.setAttribute('cy', (630 - u * 560).toFixed(1));
              d.m.setAttribute('opacity', (ko * Math.sin(Math.PI * u) * 0.9).toFixed(3));
            });
            set(door.wrap, { s: 1 + 3.6 * kfly, y: kfly * 170, o: 1 - p(t, 7.25, 0.3, E.linear) });
            set(bellPlate, { o: p(t, 3.5, 0.4) * (1 - p(t, 6.5, 0.3)), s: 0.9 + 0.1 * p(t, 3.5, 0.4, E.outBack) });
            rise(answer.words, t, 5.15, { out: 6.65 });
          }
          set(rays, { o: ko * (1 - p(t, 8.3, 1.8, E.inOutSine)) * 0.9, r: t * 5, s: 0.9 + 0.3 * kfly });
          set(flash, { o: env(t, 7.2, 0.3, 7.55, 0.7) * (TX.alpha ? 0.7 : 1) });

          // The dot: doorbell, then the bell beside the door, then (after the film) the logo's head.
          {
            let x = 540, y = 830, size = DOT, o = 0;
            if (t < 6.9) {
              const kin = p(t, 0.0, 0.5, E.outBack);
              const press = Math.max(0, 1 - Math.abs(t - hits0[0]) / 0.12) + Math.max(0, 1 - Math.abs(t - hits0[1]) / 0.12);
              const km = p(t, 2.75, 0.8, E.inOutCubic);
              x = lerp(540, 866, km); y = lerp(830, 1090, km) - Math.sin(Math.PI * km) * 90;
              size = lerp(DOT, 34, km) * kin * (1 - 0.1 * Math.min(1, press));
              o = p(t, 0, 0.12, E.linear) * (1 - p(t, 6.5, 0.3, E.linear));
            } else if (t >= 24.9) {
              const kin = p(t, 24.95, 0.5, E.outBack);
              const km = p(t, 25.5, 0.7, E.inOutCubic);
              x = lerp(540, headAt.x, km); y = lerp(880, headAt.y, km);
              size = DOT * kin;
              o = t < 26.2 ? 1 : 0; // the logo's own head takes over from here
            }
            px(dot, { left: x - size / 2, top: y - size / 2, width: Math.max(0, size), height: Math.max(0, size) });
            set(dot, { o });
          }

          // 2 — "and the whole clinic with him": cards flip in, icons draw on
          if (show(s2, t, T.clinic[0], T.clinic[1])) {
            set(glow, { o: env(t, 7.5, 0.4, 9.5, 3.0) });
            rise(title.words, t, 7.7, { stagger: 0.09, out: 14.2 });
            cards.forEach((cd, i) => {
              const a = cardAt(i);
              const k = p(t, a, 0.9, E.outExpo);
              const kx = p(t, 14.1 + (n - 1 - i) * 0.04, 0.4, E.inCubic);
              cd.c.style.transform = `rotateX(${((1 - k) * -95 + kx * 90).toFixed(2)}deg) translateY(${((1 - k) * 40).toFixed(1)}px)`;
              cd.c.style.opacity = (p(t, a, 0.25, E.linear) * (1 - kx)).toFixed(3);
              cd.draw(p(t, a + 0.25, 0.8, E.inOutCubic));
              rise(cd.words, t, a + 0.3, { y: 70, stagger: 0.06, dur: 0.6 });
            });
            rise(where.words, t, 10.2, { y: 80, stagger: 0.08, out: 14.2 });
            set(s2, { s: 1 + 0.025 * p(t, 7.6, 7.3, E.linear) });
          }

          // 3 — the queue, the traffic, the waiting room: struck, then dropped
          if (show(s3, t, T.relief[0], T.relief[1])) {
            pains.forEach((b, i) => {
              rise(b.words, t, 14.9 + i * 0.45, { stagger: 0.08 });
              const ks = p(t, strikeAt(i), 0.35, E.inOutCubic);
              const g = strikeGeo[i];
              px(strikes[i], { right: g.right - 18, top: g.top + g.height * 0.52 - 5, width: (g.width + 36) * ks });
              const kd = p(t, 17.45 + i * 0.08, 0.55, E.inCubic);
              const fall = `translate(0px, ${(kd * 160).toFixed(1)}px) rotate(${((i - 1) * 5 * kd).toFixed(2)}deg)`;
              b.el.style.transform = fall;
              b.el.style.opacity = ((1 - 0.5 * p(t, strikeAt(i) + 0.3, 0.3)) * (1 - kd)).toFixed(3);
              strikes[i].style.transform = fall;
              strikes[i].style.transformOrigin = '100% 50%';
              strikes[i].style.opacity = (ks > 0 ? 1 - kd : 0).toFixed(3);
            });
            rise(relief.words, t, 17.9, { stagger: 0.12, dur: 0.8, out: 19.55 });
          }

          // 4 — send a message, we reach your door; then it all folds into the dot
          if (show(s4, t, T.ask[0], T.ask[1])) {
            rise(ask.words, t, 20.05, { out: 24.4 });
            TX.animDots(ask.el, t, 20.5);
            const kb = p(t, 20.35, 0.7, E.spring);
            const u = p(t, 21.55, 0.75, E.inOutCubic);
            const bx = (1 - u) ** 3 * 540 + 3 * (1 - u) ** 2 * u * 330 + 3 * (1 - u) * u * u * 330 + u ** 3 * 540;
            const by = (1 - u) ** 3 * 715 + 3 * (1 - u) ** 2 * u * 820 + 3 * (1 - u) * u * u * 960 + u ** 3 * 1030;
            set(bubble, { x: bx - 540, y: by - 715, s: (0.55 + 0.45 * kb) * lerp(1, 0.14, u), o: p(t, 20.35, 0.15, E.linear) * (1 - p(t, 22.15, 0.15, E.linear)) });
            typing.forEach((d, i) => {
              const on = t > 20.55 && t < 21.55;
              const bounce = on ? Math.max(0, Math.sin((t - 20.55) * 9 - i * 0.9)) : 0;
              d.style.transform = `translateY(${(-bounce * 16).toFixed(2)}px)`;
              d.style.opacity = (0.45 + 0.55 * bounce).toFixed(3);
            });
            const kr = p(t, 21.55, 0.75, E.inOutCubic);
            const kgone = 1 - p(t, 22.6, 0.4);
            routeDots.forEach((d) => d.c.setAttribute('opacity', (kr > 0 && d.f <= kr ? kgone : 0).toFixed(3)));
            drawHome(p(t, 21.2, 0.8, E.inOutCubic));
            const knock = t > 22.3 && t < 22.68 ? Math.sin((t - 22.3) * 58) * 7 * (1 - (t - 22.3) / 0.38) : 0;
            set(home, { x: knock });
            homeSvg.style.filter = `drop-shadow(0 0 ${(26 * env(t, 22.3, 0.15, 22.8, 1.0)).toFixed(1)}px rgba(255,243,220,.9))`;
            knockRings.render(t, [22.3], W / 2, 1030, 100);
            rise(arrive.words, t, 22.5, { stagger: 0.1, out: 24.4 });
            const kc = p(t, 23.25, 0.7, E.spring);
            set(chip, { s: 0.7 + 0.3 * kc, o: p(t, 23.25, 0.15, E.linear) * (1 - p(t, 24.4, 0.3)) });
            const kc2 = p(t, 24.6, 0.55, E.inExpo);
            set(s4, { s: lerp(1, 0.2, kc2), o: 1 - kc2 });
          }

          // 5 — the logo assembles on a white plate; the doorbell rings as it locks
          if (show(s5, t, T.logo[0], T.logo[1] + 1)) {
            const kp = p(t, 25.45, 0.85, E.outExpo);
            plate.style.transform = `translateY(${((1 - kp) * 180).toFixed(1)}px) rotateX(${((1 - kp) * 70).toFixed(2)}deg) scale(${(0.9 + 0.1 * kp + 0.018 * Math.sin(Math.PI * p(t, lock, 0.5, E.linear))).toFixed(4)})`;
            plate.style.opacity = p(t, 25.45, 0.3, E.linear).toFixed(3);
            const LP = logo.parts;
            set(LP.head, { o: t >= 26.2 ? 1 : 0 });
            const ka = p(t, 26.2, 0.7, E.outExpo);
            set(LP.arms, { sx: lerp(0.15, 1, ka), sy: lerp(0.6, 1, ka), y: (1 - ka) * 18, o: p(t, 26.2, 0.12, E.linear) });
            const kx = p(t, 26.45, 0.45, E.outExpo), ky = p(t, 26.6, 0.55, E.outExpo);
            LP.torso.style.clipPath = `inset(0% ${(49.6 * (1 - kx)).toFixed(2)}% ${lerp(55, 41.5, ky).toFixed(2)}% ${(50.4 * (1 - kx)).toFixed(2)}%)`;
            set(LP.torso, { o: kx > 0 ? 1 : 0 });
            [LP.legL, LP.legR].forEach((lg, i) => {
              const kl = p(t, 26.8 + i * 0.08, 0.55, E.outExpo);
              set(lg, { sy: kl, o: kl > 0 ? 1 : 0 });
            });
            const sp = lerp(-25, 125, p(t, 27.35, 0.8, E.inOutCubic));
            logo.shine.style.background = `linear-gradient(115deg, rgba(255,255,255,0) ${(sp - 14).toFixed(1)}%, rgba(255,255,255,.75) ${sp.toFixed(1)}%, rgba(255,255,255,0) ${(sp + 14).toFixed(1)}%)`;
            logo.letters.forEach((lt, i) => {
              const kw = p(t, 27.45 + i * 0.05, 0.7, E.outExpo);
              set(lt, { y: (1 - kw) * 90 * LS, o: kw > 0 ? 1 : 0 });
            });
            logoRings.render(t, hitsL, 540, 870, 330);
            rise(tagline.words, t, 28.6, { stagger: 0.1, dur: 0.8 });
            rise(ritual.words, t, 29.2, { y: 80, stagger: 0.08 });
            set(s5, { s: 1 + 0.03 * p(t, 28.2, 4.8, E.inOutSine) });
          }
          strip.render(t, 29.5);
        },
      };
    },
  });
})();
