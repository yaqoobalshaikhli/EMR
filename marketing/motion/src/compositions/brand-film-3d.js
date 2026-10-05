/* TabeebX film in 3D — «شوف بعينك», 30.5 s, 1080×1920.
 *
 * Rendered in real 3D (three.js on WebGL): physically based materials, studio
 * reflections, soft shadows, bloom, film grain and vignette. No faces, no names.
 *   0.0–4.2   night. The glossy pink head of the logo rings like a doorbell.
 *   3.8–10.9  it settles beside a Baghdadi door; the door swings open onto warm
 *             light and drifting dust, and the camera walks through into it.
 *  10.9–19.8  a bright studio: the seven home services arrive as glossy navy
 *             cards, one piano note per card.
 *  19.3–22.8  the head comes back alone: «بس راحة بال.»
 *  22.8–30.5  the logo builds around it and casts its shadow; the doorbell rings.
 * Arabic type is HTML over the canvas so it keeps Cairo's shaping; the logo is
 * extruded from the traced vectors in src/logo.js, in the brand colours. The
 * score is composed below and rendered in the page (src/score.js). */
import * as THREE from 'three';
import { W, H, track, radial, buildLogo, buildDoor, makeRenderer, makePost, makeStudio, logoRig, makeCards } from '../three-kit.js';

const TX = window.TX;
const { E, p, env, lerp, clamp, el, set } = TX;
const S = 0.01; // traced SVG units → scene units
const NAVY = '#181943';
const T = { cut: 10.9, lock: 26.3, total: 30.5 };

/** A soft cone of light from the doorway toward the viewer. */
function buildBeam() {
  const geo = new THREE.ConeGeometry(2.6, 7, 64, 1, true);
  geo.translate(0, -3.5, 0); // apex at the origin
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uO: { value: 0 } },
    vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform float uO; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ float along = pow(vUv.y, 1.6); float edge = pow(abs(dot(vN, vV)), 2.0);
        gl_FragColor = vec4(vec3(1.0, 0.86, 0.66) * along * edge * uO * 0.5, 1.0); }`,
  });
  const beam = new THREE.Mesh(geo, mat);
  beam.rotation.x = -Math.PI / 2 + 0.12; // opens toward the viewer, dipping to the floor
  beam.position.set(0, 2.1, -0.4);
  return beam;
}

function buildDust(n) {
  const rng = TX.rng(11);
  const seeds = Array.from({ length: n }, () => [rng() * 2.4 - 1.2, rng(), rng() * 2.6 - 0.8, 0.06 + rng() * 0.12, rng() * 6.28]);
  const pos = new Float32Array(n * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ size: 0.028, map: radial('rgba(255,244,225,1)', 'rgba(255,244,225,0)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(1.6, 1.4, 1.1) });
  const pts = new THREE.Points(geo, mat);
  return {
    pts, mat,
    update(t) {
      seeds.forEach((s, i) => {
        const u = (s[1] + t * s[3] * 0.25) % 1;
        pos[i * 3] = s[0] + Math.sin(t * 0.6 + s[4]) * 0.05;
        pos[i * 3 + 1] = 0.1 + u * 3.6;
        pos[i * 3 + 2] = s[2];
      });
      geo.attributes.position.needsUpdate = true;
    },
  };
}

// ------------------------------------------------------------------ score
/* Night in A minor, home in C major, on the film's own clock (src/score.js).
 * The renderer mixes the doorbell (E5 → C5) on top, so the score keeps the
 * fifth octave clear when it rings and quotes it once, on the piano, under
 * «بس راحة بال.». */
function composeScore() {
  const k = TX.score.kit(T.total);
  // Night: a dark bed and a heartbeat that quickens while the head floats to the bell.
  k.air(0, 6.6, 0.035, 450);
  k.pad(['A2', 'E3', 'G3', 'C4', 'E4'], 0.3, 4.2, { attack: 2.6, release: 1.8, vol: 0.06, from: 240, to: 650 });
  k.pad(['F2', 'C3', 'A3', 'E4'], 4.0, 6.3, { attack: 1.6, release: 1.2, vol: 0.065, from: 450, to: 1300 });
  k.sub('A1', 0.6, 4.2, 0.05);
  k.sub('F1', 4.2, 6.3, 0.055);
  for (let t = 1.7; t < 6.0; t += lerp(1.0, 0.78, clamp((t - 1.7) / 4.5))) k.heart(t, 0.36);
  k.riser(4.7, 6.4, 0.16);
  // The door opens (6.4) onto warm light and C major; the piano answers «طبيبك.».
  k.impact(6.4, 0.34, 0);
  k.shimmer(6.45, 0.04, 14, 1.0);
  k.pad(['C3', 'G3', 'E4', 'G4', 'D5'], 6.35, 10.9, { attack: 1.0, release: 0.8, vol: 0.07, from: 700, to: 4200 });
  k.sub('C2', 6.4, 10.4, 0.06);
  ['G4', 'C5', 'E5'].forEach((n, i) => k.piano(n, 7.2 + i * 0.16, { vel: 0.15 - i * 0.015, decay: 3.2 }));
  // Through the doorway, into the white.
  k.riser(9.1, T.cut, 0.24);
  k.whoosh(10.1, 1.2, 0.14);
  // The white: a soft landing and an open C chord on the piano.
  k.impact(T.cut, 0.22, 0);
  k.shimmer(T.cut, 0.05, 18, 0.9);
  ['C3', 'G3', 'E4', 'C5'].forEach((n, i) => k.piano(n, T.cut + i * 0.07, { vel: 0.11, decay: 3.5 }));
  // The studio: a pulse on the beat of the arriving cards, one rising note per card.
  const beat = 0.62, b0 = 11.9, stop = 18.45;
  [
    { pad: ['C4', 'G4', 'D5', 'E5'], bass: ['C3', 'G3', 'C4', 'G3'], sub: 'C2' },
    { pad: ['A3', 'E4', 'G4', 'C5'], bass: ['A2', 'E3', 'A3', 'E3'], sub: 'A1' },
    { pad: ['F3', 'C4', 'E4', 'A4'], bass: ['F2', 'C3', 'F3', 'C3'], sub: 'F1' },
  ].forEach((bar, i) => {
    const at = b0 + i * 4 * beat;
    k.pad(bar.pad, i ? at : T.cut, at + 4 * beat, { attack: i ? 0.5 : 0.35, release: 0.9, vol: 0.055, from: 1400, to: 2600, send: 0.5 });
    k.sub(bar.sub, at, at + 4 * beat - 0.3, 0.045);
    for (let e = 0; e < 8; e++) {
      const t = at + (e * beat) / 2;
      if (t >= stop) break;
      k.piano(bar.bass[e % 4], t, { vel: e % 2 ? 0.055 : 0.075, decay: 0.9, pan: -0.2, send: 0.3 });
      if (e % 2 && t > b0 + 4 * beat) k.tick(t, 0.02, 0.3);
      if (e % 4 === 0 && t >= b0 + 2 * beat) k.kick(t, 0.26);
    }
  });
  ['G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5'].forEach((n, i) => k.piano(n, b0 + i * beat, { vel: 0.19, decay: 3, pan: 0.2 }));
  k.whoosh(18.35, 0.9, 0.12, 0.5, -0.5);
  // A breath: the head comes back alone, and the piano plays the doorbell's two notes.
  k.pad(['F2', 'C3', 'A3', 'E4', 'G4'], 18.9, 22.6, { attack: 1.2, release: 1.4, vol: 0.075, from: 600, to: 1500 });
  k.sub('F1', 19.0, 22.5, 0.04);
  k.whoosh(19.25, 1.0, 0.08, 0, 0);
  k.piano('F3', 20.3, { vel: 0.08, decay: 4 });
  k.piano('E5', 20.3, { vel: 0.17, decay: 4 });
  k.piano('C5', 20.3 + 0.38, { vel: 0.155, decay: 4 });
  // The logo builds: G, suspended then resolved, a hit per part, a sparkle for the letters.
  k.pad(['G2', 'D3', 'G3', 'C4', 'D4'], 22.5, 25.0, { attack: 1.2, release: 0.6, vol: 0.07, from: 600, to: 1800 });
  k.pad(['G2', 'D3', 'G3', 'B3', 'D4'], 25.0, 26.25, { attack: 0.4, release: 0.1, vol: 0.08, from: 1800, to: 3200 });
  k.sub('G1', 22.7, 26.2, 0.055);
  [[23.1, -0.3], [23.45, 0.1], [23.8, -0.4], [23.9, 0.4]].forEach(([t, pan], i) => k.tom(t, 0.3 + i * 0.02, pan));
  k.whoosh(22.95, 1.1, 0.1);
  ['G5', 'A5', 'C6', 'D6', 'E6', 'G6', 'A6'].forEach((n, i) => k.piano(n, 25.1 + i * 0.06, { vel: 0.06, decay: 1.2, pan: -0.4 + i * 0.13 }));
  k.riser(24.3, T.lock, 0.22);
  // The lock: the logo lands with the doorbell and the film comes home to C.
  k.impact(T.lock, 0.8);
  k.pad(['C2', 'G2', 'C3', 'G3', 'D4', 'E4'], T.lock, 28.2, { attack: 0.25, release: 2.2, vol: 0.08, from: 900, to: 2400 });
  k.sub('C2', T.lock, 28.4, 0.07);
  k.shimmer(26.4, 0.045, 16, 1.1);
  return k.render();
}

// ---------------------------------------------------------------- template
TX.register('brand-film-3d', {
  size: [W, H],
  fps: 30,
  build(stage, P, ctx) {
    // Transparent mode (render.mjs --alpha) is for the logo build: the studio loses its
    // backdrop, floor and type, so the 3D logo floats over any footage.
    const alpha = !!TX.alpha;
    const { renderer, envTex } = makeRenderer(stage, { alpha });

    // ============================================ scene A: night, the door
    const A = new THREE.Scene();
    A.background = new THREE.Color('#0B0C26');
    A.fog = new THREE.Fog('#0B0C26', 9, 26);
    A.environment = envTex;
    A.environmentIntensity = 0.08;
    const camA = new THREE.PerspectiveCamera(40, W / H, 0.05, 80);
    A.add(new THREE.HemisphereLight('#3a3f8f', '#05061a', 0.2));
    const moon = new THREE.DirectionalLight('#a9bcff', 0.3); moon.position.set(-4, 7, 6); A.add(moon);
    // The key and rim only reach the disc (limited range), so the door stays in the dark.
    const keyA = new THREE.SpotLight('#ffffff', 110, 6.3, 0.38, 0.75, 2); keyA.position.set(-1.6, 4.4, 7.4); keyA.target.position.set(0, 2.05, 3.2); A.add(keyA, keyA.target);
    const rimA = new THREE.PointLight('#4db8ff', 9, 2.2, 2); rimA.position.set(0.95, 2.6, 2.35); A.add(rimA);
    const fillA = new THREE.PointLight('#fff4f6', 7, 4.6, 2); fillA.position.set(0.7, 2.3, 6.9); A.add(fillA);
    const roomLight = new THREE.PointLight('#ffd9a8', 0, 14, 2); roomLight.position.set(0, 2.3, -1.4); A.add(roomLight);
    const spot = new THREE.SpotLight('#ffe2b8', 0, 22, 0.62, 0.85, 2); spot.position.set(0, 3.5, -1.6); spot.target.position.set(0, 0, 3.6);
    A.add(spot, spot.target);
    const floorA = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: '#10112F', roughness: 0.34, metalness: 0.15 }));
    floorA.rotation.x = -Math.PI / 2; A.add(floorA);
    const door = buildDoor(); A.add(door.group);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(5, 6), new THREE.MeshBasicMaterial({ map: radial('rgba(255,226,180,1)', 'rgba(255,226,180,0)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
    pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.005, 2.1); A.add(pool);
    const beam = buildBeam(); A.add(beam);
    const dust = buildDust(260); A.add(dust.pts);
    const headA = buildLogo().parts.head; // the doorbell: the logo's own head
    headA.castShadow = false;
    A.add(headA);
    const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.8, 1.9), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const rings = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.008, 8, 160), ringMat.clone()); A.add(m); return m; });

    // ======================================== scene B: the bright studio
    const { scene: B, camera: camB, sweep } = makeStudio(envTex, { alpha });
    // The services: glossy navy cards that stack into depth as each one arrives.
    const { cards: tiles, ready: labelsDrawn } = makeCards(B, P.services);
    const rig = logoRig(B, sweep);
    const LP = rig.parts;

    // ============================================== post: bloom, AA, grain
    const { composer, renderPass, bloom, grain } = makePost(renderer, A, camA);

    // ============================================== type, over the canvas
    const layer = () => el('div', 'layer', stage);
    const masked = (parent, text, cls, pos) => TX.text(parent, text, `col centered mask ${cls}`, pos);
    const rise = (words, t, at, o = {}) => TX.animWords(words, t, { at, stagger: o.stagger == null ? 0.08 : o.stagger, dur: o.dur || 0.8, y: o.y || 140, blur: 0, ease: E.outExpo, out: o.out, outDur: 0.45, outY: o.y || 140 });
    const typeA = layer();
    const hook = masked(typeA, P.hook, 't-hook', { top: 1390 });
    const answer = masked(typeA, P.answer, 't-hook', { top: 330 });
    [hook, answer].forEach((b) => { b.el.style.textShadow = '0 4px 30px rgba(5,6,26,.6)'; });
    const typeB = layer();
    typeB.style.color = NAVY;
    const title = masked(typeB, P.title, 't-hook-s', { top: 300 });
    const where = masked(typeB, P.where, 't-sub', { top: 470 });
    where.el.style.color = 'rgba(24,25,67,.6)';
    const relief = masked(typeB, P.relief, 't-hook', { top: 330 });
    const tagline = masked(typeB, P.tagline, 't-hook-s', { top: 1300 });
    tagline.el.style.fontSize = '66px';
    const ritual = masked(typeB, ctx.brand.ritual, 't-sub', { top: 1400 });
    ritual.el.style.color = '#1B9CCE';
    const strip = TX.C.strip(stage, ctx, ctx.brand.trustStrip);
    strip.el.style.color = 'rgba(24,25,67,.55)';
    const white = layer();
    white.style.background = '#FFF9F0';

    const hits0 = [0.45, 0.45 + ctx.bell.second];
    const hitsL = [T.lock, T.lock + ctx.bell.second];
    let texturesDrawn = false;

    return {
      duration: T.total,
      cover: 28.6,
      cues: [{ t: hits0[0], sfx: 'doorbell' }, { t: T.lock, sfx: 'doorbell' }],
      bed: null,
      score: composeScore,
      ready: labelsDrawn.then(() => { texturesDrawn = true; }),
      render(t) {
        const inA = t < T.cut;
        renderPass.scene = inA ? A : B;
        renderPass.camera = inA ? camA : camB;
        grain.uniforms.uTime.value = Math.round(t * 30);

        if (inA) {
          // ---------------------------------------- the bell, the door
          const cp = track(t, [[0, [0.4, 2.12, 9.8]], [3.7, [0.05, 2.06, 9.2]], [6.3, [0.2, 2.45, 11.2]], [9.0, [0.0, 2.3, 9.4]], [10.9, [0.0, 1.95, -0.9]]]);
          const ct = track(t, [[0, [0, 2.0, 3.2]], [3.7, [0, 2.0, 3.2]], [6.3, [0, 2.15, 0]], [9.0, [0, 2.05, 0]], [10.9, [0, 1.9, -3]]]);
          camA.position.set(cp[0], cp[1], cp[2]);
          if (t > 9.0) {
            const k = E.inExpo(clamp((t - 9.0) / 1.9));
            camA.position.set(0, lerp(2.3, 1.95, k), lerp(9.4, -0.9, k));
          }
          camA.lookAt(ct[0], ct[1], ct[2]);

          // The head: close up in the dark, then the bell beside the door.
          const km = p(t, 3.9, 2.4, E.inOutCubic);
          headA.position.set(lerp(0, 1.78, km), lerp(2.02, 1.72, km), lerp(3.2, 0.1, km));
          const press = Math.max(0, 1 - Math.abs(t - hits0[0]) / 0.12) + Math.max(0, 1 - Math.abs(t - hits0[1]) / 0.12);
          const hs = lerp(1, 0.24, km) * (1 - 0.06 * Math.min(1, press)) * lerp(0.6, 1, p(t, 0, 0.6, E.outBack));
          headA.scale.set(S * hs, -S * hs, S * hs);
          headA.rotation.set((0.1 + 0.05 * Math.sin(t * 0.7)) * (1 - km), (1 - km) * (-0.55 + 0.12 * t), 0);
          rings.forEach((r, i) => {
            const hit = hits0[i >> 1], k = clamp((t - hit - (i % 2) * 0.16) / 1.4);
            r.position.copy(headA.position);
            r.lookAt(camA.position);
            r.scale.setScalar(0.55 + k * 1.8);
            r.material.opacity = k <= 0 || k >= 1 ? 0 : (1 - E.outQuad(k)) * 0.8;
          });
          keyA.intensity = 110 * (1 - 0.8 * km);
          rimA.intensity = 9 * (1 - km);
          fillA.intensity = 7 * (1 - km);

          // The door opens onto light.
          const ko = p(t, 6.4, 1.3, E.inOutCubic);
          door.leaves[0].rotation.y = 1.32 * ko;
          door.leaves[1].rotation.y = -1.32 * ko;
          door.leakMat.opacity = (0.75 + 0.25 * Math.sin(t * 4.3)) * (1 - p(t, 6.3, 0.5)) * p(t, 1.0, 1.2);
          roomLight.intensity = 8 * ko;
          spot.intensity = 40 * ko;
          pool.material.opacity = 0.3 * ko;
          beam.material.uniforms.uO.value = ko;
          dust.mat.opacity = ko;
          dust.update(t);
          const kin = p(t, 9.2, 1.7, E.inExpo);
          bloom.strength = 0.3 + 0.4 * ko + 1.9 * kin;
          bloom.radius = 0.4;
          bloom.enabled = true;
          renderer.toneMappingExposure = 1 + 1.4 * kin;
          grain.uniforms.uGrain.value = 0.034;
          grain.uniforms.uVig.value = 0.34;
        } else {
          // ---------------------------------------- the bright studio
          const cp = track(t, [[T.cut, [0.8, 2.3, 7.3]], [18.6, [-0.45, 2.45, 7.0]], [19.8, [0.35, 2.62, 4.4]], [22.6, [0.1, 2.58, 4.0]], [24.2, [1.3, 2.2, 5.8]], [26.4, [0, 1.62, 6.6]], [30.5, [0, 1.58, 6.15]]]);
          const ct = track(t, [[T.cut, [0, 2.45, -1.3]], [18.6, [0, 2.5, -1.4]], [19.8, [0.02, 2.45, 0]], [22.6, [0.02, 2.45, 0]], [24.2, [0, 2.0, 0]], [26.4, [0, 1.36, 0]], [30.5, [0, 1.34, 0]]]);
          camB.position.set(cp[0], cp[1], cp[2]);
          camB.lookAt(ct[0], ct[1], ct[2]);

          const arrive = (i) => 11.9 + i * 0.62;
          tiles.forEach((g) => {
            const i = g.userData.i, k = p(t, arrive(i), 0.75, E.outExpo);
            // How far back this card has been pushed by the cards after it (smoothly).
            let d = 0;
            for (let j = i + 1; j < tiles.length; j++) d += p(t, arrive(j), 0.75, E.outExpo);
            const kx = p(t, 18.5 + (tiles.length - 1 - i) * 0.04, 0.8, E.inCubic);
            const bob = Math.sin(t * 1.1 + i) * 0.012;
            g.position.set(lerp(0.4, 0, k), lerp(0, 1.3, k) + d * 0.47 + bob + kx * 4.5, lerp(2.4, 0, k) - d * 0.5 - kx * 1.2);
            g.rotation.set(lerp(1.15, 0, k) - 0.03 * d - kx * 0.5, lerp(-0.3, 0, k) + 0.04 * Math.sin(t * 0.7 + i), 0);
            g.visible = k > 0 && kx < 1;
          });

          // The head comes back alone, then the logo builds around it.
          const home = LP.head.userData.home;
          const kd = p(t, 19.3, 1.4, E.outCubic);
          LP.head.visible = t >= 19.3;
          LP.head.position.set(home.x, lerp(home.y + 7, home.y, kd) + Math.sin(t * 1.3) * 0.02 * (1 - p(t, 23, 1)), home.z);
          LP.head.rotation.set(0.12 * (1 - p(t, 23, 2)), (1 - kd) * 4.2 + (0.42 * Math.sin(t * 0.7 - 1.2)) * (1 - p(t, 23, 2.2, E.inOutCubic)), 0);
          rig.assemble(t, 23.1);
          bloom.strength = 1.8 * (1 - p(t, T.cut, 0.9, E.outCubic));
          bloom.enabled = bloom.strength > 0.002; // skip the pass once the studio is clean
          renderer.toneMappingExposure = 1 + 1.4 * (1 - p(t, T.cut, 0.9, E.outCubic));
          grain.uniforms.uGrain.value = alpha ? 0 : 0.02;
          grain.uniforms.uVig.value = alpha ? 0 : 0.12;
        }
        if (texturesDrawn) composer.render();

        // --------------------------------------------------- type + flash
        typeA.style.display = inA ? '' : 'none';
        typeB.style.display = inA || alpha ? 'none' : '';
        if (inA) {
          rise(hook.words, t, 1.3, { stagger: 0.14, out: 3.7 });
          rise(answer.words, t, 7.2, { out: 9.1 });
        } else {
          rise(title.words, t, 11.6, { stagger: 0.09, out: 18.5 });
          rise(where.words, t, 20.9, { y: 90, out: 22.7 });
          rise(relief.words, t, 20.3, { stagger: 0.12, out: 22.7 });
          rise(tagline.words, t, 27.0, { stagger: 0.1 });
          rise(ritual.words, t, 27.6, { y: 90 });
        }
        strip.render(t, 28.0);
        if (alpha) strip.el.style.display = 'none';
        set(white, { o: env(t, 10.2, 0.7, 10.95, 0.9, E.inCubic, E.outCubic) });
      },
    };
  },
});
