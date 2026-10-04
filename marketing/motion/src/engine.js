/* TabeebX motion engine.
 *
 * Every template builds its DOM once and then exposes render(t): a pure
 * function of time that writes every animated property on every frame.
 * No CSS transitions, no timers, so the renderer can step frame by frame
 * and the same input always produces the same video.
 */
(function () {
  'use strict';
  const TX = (window.TX = window.TX || {});
  TX.templates = {};
  TX.register = (id, def) => { TX.templates[id] = def; };

  // ---------------------------------------------------------------- math
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const E = {
    linear: (t) => t,
    inQuad: (t) => t * t,
    outQuad: (t) => 1 - (1 - t) * (1 - t),
    inCubic: (t) => t * t * t,
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outQuart: (t) => 1 - Math.pow(1 - t, 4),
    outQuint: (t) => 1 - Math.pow(1 - t, 5),
    inOutQuint: (t) => (t < 0.5 ? 16 * Math.pow(t, 5) : 1 - Math.pow(-2 * t + 2, 5) / 2),
    outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inExpo: (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
    inOutExpo: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
    outBack: (t) => { const s = 1.45; return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); },
    inBack: (t) => { const s = 1.45; return (s + 1) * t * t * t - s * t * t; },
    inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    outSine: (t) => Math.sin((t * Math.PI) / 2),
    inSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
    // Damped settle: overshoots gently, rests at 1.
    spring: (t) => (t >= 1 ? 1 : 1 - Math.exp(-6 * t) * Math.cos(10.5 * t)),
    // Softer settle (~6% overshoot) for heavier things, like a card on a lanyard.
    soft: (t) => (t >= 1 ? 1 : 1 - Math.exp(-7 * t) * Math.cos(8 * t)),
  };
  TX.clamp = clamp;
  TX.lerp = lerp;
  TX.E = E;

  /** Eased progress of t through [start, start + dur]. */
  TX.p = (t, start, dur, ease = E.outCubic) => ease(clamp((t - start) / Math.max(dur, 1e-6)));
  /** In/out envelope: rises over [a, a+ai], falls over [b, b+bo]. */
  TX.env = (t, a, ai, b, bo, ei = E.outCubic, eo = E.inCubic) =>
    Math.min(TX.p(t, a, ai, ei), 1 - TX.p(t, b, bo, eo));

  /** Deterministic PRNG (mulberry32). */
  TX.rng = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
  /** Arabic-Indic numerals for Arabic copy (Design guideline → Typography). */
  TX.ar = (s) => String(s).replace(/[0-9]/g, (d) => AR_DIGITS[+d]);

  // ----------------------------------------------------------------- DOM
  TX.el = (tag, cls, parent, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  };
  TX.svg = (parent, markup, cls) => {
    const holder = document.createElement('div');
    holder.innerHTML = markup.trim();
    const node = holder.firstElementChild;
    if (cls) node.setAttribute('class', cls);
    parent.appendChild(node);
    return node;
  };
  TX.px = (e, props) => {
    for (const k in props) e.style[k] = typeof props[k] === 'number' ? props[k] + 'px' : props[k];
    return e;
  };

  /** Write transform, opacity and blur in one go; every frame writes all three. */
  TX.set = (e, s) => {
    const x = s.x || 0, y = s.y || 0, r = s.r || 0;
    const sc = s.s == null ? 1 : s.s;
    const sx = (s.sx == null ? 1 : s.sx) * sc;
    const sy = (s.sy == null ? 1 : s.sy) * sc;
    e.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${r.toFixed(3)}deg) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
    const o = s.o == null ? 1 : clamp(s.o);
    e.style.opacity = o.toFixed(4);
    // '' (not 'visible') so a hidden parent still hides its children.
    e.style.visibility = o <= 0.001 ? 'hidden' : '';
    e.style.filter = s.blur > 0.05 ? `blur(${s.blur.toFixed(2)}px)` : 'none';
  };

  /**
   * Split copy into word spans. Markup: *pink words*, ~blue words~, "\n" for
   * a line break. Words never split into letters: Arabic letters must stay
   * joined, so motion happens word by word.
   */
  function parseLine(line) {
    const segs = [];
    const re = /(\*[^*]+\*|~[^~]+~)/g;
    let last = 0, m;
    while ((m = re.exec(line))) {
      if (m.index > last) segs.push({ t: line.slice(last, m.index), cls: '' });
      segs.push({ t: m[0].slice(1, -1), cls: m[0][0] === '*' ? 'pink' : 'blue' });
      last = m.index + m[0].length;
    }
    if (last < line.length) segs.push({ t: line.slice(last), cls: '' });
    const words = [];
    let cur = [];
    for (const seg of segs) {
      for (const part of seg.t.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) { if (cur.length) { words.push(cur); cur = []; } continue; }
        cur.push({ t: part, cls: seg.cls });
      }
    }
    if (cur.length) words.push(cur);
    return words;
  }
  TX.words = (parent, text) => {
    const out = [];
    String(text).split('\n').forEach((line) => {
      const lineEl = TX.el('span', 'line', parent);
      parseLine(line).forEach((frags, i) => {
        if (i) lineEl.appendChild(document.createTextNode(' '));
        const w = TX.el('span', 'word', lineEl);
        for (const f of frags) {
          // A trailing "..." becomes three dots that keep pulsing: the open loop.
          const m = /^(.*?)(\.\.\.|…)$/.exec(f.t);
          const body = m ? m[1] : f.t;
          const host = f.cls ? TX.el('span', f.cls, w) : w;
          if (body) host.appendChild(document.createTextNode(body));
          if (m) {
            const d = TX.el('span', 'dots', host);
            for (let j = 0; j < 3; j++) TX.el('i', '', d, '.');
          }
        }
        out.push(w);
      });
    });
    return out;
  };
  /** Pulse every "..." inside root after `at`: a wait the viewer can feel. */
  TX.animDots = (root, t, at) => {
    root.querySelectorAll('.dots').forEach((d) => {
      d.querySelectorAll('i').forEach((dot, j) => {
        const k = TX.clamp((t - at) / 0.4);
        const wave = 0.5 + 0.5 * Math.sin((t - at) * Math.PI * 2 * 0.9 - j * 0.95);
        dot.style.opacity = (k * (0.3 + 0.7 * wave)).toFixed(3);
      });
    });
  };

  /** Plain text without markup, for linting and captions. */
  TX.plain = (text) => String(text).replace(/[*~]/g, '');

  /** A positioned text block. Returns { el, words }. */
  TX.text = (parent, text, cls, pos) => {
    const el = TX.el('div', cls, parent);
    if (pos) TX.px(el, pos);
    const words = TX.words(el, text);
    return { el, words };
  };

  /**
   * Word-by-word entrance (and optional exit) in reading order, which is
   * right to left on screen. opts: at, stagger, dur, y, blur, out, outDur, outY.
   */
  TX.animWords = (words, t, o) => {
    const at = o.at || 0, st = o.stagger == null ? 0.07 : o.stagger, dur = o.dur || 0.55;
    const y = o.y == null ? 34 : o.y, blur = o.blur == null ? 8 : o.blur;
    const ease = o.ease || E.outCubic;
    words.forEach((w, i) => {
      const k = TX.p(t, at + i * st, dur, ease);
      let kOut = 0;
      if (o.out != null) kOut = TX.p(t, o.out + (o.outStagger || 0) * i, o.outDur || 0.35, E.inCubic);
      TX.set(w, {
        y: (1 - k) * y - kOut * (o.outY == null ? 22 : o.outY),
        o: k * (1 - kOut),
        blur: (1 - k) * blur + kOut * 6,
        s: o.scaleFrom ? lerp(o.scaleFrom, 1, k) : 1,
      });
    });
  };

  /** Ambient navy field: a slow drift of lighter navy keeps still moments alive. */
  TX.field = (stage, opts = {}) => {
    const e = TX.el('div', 'layer', stage);
    const light = !!opts.light;
    return {
      el: e,
      render(t) {
        // Transparent renders (render --alpha) keep only what's drawn on top of the field.
        if (TX.alpha) { e.style.background = 'none'; return; }
        const x = 50 + 22 * Math.sin(t * 0.19 + 0.6);
        const y = 34 + 12 * Math.cos(t * 0.15);
        e.style.background = light
          ? `radial-gradient(80% 55% at ${x.toFixed(2)}% ${y.toFixed(2)}%, rgba(27,156,206,.07) 0%, rgba(255,254,255,0) 70%), #FFFEFF`
          : `radial-gradient(85% 55% at ${x.toFixed(2)}% ${y.toFixed(2)}%, rgba(52,55,128,.62) 0%, rgba(24,25,67,0) 72%), #181943`;
      },
    };
  };

  /** Diagonal "draft" stamp so unfinished renders can't be mistaken for final posts. */
  TX.watermark = (stage, text) => {
    const w = TX.el('div', 'watermark', stage);
    TX.el('span', '', w, text);
    return w;
  };
})();
