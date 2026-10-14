// Chapter 1: the Milky Way, our galaxy, as a particle model. 1 unit = 1 kpc (3,262 light-years).
// Shapes and sizes follow the numbers in galaxy.js (GRAVITY 2019, Eilers et al. 2019, Licquia & Newman
// 2015, Bland-Hawthorn & Gerhard 2016). The particle counts are a picture, not a census: the real disc holds
// 100 to 400 billion stars. "From the Sun" puts the camera at the Sun inside the disc, so the Galaxy becomes
// the band across the night sky, and a light-pollution slider brightens the sky until the band disappears
// (Falchi et al. 2016, Science Advances: more than a third of humanity can no longer see the Milky Way).
import { THREE, M } from '../kit.js';
import { MW, COL, KPC_LY, makeGalaxy, starfield, layout, unlayout, space, inReel, lean, num, msun, ring } from '../galaxy.js';

const VIEWS = {
  face: { pos: [8, 30, 9], target: [0, 0, 0] },
  edge: { pos: [2, 2.6, 30], target: [0, 0, 0] },
  tilt: { pos: [19, 12, 18], target: [0, 0, 0] },
};
const PARTS = {
  all: null,
  bulge: ['bulge'],
  disc: ['disc', 'thick'],
  arms: ['arms'],
  halo: ['halo', 'gc'],
};
const WHAT = {
  all: 'Bulge, bar, discs, arms, halo and clusters',
  bulge: 'The bulge and bar: old yellow stars, about 9 billion Suns',
  disc: 'Thin disc (bright) and thick disc (faint, puffier)',
  arms: 'Spiral arms: young blue stars and pink hydrogen clouds',
  halo: 'Halo stars and about 150 globular clusters',
};

export default {
  id: 'anatomy',
  short: 'Our galaxy',
  title: 'The Milky Way, inside and out',
  subtitle: 'A bar and bulge, a thin disc with arms, a thick disc, a halo of old stars, and us 26,700 light-years out.',
  view: { pos: [19, 12, 18], target: [0, 0, 0] },
  learn: `<p>A <b>galaxy</b> is a few hundred billion stars, with gas and dust between them, all held together by <b>gravity</b> and all going round. Ours is the <b>Milky Way</b>. Its bright <b>disc</b> of stars is about <b>100,000 light-years</b> across and only about 1,000 light-years thick near the Sun: a plate, not a ball. In the middle sits a fat <b>bulge</b> of old yellow stars, stretched into a <b>bar</b> about 10,000 light-years long, and at its very centre a black hole, <b>Sagittarius A*</b>, weighing about <b>4 million Suns</b>.</p>
    <p>The disc has two layers: a <b>thin disc</b> where new stars are born in the <b>spiral arms</b>, bright with young blue stars and pink glowing clouds of hydrogen, and a fainter, puffier <b>thick disc</b> of older stars. Around all of it is a huge, sparse <b>halo</b>: lonely old stars, about <b>150 globular clusters</b> (tight balls of a hundred thousand stars each), and, as the next chapter shows, a great deal of mass we cannot see at all.</p>
    <p>The <b>Sun</b> sits in the thin disc about <b>26,700 light-years</b> from the centre (8.2 kiloparsecs, measured by the GRAVITY instrument in 2019), on a small arm called the <b>Orion Spur</b>, between the Sagittarius and Perseus arms. Because we are inside the plate, we see it edge-on: a soft <b>band across the night sky</b>. In India it has long been called <b>Akash Ganga</b>, the Ganges of the sky, and the Greeks saw spilt milk, which gave us the word <i>galaxy</i>. More than a third of humanity can no longer see it: streetlights and billboards brighten the sky until the band fades.</p>
    <p class="tip"><b>Try it:</b> switch between face-on and edge-on, pick a part to highlight, then go to the Sun and slide the light pollution up until the Milky Way vanishes.</p>`,
  terms: [
    { t: 'Bulge and bar', d: 'The thick, bar-shaped crowd of old stars at the centre of the disc, about 9 billion solar masses.' },
    { t: 'Thin and thick disc', d: 'Two layers of the disc: a thin one, a few hundred light-years thick, where stars still form, and an older, puffier one.' },
    { t: 'Halo', d: 'The sparse round region around the disc: old stars, globular clusters and the dark matter that outweighs everything else.' },
    { t: 'Globular cluster', d: 'A tight ball of a hundred thousand or so very old stars. The Milky Way has about 150.' },
    { t: 'Sagittarius A*', d: 'The black hole at the centre of the Milky Way, about 4 million solar masses, pictured by the Event Horizon Telescope in 2022.' },
    { t: 'Light-year and parsec', d: 'A light-year is how far light goes in a year, 9.46 trillion km. A parsec is 3.26 light-years; a kiloparsec is 1,000 parsecs.' },
  ],
  defaults: { look: 'tilt', part: 'all', sky: false, pollution: 0 },
  controls: [
    { key: 'look', type: 'seg', label: 'Look at it', options: [{ v: 'tilt', label: 'Tilted' }, { v: 'face', label: 'Face-on' }, { v: 'edge', label: 'Edge-on' }] },
    { key: 'part', type: 'seg', label: 'Highlight', options: [{ v: 'all', label: 'All' }, { v: 'bulge', label: 'Bulge & bar' }, { v: 'disc', label: 'Discs' }, { v: 'arms', label: 'Arms' }, { v: 'halo', label: 'Halo' }] },
    { key: 'sky', type: 'toggle', label: 'Stand at the Sun: the night sky', hint: 'The camera sits at the Sun, inside the disc. Drag to look around.' },
    { key: 'pollution', type: 'range', label: 'Light pollution', min: 0, max: 1, step: 0.01, ends: ['dark village sky', 'city centre'], fmt: (v) => (v < 0.15 ? 'dark sky' : v < 0.4 ? 'small town' : v < 0.7 ? 'suburb' : 'city'), hint: 'Only matters when standing at the Sun.' },
  ],
  onChange(s, key) { if (key === 'sky' && s.sky) s.look = 'sun'; if (key === 'look' && s.look !== 'sun') s.sky = false; },
  quiz: [
    { q: 'Roughly how far is the Sun from the centre of the Milky Way?', options: ['About 27 light-years', 'About 2,700 light-years', 'About 27,000 light-years', 'About 27 million light-years'], answer: 2, why: 'The GRAVITY instrument measured 8,178 parsecs in 2019, which is about 26,700 light-years.' },
    { q: 'Why does the Milky Way look like a band across the night sky?', options: ['It is a cloud in our atmosphere', 'We are inside a flat disc of stars and see it edge-on', 'It is the light of one very long star', 'The Moon lights it up'], answer: 1, why: 'The disc is 100,000 light-years across and about 1,000 thick near us. Looking along the plate we see countless far stars blurred into a band.' },
    { q: 'What sits at the very centre of the Milky Way?', options: ['The Sun', 'A black hole of about 4 million solar masses', 'A giant star called Sagittarius', 'Nothing at all'], answer: 1, why: 'Sagittarius A*, about 4 million Suns. Stars orbit it so fast that Genzel and Ghez could weigh it, which won the 2020 Nobel Prize.' },
  ],
  reel: [
    { ms: 6000, caption: 'The Milky Way: a bar and bulge, a thin disc with spiral arms, a faint halo, and the Sun 26,700 light-years out.', set: { look: 'tilt', part: 'all', sky: false, pollution: 0 }, view: { pos: [4, 31, 4], target: [0, 0, 0] }, spin: 0.9 },
    { ms: 5400, caption: 'Seen edge-on it is a plate, 100,000 light-years across and about 1,000 thick. We live inside it.', set: { look: 'edge', part: 'all', sky: false }, view: { pos: [3, 2.6, 32], target: [0, 0, 0] }, spin: 0.25 },
  ],

  build({ stage }) {
    space(stage);
    const root = new THREE.Group(); stage.root.add(root);
    const stars = starfield(1200, 300, 3); root.add(stars);
    const gal = makeGalaxy(); root.add(gal.group);
    // A faint plane marker: a ring at the disc's edge and one at the Sun's orbit.
    root.add(ring(MW.R_DISC, 0x8fb8ff, 0.18, 0.06), ring(MW.R0, COL.sun, 0.35, 0.05));
    // Scale bar: 10 kpc = 32,600 light-years.
    const bar = new THREE.Mesh(new THREE.BoxGeometry(10, 0.06, 0.06), M.glow(0xffffff, { transparent: true, opacity: 0.6 })); bar.position.set(-5, 0, 19.5); root.add(bar);
    const lScale = stage.label('10,000 parsecs = 32,600 light-years', [-5, 0, 20.6], root);

    const lSun = stage.label('Sun, 8.2 kpc out · Orion Spur', [MW.R0, 0.9, 0], root, 'hot'); lSun.element.style.setProperty('--c', '#ffd36b');
    const lBH = stage.label('Sagittarius A*: 4 million Suns', [0, 1.2, 0], root);
    const lBar = stage.label('Bar, ~5 kpc each way', [4.2 * Math.cos(MW.BAR_ANGLE), 0.5, -4.2 * Math.sin(MW.BAR_ANGLE)], root);
    const lArm1 = stage.label('Perseus Arm', [-10.5, 0.4, -7], root), lArm2 = stage.label('Scutum–Centaurus Arm', [11, 0.4, 7.5], root);
    const lDisc = stage.label('Thin disc, ~300 pc thick here', [-13, 0.6, 5], root);
    const lThick = stage.label('Thick disc', [0, 2.2, 10.5], root), lHalo = stage.label('Halo and globular clusters', [13, 8, 3], root);
    const lEdge = stage.label('100,000 light-years', [0, -2.4, 0], root);

    // Near stars for the sky view: a few hundred bright neighbours around the Sun so the view is not empty.
    const NN = 400, near = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0.9, depthWrite: false }));
    { let seed = 99; const r = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296; const p = new Float32Array(NN * 3); for (let i = 0; i < NN; i++) { const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u), d = 1 + r() * 2; p[i * 3] = MW.R0 + d * s * Math.cos(a); p[i * 3 + 1] = d * u; p[i * 3 + 2] = d * s * Math.sin(a); } near.geometry.setAttribute('position', new THREE.BufferAttribute(p, 3)); }
    near.visible = false; root.add(near);
    // The horizon: a ground disc under the observer, so the band meets a dark ground as it does outdoors.
    const ground = new THREE.Mesh(new THREE.CircleGeometry(400, 64), new THREE.MeshBasicMaterial({ color: 0x0b0b10, side: THREE.DoubleSide })); ground.rotation.x = -Math.PI / 2; ground.position.set(MW.R0, -0.03, 0); ground.visible = false; root.add(ground);

    const sky = new THREE.Color(), dark = new THREE.Color(0x05060b), lit = new THREE.Color(0x7a6a5a);
    const labels = [lSun, lBH, lBar, lArm1, lArm2, lDisc, lThick, lHalo, lEdge, lScale];
    const baseSize = {}; for (const [k, p] of Object.entries(gal.parts)) baseSize[k] = p.material.size;
    let look = 'tilt', part = '', wasSky = false;
    return {
      dispose() { stage.controls.minDistance = 0; stage.controls.maxDistance = 140; unlayout(stage); },
      update(dt, s) {
        dt = Math.max(0, dt);
        const md = layout(stage, null, [lBar, lDisc, lThick, lScale, lArm1, lArm2], { wide: [0.1, -0.06], phone: [0, -0.08] });
        const inSky = !!s.sky;
        if (inSky !== wasSky) {
          wasSky = inSky;
          if (inSky) {
            // Camera at the Sun, looking towards the Galactic centre (−x), a little above the plane.
            // The target sits 1 cm in front of the lens, so dragging turns the view like turning your head.
            stage.setView([MW.R0, 0.05, 0], [MW.R0 - 0.01, 0.051, 0], 1.0);
            stage.controls.minDistance = 0.01; stage.controls.maxDistance = 0.01; look = 'sun';
          } else { stage.controls.minDistance = 0; stage.controls.maxDistance = 140; look = ''; }
        }
        if (!inSky && s.look !== look) { look = s.look; const v = VIEWS[look] || VIEWS.tilt; if (!inReel()) stage.setView(v.pos, v.target, 1.0); }   // reel scenes bring their own views
        if (s.part !== part) { part = s.part; gal.highlight(PARTS[part]); }
        // Sky mode: points shrink to star-like dots, the sun marker hides, and light pollution washes the band out.
        const pol = inSky ? s.pollution : 0;
        for (const [k, p] of Object.entries(gal.parts)) {
          // From inside, every particle becomes a 2-pixel star whatever its distance.
          if (p.material.sizeAttenuation === inSky) { p.material.sizeAttenuation = !inSky; p.material.needsUpdate = true; }
          p.material.size = inSky ? (k === 'gc' ? 4 : 2.2) : baseSize[k];
          const on = !PARTS[part] || PARTS[part].includes(k);
          p.material.opacity = (on ? 0.9 : 0.08) * (inSky ? Math.max(0, 1 - pol * 1.35) : 1);
        }
        near.visible = ground.visible = inSky; near.material.opacity = 0.9 - 0.5 * pol;
        gal.sun.visible = gal.sunRing.visible = !inSky;
        sky.lerpColors(dark, lit, pol * pol);
        stage.scene.background = sky;
        stars.material.opacity = inSky ? 0.6 * (1 - pol) : 0.6;
        labels.forEach((l) => { if (inSky) l.visible = false; });
        if (!inSky) { lEdge.visible = look === 'edge' && md !== 'phone'; lHalo.visible = md !== 'phone' && part !== 'disc' && part !== 'arms'; lBH.visible = true; lSun.visible = true; lArm1.visible = lArm2.visible = md !== 'phone' && look !== 'edge'; lScale.visible = bar.visible = md !== 'phone' && look !== 'edge'; lThick.visible = md !== 'phone' && look === 'edge'; lDisc.visible = md !== 'phone' && look !== 'edge'; lBar.visible = md !== 'phone' && look !== 'edge'; }
      },
      readout(s) {
        if (s.sky) {
          const seen = s.pollution < 0.45;
          return lean(`<div class="big">${seen ? 'The Milky Way is up' : 'The Milky Way has gone'}</div>
            <div class="row"><span>Sky</span><b>${s.pollution < 0.15 ? 'dark: the band glows from horizon to horizon' : s.pollution < 0.45 ? 'a little lit: the band is faint' : s.pollution < 0.7 ? 'suburb: only the brightest stars' : 'city: a few stars, orange sky'}</b></div>
            <div class="row"><span>Cannot see it at all</span><b>more than ⅓ of humanity (Falchi et al. 2016)</b></div>
            <div class="row"><span>Under light-polluted skies</span><b>more than 80% of people</b></div>
            <div class="row"><span>Dark skies in India</span><b>Hanle, Ladakh: a dark-sky reserve since 2022</b></div>
            <small>Model: ${num(20000)}-odd dots standing for hundreds of billions of stars, seen from the Sun. Dust is not drawn.</small>`, [0, 1]);
        }
        return lean(`<div class="big">${WHAT[s.part]}</div>
          <div class="row"><span>Disc across</span><b>about 100,000 ly (30 kpc)</b></div>
          <div class="row"><span>Thin disc thick</span><b>700–1,500 ly (220–450 pc)</b></div>
          <div class="row"><span>Sun to centre</span><b>8,178 pc = ${num(Math.round(8.178 * KPC_LY / 100) * 100)} ly</b></div>
          <div class="row"><span>Stars</span><b>100 to 400 billion</b></div>
          <div class="row"><span>Stars' mass</span><b>${msun(6.08e10, 1)} (bulge + bar ${msun(MW.M_BULGE, 1)})</b></div>
          <div class="row"><span>Sagittarius A*</span><b>${msun(MW.M_SGRA, 1)}</b></div>
          <small>Sizes from GRAVITY 2019, Licquia & Newman 2015, Bland-Hawthorn & Gerhard 2016. The dots are a model, not a star count.</small>`, [0, 2, 5]);
      },
    };
  },
};
