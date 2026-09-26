/* سؤال الصبح / سؤال — white story frame, navy text. The pink element is the
 * Instagram poll or question sticker the team adds in the app, so nothing on
 * this frame is pink except the tab; the lower third stays clear for it. */
(function () {
  'use strict';
  const TX = window.TX;
  const { E, p, set, el, px } = TX;

  TX.register('story-question', {
    size: [1080, 1920],
    fps: 30,
    light: true,
    build(stage, P, ctx) {
      const dur = P.duration || 8;
      const field = TX.field(stage, { light: true });
      const ghost = el('div', 'abs', stage, '؟');
      px(ghost, { left: 40, top: 760, fontSize: 900, fontWeight: 700, lineHeight: 1, color: 'rgba(24,25,67,.045)' });
      const tab = TX.C.tab(stage, ctx);
      const label = el('div', 'pill', stage);
      px(label, { top: ctx.L.pill.top, left: ctx.L.pill.left, background: '#181943', color: '#FFFEFF' });
      TX.svg(label, TX.icon(P.icon || 'chat', '#1B9CCE'));
      el('span', '', label, P.label || 'سؤال الصبح');
      const q = TX.text(stage, P.question, 'col t-hook-s', { top: 520 });
      const sub = P.sub ? TX.text(stage, P.sub, 'col t-sub blue', { top: 0 }) : null;
      const note = TX.text(stage, P.note || ctx.brand.ritual, 'col centered t-sub', { top: ctx.L.safeBottom - 96 });
      note.el.style.color = 'rgba(24,25,67,.6)';
      return {
        duration: dur,
        cues: [{ t: 0.1, sfx: 'pop' }],
        bed: { from: 0, to: dur, gain: 0.7 },
        cover: 3.5,
        render(t) {
          field.render(t);
          set(ghost, { o: p(t, 0.3, 1.2), y: -18 * Math.sin(t * 0.5), r: -6 + 2 * Math.sin(t * 0.4) });
          tab.render(t, 0.1);
          const kl = p(t, 0.35, 0.6, E.outQuint);
          set(label, { x: (1 - kl) * -36, o: kl });
          TX.animWords(q.words, t, { at: 0.7, stagger: 0.09, dur: 0.6, y: 34, blur: 6 });
          if (sub) {
            if (!sub.placed) { px(sub.el, { top: q.el.offsetTop + q.el.offsetHeight + 36 }); sub.placed = true; }
            TX.animWords(sub.words, t, { at: 0.8 + q.words.length * 0.09 + 0.3, stagger: 0.08, dur: 0.5, y: 20, blur: 4 });
          }
          TX.animWords(note.words, t, { at: 2.2, stagger: 0.06, dur: 0.5, y: 14, blur: 3 });
        },
      };
    },
  });
})();
