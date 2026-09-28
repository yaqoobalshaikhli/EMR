/* Sun 27 Sep launch Reel — "لا تصدگنا." — motion edition, 40 s.
 *
 * Follows the founder script beat for beat (Next week's content → Sun 27 Sep)
 * so it can run on its own, or be cut into the founder edit:
 *   0.0–2.3   hook + doorbell            → opener for the founder edit
 *   2.3–19.2  who / shared pain / "that's just talk"   (founder on camera)
 *  19.2–30.2  8:30 ritual + the door + what we'll show → B-roll under his voice
 *  30.2–36.3  the promise, in numbers, next Sunday     (founder on camera)
 *  36.3–40.0  end card + doorbell
 * One pink element per frame besides the tab: hook, lanyard, strike, 8:30,
 * "بالأرقام", then the tab itself on the end card. */
(function () {
  'use strict';
  const TX = window.TX;
  const { E, p, env, set, el, px, lerp } = TX;

  const T = {
    hook: [0, 2.3], who: [2.3, 6.2], shared: [6.2, 14.2], talk: [14.2, 19.2],
    door: [19.2, 30.2], promise: [30.2, 36.3], end: 36.3, total: 40,
  };

  function layer(stage) { return el('div', 'layer', stage); }
  function show(e, t, a, b) {
    const on = t >= a && t < b;
    e.style.display = on ? '' : 'none';
    return on;
  }
  const mixRgb = (a, b, k) => `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], k))).join(',')})`;
  const NAVY = [24, 25, 67], WHITE = [255, 254, 255];

  TX.register('launch-reel', {
    size: [1080, 1920],
    fps: 30,
    build(stage, P, ctx) {
      const W = ctx.w;
      const field = TX.field(stage);

      // ------------------------------------------------ 1. hook (0–2.3)
      const s1 = layer(stage);
      const slit = el('div', 'abs', s1);
      px(slit, { top: 260, height: 1300, left: W / 2, width: 0, background: 'radial-gradient(50% 50% at 50% 50%, rgba(170,178,255,.2) 0%, rgba(170,178,255,.07) 45%, rgba(24,25,67,0) 100%)' });
      const hook = TX.text(s1, P.hook, 'col centered t-hook', { top: 830 });

      // ---------------------------------------------- 2. who (2.3–6.2)
      const s2 = layer(stage);
      const lanyard = TX.svg(s2, `<svg class="abs" width="1080" height="560" viewBox="0 0 1080 560" style="left:0;top:0">
          <path d="M455 -20 L528 494 M625 -20 L552 494" stroke="#EE396B" stroke-width="30" stroke-linecap="round" fill="none"/>
          <rect x="516" y="478" width="48" height="58" rx="12" fill="#C9CBDF"/>
        </svg>`);
      lanyard.style.transformOrigin = '540px 505px';
      const card = el('div', 'card', s2);
      const withPhoto = !!P.card.photo;
      const cw = withPhoto ? 560 : 640;
      px(card, { left: (W - cw) / 2, top: 520, width: cw, height: withPhoto ? 700 : 330, overflow: 'hidden', transformOrigin: '50% -15px', boxShadow: '0 40px 80px -30px rgba(0,0,0,.6)' });
      if (withPhoto) {
        // A real ID badge: the founder's photo on top, name and role below.
        const ph = el('img', '', card);
        ph.src = P.card.photo;
        ph.alt = '';
        px(ph, { width: cw, height: 400, objectFit: 'cover', objectPosition: '50% 18%', display: 'block' });
      }
      const cardBody = el('div', withPhoto ? '' : 'abs', card);
      px(cardBody, withPhoto ? { padding: '26px 40px 0', textAlign: 'center' } : { inset: '44px 56px 40px 56px', textAlign: 'right' });
      el('div', 't-hook-s', cardBody, P.card.name).style.lineHeight = '1.15';
      const role = el('div', 't-body', cardBody, P.card.role);
      px(role, { color: 'rgba(24,25,67,.72)', marginTop: 6 });
      const rule = el('div', '', cardBody);
      px(rule, { height: 4, width: 120, background: '#1B9CCE', borderRadius: 4, margin: withPhoto ? '18px auto 14px' : '22px 0 18px auto' });
      const team = el('div', 'center', cardBody);
      px(team, { justifyContent: withPhoto ? 'center' : 'flex-start', gap: 12, fontSize: 30, fontWeight: 500, color: '#1B9CCE' });
      TX.svg(team, TX.icon('badge', '#1B9CCE', 3.4)).setAttribute('width', 40);
      el('span', '', team, P.card.team);
      const intro = TX.text(s2, P.intro, 'col centered t-hook-s', { top: withPhoto ? 1260 : 930 });

      // ------------------------------------------ 3. shared (6.2–14.2)
      const s3 = layer(stage);
      const sTitle = TX.text(s3, P.shared.title, 'col t-hook-s', { top: 470 });
      const art = el('div', 'abs', s3);
      px(art, { left: 0, top: 680, width: W, height: 470 });
      // 3a queue: six people, "you" last; the line barely moves.
      const queue = el('div', 'abs', art);
      px(queue, { left: 0, top: 110, width: W, height: 260 });
      const people = [];
      for (let i = 0; i < 6; i++) {
        const you = i === 0;
        const pz = TX.svg(queue, `<svg class="abs" width="120" height="170" viewBox="0 0 100 130">
          <circle cx="50" cy="32" r="21" fill="${you ? '#FFFEFF' : 'none'}" stroke="${you ? '#FFFEFF' : '#1B9CCE'}" stroke-width="7"/>
          <path d="M12 124c0-28 17-47 38-47s38 19 38 47z" fill="${you ? '#FFFEFF' : 'none'}" stroke="${you ? '#FFFEFF' : '#1B9CCE'}" stroke-width="7" stroke-linejoin="round"/>
        </svg>`);
        people.push(pz);
      }
      const qCap = TX.text(s3, P.shared.queue, 'col centered t-hook-s', { top: 1190 });
      // 3b stopwatch: minutes run out fast.
      const watch = TX.svg(art, `<svg class="abs" width="360" height="400" viewBox="0 0 200 222" style="left:360px;top:30px">
          <rect x="86" y="0" width="28" height="16" rx="5" fill="#FFFEFF"/>
          <path d="M100 16v10" stroke="#FFFEFF" stroke-width="8"/>
          <circle cx="100" cy="122" r="86" fill="none" stroke="rgba(255,254,255,.2)" stroke-width="14"/>
          <circle class="arc" cx="100" cy="122" r="86" fill="none" stroke="#1B9CCE" stroke-width="14" stroke-linecap="round" transform="rotate(-90 100 122)" stroke-dasharray="540.35" stroke-dashoffset="540.35"/>
          <line class="hand" x1="100" y1="122" x2="100" y2="58" stroke="#FFFEFF" stroke-width="7" stroke-linecap="round"/>
          <circle cx="100" cy="122" r="8" fill="#FFFEFF"/>
        </svg>`);
      const arc = watch.querySelector('.arc'), hand = watch.querySelector('.hand');
      const wCap = TX.text(s3, P.shared.minutes, 'col centered t-hook-s', { top: 1190 });
      // 3c home with the questions nobody had time to ask.
      const house = el('div', 'abs', art);
      px(house, { left: (W - 300) / 2, top: 120, width: 300, height: 300 });
      TX.svg(house, TX.icon('home', '#FFFEFF', 2.4)).setAttribute('width', 300);
      const qms = [];
      for (let i = 0; i < 4; i++) {
        const q = el('div', 'abs t-hook', art, '؟');
        px(q, { left: [330, 610, 440, 690][i], top: 60 });
        qms.push(q);
      }
      const hCap = TX.text(s3, P.shared.questions, 'col centered t-sub', { top: 1180 });
      // 3d respect: one doctor, many patients — the pressure is real.
      const load = TX.svg(art, `<svg class="abs" width="560" height="560" viewBox="-280 -280 560 560" style="left:260px;top:-30px"></svg>`);
      const dots = [];
      const rng = TX.rng(42);
      [[11, 92], [19, 160], [27, 228]].forEach(([n, r], ring) => {
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + ring * 0.37 + rng() * 0.12;
          const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          const rr = r + (rng() - 0.5) * 18;
          c.setAttribute('cx', (Math.cos(a) * rr).toFixed(1));
          c.setAttribute('cy', (Math.sin(a) * rr).toFixed(1));
          c.setAttribute('r', 10);
          c.setAttribute('fill', '#1B9CCE');
          load.appendChild(c);
          dots.push({ c, d: Math.hypot(Math.cos(a) * rr, Math.sin(a) * rr), ph: rng() * 6.28 });
        }
      });
      const doc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      doc.setAttribute('r', 30); doc.setAttribute('fill', '#FFFEFF');
      load.appendChild(doc);
      const rCap = TX.text(s3, P.shared.respect, 'col centered t-sub', { top: 1180 });

      // --------------------------------------------- 4. talk (14.2–19.2)
      const s4 = layer(stage);
      const tLead = TX.text(s4, P.talk.lead, 'col centered t-sub dim', { top: 560 });
      const bubble = el('div', 'abs center', s4);
      px(bubble, { left: 150, width: 780, top: 700, height: 250, borderRadius: 70 });
      const tail = el('div', 'abs', bubble);
      px(tail, { width: 70, height: 70, right: 120, bottom: -26, transform: 'rotate(45deg)', borderRadius: 10 });
      const claim = el('div', 't-hook-s', bubble);
      TX.words(claim, P.talk.claim);
      const strike = el('div', 'abs', s4);
      px(strike, { height: 14, borderRadius: 7, background: '#EE396B' });
      const admit = TX.text(s4, P.talk.admit, 'col centered t-hook-s', { top: 1100 });
      // Measure the claim's line once, before any transform: the strike runs across it, right to left.
      const strikeGeo = (() => {
        const sr = stage.getBoundingClientRect(), k = sr.width / ctx.w;
        const lr = claim.querySelector('.line').getBoundingClientRect();
        return { right: (sr.right - lr.right) / k - 18, width: lr.width / k + 36, top: (lr.top - sr.top) / k + (lr.height / k) * 0.54 };
      })();

      // ---------------------------------------------- 5. door (19.2–30.2)
      const s5 = layer(stage);
      const dLead = TX.text(s5, P.door.lead, 'col centered t-hook-s', { top: 470 });
      const clockWrap = el('div', 'abs', s5);
      px(clockWrap, { left: (W - 400) / 2, top: 640, width: 400, height: 400 });
      const clock = TX.C.clock(clockWrap, 400);
      const ritual = TX.text(s5, P.door.ritual, 'col centered t-hook', { top: 1100 });
      const dOpen = TX.text(s5, P.door.open, 'col centered t-hook-s', { top: 440 });
      const doorWrap = el('div', 'abs', s5);
      px(doorWrap, { left: (W - 440) / 2, top: 620, width: 440, height: 640 });
      const studs = (x0, x1) => {
        let s = '';
        for (let y = 300; y <= 580; y += 70) for (let x = x0; x <= x1; x += 52) s += `<circle cx="${x}" cy="${y}" r="5" fill="#1B9CCE"/>`;
        return s;
      };
      const door = TX.svg(doorWrap, `<svg width="440" height="640" viewBox="0 0 440 640">
          <defs>
            <radialGradient id="glow" cx="50%" cy="60%" r="60%">
              <stop offset="0" stop-color="#FFF7EC" stop-opacity="1"/>
              <stop offset=".55" stop-color="#F3E8FF" stop-opacity=".55"/>
              <stop offset="1" stop-color="#FFFEFF" stop-opacity="0"/>
            </radialGradient>
            <clipPath id="arch"><path d="M36 640V222A184 184 0 0 1 404 222V640z"/></clipPath>
          </defs>
          <rect class="light" x="0" y="0" width="440" height="640" fill="url(#glow)" clip-path="url(#arch)" opacity="0"/>
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
          <path d="M20 640V220A200 200 0 0 1 420 220V640" fill="none" stroke="#FFFEFF" stroke-width="9" stroke-linecap="round"/>
        </svg>`);
      const leafL = door.querySelector('.leafL'), leafR = door.querySelector('.leafR'), light = door.querySelector('.light');
      const flash = el('div', 'layer', s5);
      flash.style.background = 'radial-gradient(60% 45% at 50% 50%, rgba(255,247,236,.55), rgba(255,254,255,0) 70%)';
      const rowIcons = ['badge', 'steps', 'message'];
      const rows = P.door.rows.map((txt, i) => {
        const r = el('div', 'abs', s5);
        px(r, { right: 80, left: 80, top: 560 + i * 132, height: 110, display: 'flex', alignItems: 'center', gap: 28 });
        const ic = el('div', 'center', r);
        px(ic, { width: 104, height: 104, borderRadius: 30, background: 'rgba(255,254,255,.1)', flex: 'none' });
        TX.svg(ic, TX.icon(rowIcons[i], '#1B9CCE', 3)).setAttribute('width', 60);
        const tx = el('div', 't-sub', r);
        tx.style.fontSize = '60px';
        TX.words(tx, txt);
        return r;
      });
      const journey = TX.svg(s5, `<svg class="abs" width="920" height="200" viewBox="0 0 920 200" style="left:80px;top:990px">
          <path class="route" d="M780 110 Q460 -10 140 110" fill="none" stroke="#1B9CCE" stroke-width="6" stroke-dasharray="4 18" stroke-linecap="round"/>
          <g transform="translate(790 50)">${TX.icon('message', '#FFFEFF', 3).replace('<svg', '<svg width="120" height="120" x="0" y="0"')}</g>
          <g class="dg" transform="translate(10 50)">${TX.icon('door', '#FFFEFF', 3).replace('<svg', '<svg width="120" height="120" x="0" y="0"')}</g>
          <circle class="dot" r="15" fill="#FFFEFF"/>
        </svg>`);
      const route = journey.querySelector('.route'), jdot = journey.querySelector('.dot'), jdoor = journey.querySelector('.dg');
      const arrive = TX.text(s5, P.door.arrive, 'col centered t-sub', { top: 1215 });

      // ------------------------------------------ 6. promise (30.2–36.3)
      const s6 = layer(stage);
      const pLead = TX.text(s6, P.promise.lead, 'col centered t-hook-s', { top: 450 });
      const cal = el('div', 'card', s6);
      px(cal, { left: (W - 400) / 2, top: 640, width: 400, height: 470, overflow: 'hidden', transformOrigin: '50% 0' });
      const calTop = el('div', 'center t-sub', cal, P.promise.day);
      px(calTop, { height: 104, background: '#1B9CCE', color: '#FFFEFF' });
      const calNum = el('div', 'center', cal, P.promise.date);
      px(calNum, { height: 210, fontSize: 200, fontWeight: 700, lineHeight: 1 });
      el('div', 'center t-sub', cal, P.promise.month).style.height = '70px';
      const calTime = el('div', 'center t-body', cal, P.promise.time);
      px(calTime, { color: 'rgba(24,25,67,.62)', height: 70 });
      const announce = TX.text(s6, P.promise.announce, 'col centered t-sub', { top: 470 });
      const numbers = TX.text(s6, P.promise.numbers, 'col centered t-hook', { top: 555 });
      const slots = [0, 1, 2].map((i) => {
        const s = el('div', 'abs center', s6);
        px(s, { left: 190 + i * 250, top: 800, width: 200, height: 230, borderRadius: 36, border: '6px solid rgba(255,254,255,.9)', fontSize: 130, fontWeight: 700 });
        const d = el('span', '', s, '٠');
        d.style.display = 'inline-block';
        return { s, d };
      });
      const account = TX.text(s6, P.promise.accountable, 'col centered t-hook-s', { top: 1110 });

      // --------------------------------------------------- shared chrome
      const rings = TX.C.rings(stage, 2);
      const tab = TX.C.tab(stage, ctx);
      const pill = TX.C.pill(stage, ctx, P.series, 'eye');
      const end = TX.C.endCard(stage, ctx, tab, T.end);
      const bell0 = 0.05;
      const hits0 = [bell0, bell0 + ctx.bell.second];

      const cues = [
        { t: bell0, sfx: 'doorbell' },
        { t: 2.25, sfx: 'whoosh' }, { t: 3.35, sfx: 'pop' },
        { t: 6.15, sfx: 'whoosh', gain: 0.7 },
        { t: 14.15, sfx: 'whoosh', gain: 0.7 }, { t: 14.9, sfx: 'pop' }, { t: 16.55, sfx: 'whoosh', gain: 0.8 },
        { t: 19.15, sfx: 'whoosh' }, { t: 23.35, sfx: 'whoosh', gain: 0.8 },
        { t: 25.1, sfx: 'blip' }, { t: 25.9, sfx: 'blip' }, { t: 26.7, sfx: 'blip' },
        { t: 28.95, sfx: 'tick', gain: 2.2 }, { t: 29.13, sfx: 'tick', gain: 2.2 },
        { t: 30.15, sfx: 'whoosh' }, { t: 30.55, sfx: 'pop' }, { t: 34.55, sfx: 'blip' },
        ...end.cues,
      ];
      for (let s = 9.05; s < 10.5; s += 0.25) cues.push({ t: s, sfx: 'tick' });
      for (let s = 20.4; s < 21.5; s += 0.12) cues.push({ t: s, sfx: 'tick', gain: 0.8 });
      for (let s = 33.0; s < 34.5; s += 0.075) cues.push({ t: s, sfx: 'tick', gain: 0.7 });

      return {
        duration: T.total,
        cues,
        bed: { from: 1.0, to: 37.6, gain: 0.85 },
        cover: 1.9,
        render(t) {
          field.render(t);

          // 1 — hook, on the doorbell
          if (show(s1, t, T.hook[0], T.hook[1] + 0.01)) {
            const ks = p(t, 0.0, 0.7, E.outQuint);
            px(slit, { width: 900 * ks, left: W / 2 - 450 * ks });
            set(slit, { o: env(t, 0, 0.3, 1.2, 0.9) });
            TX.animWords(hook.words, t, { at: 0.12, stagger: 0.24, dur: 0.55, y: 60, blur: 14, scaleFrom: 1.12, out: 1.95, outDur: 0.3, outY: 60 });
          }

          // 2 — who: the name, then the card on the pink lanyard
          if (show(s2, t, T.who[0], T.who[1] + 0.01)) {
            TX.animWords(intro.words, t, { at: 3.05, stagger: 0.12, dur: 0.6, out: 5.85, outDur: 0.3 });
            const drop = p(t, 2.5, 1.0, E.soft);
            const leave = p(t, 5.8, 0.4, E.inBack);
            const dist = withPhoto ? 1300 : 900; // start fully above the frame
            const y = (1 - drop) * -dist - leave * dist;
            const sw = t < 2.5 ? 0 : 6 * Math.exp(-(t - 2.5) / 0.85) * Math.cos((t - 2.5) * 5.4);
            set(card, { y, r: sw });
            set(lanyard, { y, r: sw });
          }

          // 3 — the experience everyone shares
          if (show(s3, t, T.shared[0], T.shared[1] + 0.01)) {
            TX.animWords(sTitle.words, t, { at: 6.3, stagger: 0.1, out: 12.05, outDur: 0.35 });
            // queue
            const qIn = env(t, 7.2, 0.5, 8.85, 0.3);
            set(queue, { o: qIn });
            people.forEach((pz, i) => {
              const k = p(t, 7.2 + (5 - i) * 0.07, 0.7, E.outQuint);
              const shuffle = Math.max(0, t - 7.9) * 16;
              px(pz, { left: 140 + i * 140 + shuffle });
              set(pz, { y: (1 - k) * 60 + Math.abs(Math.sin(t * 3.2 + i)) * -5, o: k });
            });
            TX.animWords(qCap.words, t, { at: 7.4, stagger: 0.1, out: 8.8, outDur: 0.3 });
            // stopwatch
            const wIn = env(t, 8.95, 0.45, 10.45, 0.3);
            set(watch, { o: wIn, s: 0.9 + 0.1 * wIn });
            const run = p(t, 9.1, 1.2, E.inOutCubic);
            arc.setAttribute('stroke-dashoffset', (540.35 * (1 - run * 0.92)).toFixed(2));
            hand.setAttribute('transform', `rotate(${(run * 331).toFixed(2)} 100 122)`);
            TX.animWords(wCap.words, t, { at: 9.0, stagger: 0.1, out: 10.4, outDur: 0.3 });
            // home + questions
            const hIn = env(t, 10.55, 0.5, 12.2, 0.35);
            set(house, { o: hIn, y: (1 - hIn) * 30 });
            qms.forEach((q, i) => {
              const k = TX.clamp((t - 10.9 - i * 0.28) / 1.5);
              set(q, { y: 170 - k * 150, o: Math.sin(Math.PI * Math.min(1, k * 1.1)) * hIn, s: 0.7 + 0.3 * k, r: (i % 2 ? 1 : -1) * 8 * k });
            });
            TX.animWords(hCap.words, t, { at: 10.7, stagger: 0.07, out: 12.2, outDur: 0.3 });
            // respect: the load on one doctor
            const lIn = env(t, 12.35, 0.4, 13.9, 0.3);
            set(load, { o: lIn });
            doc.setAttribute('r', (30 * p(t, 12.35, 0.5, E.outBack)).toFixed(2));
            dots.forEach((d, i) => {
              const k = p(t, 12.5 + (d.d / 228) * 0.7 + (i % 5) * 0.02, 0.45, E.outBack);
              d.c.setAttribute('r', (10 * k).toFixed(2));
              d.c.setAttribute('transform', `translate(${(Math.sin(t * 2.2 + d.ph) * 3).toFixed(2)} ${(Math.cos(t * 1.9 + d.ph) * 3).toFixed(2)})`);
            });
            TX.animWords(rCap.words, t, { at: 12.5, stagger: 0.08, out: 13.9, outDur: 0.3 });
            TX.animDots(rCap.el, t, 13.0);
          }

          // 4 — "we could say we're better… that stays talk"
          if (show(s4, t, T.talk[0], T.talk[1] + 0.01)) {
            TX.animWords(tLead.words, t, { at: 14.3, stagger: 0.08, out: 18.9, outDur: 0.3 });
            const kb = p(t, 14.85, 0.8, E.spring);
            const kx = p(t, 18.9, 0.3, E.inCubic);
            const deflate = p(t, 16.7, 0.7, E.outCubic);
            set(bubble, { s: (0.6 + 0.4 * kb) * (1 - 0.06 * deflate), o: p(t, 14.85, 0.2) * (1 - kx) });
            bubble.style.background = `rgba(255,254,255,${(1 - 0.9 * deflate).toFixed(3)})`;
            bubble.style.boxShadow = `inset 0 0 0 5px rgba(255,254,255,${(0.55 * deflate).toFixed(3)})`;
            tail.style.background = '#FFFEFF';
            tail.style.opacity = (1 - deflate).toFixed(3);
            claim.style.color = mixRgb(NAVY, WHITE, deflate);
            claim.style.opacity = (1 - 0.35 * deflate).toFixed(3);
            TX.animDots(claim, t, 15.6);
            const ks = p(t, 16.55, 0.45, E.inOutCubic);
            px(strike, { right: strikeGeo.right, top: strikeGeo.top, width: strikeGeo.width * ks });
            set(strike, { o: ks > 0 ? 1 - kx : 0, r: -3 });
            strike.style.transformOrigin = '100% 50%';
            TX.animWords(admit.words, t, { at: 17.25, stagger: 0.1, out: 18.9, outDur: 0.3 });
          }

          // 5 — the ritual, the door, what we'll show
          if (show(s5, t, T.door[0], T.door[1] + 0.01)) {
            TX.animWords(dLead.words, t, { at: 19.3, stagger: 0.1, out: 22.7, outDur: 0.3 });
            const kc = env(t, 20.0, 0.6, 22.7, 0.35);
            set(clockWrap, { o: kc, s: 0.85 + 0.15 * kc });
            clock.setTime(p(t, 20.2, 1.35, E.inOutCubic) * 510);
            TX.animWords(ritual.words, t, { at: 21.25, stagger: 0.12, dur: 0.6, y: 44, out: 22.7, outDur: 0.3 });

            TX.animWords(dOpen.words, t, { at: 22.95, stagger: 0.09, out: 24.3, outDur: 0.3 });
            const kdIn = p(t, 22.9, 0.55, E.outCubic);
            const ko = p(t, 23.4, 0.95, E.inOutCubic);
            const kfly = p(t, 24.3, 0.75, E.inExpo);
            set(doorWrap, { o: kdIn * (1 - p(t, 24.75, 0.3, E.linear)), s: (0.92 + 0.08 * kdIn) * (1 + 3.6 * kfly), y: kfly * 120 });
            leafL.setAttribute('transform', `translate(36 0) scale(${(1 - 0.86 * ko).toFixed(4)} 1) skewY(${(ko * 5).toFixed(2)}) translate(-36 0)`);
            leafR.setAttribute('transform', `translate(404 0) scale(${(1 - 0.86 * ko).toFixed(4)} 1) skewY(${(-ko * 5).toFixed(2)}) translate(-404 0)`);
            light.setAttribute('opacity', (0.15 + 0.85 * ko).toFixed(3));
            set(flash, { o: env(t, 24.6, 0.25, 24.9, 0.5) });

            rows.forEach((r, i) => {
              const k = p(t, 25.0 + i * 0.8, 0.6, E.outQuint);
              const kx2 = p(t, 29.85, 0.3, E.inCubic);
              set(r, { x: (1 - k) * 90, o: k * (1 - kx2) });
            });
            const kj = env(t, 27.45, 0.5, 29.85, 0.3);
            set(journey, { o: kj });
            const kr = p(t, 27.5, 0.6, E.outCubic);
            route.setAttribute('stroke-dashoffset', ((1 - kr) * 200).toFixed(1));
            const u = p(t, 27.8, 1.1, E.inOutCubic);
            const bx = (1 - u) * (1 - u) * 780 + 2 * (1 - u) * u * 460 + u * u * 140;
            const by = (1 - u) * (1 - u) * 110 + 2 * (1 - u) * u * -10 + u * u * 110;
            jdot.setAttribute('cx', bx.toFixed(1)); jdot.setAttribute('cy', by.toFixed(1));
            jdot.setAttribute('opacity', (u > 0 && u < 1 ? 1 : u >= 1 ? 1 - p(t, 29.0, 0.2) : 0).toFixed(2));
            const knock = (t > 28.93 && t < 29.35) ? Math.sin((t - 28.93) * 60) * 4 * (1 - (t - 28.93) / 0.42) : 0;
            jdoor.setAttribute('transform', `translate(${(10 + knock).toFixed(2)} 50)`);
            TX.animWords(arrive.words, t, { at: 28.1, stagger: 0.08, out: 29.85, outDur: 0.3 });
          }

          // 6 — next Sunday, the promise in numbers
          if (show(s6, t, T.promise[0], T.promise[1] + 0.01)) {
            TX.animWords(pLead.words, t, { at: 30.3, stagger: 0.1, out: 32.15, outDur: 0.3 });
            const kf = p(t, 30.45, 0.8, E.outBack);
            const kcx = p(t, 32.1, 0.35, E.inCubic);
            cal.style.transform = `perspective(1400px) rotateX(${((1 - kf) * -80).toFixed(2)}deg) translateY(${(kcx * -60).toFixed(1)}px)`;
            cal.style.opacity = (p(t, 30.45, 0.25) * (1 - kcx)).toFixed(3);
            cal.style.visibility = t < 30.45 || kcx >= 1 ? 'hidden' : 'visible';

            TX.animWords(announce.words, t, { at: 32.35, stagger: 0.09, out: 35.95, outDur: 0.3 });
            TX.animWords(numbers.words, t, { at: 32.75, stagger: 0.1, dur: 0.6, y: 50, blur: 12, scaleFrom: 1.1, out: 35.95, outDur: 0.3 });
            const frame = Math.floor(t * 30);
            slots.forEach((sl, i) => {
              const k = p(t, 32.95 + i * 0.1, 0.5, E.outBack);
              const kx3 = p(t, 35.95, 0.3, E.inCubic);
              const land = 34.5 + i * 0.05;
              set(sl.s, { s: 0.7 + 0.3 * k, o: TX.clamp(k * 1.4) * (1 - kx3) });
              if (t < land) {
                const r = TX.rng(frame * 7 + i * 131)();
                sl.d.textContent = TX.ar(Math.floor(r * 10));
                set(sl.d, { y: ((frame + i) % 2) * -6, o: 0.9 });
              } else {
                sl.d.textContent = '؟';
                const kl = p(t, land, 0.5, E.outBack);
                const pulse = 1 + 0.04 * Math.sin((t - land) * 5 + i);
                set(sl.d, { s: (0.6 + 0.4 * kl) * pulse, o: 1 });
              }
            });
            TX.animWords(account.words, t, { at: 34.85, stagger: 0.1, out: 35.95, outDur: 0.3 });
          }

          // chrome: tab, rings on the opening doorbell, series pill, end card
          tab.render(t, 0.05);
          rings.render(t, t < 3 ? hits0 : [], tab.base.cx, tab.base.cy, 70);
          pill.render(t, 2.45, 36.0);
          end.render(t);
        },
      };
    },
  });
})();
