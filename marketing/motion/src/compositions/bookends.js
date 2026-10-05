/* Bookends for every Reel cut from real footage (Design guideline → Reel order):
 *   reel-opener  — first ~2.3 s: the hook, one pink element, the doorbell.
 *   reel-endcard — last ~3.3 s: navy, the white figure, "لا تصدگنا. شوف بعينك.",
 *                  "كل ليلة ٨:٣٠", the doorbell.
 * Editors drop them before and after the footage in CapCut or Premiere. */
(function () {
  'use strict';
  const TX = window.TX;
  const { E, p, env, set, el, px } = TX;
  const SERIES_ICON = { 'شوف بعينك': 'eye', 'طبيبك بالاسم': 'badge', 'صح لو غلط؟': 'truefalse', 'لأهلك': 'family', 'سؤالكم': 'chat', 'وعد TabeebX': 'seal', 'اعرف أرقامك': 'pulse', 'أكتوبر الوردي': 'ribbon', 'هرمونات بلا طبيب': 'dumbbell' };
  TX.seriesIcon = (name) => SERIES_ICON[name] || 'eye';

  TX.register('reel-opener', {
    size: [1080, 1920],
    fps: 30,
    build(stage, P, ctx) {
      const W = ctx.w;
      const dur = P.duration || 2.4;
      const field = TX.field(stage);
      const slit = el('div', 'abs', stage);
      px(slit, { top: 260, height: 1300, left: W / 2, width: 0, background: 'radial-gradient(50% 50% at 50% 50%, rgba(170,178,255,.2) 0%, rgba(170,178,255,.07) 45%, rgba(24,25,67,0) 100%)' });
      const hook = TX.text(stage, P.hook, 'col centered t-hook', { top: P.hookTop || 800 });
      const label = P.label ? TX.text(stage, P.label, 'col centered t-strip dim', { top: ctx.L.stripY }) : null;
      const rings = TX.C.rings(stage, 2);
      const tab = TX.C.tab(stage, ctx);
      const pill = P.series ? TX.C.pill(stage, ctx, P.series, TX.seriesIcon(P.series)) : null;
      const bell = 0.05, hits = [bell, bell + ctx.bell.second];
      return {
        duration: dur,
        cues: [{ t: bell, sfx: 'doorbell' }],
        bed: null,
        cover: Math.min(1.6, dur - 0.2),
        render(t) {
          field.render(t);
          const ks = p(t, 0, 0.7, E.outQuint);
          px(slit, { width: 900 * ks, left: W / 2 - 450 * ks });
          set(slit, { o: env(t, 0, 0.3, dur - 1.0, 0.9) });
          TX.animWords(hook.words, t, { at: 0.12, stagger: 0.2, dur: 0.55, y: 60, blur: 14, scaleFrom: 1.12 });
          TX.animDots(hook.el, t, 0.9);
          if (label) TX.animWords(label.words, t, { at: 0.6, stagger: 0.03, dur: 0.4, y: 8, blur: 2 });
          tab.render(t, 0.05);
          rings.render(t, hits, tab.base.cx, tab.base.cy, 70);
          if (pill) pill.render(t, 0.35);
        },
      };
    },
  });

  TX.register('reel-endcard', {
    size: [1080, 1920],
    fps: 30,
    build(stage, P, ctx) {
      const field = TX.field(stage);
      const tab = TX.C.tab(stage, ctx);
      const end = TX.C.endCard(stage, ctx, tab, 0.0);
      const dur = P.duration || 3.4;
      return {
        duration: dur,
        cues: end.cues,
        bed: null,
        cover: dur - 0.2,
        render(t) {
          field.render(t);
          tab.render(t, -1); // already in its corner when the card starts
          end.render(t);
        },
      };
    },
  });
})();
