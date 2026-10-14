// Chapter 2: the rotation curve and dark matter. 1 unit = 1 kpc.
// The board plots orbital speed against distance from the centre. Three curves:
//   • "Kepler": if all the visible mass sat at the centre, v = √(GM/R), falling like the planets' speeds.
//   • "Visible mass": the black hole, a Hernquist bulge (0.91 × 10¹⁰ M☉), an exponential stellar disc
//     (5.17 × 10¹⁰ M☉, 2.6 kpc) and a gas disc (10¹⁰ M☉, 5 kpc), computed with Freeman's formula (galaxy.js).
//   • "Measured": Eilers, Hogg, Rix & Ness 2019 (ApJ 871, 120): 229.0 ± 0.2 km/s at the Sun, falling
//     1.7 km/s per kpc out to 25 kpc, drawn as a band of ±5% for the stated systematic uncertainty.
// The slider adds an NFW dark-matter halo (scale radius 16 kpc) set by its mass inside 200 kpc, until the
// model meets the measured band. Eilers et al. find a dark halo of 7.25 × 10¹¹ M☉ inside the virial radius.
// The Solar System comparison uses the planets' real mean speeds (NASA fact sheets, as in KeplerClear).
import { THREE } from '../kit.js';
import { MW, COL, G_KPC, makeGalaxy, starfield, layout, unlayout, space, lean, ring, ball, sci, msun, board, panelBg, title, axes, clipTo, curve, band, line, dot, text, vVisible, vModel, vMeasured, mVisible, mFromV, mHalo, omegaRadGyr } from '../galaxy.js';

const PLANETS = [['Mercury', 0.387, 47.4], ['Venus', 0.723, 35.0], ['Earth', 1, 29.8], ['Mars', 1.524, 24.1], ['Jupiter', 5.203, 13.1], ['Saturn', 9.537, 9.7], ['Uranus', 19.19, 6.8], ['Neptune', 30.07, 5.4]];  // AU, km/s (NASA Planetary Fact Sheet)
const MARK_R = [2, 5, MW.R0, 12, 16, 20, 24];   // kpc: tracer stars with speed arrows
const HALO_FIT = 1.0e12;                        // M☉ inside 200 kpc: where the model meets the band (found by the readout's own sum)

export default {
  id: 'rotation',
  short: 'Going round',
  title: 'Why the outer stars do not slow down',
  subtitle: 'Planets far from the Sun crawl. Stars far from the centre of the Galaxy race on. Something unseen is pulling.',
  view: { pos: [6, 30, 22], target: [0, 0, 0] },
  learn: `<p>In the Solar System almost all the mass is in the Sun, so the farther out a planet is, the weaker the pull and the slower it moves: Mercury at 47 km/s, Neptune at 5.4 km/s (see <a href="https://glassbox.how/keplerclear/" target="_blank" rel="noopener">KeplerClear</a>). Astronomers expected a galaxy to do the same beyond its bright middle: the <b>rotation curve</b>, speed against distance, should fall.</p>
    <p>It does not. In the 1970s <b>Vera Rubin</b> and <b>Kent Ford</b> measured the speeds of gas clouds across Andromeda and then dozens of spirals, and found the curves stay <b>flat</b> to the edge of the visible disc and beyond. Our own Galaxy does it too: at the Sun, 8.2 kpc out, the speed is <b>229 km/s</b>, and at 25 kpc it has fallen only to about 200 (Eilers et al. 2019, from Gaia and APOGEE). Add up every star and all the gas, and the pull is too weak by far.</p>
    <p>The sum is simple: <b>M = v²R ÷ G</b>. A flat curve means the mass inside R keeps growing in step with R, long after the starlight has run out. The usual conclusion is a <b>dark-matter halo</b>: a huge, round cloud of something that has mass but gives off no light, outweighing the stars about five to one. Fritz <b>Zwicky</b> had seen the same shortfall in a cluster of galaxies in 1933. Dark matter is <b>inferred</b>, not seen: nobody has yet identified what it is, despite decades of searching. A minority of physicists instead propose that <b>gravity itself</b> changes at very low accelerations (<b>MOND</b>, Milgrom 1983). It fits many galaxy curves well, but struggles with clusters and the early universe, so most astronomers favour dark matter. Both are live ideas; the box shows the mainstream one.</p>
    <p class="tip"><b>Try it:</b> set the halo to zero and compare the visible-mass curve with the measured band. Then add dark matter until they meet, and read off how much you needed.</p>`,
  terms: [
    { t: 'Rotation curve', d: 'A graph of orbital speed against distance from the centre of a galaxy.' },
    { t: 'Keplerian fall-off', d: 'How speed drops with distance when nearly all the mass sits at the centre: v ∝ 1 ÷ √R.' },
    { t: 'Dark matter', d: 'Unseen mass inferred from gravity. In galaxies it seems to outweigh the stars about five to one. Its nature is unknown.' },
    { t: 'Halo (dark)', d: 'The roughly round cloud of dark matter a galaxy is thought to sit in, far bigger than its disc.' },
    { t: 'MOND', d: 'Modified Newtonian Dynamics: a minority proposal that gravity weakens more slowly at tiny accelerations, so no dark matter is needed in galaxies.' },
  ],
  defaults: { halo: 0, show: 'galaxy', run: true },
  controls: [
    { key: 'halo', type: 'range', label: 'Dark-matter halo (mass inside 200 kpc)', min: 0, max: 2e12, step: 2e10, ends: ['none', '2 trillion Suns'], fmt: (v) => (v ? `${(v / 1e12).toFixed(2)} × 10¹² Suns` : 'none') },
    { key: 'show', type: 'seg', label: 'Compare with', options: [{ v: 'galaxy', label: 'The Galaxy' }, { v: 'solar', label: 'The Solar System' }] },
    { key: 'run', type: 'toggle', label: 'Let the disc turn (sped up)' },
  ],
  quiz: [
    { q: 'What did astronomers expect the speed of stars far from a galaxy’s centre to do?', options: ['Rise steeply', 'Fall, like the outer planets', 'Stay exactly constant', 'Reverse direction'], answer: 1, why: 'If most of the mass is in the bright middle, the pull weakens with distance and speeds should fall, as Neptune’s does.' },
    { q: 'Measured rotation curves of spiral galaxies turn out to be roughly flat. What does that say about the mass?', options: ['There is less mass than the stars suggest', 'The mass inside R keeps growing with R, well past the visible disc', 'All the mass is in the black hole', 'Gravity switches off at large distances'], answer: 1, why: 'M = v²R ÷ G. With v constant, M grows in step with R, so most of the mass is spread far out and gives off no light.' },
    { q: 'Which statement about dark matter is accurate?', options: ['It has been captured in a laboratory', 'It is inferred from gravity and has not been identified', 'It is just black holes', 'It only exists in the Solar System'], answer: 1, why: 'Dark matter is a conclusion from motion, not a thing anyone has caught. Modified gravity remains a minority alternative.' },
  ],
  reel: [
    { ms: 6000, caption: 'Add up every star and all the gas: the outer disc should slow down. Measured, it does not.', set: { halo: 0, show: 'galaxy', run: true }, view: { pos: [4, 26, 22], target: [0, 0, 0] }, spin: 0 },
    { ms: 6000, caption: 'Only a halo of unseen mass, about a trillion Suns of dark matter, makes the curve fit.', set: { show: 'galaxy', run: true }, anim: { halo: [0, 1.0e12] }, view: { pos: [4, 26, 22], target: [0, 0, 0] }, spin: 0 },
  ],

  build({ stage }) {
    space(stage);
    const root = new THREE.Group(); stage.root.add(root);
    root.add(starfield(900, 300, 7));
    const gal = makeGalaxy({ nHalo: 400, nGC: 60 }); root.add(gal.group);
    gal.parts.halo.material.opacity = 0.35;
    // Tracer stars on circles, with arrows whose length shows the speed in the chosen model.
    const tracers = MARK_R.map((R) => {
      const g = new THREE.Group(); root.add(g);
      g.add(ring(R, 0xffffff, 0.12, 0.03));
      const b = ball(0.22, COL.hot); g.add(b);
      const sh = new THREE.Mesh(new THREE.BoxGeometry(1, 0.07, 0.07), new THREE.MeshBasicMaterial({ color: 0x8ef0ff, toneMapped: false })); g.add(sh);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 10), sh.material); g.add(tip);
      return { R, b, sh, tip, phi: (R * 1.7) % 6.28 };
    });
    const lSun = stage.label('Sun: 229 km/s', [MW.R0, 0.9, 0], root, 'hot'); lSun.element.style.setProperty('--c', '#ffd36b');
    const lOut = stage.label('', [0, 0.9, 0], root, 'hot');
    const lHalo = stage.label('dark-matter halo (model)', [0, 24, 0], root);
    // The halo as a faint translucent sphere whose size and brightness grow with the slider.
    const haloMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), new THREE.MeshBasicMaterial({ color: 0x8f7fff, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.BackSide, toneMapped: false })); root.add(haloMesh);
    const haloMesh2 = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), new THREE.MeshBasicMaterial({ color: 0x8f7fff, transparent: true, opacity: 0.06, depthWrite: false, toneMapped: false })); root.add(haloMesh2);

    let S = null;
    const bd = board(root, (g, w, h) => {
      panelBg(g, w, h);
      if (!S) return;
      if (S.show === 'solar') {
        title(g, 'The Solar System: speeds fall with distance', 'v = √(GM☉ ÷ r). Mercury 47 km/s, Neptune 5.4 km/s');
        const ax = axes(g, w, h, { xMax: 32, yMax: 50, xTicks: [0, 10, 20, 30], yTicks: [0, 10, 20, 30, 40, 50], xLabel: 'distance from the Sun (AU)', yLabel: 'km/s' });
        clipTo(g, ax, () => curve(g, (r) => 29.78 / Math.sqrt(Math.max(r, 0.05)), 0.2, 32, ax.X, ax.Y, COL.law, 4));
        PLANETS.forEach(([n, a, v]) => { dot(g, ax.X(a), ax.Y(v), COL.hot, 7); if (a < 2 ? n === 'Earth' || n === 'Mercury' : true) text(g, n, ax.X(a) + 10, ax.Y(v) - 10, COL.text, '19px sans-serif'); });
        return;
      }
      title(g, 'The Milky Way’s rotation curve', `dark halo: ${S.halo ? sci(S.halo, 2) + ' M☉ inside 200 kpc' : 'none'}`);
      const ax = axes(g, w, h, { xMax: 26, yMax: 320, xTicks: [0, 5, 10, 15, 20, 25], yTicks: [0, 100, 200, 300], xLabel: 'distance from the centre (kpc)', yLabel: 'km/s' });
      const { X, Y } = ax;
      clipTo(g, ax, () => {
        band(g, (R) => vMeasured(R) * 0.95, (R) => vMeasured(R) * 1.05, 5, 25, X, Y, 'rgba(92,225,169,.25)');
        line(g, [[5, vMeasured(5)], [25, vMeasured(25)]], X, Y, COL.good, 4);
        const Mtot = mVisible(26);
        curve(g, (R) => Math.sqrt((G_KPC * Mtot) / Math.max(R, 0.3)), 0.6, 26, X, Y, 'rgba(255,255,255,.35)', 2, [6, 6]);
        curve(g, (R) => vVisible(R), 0.05, 26, X, Y, COL.cool, 4);
        if (S.halo > 0) curve(g, (R) => vModel(R, S.halo), 0.05, 26, X, Y, COL.hot, 5);
        g.setLineDash([4, 4]); g.strokeStyle = 'rgba(255,211,107,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(X(MW.R0), ax.y0); g.lineTo(X(MW.R0), ax.y1); g.stroke(); g.setLineDash([]);
      });
      text(g, 'measured (Eilers et al. 2019, Gaia + APOGEE)', X(8.5), Y(vMeasured(8.5)) - 46, COL.good, '19px sans-serif');
      text(g, 'visible mass only: stars, gas, black hole', X(13), Y(vVisible(13)) + 46, COL.cool, '19px sans-serif');
      text(g, 'if all that mass sat at the centre', X(16), Y(Math.sqrt((G_KPC * mVisible(26)) / 16)) + 36, 'rgba(255,255,255,.55)', '17px sans-serif');
      if (S.halo > 0) text(g, 'visible + dark halo', X(19), Y(vModel(19, S.halo)) - 28, COL.hot, 'bold 19px sans-serif');
      text(g, 'Sun', X(MW.R0) + 6, ax.y1 + 18, '#ffd36b', '17px sans-serif');
    });

    let t = 0, key = '', md = 'wide';
    const speedAt = (R, s) => (s.halo > 0 ? vModel(R, s.halo) : vVisible(R));
    return {
      dispose() { unlayout(stage); },
      update(dt, s) {
        dt = Math.max(0, dt); S = s;
        md = layout(stage, bd, [lHalo]);
        // One second on screen = 10 million years, so the Sun laps in about 22 s.
        if (s.run) t += dt * 0.01;
        gal.turn('disc', (R) => omegaRadGyr(speedAt(R, s), R) * t);
        gal.turn('arms', (R) => omegaRadGyr(speedAt(R, s), R) * t);
        gal.turn('bulge', (R) => omegaRadGyr(speedAt(Math.max(R, 0.5), s), Math.max(R, 0.5)) * t);
        for (const tr of tracers) {
          const v = speedAt(tr.R, s), phi = tr.phi - omegaRadGyr(v, tr.R) * t;
          const x = tr.R * Math.cos(phi), z = -tr.R * Math.sin(phi);
          tr.b.position.set(x, 0.05, z);
          // Velocity for clockwise motion seen from +y: d/dt of (cos φ, −sin φ) with φ decreasing → (sin φ, cos φ)... worked out below.
          const vx = Math.sin(phi), vz = Math.cos(phi), L = v / 40;  // 40 km/s per unit of arrow
          tr.sh.scale.x = Math.max(0.01, L); tr.sh.position.set(x + (vx * L) / 2, 0.05, z + (vz * L) / 2); tr.sh.rotation.y = -Math.atan2(vz, vx);
          tr.tip.position.set(x + vx * (L + 0.2), 0.05, z + vz * (L + 0.2)); tr.tip.rotation.set(0, -Math.atan2(vz, vx), -Math.PI / 2);
          if (tr.R === 20) { lOut.position.set(x, 0.9, z); lOut.element.textContent = `20 kpc: ${v.toFixed(0)} km/s (measured ${vMeasured(20).toFixed(0)})`; }
          if (tr.R === MW.R0) { lSun.position.set(x, 0.9, z); lSun.element.textContent = `Sun: ${v.toFixed(0)} km/s (measured 229)`; }
        }
        gal.sun.position.copy(tracers[2].b.position); gal.sunRing.position.copy(tracers[2].b.position);
        const hs = s.halo > 0 ? 12 + 14 * Math.min(1, s.halo / 1.2e12) : 0.001;
        haloMesh.scale.setScalar(hs); haloMesh2.scale.setScalar(hs); haloMesh.visible = haloMesh2.visible = s.halo > 0 && s.show === 'galaxy';
        lHalo.visible = md !== 'phone' && s.halo > 0 && s.show === 'galaxy'; lHalo.position.y = hs + 1;
        lOut.visible = s.show === 'galaxy' && md !== 'phone';
        const k = `${s.show}|${Math.round(s.halo / 1e10)}`;
        if (k !== key) { key = k; bd.redraw(); }
      },
      readout(s) {
        if (s.show === 'solar') {
          return lean(`<div class="big">One Sun, falling speeds</div>
            <div class="row"><span>Mercury, 0.39 AU</span><b>47.4 km/s</b></div>
            <div class="row"><span>Earth, 1 AU</span><b>29.8 km/s</b></div>
            <div class="row"><span>Neptune, 30 AU</span><b>5.4 km/s</b></div>
            <div class="row"><span>Rule</span><b>v ∝ 1 ÷ √r when the mass is all in the middle</b></div>
            <small>Mean orbital speeds from NASA's planetary fact sheets, as in KeplerClear.</small>`, [0, 2]);
        }
        const vis = vVisible(20), mod = vModel(20, s.halo), meas = vMeasured(20);
        const needDark = mFromV(20, meas) - mVisible(20), haveDark = mHalo(20, s.halo);
        const fit = Math.abs(mod - meas) / meas < 0.05;
        return lean(`<div class="big">At 20 kpc: ${mod.toFixed(0)} km/s ${fit ? '<span class="ok">✓ fits</span>' : mod < meas ? '<span class="no">too slow</span>' : '<span class="no">too fast</span>'}</div>
          <div class="row"><span>Measured there</span><b>${meas.toFixed(0)} km/s (±5%)</b></div>
          <div class="row"><span>From visible mass alone</span><b>${vis.toFixed(0)} km/s</b></div>
          <div class="row"><span>Visible mass inside 20 kpc</span><b>${sci(mVisible(20), 2)} M☉</b></div>
          <div class="row"><span>Mass the speed demands, v²R ÷ G</span><b>${sci(mFromV(20, meas), 2)} M☉</b></div>
          <div class="row"><span>Dark matter needed inside 20 kpc</span><b>${sci(needDark, 2)} M☉</b></div>
          <div class="row"><span>Your halo gives inside 20 kpc</span><b>${s.halo ? sci(haveDark, 2) + ' M☉' : 'none'}</b></div>
          <div class="row"><span>Sun's lap at ${speedAt(MW.R0, s).toFixed(0)} km/s</span><b>${(1 / (omegaRadGyr(speedAt(MW.R0, s), MW.R0) / (2 * Math.PI)) * 1000).toFixed(0)} million years</b></div>
          <small>Visible mass: ${msun(6.08e10, 1)} of stars, ${msun(MW.M_GAS, 0)} of gas (model), the black hole. Halo: NFW shape, a model. Eilers et al. 2019 find ${sci(7.25e11, 2)} M☉ of dark matter in all.</small>`, [0, 1, 4]);
      },
    };
  },
};
