/* The TabeebX cast, as a choice sheet: 1080×1920 stills.
 *   page 1   the three men, numbered, on pedestals in the studio
 *   page 2   the three women
 *   page 3+  one portrait card each: the person in a 3/4 view, name, role, a line on who they are
 * The people come from src/cast.js (Rocketbox avatars dressed for TabeebX), each
 * loaded once and moved from page to page; their names and copy are the job's params. */
import * as THREE from 'three';
import { W, H, V, glossy, mesh, radial, makeRenderer, makePost, makeStudio } from '../three-kit.js';
import { loadPerson } from '../cast.js';

const TX = window.TX;
const { el, px } = TX;
const NAVY = '#181943', PINK = '#EE396B', BLUE = '#1B9CCE';
const STUDIO = '#EFF0F5'; // the studio backdrop as it comes out of the post chain, for the fade under the portrait copy
const SPOTS = [[-0.84, 0], [0, -0.3], [0.84, 0]]; // x, z of the three pedestals

function pedestal(parent, x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
  const top = mesh(new THREE.CylinderGeometry(0.31, 0.34, 0.1, 72), glossy('#FFFFFF', { roughness: 0.25 }), g, [0, 0.05, 0]);
  top.receiveShadow = true; top.castShadow = true;
  const ring = mesh(new THREE.TorusGeometry(0.31, 0.009, 10, 120), glossy(PINK, { roughness: 0.3 }), g, [0, 0.1, 0]);
  ring.rotation.x = Math.PI / 2;
  return g;
}

TX.register('characters-3d', {
  size: [W, H],
  kind: 'still',
  build(stage, P, ctx) {
    const { renderer, envTex } = makeRenderer(stage);
    const { scene, camera } = makeStudio(envTex);
    const rim = new THREE.DirectionalLight('#d6e9ff', 1.4); rim.position.set(3, 4, -5); scene.add(rim);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: radial('rgba(27,156,206,0.14)', 'rgba(27,156,206,0)'), depthWrite: false, fog: false }));
    scene.add(halo);
    const { composer, bloom, grain } = makePost(renderer, scene, camera);
    bloom.strength = 0.08;
    grain.uniforms.uGrain.value = 0.016;
    const pedestals = new THREE.Group(); scene.add(pedestals);
    for (const [x, z] of SPOTS) pedestal(pedestals, x, z);

    // ------------------------------------------------------------ type
    // the portrait fades into the backdrop before its copy starts
    const fade = el('div', 'layer', stage);
    fade.style.background = `linear-gradient(to bottom, rgba(239,240,245,0) 1060px, ${STUDIO} 1290px)`;
    const layer = () => el('div', 'layer', stage);
    const text = (parent, s, cls, pos, style = {}) => { const b = TX.text(parent, s, `col centered ${cls}`, pos); Object.assign(b.el.style, { color: NAVY, ...style }); return b; };
    const tab = TX.C.tab(stage, ctx);
    tab.render(1, 0);

    const pages = [];
    const ready = Promise.all(P.cast.map((c) => loadPerson(c.key))).then((loaded) => {
      const people = P.cast.map((c, i) => ({ ...c, p: loaded[i] }));
      for (const { p } of people) scene.add(p.group);
      for (const sex of ['m', 'f']) {
        const L = layer();
        text(L, P.title, 't-hook-s', { top: 450 });
        text(L, sex === 'm' ? P.men : P.women, 't-sub', { top: 565 }, { color: BLUE });
        const slots = people.filter((c) => c.p.spec.sex === sex).map((c, i) => {
          const box = el('div', 'abs', L);
          Object.assign(box.style, { width: '330px', textAlign: 'center', color: NAVY });
          box.innerHTML = `<div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:50%;background:${PINK};color:#fff;font:700 38px Cairo">${TX.ar(i + 1)}</div>`
            + `<div style="font:700 58px/1.25 Cairo;margin-top:12px">${c.name}</div>`
            + `<div style="font:500 28px/1.3 Cairo;color:${PINK}">${c.role}</div>`;
          return { c, box, spot: SPOTS[i] };
        });
        pages.push({ L, kind: 'group', slots });
      }
      for (const c of people) {
        const L = layer();
        const chip = el('div', 'pill', L);
        px(chip, { top: ctx.L.pill.top, left: ctx.L.pill.left });
        Object.assign(chip.style, { background: NAVY, color: '#FFFEFF' });
        chip.textContent = c.chip;
        text(L, c.name, 't-hook', { top: 1330 });
        text(L, c.latin, '', { top: 1470 }, { font: '500 34px/1.2 Cairo', letterSpacing: '0.18em', color: BLUE, direction: 'ltr' });
        text(L, c.role, 't-sub', { top: 1530 }, { color: PINK });
        text(L, c.about, 't-body', { top: 1620 }, { color: 'rgba(24,25,67,.78)' });
        pages.push({ L, kind: 'solo', c });
      }
      pages.people = people;
    });

    const project = (v) => { const q = v.clone().project(camera); return { x: (q.x + 1) / 2 * W, y: (1 - q.y) / 2 * H }; };
    const headOf = (p) => Object.values(p.bones).find((b) => /Head$/.test(b.name)).getWorldPosition(new THREE.Vector3());
    return {
      pages: P.cast.length + 2,
      ready,
      render(i) {
        const pg = pages[Math.round(i)];
        pages.forEach((q) => { q.L.style.display = q === pg ? '' : 'none'; });
        for (const c of pages.people) c.p.group.visible = false;
        const solo = pg.kind === 'solo';
        pedestals.visible = !solo;
        fade.style.display = solo ? '' : 'none';
        grain.uniforms.uVig.value = solo ? 0 : 0.1; // flat backdrop under the fade
        if (!solo) {
          for (const { c, spot: [x, z] } of pg.slots) {
            c.p.group.visible = true;
            c.p.group.position.set(x, 0.1, z);
            c.p.group.rotation.y = (c.p.spec.turn || 0) * 0.5 - x * 0.2;
          }
          camera.position.set(0, 1.46, 5.9);
          camera.lookAt(0, 1.38, 0);
          halo.position.set(0, 1.3, -3); halo.scale.set(8, 8, 1);
        } else {
          const p = pg.c.p;
          p.group.visible = true;
          p.group.position.set(0, 0, 0);
          p.group.rotation.y = p.spec.turn || 0;
          p.group.updateMatrixWorld(true);
          const head = headOf(p);
          camera.position.set(0, head.y - 0.28, 2.75);
          camera.lookAt(0, head.y - 0.52, 0);
          halo.position.set(0, head.y - 0.3, -2.5); halo.scale.set(5, 5, 1);
        }
        camera.updateMatrixWorld();
        if (pg.slots) for (const { c, box, spot: [x, z] } of pg.slots) { const q = project(V(x, 0, z + 0.34)); px(box, { left: q.x - 165, top: q.y + 18 }); }
        composer.render();
      },
    };
  },
});
