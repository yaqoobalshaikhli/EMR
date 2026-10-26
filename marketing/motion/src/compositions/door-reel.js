/* «منو بالباب؟» — a Reel with no faces and no names, 28.6 s.
 *
 *   0.0–2.8   the doorbell rings; a closed door, light under it: "who's at the door?"
 *   2.8–5.3   the door opens onto light: "your doctor."
 *   5.3–12.6  "and the whole clinic with him": the home services fly out of the light
 *  12.6–18.5  what stays behind: the clinic queue, the traffic, the waiting room
 *  18.5–24.9  "send us a message... and we reach your door" + the WhatsApp link
 *  24.9–28.6  end card + doorbell
 * One pink element per frame besides the tab: the hook, "كلها", "راحة بال",
 * "لبابك". Nothing in it identifies a person, so it can run before any doctor
 * is filmed. */
(function () {
  'use strict';
  const TX = window.TX;
  const { E, p, env, set, el, px, lerp } = TX;

  const T = { door: [0, 5.4], clinic: [5.2, 12.7], relief: [12.6, 18.6], ask: [18.5, 25.0], end: 24.9 };
  const TOTAL = T.end + 3.7;
  const LIGHT = '#FFF3DC';

  const layer = (stage) => el('div', 'layer', stage);
  function show(e, t, a, b) {
    const on = t >= a && t < b;
    e.style.display = on ? '' : 'none';
    return on;
  }

  /** Stage-space box around a text block's words, measured once before any transform. */
  function wordsBox(stage, ctx, block) {
    const sr = stage.getBoundingClientRect(), k = sr.width / ctx.w;
    let l = Infinity, r = -Infinity, top = Infinity, bottom = -Infinity;
    block.querySelectorAll('.word').forEach((w) => {
      const b = w.getBoundingClientRect();
      l = Math.min(l, b.left); r = Math.max(r, b.right);
      top = Math.min(top, b.top); bottom = Math.max(bottom, b.bottom);
    });
    return { right: (sr.right - r) / k, width: (r - l) / k, top: (top - sr.top) / k, height: (bottom - top) / k };
  }

  /** The Baghdadi double door from the launch Reel, with light leaking round it. */
  function doorSvg(parent) {
    const studs = (x0, x1) => {
      let s = '';
      for (let y = 300; y <= 580; y += 70) for (let x = x0; x <= x1; x += 52) s += `<circle cx="${x}" cy="${y}" r="5" fill="#1B9CCE"/>`;
      return s;
    };
    const rng = TX.rng(7);
    let motes = '';
    for (let i = 0; i < 22; i++) {
      motes += `<circle class="mote" cx="${(60 + rng() * 320).toFixed(1)}" cy="600" r="${(1.8 + rng() * 3.2).toFixed(1)}" fill="#FFFEFF" data-y="${rng().toFixed(3)}" data-v="${(0.12 + rng() * 0.22).toFixed(3)}"/>`;
    }
    return TX.svg(parent, `<svg width="520" height="756" viewBox="0 0 440 640">
        <defs>
          <radialGradient id="dr-glow" cx="50%" cy="62%" r="62%">
            <stop offset="0" stop-color="#FFF7EC"/>
            <stop offset=".55" stop-color="#F6EEFF" stop-opacity=".6"/>
            <stop offset="1" stop-color="#FFFEFF" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="dr-spill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="${LIGHT}" stop-opacity=".55"/>
            <stop offset="1" stop-color="${LIGHT}" stop-opacity="0"/>
          </linearGradient>
          <clipPath id="dr-arch"><path d="M36 640V222A184 184 0 0 1 404 222V640z"/></clipPath>
          <filter id="dr-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>
        </defs>
        <path class="spill" d="M36 640H404L520 760H-80z" fill="url(#dr-spill)" opacity="0"/>
        <g clip-path="url(#dr-arch)">
          <rect class="light" x="0" y="0" width="440" height="640" fill="url(#dr-glow)" opacity="0"/>
          <g class="motes">${motes}</g>
        </g>
        <g class="leafL">
          <path d="M36 640V222A184 184 0 0 1 220 38V640z" fill="#22246A" stroke="#FFFEFF" stroke-width="4"/>
          ${studs(70, 190)}
          <circle cx="196" cy="420" r="9" fill="#FFFEFF"/>
        </g>
        <g class="leafR">
          <path d="M404 640V222A184 184 0 0 0 220 38V640z" fill="#22246A" stroke="#FFFEFF" stroke-width="4"/>
          ${studs(250, 370)}
          <circle cx="244" cy="420" r="9" fill="#FFFEFF"/>
        </g>
        <g class="leak">
          <line x1="220" y1="52" x2="220" y2="636" stroke="${LIGHT}" stroke-width="12" filter="url(#dr-soft)" opacity=".7"/>
          <line x1="220" y1="64" x2="220" y2="636" stroke="${LIGHT}" stroke-width="2.5"/>
          <ellipse cx="220" cy="652" rx="200" ry="20" fill="${LIGHT}" opacity=".3" filter="url(#dr-soft)"/>
          <rect x="40" y="633" width="360" height="7" rx="3.5" fill="${LIGHT}"/>
          <rect x="158" y="630" width="46" height="13" rx="5" fill="#111233"/>
          <rect x="236" y="630" width="46" height="13" rx="5" fill="#111233"/>
        </g>
        <path d="M20 640V220A200 200 0 0 1 420 220V640" fill="none" stroke="#FFFEFF" stroke-width="9" stroke-linecap="round"/>
      </svg>`);
  }

  TX.register('door-reel', {
    size: [1080, 1920],
    fps: 30,
    build(stage, P, ctx) {
      const W = ctx.w;
      const field = TX.field(stage);

      // --------------------------------------- 1–2. the door (0–5.4)
      const s1 = layer(stage);
      const doorWrap = el('div', 'abs', s1);
      px(doorWrap, { left: (W - 520) / 2, top: 660, width: 520, height: 756, transformOrigin: '50% 62%' });
      const door = doorSvg(doorWrap);
      const leafL = door.querySelector('.leafL'), leafR = door.querySelector('.leafR');
      const light = door.querySelector('.light'), leak = door.querySelector('.leak'), spill = door.querySelector('.spill');
      const motes = [...door.querySelectorAll('.mote')].map((m) => ({ m, y: +m.dataset.y, v: +m.dataset.v }));
      const bell = el('div', 'abs', s1);
      px(bell, { left: 836, top: 1012, width: 70, height: 110 });
      const bellBtn = TX.svg(bell, `<svg width="70" height="110" viewBox="0 0 70 110">
          <rect x="4" y="4" width="62" height="102" rx="18" fill="#22246A" stroke="#FFFEFF" stroke-width="4"/>
          <circle class="btn" cx="35" cy="55" r="16" fill="#1B9CCE"/>
        </svg>`).querySelector('.btn');
      const hook = TX.text(s1, P.hook, 'col centered t-hook', { top: 440 });
      const answer = TX.text(s1, P.answer, 'col centered t-hook', { top: 440 });

      // Light rays out of the open door, and the flash as we walk into it.
      const rays = el('div', 'abs', stage);
      px(rays, {
        left: W / 2 - 900, top: 1130 - 900, width: 1800, height: 1800, mixBlendMode: 'screen',
        background: 'repeating-conic-gradient(from 0deg, rgba(255,243,220,.16) 0deg 4deg, rgba(255,243,220,0) 4deg 13deg)',
        WebkitMaskImage: 'radial-gradient(closest-side, #000 8%, rgba(0,0,0,.5) 38%, transparent 72%)',
        maskImage: 'radial-gradient(closest-side, #000 8%, rgba(0,0,0,.5) 38%, transparent 72%)',
      });
      const flash = el('div', 'layer', stage);
      flash.style.background = 'radial-gradient(70% 50% at 50% 55%, rgba(255,247,236,.85), rgba(255,247,236,.35) 45%, rgba(255,254,255,0) 80%)';

      // ------------------------------ 3. the whole clinic (5.2–12.7)
      const s3 = layer(stage);
      const glow = el('div', 'layer', s3);
      glow.style.background = 'radial-gradient(45% 30% at 50% 54%, rgba(255,243,220,.28), rgba(255,243,220,0) 70%)';
      const title = TX.text(s3, P.title, 'col centered t-hook-s', { top: 430 });
      const CW = 445, CH = 170, GAP = 24, n = P.services.length;
      const cards = P.services.map((sv, i) => {
        const c = el('div', 'abs', s3);
        const alone = i === n - 1 && n % 2 === 1;
        const left = alone ? (W - CW) / 2 : i % 2 === 0 ? W - 80 - CW : 80; // reading order: right, then left
        const top = 600 + Math.floor(i / 2) * (CH + GAP);
        px(c, {
          left, top, width: CW, height: CH, borderRadius: 40, padding: '0 26px', display: 'flex', alignItems: 'center', gap: 20,
          background: 'rgba(255,254,255,.08)', border: '2px solid rgba(255,254,255,.16)', boxShadow: '0 30px 60px -30px rgba(0,0,0,.5)',
        });
        const ic = el('div', 'center', c);
        px(ic, { width: 94, height: 94, borderRadius: 26, background: 'rgba(27,156,206,.16)', flex: 'none' });
        TX.svg(ic, TX.icon(sv.icon, '#1B9CCE', 3)).setAttribute('width', 58);
        const lb = el('div', '', c);
        px(lb, { fontWeight: 700, fontSize: 46, lineHeight: 1.2, whiteSpace: 'nowrap' });
        TX.words(lb, sv.text);
        return { c, dx: W / 2 - (left + CW / 2), dy: 1060 - (top + CH / 2), spin: i % 2 ? 9 : -9 };
      });
      const where = TX.text(s3, P.where, 'col centered t-sub dim', { top: 600 + Math.ceil(n / 2) * (CH + GAP) + 26 });

      // ------------------------- 4. what stays behind (12.6–18.6)
      const s4 = layer(stage);
      const pains = P.pains.map((txt, i) => TX.text(s4, txt, 'col centered t-hook-s', { top: 580 + i * 150 }));
      const strikes = pains.map(() => {
        const s = el('div', 'abs', s4);
        px(s, { height: 12, borderRadius: 6, background: '#FFFEFF', transformOrigin: '100% 50%' });
        return s;
      });
      const relief = TX.text(s4, P.relief, 'col centered t-hook', { top: 1090 });

      // ---------------------------------- 5. one message (18.5–25.0)
      const s5 = layer(stage);
      const ask = TX.text(s5, P.ask, 'col centered t-hook-s', { top: 440 });
      const bubble = el('div', 'abs center', s5);
      px(bubble, { left: (W - 460) / 2, top: 610, width: 460, height: 240, borderRadius: 72, background: '#FFFEFF', gap: 26 });
      const btail = el('div', 'abs', bubble);
      px(btail, { width: 64, height: 64, right: 86, bottom: -22, transform: 'rotate(45deg)', borderRadius: 10, background: '#FFFEFF' });
      const typing = [0, 1, 2].map(() => {
        const d = el('div', '', bubble);
        px(d, { width: 30, height: 30, borderRadius: '50%', background: '#181943', position: 'relative' });
        return d;
      });
      const doorIcon = el('div', 'abs', s5);
      px(doorIcon, { left: (W - 180) / 2, top: 930, width: 180, height: 180 });
      const doorIconSvg = TX.svg(doorIcon, TX.icon('door', '#FFFEFF', 3));
      doorIconSvg.setAttribute('width', 180);
      const knockRings = TX.C.rings(s5, 1);
      const arrive = TX.text(s5, P.arrive, 'col centered t-hook-s', { top: 1150 });
      const chipRow = el('div', 'abs center', s5);
      px(chipRow, { left: 0, right: 0, top: 1310, height: 104 });
      const chip = el('div', 'center', chipRow);
      px(chip, { height: 104, padding: '0 44px 6px 40px', borderRadius: 999, background: '#FFFEFF', color: '#181943', gap: 18, fontWeight: 700, fontSize: 42, whiteSpace: 'nowrap' });
      TX.svg(chip, TX.icon('chat', '#1B9CCE', 3.2)).setAttribute('width', 54);
      el('span', '', chip, P.cta);

      // --------------------------------------------------- shared chrome
      const bellRings = TX.C.rings(stage, 2);
      const tab = TX.C.tab(stage, ctx);
      const pill = TX.C.pill(stage, ctx, P.series, TX.seriesIcon(P.series));
      const end = TX.C.endCard(stage, ctx, tab, T.end);
      // Strike lines run across the words, right to left; measure while nothing is transformed.
      const strikeGeo = pains.map((b) => wordsBox(stage, ctx, b.el));

      const bell0 = 0.05;
      const hits0 = [bell0, bell0 + ctx.bell.second];
      const cardAt = (i) => 6.0 + i * 0.48;
      const strikeAt = (i) => 13.35 + i * 0.9;
      const cues = [
        { t: bell0, sfx: 'doorbell' },
        { t: 2.72, sfx: 'tick', gain: 2.4 }, { t: 2.78, sfx: 'whoosh', gain: 0.9 },
        { t: 3.4, sfx: 'pop' }, { t: 4.72, sfx: 'whoosh' },
        ...cards.map((_, i) => ({ t: cardAt(i) + 0.06, sfx: 'pop', gain: 0.7 + 0.1 * (i % 3) })),
        { t: 9.75, sfx: 'blip', gain: 0.8 }, { t: 12.1, sfx: 'whoosh', gain: 0.8 },
        ...pains.map((_, i) => ({ t: strikeAt(i), sfx: 'tick', gain: 2.2 })),
        { t: 15.9, sfx: 'pop' }, { t: 15.95, sfx: 'blip', gain: 0.6 },
        { t: 18.2, sfx: 'whoosh', gain: 0.8 }, { t: 18.95, sfx: 'pop', gain: 0.8 },
        { t: 20.5, sfx: 'blip' }, { t: 20.55, sfx: 'whoosh', gain: 0.6 },
        { t: 21.25, sfx: 'tick', gain: 2.4 }, { t: 21.43, sfx: 'tick', gain: 2.4 },
        { t: 22.4, sfx: 'pop' }, { t: 24.45, sfx: 'whoosh', gain: 0.8 },
        ...end.cues,
      ];
      for (let s = 19.25; s < 20.4; s += 0.13) cues.push({ t: s, sfx: 'tick', gain: 0.6 });

      return {
        duration: TOTAL,
        cues,
        bed: { from: 1.0, to: T.end + 1.3, gain: 0.85 },
        cover: 1.7,
        render(t) {
          field.render(t);

          // 1–2 — the doorbell, "who's at the door?", the door opens: "your doctor."
          const ko = p(t, 2.8, 0.9, E.inOutCubic);
          const kfly = p(t, 4.7, 0.6, E.inExpo);
          if (show(s1, t, T.door[0], T.door[1])) {
            const kin = p(t, 0, 0.7, E.outCubic);
            set(doorWrap, { o: kin * (1 - p(t, 5.05, 0.25, E.linear)), s: (0.94 + 0.06 * kin) * (1 + 3.4 * kfly), y: kfly * 150 });
            leafL.setAttribute('transform', `translate(36 0) scale(${(1 - 0.86 * ko).toFixed(4)} 1) skewY(${(ko * 5).toFixed(2)}) translate(-36 0)`);
            leafR.setAttribute('transform', `translate(404 0) scale(${(1 - 0.86 * ko).toFixed(4)} 1) skewY(${(-ko * 5).toFixed(2)}) translate(-404 0)`);
            light.setAttribute('opacity', (0.1 + 0.9 * ko).toFixed(3));
            spill.setAttribute('opacity', ko.toFixed(3));
            // The leak breathes while someone waits outside, and goes when the door opens.
            leak.setAttribute('opacity', ((0.75 + 0.25 * Math.sin(t * 4.2)) * kin * (1 - p(t, 2.8, 0.35))).toFixed(3));
            motes.forEach((d) => {
              const u = (d.y + t * d.v) % 1;
              d.m.setAttribute('cy', (630 - u * 560).toFixed(1));
              d.m.setAttribute('opacity', (ko * Math.sin(Math.PI * u) * 0.9).toFixed(3));
            });
            const press = Math.max(0, 1 - Math.abs(t - hits0[0]) / 0.12) + Math.max(0, 1 - Math.abs(t - hits0[1]) / 0.12);
            bellBtn.setAttribute('r', (16 - 3 * Math.min(1, press)).toFixed(2));
            set(bell, { o: kin * (1 - p(t, 4.6, 0.3, E.linear)) });
            TX.animWords(hook.words, t, { at: 0.25, stagger: 0.24, dur: 0.6, y: 60, blur: 14, scaleFrom: 1.12, out: 2.6, outDur: 0.3, outY: 50 });
            TX.animWords(answer.words, t, { at: 3.35, stagger: 0.1, dur: 0.6, y: 50, blur: 12, scaleFrom: 1.1, out: 4.6, outDur: 0.3 });
          }
          const kr = ko * (1 - p(t, 6.4, 1.8, E.inOutSine));
          set(rays, { o: kr * 0.9, r: t * 5, s: 0.9 + 0.25 * kfly });
          set(flash, { o: env(t, 4.95, 0.25, 5.25, 0.7) });

          // 3 — "and the whole clinic with him": the services fly out of the light
          if (show(s3, t, T.clinic[0], T.clinic[1])) {
            set(glow, { o: env(t, 5.2, 0.3, 8.0, 3.0) });
            TX.animWords(title.words, t, { at: 5.35, stagger: 0.1, dur: 0.6, out: 12.2, outDur: 0.3 });
            cards.forEach((cd, i) => {
              const a = cardAt(i);
              const k = p(t, a, 0.85, E.outBack);
              const kx = p(t, 12.1 + (n - 1 - i) * 0.035, 0.35, E.inCubic);
              set(cd.c, {
                x: (1 - k) * cd.dx, y: (1 - k) * cd.dy + kx * 40, r: (1 - p(t, a, 0.7)) * cd.spin,
                s: lerp(0.18, 1, k) * (1 - 0.12 * kx), o: p(t, a, 0.2, E.linear) * (1 - kx),
                blur: (1 - p(t, a, 0.5)) * 16,
              });
            });
            TX.animWords(where.words, t, { at: 9.7, stagger: 0.08, dur: 0.5, y: 20, blur: 5, out: 12.2, outDur: 0.3 });
          }

          // 4 — the queue, the traffic, the waiting room: struck out
          if (show(s4, t, T.relief[0], T.relief[1])) {
            pains.forEach((b, i) => {
              TX.animWords(b.words, t, { at: 12.8 + i * 0.9, stagger: 0.08, dur: 0.5, y: 30, out: 18.2, outDur: 0.3 });
              const ks = p(t, strikeAt(i), 0.4, E.inOutCubic);
              const g = strikeGeo[i];
              px(strikes[i], { right: g.right - 16, top: g.top + g.height * 0.5 - 6, width: (g.width + 32) * ks });
              // Once struck, the word and its line fade back: gone, not shouted.
              const dim = p(t, strikeAt(i) + 0.3, 0.4);
              set(strikes[i], { o: ks > 0 ? (1 - 0.45 * dim) * (1 - p(t, 18.2, 0.3)) : 0, r: -2 });
              b.el.style.opacity = (1 - 0.62 * dim).toFixed(3);
            });
            TX.animWords(relief.words, t, { at: 15.9, stagger: 0.12, dur: 0.65, y: 50, blur: 14, scaleFrom: 1.15, out: 18.2, outDur: 0.3 });
          }

          // 5 — send a message, and we reach your door
          if (show(s5, t, T.ask[0], T.ask[1])) {
            TX.animWords(ask.words, t, { at: 18.6, stagger: 0.1, out: 24.45, outDur: 0.3 });
            TX.animDots(ask.el, t, 19.0);
            const kb = p(t, 18.95, 0.7, E.spring);
            const u = p(t, 20.5, 0.7, E.inOutCubic);
            set(bubble, {
              x: -Math.sin(Math.PI * u) * 150, y: u * 290, s: (0.55 + 0.45 * kb) * lerp(1, 0.16, u),
              o: p(t, 18.95, 0.15, E.linear) * (1 - p(t, 21.05, 0.15, E.linear)),
            });
            typing.forEach((d, i) => {
              const on = t > 19.2 && t < 20.5;
              const bounce = on ? Math.max(0, Math.sin((t - 19.2) * 9 - i * 0.9)) : 0;
              d.style.transform = `translateY(${(-bounce * 16).toFixed(2)}px)`;
              d.style.opacity = (0.45 + 0.55 * bounce).toFixed(3);
            });
            const kd = p(t, 20.1, 0.6, E.outBack);
            const knock = t > 21.25 && t < 21.62 ? Math.sin((t - 21.25) * 58) * 7 * (1 - (t - 21.25) / 0.37) : 0;
            const kout = p(t, 24.45, 0.3, E.inCubic);
            set(doorIcon, { x: knock, s: 0.6 + 0.4 * kd, o: TX.clamp(kd * 1.5) * (1 - kout) });
            doorIconSvg.style.filter = `drop-shadow(0 0 ${(28 * env(t, 21.25, 0.15, 21.7, 1.2)).toFixed(1)}px rgba(255,243,220,.9))`;
            knockRings.render(t, [21.25], W / 2, 1020, 100);
            TX.animWords(arrive.words, t, { at: 21.6, stagger: 0.12, dur: 0.6, y: 40, out: 24.45, outDur: 0.3 });
            const kc = p(t, 22.4, 0.7, E.spring);
            set(chip, { s: 0.7 + 0.3 * kc, o: p(t, 22.4, 0.15, E.linear) * (1 - kout), y: kout * 20 });
          }

          // chrome: tab, rings on the doorbell, series pill, end card
          tab.render(t, 0.05);
          bellRings.render(t, t < 3 ? hits0 : [], 871, 1067, 30);
          pill.render(t, 1.0, 24.4);
          end.render(t);
        },
      };
    },
  });
})();
