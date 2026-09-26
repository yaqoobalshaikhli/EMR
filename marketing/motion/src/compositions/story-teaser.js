/* باچر (tomorrow) teaser story — navy, a text teaser, a clock set to the
 * ritual time. Also used for the Sat 26 Sep countdown story and the
 * "الأحد ٨:٣٠" payoff teasers. The Instagram countdown sticker is added in
 * the app, over the clock, so viewers can tap to be reminded. */
(function () {
  'use strict';
  const TX = window.TX;
  const { E, p, set, el, px } = TX;

  TX.register('story-teaser', {
    size: [1080, 1920],
    fps: 30,
    build(stage, P, ctx) {
      const B = ctx.brand;
      const dur = P.duration || 8;
      const field = TX.field(stage);
      const tab = TX.C.tab(stage, ctx);

      const kicker = TX.text(stage, P.kicker || 'باچر', 'col t-hook', { top: 400 });
      const bar = el('div', 'abs', stage);
      px(bar, { right: 80, top: 560, height: 10, borderRadius: 10, background: '#1B9CCE' });

      const body = TX.text(stage, P.text, 'col t-cap', { top: 640 });
      body.el.style.fontSize = '64px';
      // Medical answers are signed: "راجعها طبياً: د. [الاسم]" (Copy rules → 8).
      const signed = P.signed ? TX.text(stage, P.signed, 'col t-strip dim', { top: 0 }) : null;

      const clockWrap = el('div', 'abs', stage);
      const clockSize = 330;
      px(clockWrap, { left: (ctx.w - clockSize) / 2, top: P.clockTop || 1030, width: clockSize, height: clockSize });
      const clock = TX.C.clock(clockWrap, clockSize, { ring: 'rgba(255,254,255,.85)' });
      // A thin second hand keeps the clock alive without moving the time off 8:30.
      const sweep = TX.svg(clock.el, '<line x1="100" y1="112" x2="100" y2="18" stroke="#1B9CCE" stroke-width="2.5" stroke-linecap="round"/>');

      const note = TX.text(stage, P.note || B.ritual, 'col centered t-sub dim', { top: ctx.L.safeBottom - 96 });

      const target = P.clockTo == null ? 510 : P.clockTo; // 8:30
      const cues = [{ t: 0.1, sfx: 'pop' }];
      for (let s = 3; s < dur - 0.5; s += 1) cues.push({ t: s, sfx: 'tick' });

      return {
        duration: dur,
        cues,
        bed: { from: 0, to: dur, gain: 0.8 },
        cover: 4.5,
        render(t) {
          field.render(t);
          tab.render(t, 0.1);

          const kk = p(t, 0.3, 0.75, E.outQuint);
          kicker.el.style.clipPath = `inset(-30% 0 -30% ${((1 - kk) * 100).toFixed(2)}%)`;
          kicker.words.forEach((w) => set(w, { x: (1 - kk) * 70, o: p(t, 0.3, 0.3, E.linear) }));
          const bw = p(t, 0.62, 0.7, E.outExpo);
          px(bar, { width: 200 * bw });
          set(bar, { o: bw > 0.001 ? 1 : 0 });

          TX.animWords(body.words, t, { at: 0.95, stagger: 0.085, dur: 0.6, y: 30, blur: 6 });
          TX.animDots(body.el, t, 0.95 + body.words.length * 0.085 + 0.3);
          if (signed) {
            if (!signed.placed) { px(signed.el, { top: body.el.offsetTop + body.el.offsetHeight + 22 }); signed.placed = true; }
            TX.animWords(signed.words, t, { at: 1.6 + body.words.length * 0.085, stagger: 0.03, dur: 0.4, y: 8, blur: 2 });
          }

          const kc = p(t, 1.25, 0.9, E.outCubic);
          set(clockWrap, { s: 0.86 + 0.14 * kc, o: kc });
          const kh = p(t, 1.35, 1.6, E.inOutCubic);
          clock.setTime(target - 40 + 40 * kh);
          sweep.setAttribute('transform', `rotate(${((t - 1.35) * 36).toFixed(2)} 100 100)`);
          sweep.style.opacity = p(t, 2.6, 0.4).toFixed(3); // style.transform would override the SVG rotate

          TX.animWords(note.words, t, { at: 2.9, stagger: 0.06, dur: 0.6, y: 16, blur: 4 });
        },
      };
    },
  });
})();
