// Chapter 4: kinds of galaxies, and what a collision does.
// "Tuning fork": Hubble's 1926 classes laid out the way his 1936 book drew them: ellipticals E0–E7 on the
//   handle, then two prongs, ordinary spirals Sa–Sc and barred spirals SBa–SBc, with S0 at the join and
//   irregulars off the end. It is a classification by shape, not a sequence in time (Hubble said so himself).
//   Each galaxy here is a small particle model, not to scale. Barred spirals are about two thirds of spirals
//   (NASA). NASA: Andromeda is 2.5 million light-years away, approaching at about 110 km/s (250,000 mph).
// "Collision": a restricted three-body sketch in the spirit of Toomre & Toomre (1972): two discs of test
//   particles orbit two point masses on a near-parabolic encounter, with an added drag so the two nuclei
//   spiral together (real galaxies lose orbital energy to their dark halos by dynamical friction). Tidal
//   tails are thrown out and the discs end as one puffed-up blob, the way ellipticals are thought to form.
//   Units: G = 1, mass 1 = 10¹² M☉, length 1 = 10 kpc, so one time unit is about 15 million years.
import { THREE } from '../kit.js';
import { COL, cloud, starfield, layout, unlayout, space, inReel, lean, ball, num, rng, gauss } from '../galaxy.js';

const TAU = Math.PI * 2, T_UNIT_MYR = 14.9;   // √(L³ / G M) with L = 10 kpc, M = 10¹² M☉
const TYPES = [
  { id: 'E0', name: 'E0 elliptical', kind: 'E', flat: 0, x: -7.5, y: 0, text: 'Round, old, little gas or dust. From dwarfs to the giants at the hearts of clusters.' },
  { id: 'E4', name: 'E4 elliptical', kind: 'E', flat: 0.4, x: -5, y: 0, text: 'The number is the flattening: 10 × (1 − b/a). E4 is about 40% flatter than round.' },
  { id: 'E7', name: 'E7 elliptical', kind: 'E', flat: 0.7, x: -2.5, y: 0, text: 'The flattest ellipticals. Still no disc, no arms, no young blue stars.' },
  { id: 'S0', name: 'S0 lenticular', kind: 'S0', x: 0, y: 0, text: 'A disc and bulge but no arms and almost no gas: a cross between the two families.' },
  { id: 'Sa', name: 'Sa spiral', kind: 'S', bar: false, tight: 0.09, bulge: 1.2, x: 3, y: 2.2, text: 'Big bulge, tightly wound arms.' },
  { id: 'Sb', name: 'Sb spiral', kind: 'S', bar: false, tight: 0.16, bulge: 0.8, x: 6, y: 2.2, text: 'Medium bulge and arms. Andromeda is an Sb.' },
  { id: 'Sc', name: 'Sc spiral', kind: 'S', bar: false, tight: 0.28, bulge: 0.45, x: 9, y: 2.2, text: 'Small bulge, open arms, lots of gas and young stars.' },
  { id: 'SBa', name: 'SBa barred spiral', kind: 'S', bar: true, tight: 0.09, bulge: 1.2, x: 3, y: -2.2, text: 'A bar through the middle, arms springing from its ends.' },
  { id: 'SBb', name: 'SBb barred spiral', kind: 'S', bar: true, tight: 0.16, bulge: 0.8, x: 6, y: -2.2, text: 'The Milky Way is a barred spiral of roughly this kind (SBbc).' },
  { id: 'SBc', name: 'SBc barred spiral', kind: 'S', bar: true, tight: 0.28, bulge: 0.45, x: 9, y: -2.2, text: 'Bar plus loose arms. About two thirds of spirals have a bar (NASA).' },
  { id: 'Irr', name: 'Irregular', kind: 'I', x: 12.2, y: 0, text: 'No clear shape, often small and gas-rich. The Magellanic Clouds, our nearest big neighbours at 160,000 and 200,000 light-years, are irregular dwarfs.' },
];

// A small particle galaxy of a given type, radius about 1.1 units.
function makeType(t, seed) {
  const r = rng(seed), g = new THREE.Group();
  const n = 650, c = cloud(n, 0.16, 0.9);
  for (let i = 0; i < n; i++) {
    let x, y, z, col = COL.disc, k = 0.6 + 0.5 * r();
    if (t.kind === 'E') { const rr = Math.pow(r(), 1.6) * 1.1, u = r() * 2 - 1, a = r() * TAU, s = Math.sqrt(1 - u * u); x = rr * s * Math.cos(a); z = rr * u; y = rr * s * Math.sin(a) * (1 - t.flat); col = COL.bulge; }
    else if (t.kind === 'I') { const cx = (r() - 0.5) * 1.6, cz = (r() - 0.5) * 1.2; x = cx + gauss(r) * 0.2; z = cz + gauss(r) * 0.2; y = gauss(r) * 0.08; col = r() < 0.4 ? COL.blue : r() < 0.5 ? COL.pink : COL.disc; }
    else {
      const inB = r() < (t.kind === 'S0' ? 0.45 : 0.3 * (t.bulge || 0.8));
      if (inB) { const rr = Math.pow(r(), 1.5) * 0.35 * (t.bulge || 0.8), u = r() * 2 - 1, a = r() * TAU, s = Math.sqrt(1 - u * u); x = rr * s * Math.cos(a); z = rr * s * Math.sin(a); y = rr * u * 0.7; col = COL.bulge; }
      else if (t.bar && r() < 0.18) { x = (r() - 0.5) * 1.1; z = gauss(r) * 0.07; y = gauss(r) * 0.03; col = COL.bulge; }
      else {
        const R = 0.25 + 0.85 * Math.sqrt(r()); let phi = r() * TAU;
        if (t.kind === 'S') { const m = r() < 0.5 ? 0 : 1, armPhi = (m * Math.PI) + Math.log(R / 0.25) / t.tight * (t.bar ? 0.5 : 1) + (t.bar ? 0 : 0); const on = r() < 0.55; phi = on ? armPhi + gauss(r) * 0.18 : phi; if (on && r() < 0.5) col = r() < 0.75 ? COL.blue : COL.pink; }
        x = R * Math.cos(phi); z = R * Math.sin(phi); y = gauss(r) * 0.025;
      }
    }
    c.set(i, x, y, z); c.paint(i, col, k);
  }
  c.done(); g.add(c); g.position.set(t.x, 0, -t.y); g.rotation.x = -0.35; g.userData.type = t;
  return g;
}

// ---- the collision sim
const NP = 2200, SOFT = 0.25, DRAG = 0.12;
function makeSim() {
  const r = rng(77);
  const P = new Float32Array(NP * 3), Vv = new Float32Array(NP * 3), home = new Uint8Array(NP);
  const nuc = [{ m: 1, x: -2.8, y: 0, z: 0.6, vx: 0.45, vy: 0, vz: -0.22 }, { m: 1, x: 2.8, y: 0, z: -0.6, vx: -0.45, vy: 0, vz: 0.22 }];
  for (let i = 0; i < NP; i++) {
    const h = i < NP / 2 ? 0 : 1, n = nuc[h], R = 0.25 + 1.25 * Math.sqrt(r()), a = r() * TAU, v = Math.sqrt(n.m / Math.hypot(R, SOFT));
    const tilt = h ? 0.5 : -0.25, cx = R * Math.cos(a), cz = R * Math.sin(a), vx = -v * Math.sin(a), vz = v * Math.cos(a);
    // tilt each disc a little about x
    P[i * 3] = n.x + cx; P[i * 3 + 1] = n.y + cz * Math.sin(tilt) + gauss(r) * 0.03; P[i * 3 + 2] = n.z + cz * Math.cos(tilt);
    Vv[i * 3] = n.vx + vx; Vv[i * 3 + 1] = n.vy + vz * Math.sin(tilt); Vv[i * 3 + 2] = n.vz + vz * Math.cos(tilt);
    home[i] = h;
  }
  return { P, V: Vv, home, nuc, t: 0 };
}
function stepSim(S, dt) {
  const { P, V, nuc } = S;
  // nuclei pull each other; drag stands in for dynamical friction against the halos
  const dx = nuc[1].x - nuc[0].x, dy = nuc[1].y - nuc[0].y, dz = nuc[1].z - nuc[0].z, d2 = dx * dx + dy * dy + dz * dz + SOFT * SOFT, inv = 1 / (d2 * Math.sqrt(d2));
  for (const [a, b, sg] of [[nuc[0], nuc[1], 1], [nuc[1], nuc[0], -1]]) {
    a.vx += (sg * dx * b.m * inv - DRAG * (a.vx - 0)) * dt; a.vy += (sg * dy * b.m * inv - DRAG * a.vy) * dt; a.vz += (sg * dz * b.m * inv - DRAG * a.vz) * dt;
  }
  for (const n of nuc) { n.x += n.vx * dt; n.y += n.vy * dt; n.z += n.vz * dt; }
  for (let i = 0; i < NP; i++) {
    let ax = 0, ay = 0, az = 0;
    for (const n of nuc) { const ex = n.x - P[i * 3], ey = n.y - P[i * 3 + 1], ez = n.z - P[i * 3 + 2], q = ex * ex + ey * ey + ez * ez + SOFT * SOFT, f = n.m / (q * Math.sqrt(q)); ax += ex * f; ay += ey * f; az += ez * f; }
    V[i * 3] += ax * dt; V[i * 3 + 1] += ay * dt; V[i * 3 + 2] += az * dt;
    P[i * 3] += V[i * 3] * dt; P[i * 3 + 1] += V[i * 3 + 1] * dt; P[i * 3 + 2] += V[i * 3 + 2] * dt;
  }
  S.t += dt;
}

export default {
  id: 'kinds',
  short: 'Kinds of galaxies',
  title: 'Spirals, ellipticals, irregulars, and what a crash makes',
  subtitle: 'Hubble sorted galaxies by shape. Collisions turn discs into blobs. Andromeda may be next, or not.',
  view: { pos: [2.5, 13, 19], target: [2.5, 0, 0] },
  learn: `<p>In 1926 <b>Edwin Hubble</b> sorted galaxies by shape, and his <b>tuning fork</b> is still the first thing students learn. On the handle are <b>ellipticals</b>, E0 to E7, smooth balls and eggs of old stars with little gas. At the join sits <b>S0</b>, a disc without arms. Then two prongs: ordinary <b>spirals</b> Sa, Sb, Sc, and <b>barred spirals</b> SBa, SBb, SBc, from big bulge and tight arms to small bulge and loose arms. Off the end are the <b>irregulars</b>. The Milky Way is a barred spiral, roughly SBbc; Andromeda an Sb.</p>
    <p>One thing the fork is <b>not</b>: a life story. Hubble called the left "early" and the right "late", and the words stuck, but galaxies do not slide along the prongs as they age. It is a <b>classification</b>, like sorting leaves by shape.</p>
    <p>Shapes do change, though, when galaxies <b>collide</b>. Stars almost never hit each other (they are far too small and far apart), but gravity tugs the discs into long <b>tidal tails</b>, the gas crashes together and bursts into new stars, and after a few hundred million years the two discs settle into one puffy, round <b>elliptical</b>. That is the leading idea for how big ellipticals are made. Most big galaxies also have <b>dwarf</b> companions: the Milky Way has dozens, the biggest being the <b>Large and Small Magellanic Clouds</b>, irregular dwarfs about 160,000 and 200,000 light-years away, visible from southern India as two faint smudges.</p>
    <p><b>Andromeda</b>, 2.5 million light-years away, is heading our way at about 110 km/s. In 2012 NASA's Hubble team predicted a head-on meeting in about <b>4 billion years</b>, with a merged elliptical two billion years later. In 2025 a study by Sawala and colleagues, using newer measurements and the tug of the Magellanic Cloud, put the odds of no merger at all in the next 10 billion years at close to <b>50%</b>. Either way, the Sun will be long dead before it matters.</p>
    <p class="tip"><b>Try it:</b> tap a galaxy on the fork to read about it, then switch to "collision" and let it run. Watch the tidal tails fly out and the two discs become one blob.</p>`,
  terms: [
    { t: 'Elliptical galaxy', d: 'A smooth ball or egg of mostly old stars with little gas, from tiny dwarfs to the giants in cluster centres.' },
    { t: 'Spiral galaxy', d: 'A flat disc with arms, a central bulge, and usually a bar. The Milky Way and Andromeda are spirals.' },
    { t: 'Irregular galaxy', d: 'A galaxy with no clear shape, often small, gas-rich and busy forming stars.' },
    { t: 'Tuning fork', d: 'Hubble’s diagram sorting galaxies by shape: ellipticals on the handle, spirals and barred spirals on the two prongs.' },
    { t: 'Tidal tail', d: 'A long streamer of stars and gas pulled out of a galaxy by a passing galaxy’s gravity.' },
    { t: 'Merger', d: 'Two galaxies falling together and settling into one, usually a puffed-up elliptical.' },
  ],
  defaults: { mode: 'fork', pick: 'SBb', run: true, speed: 1 },
  controls: [
    { key: 'mode', type: 'seg', label: 'Show', options: [{ v: 'fork', label: 'The tuning fork' }, { v: 'crash', label: 'A collision' }] },
    { key: 'pick', type: 'seg', label: 'Fork: pick a galaxy', options: TYPES.map((t) => ({ v: t.id, label: t.id })) },
    { key: 'run', type: 'toggle', label: 'Collision: let it run' },
    { key: 'speed', type: 'range', label: 'Collision: speed', min: 0.3, max: 4, step: 0.1, fmt: (v) => v.toFixed(1) + '×' },
    { key: 'again', type: 'buttons', label: 'Collision', items: [{ label: '↺ Start again', act: (s, inst) => inst.restart() }] },
  ],
  onChange(s, key) { if (key === 'pick') s.mode = 'fork'; if (key === 'run' || key === 'speed') s.mode = 'crash'; },
  quiz: [
    { q: 'What does Hubble’s tuning fork show?', options: ['How galaxies age from left to right', 'Galaxies sorted by shape: ellipticals, lenticulars, spirals, barred spirals', 'The distance to each galaxy', 'Which galaxies will collide'], answer: 1, why: 'It is a classification by shape. Galaxies do not evolve along it, whatever “early” and “late” suggest.' },
    { q: 'When two spiral galaxies collide, what usually happens to their stars?', options: ['Most of them smash into each other', 'Almost none collide, but gravity flings them into tails and the discs settle into a round blob', 'They all fall into the black holes', 'Nothing changes'], answer: 1, why: 'Stars are tiny compared with the space between them. Gravity reshapes the galaxies; the stars themselves pass by.' },
    { q: 'Will Andromeda hit the Milky Way?', options: ['Yes, next year', 'It cannot: galaxies never meet', 'NASA’s 2012 model says a meeting in about 4 billion years; a 2025 study puts the chance of no merger in 10 billion years near 50%', 'It already has'], answer: 2, why: 'The answer depends on sideways speeds and the Magellanic Cloud’s pull, which are hard to measure. Science is allowed to say “about half”.' },
  ],
  reel: [
    { ms: 5600, caption: 'Hubble’s tuning fork sorts galaxies by shape: ellipticals, then spirals and barred spirals. A catalogue, not a life story.', set: { mode: 'fork', pick: 'SBb' }, view: { pos: [2.5, 11, 17], target: [2.5, 0, 0] }, spin: 0 },
    { ms: 6000, caption: 'When two discs collide, stars miss each other, tails fly out, and the pair settles into one elliptical blob.', set: { mode: 'crash', run: true, speed: 4 }, act: (s, inst) => inst.restart(), view: { pos: [0, 5.5, 7.5], target: [0, 0, 0] }, spin: 0 },
  ],

  build({ stage }) {
    space(stage);
    const root = new THREE.Group(); stage.root.add(root);
    root.add(starfield(900, 300, 13));
    // ---- the fork
    const fork = new THREE.Group(); root.add(fork);
    const types = TYPES.map((t, i) => { const g = makeType(t, 100 + i); fork.add(g); return g; });
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x5b6b84, transparent: true, opacity: 0.6, toneMapped: false });
    const seg = (a, b) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), m = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, A.distanceTo(B), 6), lineMat); m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); return m; };
    fork.add(seg([-7.5, -0.02, 0], [0, -0.02, 0]), seg([0, -0.02, 0], [1.5, -0.02, -2.2]), seg([1.5, -0.02, -2.2], [10.5, -0.02, -2.2]), seg([0, -0.02, 0], [1.5, -0.02, 2.2]), seg([1.5, -0.02, 2.2], [10.5, -0.02, 2.2]));
    const ringSel = new THREE.Mesh(new THREE.RingGeometry(1.35, 1.45, 48), new THREE.MeshBasicMaterial({ color: 0xffb547, side: THREE.DoubleSide, transparent: true, opacity: 0.9, toneMapped: false })); ringSel.rotation.x = -Math.PI / 2; fork.add(ringSel);
    const tl = types.map((g) => stage.label(g.userData.type.id, [g.position.x, -1.3, g.position.z], fork));
    const lE = stage.label('ellipticals', [-5, 1.6, 0], fork), lS = stage.label('spirals', [6, 1.6, -2.2], fork), lSB = stage.label('barred spirals', [6, -1.7, 2.2], fork), lI = stage.label('irregular', [12.2, 1.6, 0], fork);
    stage.pickables = types.map((g) => g.children[0]);

    // ---- the collision
    const crash = new THREE.Group(); root.add(crash);
    const pc = cloud(NP, 0.22, 0.9); crash.add(pc);
    const nucA = ball(0.08, COL.bulge), nucB = ball(0.08, COL.bulge); crash.add(nucA, nucB);
    let sim = makeSim();
    const lT = stage.label('', [0, -0.5, 4.2], crash);
    const paintSim = () => { for (let i = 0; i < NP; i++) { pc.set(i, sim.P[i * 3], sim.P[i * 3 + 1], sim.P[i * 3 + 2]); pc.paint(i, sim.home[i] ? COL.blue : COL.disc, 1.0); } pc.done(); nucA.position.set(sim.nuc[0].x, sim.nuc[0].y, sim.nuc[0].z); nucB.position.set(sim.nuc[1].x, sim.nuc[1].y, sim.nuc[1].z); };
    paintSim();

    let mode = 'fork', picked = '';
    const api = { restart() { sim = makeSim(); paintSim(); } };
    return {
      ...api,
      pick(o) { const t = o.parent?.userData?.type; if (t) { const s = window.galaxyclear?.settings; if (s) { s.pick = t.id; s.mode = 'fork'; } } },
      dispose() { unlayout(stage); stage.pickables = []; },
      update(dt, s) {
        dt = Math.max(0, dt);
        const md = layout(stage, null, [lE, lS, lSB, lI, ...tl], { wide: [0.06, -0.12], phone: [0, -0.1] });
        if (s.mode !== mode) { mode = s.mode; if (!inReel()) { if (mode === 'fork') stage.setView([2.5, 13, 19], [2.5, 0, 0], 1); else stage.setView([0, 8, 11], [0, 0, 0], 1); } }
        fork.visible = mode === 'fork'; crash.visible = mode === 'crash'; lT.visible = mode === 'crash' && md !== 'phone';
        [lE, lS, lSB, lI, ...tl].forEach((l) => { l.visible = l.visible && mode === 'fork'; });
        if (mode === 'fork') {
          const g = types.find((x) => x.userData.type.id === s.pick) || types[8];
          ringSel.position.set(g.position.x, 0, g.position.z);
          types.forEach((x) => { x.rotation.y += dt * 0.15; });
          if (s.pick !== picked) { picked = s.pick; tl.forEach((l, i) => { l.element.className = 'lbl' + (types[i].userData.type.id === picked ? ' hot' : ''); }); }
        } else {
          if (s.run) { const step = 0.6 * s.speed * Math.min(dt, 0.05), n = Math.max(1, Math.ceil(step / 0.01)); for (let k = 0; k < n; k++) stepSim(sim, step / n); }
          paintSim();
          lT.element.textContent = `${num(sim.t * T_UNIT_MYR)} million years in (model time)`;
        }
      },
      readout(s) {
        if (s.mode === 'crash') {
          const d = Math.hypot(sim.nuc[0].x - sim.nuc[1].x, sim.nuc[0].y - sim.nuc[1].y, sim.nuc[0].z - sim.nuc[1].z);
          return lean(`<div class="big">${d > 1.5 ? 'Two discs approach' : d > 0.35 ? 'Tidal tails fly out' : 'One blob: an elliptical in the making'}</div>
            <div class="row"><span>Model time</span><b>${num(sim.t * T_UNIT_MYR)} million years</b></div>
            <div class="row"><span>Nuclei apart</span><b>${(d * 10).toFixed(1)} kpc</b></div>
            <div class="row"><span>Stars that hit each other</span><b>essentially none</b></div>
            <div class="row"><span>Andromeda today</span><b>2.5 million ly away, closing at about 110 km/s</b></div>
            <div class="row"><span>Collision?</span><b>NASA 2012: in ~4 billion years. Sawala et al. 2025: ~50% chance of none in 10 billion</b></div>
            <small>A restricted three-body sketch after Toomre & Toomre 1972, with a drag standing in for dynamical friction. 2,200 test particles, two point masses.</small>`, [0, 1, 4]);
        }
        const t = TYPES.find((x) => x.id === s.pick) || TYPES[8];
        return lean(`<div class="big">${t.name}</div>
          <div class="row"><span>Family</span><b>${t.kind === 'E' ? 'elliptical' : t.kind === 'S0' ? 'lenticular' : t.kind === 'I' ? 'irregular' : t.bar ? 'barred spiral' : 'spiral'}</b></div>
          <div class="row"><span>About it</span><b>${t.text}</b></div>
          <div class="row"><span>The fork is</span><b>a sorting by shape, not a sequence in time</b></div>
          <small>Hubble 1926 (ApJ 64, 321) and The Realm of the Nebulae (1936). Models are sketches, not to scale.</small>`, [0, 1]);
      },
    };
  },
};
