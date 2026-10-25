/* «العلاج يجيك» — home physiotherapy: a story told in photographs and handwriting.
 *
 * Each shot is an AI-generated photograph (assets/shots/physio/, kept out of git)
 * moved by a slow camera. Between the shots, full-screen cards are WRITTEN on the
 * screen: a pen travels along each line from right to left (Arabic letters stay
 * joined, so the line is revealed rather than typed letter by letter), a hand-drawn
 * line is drawn under it, and a pen sound goes with it. The captions over the
 * shots are written the same way. The grade turns from cool and grey to warm at the
 * doorbell, so the mood is the story: suffering in silence, then care at the door,
 * then the small things that return, and what matters to us most.
 *
 * The film is a list of segments (cards and shots) with durations; the times of
 * the captions, the cues and the score all follow from it (plan()). Scenes s8, s9 and
 * s10 (a courtyard, a lifted child, two physiotherapists at a door) are optional: they
 * are added to the film when their stills exist. The words are on screen, so the film
 * works muted and a voice can be laid over it (content/scripts/97b-physio-voice-sheet.md).
 * One pink element per frame. */
(function () {
  'use strict';
  const TX = window.TX;
  const { E, p, set, el, px, lerp, clamp } = TX;

  const FADE = 0.3;
  const WHITE = '#FFFEFF', BLUE = '#1B9CCE';
  const LINE_DUR = 0.85; // seconds a pen takes along one line

  // ------------------------------------------------------------------ plan
  /** The film as segments: kind 'card' (written on a blurred backdrop) or 'shot' (a photograph). */
  function plan(photos) {
    const segs = [];
    let t = 0;
    const add = (o) => { o.t0 = t; t += o.dur; o.t1 = t; segs.push(o); return o; };
    // caps: [from, to, text, top, class] relative to the shot's start. A caption's lines are written one after another.
    const shot = (id, dur, cam, extra = {}) => add({ kind: 'shot', id, dur, ...cam, ...extra });

    add({ kind: 'card', key: 'c1', bg: 's1', grade: 0, dur: 3.7, size: 112, top: 690, head: ['كل واحد منا', 'عنده شخص...', '*يتألم بصمت.*'], headAt: [0.3, 1.15, 2.0] });
    shot('s1', 3.3, { zoom: [1.05, 1.17], at: [50, 42], pan: [0, 14, -14, -8], grade: 0 }, {
      caps: [[0.15, 3.2, 'رجلك توجعك؟\nوالطريق... *مؤذي.*', 1130, 't-hook']] });
    shot('s2', 2.3, { zoom: [1.06, 1.14], at: [50, 52], pan: [10, 0, -12, 0], grade: 0 }, { caps: [[0.1, 2.2, 'ازدحامات .. سرة .. درج', 1290, 't-sub']] });
    shot('s3', 2.2, { zoom: [1.07, 1.19], at: [50, 55], pan: [0, 10, 0, -12], grade: 0 }, { caps: [[0.1, 2.1, 'تأجل... وتأجل...\nوالوجع يزيد.', 1220, 't-sub']] });
    add({ kind: 'card', key: 'c2', bg: 's3', grade: 0, dur: 3.2, size: 100, top: 760, head: ['مو لأن الوجع بسيط...', 'بس لأن الوصول *صعب.*'], headAt: [0.3, 1.3] });
    const bell = shot('s4a', 1.9, { zoom: [1.10, 1.24], at: [63, 49], pan: [0, 0, 0, 0], grade: [0.25, 0.7] }, { cut: true });
    const warm = shot('s4b', 3.0, { zoom: [1.04, 1.13], at: [50, 38], pan: [0, 8, 0, -8], grade: 1 }, {
      caps: [[0.2, 1.6, 'بس لو العلاج يصير أسهل', 1230, 't-sub'], [1.65, 2.95, '*نجيك للبيت*', 1250, 't-hook']] });
    const male = shot('s5', 3.7, { zoom: [1.05, 1.14], at: [48, 55], pan: [28, 0, -28, 0], grade: 1 }, {
      caps: [[0.2, 3.6, 'أخصائية أو أخصائي علاج طبيعي\nيوصل لبيتك.', 1170, 't-sub']], pills: [['أخصائي', 'mars', 0.3, 3.6]] });
    const female = shot('s6', 3.8, { zoom: [1.06, 1.13], at: [50, 55], pan: [-18, 0, 18, 0], grade: 1 }, {
      caps: [[0.15, 2.8, 'يفحصك، يعلّمك التمارين الصح\nويمشي وياك خطوة بخطوة.', 1170, 't-sub']],
      pills: [['أخصائية', 'venus', 0.3, 2.5], ['بخصوصية', 'heart', 2.7, 3.7]] });
    const c3 = add({ kind: 'card', key: 'c3', bg: 's6', grade: 1, dur: 5.7, size: 100, top: 500, head: ['الأشياء الصغيرة', 'هي اللي *تغيّر الحياة:*'], headAt: [0.3, 1.25],
      list: ['تنام بلا وجع', 'تطلع الدرج بسهولة', 'تمسك إيد حفيدك'], listAt: [2.4, 3.2, 4.0] });
    const steps = shot('s7', 2.9, { zoom: [1.12, 1.02], at: [50, 50], pan: [0, 0, 0, 0], grade: 1 }, { caps: [[0.2, 2.8, '*خطوة بخطوة.*', 1250, 't-hook']] });
    shot('s7', 3.3, { zoom: [1.38, 1.52], at: [62, 30], pan: [0, 0, 0, 0], grade: 1 }, { caps: [[0.3, 3.2, 'والخطوة اللي كنت تخاف منها...\nتصير عادية.', 1210, 't-sub']] });
    if (photos.s8) shot('s8', 3.6, { zoom: [1.03, 1.13], at: [50, 50], pan: [24, 0, -24, 0], grade: 1 }, { caps: [[0.3, 3.5, 'ويمشي... وإيد حفيدته بإيده.', 1210, 't-sub']] });
    if (photos.s9) shot('s9', 3.0, { zoom: [1.04, 1.11], at: [50, 45], pan: [0, 10, 0, -6], grade: 1 }, { caps: [[0.3, 2.9, 'وتشيل ولدك... وتلعب ويا عيالك.', 1210, 't-sub']] });
    const c5 = add({ kind: 'card', key: 'c5', bg: photos.s9 ? 's9' : 's7', grade: 1, dur: 3.8, size: 118, top: 660, head: ['أهلنا...', '*أهم شي عدنا.*'], headAt: [0.3, 1.2],
      small: 'وكل خطوة صغيرة بحياتهم... تهمنا.', smallAt: 2.3 });
    let tail = null;
    if (photos.s10) tail = shot('s10', 3.0, { zoom: [1.10, 1.02], at: [50, 52], pan: [0, 0, 0, 0], grade: 1 }, {});
    const END = t;
    return { segs, END, TOTAL: END + 3.0, BELL2: END + 0.25, tail, A: { bell: bell.t0, warm: warm.t0, male: male.t0, female: female.t0, c3: c3.t0, steps: steps.t0, c5: c5.t0 } };
  }

  // ------------------------------------------------------------------ score
  /* Night in A minor: a drone, a clock, tension into the doorbell. From the door, C major:
   * a pulse, piano, a note for each small thing written on the card, an opening swell on
   * the first steps, a held chord. The brand's doorbell (E5 → C5) rings over it at the door
   * and at the end card, so the score keeps the fifth octave clear there. */
  function composeScore(pl) {
    const { A, END, TOTAL } = pl;
    const k = TX.score.kit(TOTAL);
    k.air(0, A.bell + 0.2, 0.035, 420);
    k.pad(['A2', 'E3', 'G3'], 0.0, A.bell, { attack: 1.6, release: 0.8, vol: 0.06, from: 220, to: 700 });
    k.sub('A1', 0.2, A.bell - 0.1, 0.05);
    for (let t = 0.5; t < A.bell - 0.5; t += 0.9) k.tick(t, 0.04, t % 1.8 < 0.9 ? -0.2 : 0.2);
    k.riser(A.bell - 2.4, A.bell, 0.15);
    // the door: warmth arrives, C major
    k.impact(A.warm, 0.24, 0);
    k.shimmer(A.warm + 0.05, 0.04, 12, 0.9);
    k.whoosh(A.warm - 0.45, 0.9, 0.1, -0.5, 0.5);
    const beat = 0.62, groove = A.steps + 0.4;
    const quiet = (t) => t > A.c3 && t < A.c3 + 4.9; // under the small things on the card the music steps back
    const bars = [
      { pad: ['C3', 'G3', 'D4', 'E4'], bass: ['C3', 'G3', 'C4', 'G3'], sub: 'C2' },
      { pad: ['A2', 'E3', 'G3', 'C4'], bass: ['A2', 'E3', 'A3', 'E3'], sub: 'A1' },
      { pad: ['F2', 'C3', 'E3', 'A3'], bass: ['F2', 'C3', 'F3', 'C3'], sub: 'F1' },
      { pad: ['G2', 'D3', 'F3', 'B3'], bass: ['G2', 'D3', 'G3', 'D3'], sub: 'G1' },
    ];
    for (let n = 0; n * 4 * beat + A.warm < groove; n++) {
      const bar = bars[n % 4], at = A.warm + n * 4 * beat, to = Math.min(at + 4 * beat, groove);
      k.pad(bar.pad, at, to, { attack: 0.5, release: 0.8, vol: 0.058, from: 900, to: 2400, send: 0.5 });
      k.sub(bar.sub, at, Math.min(to - 0.2, groove), 0.04);
      for (let e = 0; e < 8; e++) {
        const t = at + (e * beat) / 2;
        if (t >= groove) break;
        if (t >= A.male && !quiet(t)) k.piano(bar.bass[e % 4], t, { vel: e % 2 ? 0.05 : 0.07, decay: 0.9, pan: -0.2, send: 0.3 });
        if (e % 2 && t >= A.male + 1.2 && !quiet(t)) k.tick(t, 0.018, 0.3);
        if (e % 4 === 0 && t >= A.female + 0.2 && !quiet(t)) k.kick(t, 0.2);
      }
    }
    // «أخصائي» / «أخصائية»: a note on each; the small things on the card: three rising notes
    k.piano('G4', A.male + 0.4, { vel: 0.1, decay: 2.4, pan: 0.2 });
    k.piano('C5', A.female + 0.4, { vel: 0.1, decay: 2.4, pan: 0.2 });
    ['C5', 'E5', 'G5'].forEach((n, i) => k.piano(n, A.c3 + [2.4, 3.2, 4.0][i] + 0.1, { vel: 0.1, decay: 3, pan: -0.15 + i * 0.15, send: 0.5 }));
    k.shimmer(A.c3 + 0.3, 0.03, 10, 0.8);
    // the first steps: the music opens
    k.riser(A.steps - 1.8, A.steps, 0.16);
    k.impact(A.steps, 0.22, 0);
    ['E5', 'G5', 'C6', 'E6'].forEach((n, i) => k.piano(n, A.steps + 0.2 + i * 0.28, { vel: 0.1 - i * 0.012, decay: 3, pan: -0.2 + i * 0.15 }));
    k.pad(['C3', 'G3', 'E4', 'G4', 'D5'], A.steps, A.c5, { attack: 0.9, release: 1.2, vol: 0.07, from: 1000, to: 4200, send: 0.55 });
    // what matters most: the held chord, a last phrase
    k.shimmer(A.c5 + 0.2, 0.045, 14, 1.0);
    ['G4', 'C5', 'E5', 'G5'].forEach((n, i) => k.piano(n, A.c5 + 0.3 + i * 0.22, { vel: 0.1, decay: 3.2, pan: 0.2 }));
    k.pad(['C3', 'G3', 'C4', 'E4', 'G4'], A.c5, END + 0.1, { attack: 1.0, release: 1.4, vol: 0.075, from: 1400, to: 3000, send: 0.55 });
    k.sub('C2', A.c5, END, 0.06);
    // the close: the bell, a rise, the home chord
    k.riser(END - 1.4, END + 0.2, 0.14);
    k.impact(END + 0.25, 0.45, 0);
    k.shimmer(END + 0.4, 0.045, 16, 1.0);
    ['G5', 'E5', 'C6'].forEach((n, i) => k.piano(n, END + 0.9 + i * 0.25, { vel: 0.06, decay: 2.4, pan: -0.2 + i * 0.2 }));
    return k.render();
  }

  function composeCues(pl) {
    const { A, segs, BELL2 } = pl;
    const c = [{ t: A.bell, sfx: 'doorbell' }, { t: A.warm, sfx: 'whoosh', gain: 0.4 }, { t: BELL2, sfx: 'doorbell' },
      { t: BELL2 + 0.75, sfx: 'tick', gain: 0.6 }, { t: BELL2 + 1.0, sfx: 'tick', gain: 0.6 }];
    segs.forEach((s) => {
      if (s.kind === 'card') {
        c.push({ t: s.t0 + 0.05, sfx: 'whoosh', gain: 0.3 });
        s.head.forEach((_, i) => c.push({ t: s.t0 + s.headAt[i], sfx: 'pen', gain: 0.5 }));
        (s.list || []).forEach((_, i) => c.push({ t: s.t0 + s.listAt[i], sfx: 'pen', gain: 0.45 }));
        if (s.small) c.push({ t: s.t0 + s.smallAt, sfx: 'pen', gain: 0.4 });
      } else {
        (s.caps || []).forEach(([from, , text]) => text.split('\n').forEach((_, i) => c.push({ t: s.t0 + from + i * 0.75, sfx: 'pen', gain: 0.28 })));
        (s.pills || []).forEach(([, , a]) => c.push({ t: s.t0 + a, sfx: 'pop', gain: 0.5 }));
      }
    });
    return c;
  }

  // --------------------------------------------------------------- writing
  /**
   * Text that is written: each line is revealed from its right end to its left by a
   * clip that follows a small pen, at a schedule given per line.
   */
  function writer(parent, ctx, text, cls, top, o = {}) {
    const blk = TX.text(parent, text, `col centered ${cls}`, { top });
    if (o.lineHeight) blk.el.style.lineHeight = o.lineHeight;
    if (o.size) blk.el.style.fontSize = `${o.size}px`;
    blk.el.querySelectorAll('.line').forEach((ln) => { ln.style.whiteSpace = 'nowrap'; }); // a line is one line: it is measured and written as one
    if (o.shadow !== false) blk.el.style.textShadow = '0 3px 24px rgba(0,0,0,.65)';
    const sr = ctx.stage.getBoundingClientRect(), K = sr.width / ctx.w;
    const measure = () => [...blk.el.querySelectorAll('.line')].map((line) => {
      const ws = [...line.querySelectorAll('.word')].map((w) => w.getBoundingClientRect());
      const lr = line.getBoundingClientRect();
      const l = Math.min(...ws.map((r) => r.left)), r = Math.max(...ws.map((x) => x.right));
      const tp = Math.min(...ws.map((x) => x.top)), bt = Math.max(...ws.map((x) => x.bottom));
      return { line, l: (l - sr.left) / K, r: (r - sr.left) / K, top: (tp - sr.top) / K, h: (bt - tp) / K, lineLeft: (lr.left - sr.left) / K };
    });
    let lines = measure();
    const widest = Math.max(...lines.map((x) => x.r - x.l));
    if (widest > 900) { // never wrap or crowd the safe zone: shrink the block to fit
      blk.el.style.fontSize = `${(parseFloat(getComputedStyle(blk.el).fontSize) * 900) / widest}px`;
      lines = measure();
    }
    const pens = lines.map(() => {
      const pn = el('div', 'abs', parent);
      px(pn, { width: 7, borderRadius: 4, background: WHITE, boxShadow: '0 0 22px 6px rgba(255,254,255,.55)', display: 'none' });
      return pn;
    });
    return {
      el: blk.el, lines,
      hide() { lines.forEach((L) => { L.line.style.clipPath = 'inset(0 0 0 100%)'; }); pens.forEach((pn) => { pn.style.display = 'none'; }); },
      /** sched: [{ at, dur }] per line, in seconds on the film's clock. */
      render(t, sched) {
        lines.forEach((L, i) => {
          const s = sched[i];
          const f = clamp((t - s.at) / s.dur);
          const lead = L.r + 4 - E.inOutSine(f) * (L.r - L.l + 8);
          if (f <= 0) L.line.style.clipPath = 'inset(0 0 0 100%)';
          else if (f >= 1) L.line.style.clipPath = 'none';
          else L.line.style.clipPath = `inset(-60px 0 -60px ${(lead - L.lineLeft).toFixed(1)}px)`;
          const on = f > 0 && f < 1;
          pens[i].style.display = on ? '' : 'none';
          if (on) px(pens[i], { left: lead - 3.5, top: L.top + L.h * 0.08, height: L.h * 0.84 });
        });
      },
    };
  }

  /** A hand-drawn line under a written line, drawn right to left in the brand blue. */
  function underline(parent, L, y) {
    const w = L.r - L.l;
    const R = L.r - w * 0.04, Lf = L.l + w * 0.04, yy = y + 10;
    const svg = TX.svg(parent, `<svg class="abs" style="left:0;top:0;overflow:visible" width="1080" height="1920" viewBox="0 0 1080 1920">
      <path d="M${R} ${yy} C ${R - w * 0.28} ${yy + 10}, ${R - w * 0.55} ${yy - 8}, ${Lf} ${yy + 3}" fill="none" stroke="${BLUE}" stroke-width="7" stroke-linecap="round"/></svg>`);
    const path = svg.querySelector('path');
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    return { render(t, at, dur) { const f = E.outCubic(clamp((t - at) / dur)); path.style.strokeDashoffset = `${(len * (1 - f)).toFixed(1)}`; svg.style.display = f <= 0 ? 'none' : ''; } };
  }

  // -------------------------------------------------------------- template
  TX.register('physio-film', {
    size: [1080, 1920],
    fps: 30,
    build(stage, P, ctx) {
      ctx.stage = stage;
      const W = ctx.w;
      const photos = P.photos || {};
      const pl = plan(photos);
      const { segs, END, TOTAL, BELL2 } = pl;
      const field = TX.field(stage);

      // the layers: one per segment, stacked in order
      const backs = [];
      const layers = segs.map((s) => {
        const layer = el('div', 'layer', stage);
        px(layer, { overflow: 'hidden', background: '#10102E' });
        const o = { s, layer };
        if (s.kind === 'shot') {
          const img = el('img', '', layer);
          if (photos[s.id]) img.src = photos[s.id];
          px(img, { position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: `${s.at[0]}% ${s.at[1]}%`, display: photos[s.id] ? 'block' : 'none' });
          o.img = img; o.tint = el('div', 'layer', layer);
        } else {
          // a soft, dark, blurred version of a nearby photograph: the card sits in the film
          const cv = el('canvas', 'abs', layer);
          cv.width = 216; cv.height = 384;
          px(cv, { left: 0, top: 0, width: 1080, height: 1920 });
          backs.push({ cv, bg: s.bg });
          const wash = el('div', 'layer', layer);
          px(wash, { background: s.grade ? 'radial-gradient(110% 80% at 50% 45%, rgba(20,16,44,.40) 0%, rgba(10,10,40,.80) 100%), rgba(120,60,30,.10)' : 'radial-gradient(110% 80% at 50% 45%, rgba(16,16,52,.55) 0%, rgba(10,10,40,.86) 100%), rgba(20,40,100,.18)' });
          const top = s.top || 740;
          const head = writer(layer, ctx, s.head.join('\n'), 't-hook-s', top, { size: s.size });
          o.head = head;
          const last = head.lines[head.lines.length - 1];
          o.under = underline(layer, last, last.top + last.h);
          if (s.list) {
            const list = writer(layer, ctx, s.list.join('\n'), 't-sub', top + 400, { lineHeight: '1.95', size: 62 });
            o.list = list;
            o.dots = list.lines.map((L) => { const d = el('div', 'abs', layer); px(d, { width: 18, height: 18, borderRadius: '50%', background: BLUE, left: L.r + 28, top: L.top + L.h / 2 - 9, display: 'none' }); return d; });
          }
          if (s.small) o.small = writer(layer, ctx, s.small, 't-sub dim', top + 350, { size: 52 });
        }
        return o;
      });

      // light over the shots: a vignette, the top where the tab sits, the bottom where the captions sit
      const shade = el('div', 'layer', stage);
      px(shade, { background: 'radial-gradient(120% 90% at 50% 45%, rgba(10,10,40,0) 55%, rgba(10,10,40,.5) 100%), linear-gradient(to bottom, rgba(10,10,40,.55) 0px, rgba(10,10,40,0) 340px), linear-gradient(to top, rgba(10,10,40,.82) 0px, rgba(10,10,40,.55) 520px, rgba(10,10,40,0) 900px)' });
      const bellRings = TX.C.rings(stage, 2);

      // captions and pills on the shots
      const caps = [], pills = [];
      segs.forEach((s) => {
        if (s.kind !== 'shot') return;
        (s.caps || []).forEach(([from, to, text, top, cls]) => {
          const w = writer(stage, ctx, text, cls, top);
          caps.push({ w, a: s.t0 + from, b: s.t0 + to, n: text.split('\n').length });
        });
        (s.pills || []).forEach(([text, icon, a, b]) => {
          const e = el('div', 'pill', stage);
          TX.svg(e, TX.icon(icon, BLUE));
          el('span', '', e, text);
          px(e, { top: 1400, left: (W - 330) / 2, width: 330, justifyContent: 'center' });
          pills.push({ e, a: s.t0 + a, b: s.t0 + b });
        });
      });

      // logo and tag on the two physiotherapists at the door (only when that scene exists)
      const lockup = el('div', 'abs', stage);
      px(lockup, { left: 0, width: W, top: 1200, textAlign: 'center' });
      (() => {
        const [fx, fy] = [TX.logo.wordBox[0], TX.logo.figureBox[1]];
        const w = TX.logo.wordBox[2], h = TX.logo.wordBox[1] + TX.logo.wordBox[3] - fy;
        const paths = TX.logo.order.map((k) => `<path d="${TX.logo.parts[k].d}" fill="${TX.logo.parts[k].color === '#181943' ? WHITE : TX.logo.parts[k].color}"/>`).join('');
        TX.svg(lockup, `<svg viewBox="${fx} ${fy} ${w} ${h}" width="150" height="${(150 * h) / w}">${paths}</svg>`);
      })();
      const tag = TX.text(stage, 'علاج طبيعي بالبيت', 'col centered t-sub', { top: 1385 });
      tag.el.style.textShadow = '0 3px 24px rgba(0,0,0,.65)';

      // end card
      const endLayer = el('div', 'layer', stage);
      px(endLayer, { background: '#181943' });
      TX.field(endLayer).render(3);
      const rings = TX.C.rings(stage, 2);
      const hero = { w: 292, h: 340, r: 76, cx: W / 2, cy: 640, at: END, dur: 1.0 };
      const cta1 = TX.text(stage, 'اكتب *«علاج طبيعي»*', 'col centered t-hook-s', { top: 900 });
      const cta2 = TX.text(stage, 'على الواتس اب', 'col centered t-hook-s', { top: 1010 });
      const num = el('div', 'abs', stage, P.phone || '07802610170');
      px(num, { left: 0, width: W, top: 1150, textAlign: 'center', direction: 'ltr', fontSize: 84, fontWeight: '900', letterSpacing: '0.02em' });
      const close = TX.text(stage, 'لا تصدگنا. شوف بعينك.', 'col centered t-sub dim', { top: 1290 });
      const foot = TX.text(stage, 'النتائج تختلف من شخص لشخص.', 'col centered t-strip dim', { top: 1420 });
      const strip = TX.C.strip(stage, ctx, ctx.brand.trustStrip);
      const tab = TX.C.tab(stage, ctx); // above the end card, with the rings behind it
      stage.insertBefore(rings.el, tab.el);

      const warm = (g) => `saturate(${lerp(0.5, 1.08, g).toFixed(3)}) brightness(${lerp(0.86, 1.02, g).toFixed(3)}) contrast(${lerp(1.06, 1.02, g).toFixed(3)})`;
      const tintColor = (g) => (g < 0.5 ? `rgba(24,44,110,${(0.30 * (1 - g * 2) + 0.05).toFixed(3)})` : `rgba(255,168,84,${(0.10 * (g * 2 - 1) + 0.02).toFixed(3)})`);

      // draw the blurred backdrops once the photographs are decoded
      const ready = Promise.all(backs.map(async ({ cv, bg }) => {
        if (!photos[bg]) return;
        const img = new Image();
        img.src = photos[bg];
        await img.decode();
        const g = cv.getContext('2d');
        g.filter = 'blur(7px)';
        g.drawImage(img, -14, -14, 244, 412);
      }));

      return {
        ready,
        duration: TOTAL,
        cues: composeCues(pl),
        score: () => composeScore(pl),
        cover: pl.A.warm + 2.1,
        render(t) {
          field.render(t);
          const ending = t >= END - 0.05;
          let cur = -1;
          // segments: stacked, each fading in (the doorbell cuts in at once)
          layers.forEach((o, i) => {
            const { s } = o;
            const next = segs[i + 1];
            const nextFull = next ? next.t0 + (next.cut ? 0.02 : FADE) : TOTAL + 1;
            const on = t >= s.t0 - 0.001 && t < nextFull && !ending;
            o.layer.style.display = on ? '' : 'none';
            if (t >= s.t0 && t < s.t1) cur = i;
            if (!on) return;
            o.layer.style.opacity = (s.cut ? 1 : clamp((t - s.t0) / FADE)).toFixed(3);
            if (s.kind === 'shot') {
              const k = clamp((t - s.t0) / s.dur);
              const z = lerp(s.zoom[0], s.zoom[1], E.inOutSine(k));
              const x = lerp(s.pan[0], s.pan[2], E.inOutSine(k)), y = lerp(s.pan[1], s.pan[3], E.inOutSine(k));
              o.img.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${z.toFixed(4)})`;
              const g = Array.isArray(s.grade) ? lerp(s.grade[0], s.grade[1], k) : s.grade;
              o.img.style.filter = warm(g);
              o.tint.style.background = tintColor(g);
            } else {
              o.head.render(t, s.head.map((_, j) => ({ at: s.t0 + s.headAt[j], dur: LINE_DUR })));
              o.under.render(t, s.t0 + s.headAt[s.head.length - 1] + LINE_DUR + 0.05, 0.55);
              if (o.list) {
                o.list.render(t, s.list.map((_, j) => ({ at: s.t0 + s.listAt[j], dur: LINE_DUR * 0.8 })));
                o.dots.forEach((d, j) => { d.style.display = t > s.t0 + s.listAt[j] + 0.15 ? '' : 'none'; });
              }
              if (o.small) o.small.render(t, [{ at: s.t0 + s.smallAt, dur: LINE_DUR }]);
            }
          });
          // the shade is for photographs only
          const onCard = cur >= 0 && segs[cur].kind === 'card';
          shade.style.display = ending || onCard ? 'none' : '';

          // the doorbell's rings, on the macro of the finger
          bellRings.el.style.display = ending ? 'none' : '';
          bellRings.render(t, [pl.A.bell + 0.05, pl.A.bell + 0.05 + ctx.bell.second], 675, 945, 40);

          // captions, written, then gone
          caps.forEach(({ w, a, b, n }) => {
            const on = t >= a - 0.01 && t < b + 0.4 && !ending;
            w.el.style.display = on ? '' : 'none';
            if (!on) { w.hide(); return; }
            w.render(t, Array.from({ length: n }, (_, i) => ({ at: a + i * 0.75, dur: LINE_DUR * 0.85 })));
            set(w.el, { o: 1 - p(t, b, 0.35, E.inCubic) });
          });
          pills.forEach(({ e, a, b }) => {
            const k = p(t, a, 0.45, E.outBack), ko = p(t, b - 0.2, 0.2, E.inCubic);
            set(e, { y: (1 - k) * 30, s: lerp(0.85, 1, k), o: Math.min(k, 1 - ko) * (ending ? 0 : 1) });
          });

          // logo and tag on the two physiotherapists at the door
          if (pl.tail) {
            const lk = p(t, pl.tail.t0 + 0.3, 0.7, E.outQuint), lo = p(t, END - 0.35, 0.3, E.inCubic);
            set(lockup, { y: (1 - lk) * 24, o: Math.min(lk, 1 - lo) });
            tag.el.style.display = ending ? 'none' : '';
            TX.animWords(tag.words, t, { at: pl.tail.t0 + 0.6, stagger: 0.09, dur: 0.5, y: 18, blur: 4, out: END - 0.35, outDur: 0.3 });
          } else { set(lockup, { o: 0 }); tag.el.style.display = 'none'; }

          // the tab, growing into the hero on the end card
          tab.render(t, 0.1, ending ? hero : null);

          // end card
          endLayer.style.display = ending ? '' : 'none';
          rings.render(t, ending ? [BELL2 + 0.02, BELL2 + 0.02 + ctx.bell.second] : [], hero.cx, hero.cy, 150);
          const e0 = BELL2 - 0.25;
          [cta1, cta2, close, foot].forEach((b) => { b.el.style.display = ending ? '' : 'none'; });
          num.style.display = ending ? '' : 'none';
          strip.el.style.display = ending ? '' : 'none';
          if (ending) {
            TX.animWords(cta1.words, t, { at: e0 + 0.5, stagger: 0.09, dur: 0.55, y: 36 });
            TX.animWords(cta2.words, t, { at: e0 + 0.7, stagger: 0.09, dur: 0.55, y: 36 });
            set(num, { y: (1 - p(t, e0 + 1.0, 0.6, E.outQuint)) * 24, o: p(t, e0 + 1.0, 0.4, E.linear) });
            TX.animWords(close.words, t, { at: e0 + 1.35, stagger: 0.08, dur: 0.5, y: 14, blur: 3 });
            TX.animWords(foot.words, t, { at: e0 + 1.6, stagger: 0.04, dur: 0.4, y: 8, blur: 2 });
            strip.render(t, e0 + 1.4);
          }
        },
      };
    },
  });
})();
