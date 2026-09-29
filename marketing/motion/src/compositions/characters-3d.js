/* The TabeebX cast, as a choice sheet: 1080×1920 stills.
 *   page 1   the three men, numbered, on pedestals in the studio
 *   page 2   the three women
 *   page 3+  one card each: the character in a 3/4 view, name, role, a line on who they are
 * The people are built in src/characters.js; their names and copy are the job's params. */
import * as THREE from 'three';
import { W, H, V, glossy, mesh, radial, makeRenderer, makePost, makeStudio } from '../three-kit.js';
import { ROSTER, buildCharacter } from '../characters.js';

const TX = window.TX;
const { el, px } = TX;
const NAVY = '#181943', PINK = '#EE396B', BLUE = '#1B9CCE';

function pedestal(parent, x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
  const top = mesh(new THREE.CylinderGeometry(0.38, 0.41, 0.1, 72), glossy('#FFFFFF', { roughness: 0.25 }), g, [0, 0.05, 0]);
  top.receiveShadow = true; top.castShadow = true;
  const ring = mesh(new THREE.TorusGeometry(0.38, 0.011, 10, 120), glossy(PINK, { roughness: 0.3 }), g, [0, 0.1, 0]);
  ring.rotation.x = Math.PI / 2;
  return g;
}

TX.register('characters-3d', {
  size: [W, H],
  kind: 'still',
  build(stage, P, ctx) {
    const { renderer, envTex } = makeRenderer(stage);
    const { scene, camera } = makeStudio(envTex);
    const rim = new THREE.DirectionalLight('#d6e9ff', 1.6); rim.position.set(3, 4, -5); scene.add(rim);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: radial('rgba(27,156,206,0.16)', 'rgba(27,156,206,0)'), depthWrite: false, fog: false }));
    scene.add(halo);
    const { composer, bloom, grain } = makePost(renderer, scene, camera);
    bloom.strength = 0.12;
    grain.uniforms.uGrain.value = 0.018;
    grain.uniforms.uVig.value = 0.1;

    // Every character twice: once in the group line-up, once alone.
    const people = P.cast.map((c) => ({ ...c, spec: ROSTER[c.key] }));
    const groups = ['m', 'f'].map((sex) => {
      const g = new THREE.Group(); scene.add(g);
      const who = people.filter((c) => c.spec.sex === sex);
      const slots = who.map((c, i) => {
        const x = (i - 1) * 1.08, z = i === 1 ? 0.3 : 0;
        pedestal(g, x, z);
        const ch = buildCharacter(c.spec);
        ch.group.position.set(x, 0.1, z);
        ch.group.rotation.y = (c.spec.turn || 0) * 0.5 - x * 0.12;
        g.add(ch.group);
        return { c, at: V(x, 0.05, z + 0.45), n: i + 1 };
      });
      return { g, sex, slots };
    });
    const solos = people.map((c) => {
      const g = new THREE.Group(); scene.add(g);
      pedestal(g, 0, 0);
      const ch = buildCharacter(c.spec);
      ch.group.position.y = 0.1;
      ch.group.rotation.y = c.spec.turn || 0;
      g.add(ch.group);
      return { g, c };
    });

    // ------------------------------------------------------------ type
    const layer = () => el('div', 'layer', stage);
    const text = (parent, s, cls, pos, style = {}) => { const b = TX.text(parent, s, `col centered ${cls}`, pos); Object.assign(b.el.style, { color: NAVY, ...style }); return b; };
    const tab = TX.C.tab(stage, ctx);
    tab.render(1, 0);
    const pages = [];
    for (const grp of groups) {
      const L = layer();
      text(L, P.title, 't-hook-s', { top: 450 });
      text(L, grp.sex === 'm' ? P.men : P.women, 't-sub', { top: 565 }, { color: BLUE });
      const labels = grp.slots.map((s) => {
        const box = el('div', 'abs', L);
        Object.assign(box.style, { width: '330px', textAlign: 'center', color: NAVY });
        box.innerHTML = `<div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:50%;background:${PINK};color:#fff;font:700 38px Cairo">${TX.ar(s.n)}</div>`
          + `<div style="font:700 60px/1.25 Cairo;margin-top:14px">${s.c.name}</div>`
          + `<div style="font:500 30px/1.3 Cairo;color:${PINK}">${s.c.role}</div>`;
        return { box, s };
      });
      pages.push({ L, obj: grp.g, kind: 'group', labels });
    }
    for (const solo of solos) {
      const L = layer(), c = solo.c;
      const chip = el('div', 'pill', L);
      px(chip, { top: ctx.L.pill.top, left: ctx.L.pill.left });
      Object.assign(chip.style, { background: NAVY, color: '#FFFEFF' });
      chip.textContent = c.chip;
      text(L, c.name, 't-hook', { top: 1330 });
      text(L, c.latin, '', { top: 1470 }, { font: '500 34px/1.2 Cairo', letterSpacing: '0.18em', color: BLUE, direction: 'ltr' });
      text(L, c.role, 't-sub', { top: 1530 }, { color: PINK });
      text(L, c.about, 't-body', { top: 1620 }, { color: 'rgba(24,25,67,.78)' });
      pages.push({ L, obj: solo.g, kind: 'solo' });
    }

    const project = (v) => { const q = v.clone().project(camera); return { x: (q.x + 1) / 2 * W, y: (1 - q.y) / 2 * H }; };
    return {
      pages: pages.length,
      render(i) {
        const pg = pages[Math.round(i)];
        pages.forEach((q) => { q.L.style.display = q === pg ? '' : 'none'; q.obj.visible = q === pg; });
        if (pg.kind === 'group') {
          camera.position.set(0, 1.6, 7.8);
          camera.lookAt(0, 1.3, 0);
          halo.position.set(0, 1.2, -3); halo.scale.set(9, 9, 1);
        } else {
          camera.position.set(0, 1.3, 5.9);
          camera.lookAt(0, 0.76, 0);
          halo.position.set(0, 1.1, -2.5); halo.scale.set(6, 6, 1);
        }
        camera.updateMatrixWorld();
        if (pg.labels) pg.labels.forEach(({ box, s }) => { const q = project(s.at); px(box, { left: q.x - 165, top: q.y + 20 }); });
        composer.render();
      },
    };
  },
});
