// Chapter 6: how far and how many. Four scenes, each with its own scale.
// "parallax": the Earth's orbit (1 AU) as the baseline; a star at d parsecs shifts by p = 1 ÷ d arcseconds
//   (the definition of the parsec). Gaia measured positions of bright stars to 24 microarcseconds (ESA) and
//   gave parallaxes for about 1.5 billion stars in DR3 (2022).
// "cepheid": Leavitt's law (1912). The modern version from Benedict et al. 2007 (AJ 133, 1810), as quoted on
//   Wikipedia: M_V = −2.43 (log₁₀P − 1) − 4.05, P in days. Luminosity ratio to the Sun from M_V,☉ = 4.83.
//   Distance from the inverse-square law: d = 10^((m − M + 5) ÷ 5) parsecs (no dust correction).
// "hubble": v = H₀ d (Hubble 1929; Lemaître 1927). H₀ = 67.4 (Planck 2018) or 73 (nearby Cepheids and
//   supernovae), the same figures DopplerClear uses. Redshift z = v ÷ c for small v.
// "neighbours": the Local Group map, 1 unit = 100,000 light-years. Distances: LMC about 160,000 ly and SMC about
//   200,000 ly (Wikipedia, "Magellanic Clouds"); Andromeda 2.5 million ly (NASA 2012); Triangulum (M33) about
//   2.7 million ly (NASA). NASA: the Local Group has over 50 galaxies, nearly 10 million light-years across;
//   the Virgo cluster, over 2,000 galaxies, is about 54 million light-years away.
// Counts: ESA/Hubble 2016: earlier estimates were 100–200 billion galaxies in the observable universe;
//   Conselice et al. 2016 raised it to about 2 trillion (ten times more, mostly faint and far).
import { THREE, M } from '../kit.js';
import { COL, C_KMS, PC_LY, cloud, starfield, layout, unlayout, space, inReel, lean, ring, ball, num, rng, board, panelBg, title, axes, clipTo, curve, line, dot, text } from '../galaxy.js';

const TAU = Math.PI * 2;
const PX = 0, CX = 60, HX = 120, NX = 180;
const VIEWS = {
  parallax: { pos: [PX + 1, 7, 12], target: [PX, 0.5, 0] },
  cepheid: { pos: [CX, 4, 11], target: [CX, 0.6, 0] },
  hubble: { pos: [HX - 2, 16, 11], target: [HX - 2, 0, -2] },
  neighbours: { pos: [NX + 13, 30, 10], target: [NX + 13, 0, -1] },
};
const MV_SUN = 4.83;
const cephM = (P) => -2.43 * (Math.log10(P) - 1) - 4.05;
const GALS = [
  { n: 'Milky Way', x: 0, z: 0, s: 0.9, c: 0xfff1d6 }, { n: 'LMC, 160,000 ly', x: -1.2, z: 1.1, s: 0.3, c: 0x9fd8ff }, { n: 'SMC, 200,000 ly', x: -1.9, z: 0.6, s: 0.2, c: 0x9fd8ff },
  { n: 'Andromeda (M31), 2.5 million ly', x: 24.5, z: -4.5, s: 1.1, c: 0xfff1d6 }, { n: 'Triangulum (M33), 2.7 million ly', x: 24, z: 3.5, s: 0.45, c: 0x8fb8ff },
];

export default {
  id: 'scale',
  short: 'How far, how many',
  title: 'Measuring the distances, counting the galaxies',
  subtitle: 'Parallax, Leavitt\'s pulsing stars and Hubble\'s redshifts build a ladder out to trillions of galaxies.',
  view: VIEWS.parallax,
  learn: `<p>Nothing about galaxies made sense until someone could measure <b>how far</b>. The first rung is <b>parallax</b>: watch a nearby star for a year and it wobbles against the far stars as the Earth goes round the Sun. The wobble is tiny, under one arcsecond for every star, and the <b>parsec</b> is defined by it: the distance at which the wobble is one arcsecond, 3.26 light-years. ESA's <b>Gaia</b> satellite has now measured it for about 1.5 billion stars, out across a good part of the Galaxy.</p>
    <p>Beyond that you need a <b>standard candle</b>. In 1912 <b>Henrietta Leavitt</b> found that <b>Cepheid</b> stars pulse with a rhythm set by their brightness: the longer the period, the more luminous the star. Time the pulse, and you know how bright it really is; compare with how bright it looks, and the inverse-square law gives the distance. With Cepheids, Hubble showed in 1924 that Andromeda lies far outside the Milky Way: galaxies are <b>other galaxies</b>.</p>
    <p>Farther still, the universe does the measuring for you. In 1929 Hubble found that galaxies recede faster the farther they are: <b>v = H₀ × d</b>, with <b>H₀</b> about 70 km/s for every megaparsec (see <a href="https://glassbox.how/dopplerclear/" target="_blank" rel="noopener">DopplerClear</a>). Measure a galaxy's <b>redshift</b> and you have its distance, and the discovery that space itself is expanding.</p>
    <p>And how many? The Milky Way belongs to the <b>Local Group</b>: Andromeda, Triangulum and dozens of dwarfs in a patch about 10 million light-years across, on the edge of the <b>Virgo cluster</b> of over 2,000 galaxies, 54 million light-years away. In 1995 Hubble stared at a blank patch of sky for ten days and found about 3,000 galaxies: the <b>Hubble Deep Field</b>. Scaled to the whole sky, that gave <b>100 to 200 billion</b> galaxies in the observable universe; a 2016 study counting the faint ones raised it to about <b>2 trillion</b>. Indian telescopes watch too: the <b>GMRT</b> near Pune, thirty 45-metre dishes, maps the <b>21 cm</b> radio hum of hydrogen in galaxies (in 2020 it caught that hum from galaxies as they were 8 billion years ago); <b>AstroSat</b>, launched in 2015, sees them in ultraviolet and X-rays; and the 2-metre telescope at <b>Hanle</b>, 4,500 m up in Ladakh, works under some of the darkest skies on Earth.</p>
    <p class="tip"><b>Try it:</b> push the star farther and watch the parallax shrink below what Gaia can measure. Then time a Cepheid, and send a galaxy off with Hubble's law.</p>`,
  terms: [
    { t: 'Parallax', d: 'The apparent shift of a nearby star against far ones as the Earth moves round the Sun. Half the yearly shift, in arcseconds, is 1 ÷ distance in parsecs.' },
    { t: 'Standard candle', d: 'An object whose true brightness is known, so its apparent brightness gives its distance.' },
    { t: 'Cepheid', d: 'A pulsing giant star whose period tells its luminosity: Leavitt’s law, 1912.' },
    { t: 'Hubble’s law', d: 'Galaxies recede at a speed proportional to their distance: v = H₀ × d.' },
    { t: 'Local Group', d: 'Our neighbourhood of over 50 galaxies, about 10 million light-years across, led by Andromeda and the Milky Way.' },
    { t: '21 cm line', d: 'Radio waves at 1420 MHz from cold hydrogen atoms. Radio telescopes such as the GMRT use it to map gas in galaxies.' },
  ],
  defaults: { rung: 'parallax', dpc: 10, period: 10, mag: 10, dist: 100, h0: 70 },
  controls: [
    { key: 'rung', type: 'seg', label: 'Rung of the ladder', options: [{ v: 'parallax', label: 'Parallax' }, { v: 'cepheid', label: 'Cepheid' }, { v: 'hubble', label: 'Hubble’s law' }, { v: 'neighbours', label: 'Neighbours' }] },
    { key: 'dpc', type: 'log', label: 'Parallax: star’s distance', min: 1, max: 100000, fmt: (v) => (v < 1000 ? `${v.toFixed(0)} pc` : `${(v / 1000).toFixed(1)} kpc`) + ` · ${num(v * PC_LY)} ly` },
    { key: 'period', type: 'range', label: 'Cepheid: pulse period', min: 2, max: 60, step: 0.5, fmt: (v) => `${v.toFixed(1)} days` },
    { key: 'mag', type: 'range', label: 'Cepheid: how bright it looks (magnitude)', min: 4, max: 24, step: 0.1, ends: ['naked eye', 'Hubble only'], fmt: (v) => `m = ${v.toFixed(1)}` },
    { key: 'dist', type: 'range', label: 'Hubble: galaxy’s distance', min: 10, max: 600, step: 5, fmt: (v) => `${v} Mpc · ${num(Math.round(v * 3.2616))} million ly` },
    { key: 'h0', type: 'seg', label: 'Hubble constant', options: [{ v: 67.4, label: '67.4' }, { v: 70, label: '70' }, { v: 73, label: '73' }] },
  ],
  onChange(s, key) { if (key === 'dpc') s.rung = 'parallax'; if (key === 'period' || key === 'mag') s.rung = 'cepheid'; if (key === 'dist' || key === 'h0') s.rung = 'hubble'; },
  quiz: [
    { q: 'A star shows a parallax of 0.1 arcseconds. How far is it?', options: ['1 parsec', '10 parsecs', '100 parsecs', '0.1 light-years'], answer: 1, why: 'Distance in parsecs = 1 ÷ parallax in arcseconds = 10 pc, about 33 light-years.' },
    { q: 'What did Henrietta Leavitt discover about Cepheid stars?', options: ['They are all the same distance', 'Their pulse period tells their true brightness', 'They are made of iron', 'They never change'], answer: 1, why: 'Longer period, brighter star. Time the pulse and you have a standard candle for measuring distance.' },
    { q: 'Roughly how many galaxies are in the observable universe?', options: ['A few thousand', 'About a million', 'Hundreds of billions to a couple of trillion', 'Exactly 100'], answer: 2, why: 'Hubble Deep Field counts gave 100 to 200 billion; a 2016 study that included faint galaxies raised the estimate to about 2 trillion.' },
  ],
  reel: [
    { ms: 5600, caption: 'Nearby stars wobble as the Earth goes round: parallax. Cepheids and redshifts carry the ladder out to trillions of galaxies.', set: { rung: 'parallax', dpc: 5 }, anim: { dpc: [3, 30, true] }, view: { pos: [PX, 6, 11], target: [PX, 0.5, 0] }, spin: 0 },
  ],

  build({ stage }) {
    space(stage);
    const root = new THREE.Group(); stage.root.add(root);
    root.add(starfield(900, 300, 19));

    // ================================================================ PARALLAX (1 unit = 1 AU for the orbit; the star is drawn at a compressed distance)
    const P = new THREE.Group(); P.position.x = PX; root.add(P);
    P.add(ring(1, 0xffd36b, 0.6, 0.03));
    const sunP = ball(0.14, 0xffd36b); P.add(sunP);
    const earth = ball(0.08, 0x4f8dff); P.add(earth);
    const star = ball(0.12, 0xffffff); P.add(star);
    const sight1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 6), M.glow(0x8ef0ff, { transparent: true, opacity: 0.7 })); P.add(sight1);
    const sight2 = sight1.clone(); P.add(sight2);
    const farWall = cloud(160, 0.25, 0.9); P.add(farWall); { const r = rng(23); for (let i = 0; i < 160; i++) { farWall.set(i, (r() - 0.5) * 16, (r() - 0.2) * 8, -14); farWall.paint(i, 0xffffff, 0.8); } farWall.done(); }
    const lEarthJan = stage.label('Earth in January', [1, 0.3, 0], P), lEarthJul = stage.label('Earth in July', [-1, 0.3, 0], P);
    const lStar = stage.label('', [0, 0, 0], P, 'hot'), lFar = stage.label('far background stars', [0, 5.6, -14], P), lBase = stage.label('baseline: 2 AU', [0, -0.35, 0.3], P);

    // ================================================================ CEPHEID
    const Cg = new THREE.Group(); Cg.position.x = CX; root.add(Cg);
    const ceph = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), new THREE.MeshBasicMaterial({ color: 0xffe9a8, toneMapped: false })); ceph.position.y = 0.8; Cg.add(ceph);
    const cephGlow = new THREE.Mesh(new THREE.SphereGeometry(1.4, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.2, depthWrite: false, toneMapped: false })); cephGlow.position.y = 0.8; Cg.add(cephGlow);
    const lCeph = stage.label('a Cepheid, swelling and shrinking', [0, 2.9, 0], Cg);
    const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 1.2, 16), M.metal(0xb9bec8)); scope.rotation.z = Math.PI / 2 + 0.3; scope.position.set(-4.2, 0.2, 0); Cg.add(scope);
    const lScope = stage.label('telescope: how bright does it look?', [-3.6, 1.0, 0], Cg);

    // ================================================================ HUBBLE (1 unit = 50 Mpc)
    const Hg = new THREE.Group(); Hg.position.x = HX; root.add(Hg);
    const NG = 180, gal = cloud(NG, 0.6, 0.95, false); Hg.add(gal);
    const r3 = rng(29);
    const gpos = Array.from({ length: NG }, () => { const a = r3() * TAU, rr = 0.8 + 12.4 * Math.sqrt(r3()); return [Math.cos(a) * rr, Math.sin(a) * rr]; });
    const us = ball(0.25, 0x8ef0ff); Hg.add(us);
    const mark = ball(0.32, 0xffb547); Hg.add(mark);
    const dRing = ring(1, 0xffb547, 0.6, 0.06); Hg.add(dRing);
    const lUs = stage.label('Milky Way: us', [0, 0.5, 1.0], Hg), lMark = stage.label('', [0, 0, 0], Hg, 'hot');
    let ht = 0;

    // ================================================================ NEIGHBOURS (1 unit = 100,000 ly)
    const Ng = new THREE.Group(); Ng.position.x = NX; root.add(Ng);
    const nl = GALS.map((gd) => {
      const g = new THREE.Group(); g.position.set(gd.x, 0, gd.z); Ng.add(g);
      const c = cloud(220, 0.22 * gd.s + 0.08, 0.9); g.add(c); const r = rng(gd.x * 7 + 3);
      for (let i = 0; i < 220; i++) { const rr = gd.s * Math.sqrt(r()), a = r() * TAU; c.set(i, rr * Math.cos(a), (r() - 0.5) * 0.05 * gd.s, rr * Math.sin(a)); c.paint(i, gd.c, 0.6 + 0.6 * r()); } c.done();
      const l = stage.label(gd.n, [0, 0.5 + gd.s * 0.5, gd.n.startsWith('SMC') ? 1.2 : 0], g, gd.n === 'Milky Way' ? 'hot' : ''); return l;
    });
    const scaleBar = new THREE.Mesh(new THREE.BoxGeometry(10, 0.05, 0.05), M.glow(0xffffff, { transparent: true, opacity: 0.6 })); scaleBar.position.set(8, 0, 5); Ng.add(scaleBar);
    const lScale = stage.label('1 million light-years', [8, -0.4, 5.6], Ng);
    const lVirgo = stage.label('Virgo cluster: over 2,000 galaxies, 54 million ly, far beyond →', [22, 0.3, -9], Ng);

    // ================================================================ board
    let S = null, rung = 'parallax', key = '', md = 'wide', phase = 0;
    const bd = board(root, (g, w, h) => {
      panelBg(g, w, h); if (!S) return;
      if (rung === 'parallax') {
        title(g, 'Parallax shrinks with distance', 'p = 1 ÷ d: one arcsecond at one parsec');
        const ax = axes(g, w, h, { xMax: 5, yMax: 3, xMin: 0, yMin: -4, xTicks: [0, 1, 2, 3, 4, 5], yTicks: [-4, -3, -2, -1, 0, 1, 2, 3], xFmt: (x) => ['1', '10', '100', '1k', '10k', '100k'][x], yFmt: (y) => ['0.1 mas', '1 mas', '10 mas', '0.1″', '1″', '10″', '100″', '1000″'][y + 4], xLabel: 'distance (parsecs)', yLabel: 'parallax' });
        clipTo(g, ax, () => { line(g, [[0, 0], [5, -5]], ax.X, ax.Y, COL.cool, 4); line(g, [[0, Math.log10(0.024)], [5, Math.log10(0.024)]], ax.X, ax.Y, COL.red, 2, [6, 6]); line(g, [[0, 0], [5, 0]], ax.X, ax.Y, 'rgba(255,255,255,.3)', 2, [6, 6]); });
        text(g, 'Gaia’s best: 0.024 mas', ax.X(0.2), ax.Y(Math.log10(0.024)) - 10, COL.red, '18px sans-serif');
        text(g, 'Hipparcos 1997: about 1 mas', ax.X(0.2), ax.Y(0) - 10, 'rgba(255,255,255,.6)', '18px sans-serif');
        dot(g, ax.X(Math.log10(S.dpc)), ax.Y(-Math.log10(S.dpc)), COL.hot, 8);
      } else if (rung === 'cepheid') {
        title(g, 'Leavitt’s law: longer pulse, brighter star', 'M_V = −2.43 (log P − 1) − 4.05 (Benedict et al. 2007)');
        const ax = axes(g, w, h, { xMin: 0.3, xMax: 1.8, yMin: -2, yMax: -7, xTicks: [0.3, 0.6, 1, 1.3, 1.6], yTicks: [-2, -3, -4, -5, -6, -7], xFmt: (x) => `${Math.round(Math.pow(10, x))} d`, yFmt: (y) => `M = ${y}`, xLabel: 'period', yLabel: 'true brightness (brighter upward)' });
        clipTo(g, ax, () => curve(g, (x) => cephM(Math.pow(10, x)), 0.3, 1.8, ax.X, ax.Y, COL.hot, 4));
        dot(g, ax.X(Math.log10(S.period)), ax.Y(cephM(S.period)), COL.cool, 8);
        text(g, `${S.period} days → ${num(Math.pow(10, (MV_SUN - cephM(S.period)) / 2.5))} Suns`, ax.X(0.35), ax.Y(-6.4), COL.text, '19px sans-serif');
      } else if (rung === 'hubble') {
        const v = S.h0 * S.dist;
        title(g, 'Farther means faster', `v = H₀ × d, H₀ = ${S.h0} km/s per Mpc`);
        const ax = axes(g, w, h, { xMax: 600, yMax: 45000, xTicks: [0, 200, 400, 600], yTicks: [0, 15000, 30000, 45000], yFmt: (y) => num(y), xLabel: 'distance (Mpc)', yLabel: 'km/s' });
        clipTo(g, ax, () => { line(g, [[0, 0], [600, 600 * 500]], ax.X, ax.Y, 'rgba(255,255,255,.3)', 2, [6, 5]); line(g, [[0, 0], [600, 600 * S.h0]], ax.X, ax.Y, COL.cool, 5); });
        text(g, 'Hubble’s 1929 slope: about 500', ax.X(60), ax.Y(40000), COL.soft, '16px sans-serif');
        dot(g, ax.X(S.dist), ax.Y(v), COL.hot, 8);
      } else {
        title(g, 'How many galaxies?', 'counts from deep fields, scaled to the whole sky');
        const rows = [['Local Group (NASA)', 'over 50'], ['Virgo cluster (NASA)', 'over 2,000'], ['Hubble Deep Field, 1995', 'about 3,000 in one tiny patch'], ['Observable universe, earlier estimate', '100–200 billion'], ['Conselice et al. 2016', 'about 2 trillion']];
        rows.forEach(([a, b], i) => { text(g, a, 26, 130 + i * 52, COL.soft, '22px sans-serif'); text(g, b, w - 26, 130 + i * 52, i >= 3 ? COL.hot : COL.text, 'bold 24px sans-serif', 'right'); });
      }
    });

    return {
      dispose() { unlayout(stage); },
      update(dt, s) {
        dt = Math.max(0, dt); S = s; phase += dt;
        md = layout(stage, bd, [lEarthJan, lEarthJul, lFar, lBase, lScope, lUs, lScale, lVirgo, ...nl.slice(1)]);
        if (s.rung !== rung) { rung = s.rung; const v = VIEWS[rung]; if (!inReel()) stage.setView(v.pos, v.target, 1.0); }
        P.visible = rung === 'parallax'; Cg.visible = rung === 'cepheid'; Hg.visible = rung === 'hubble'; Ng.visible = rung === 'neighbours';
        [lStar, lCeph, lMark].forEach((l) => { l.visible = l.parent?.parent?.visible !== false; });
        lStar.visible = P.visible; lCeph.visible = Cg.visible; lMark.visible = Hg.visible;
        if (P.visible) {
          // The Earth goes round once every 6 s; the star sits at a drawn distance that grows only slowly with the real one.
          const a = phase * TAU / 6; earth.position.set(Math.cos(a), 0, -Math.sin(a));
          const drawn = 3 + 2.2 * Math.log10(s.dpc); star.position.set(0, 0.6, -drawn);
          const p = 1 / s.dpc;
          lStar.position.set(0.6, 1.0, -drawn); lStar.element.innerHTML = `star at ${s.dpc < 1000 ? s.dpc.toFixed(0) + ' pc' : (s.dpc / 1000).toFixed(1) + ' kpc'}: parallax <b>${p >= 0.01 ? (p * 1000).toFixed(0) + ' mas' : (p * 1e6).toFixed(0) + ' µas'}</b>`;
          const aim = (m, from, to) => { const A = new THREE.Vector3(...from), B = new THREE.Vector3(...to); m.position.copy(A).add(B).multiplyScalar(0.5); m.scale.y = A.distanceTo(B); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); };
          // Sight lines from the Earth's two extreme positions through the star to the far wall (exaggerated).
          const ex = 1, sx = star.position, k = (14 + drawn) / drawn;
          aim(sight1, [ex, 0, 0], [ex + (sx.x - ex) * k, sx.y * k, sx.z * k]);
          aim(sight2, [-ex, 0, 0], [-ex + (sx.x + ex) * k, sx.y * k, sx.z * k]);
        }
        if (Cg.visible) {
          const Pd = s.period, ph = (phase / (Pd * 0.25)) % 1;        // a day = 0.25 s on screen
          const sw = 0.85 + 0.25 * Math.sin(ph * TAU);
          ceph.scale.setScalar(sw); cephGlow.scale.setScalar(sw * (1 + 0.3 * Math.max(0, Math.sin(ph * TAU)))); cephGlow.material.opacity = 0.12 + 0.18 * Math.max(0, Math.sin(ph * TAU));
          ceph.material.color.setRGB(1, 0.86 + 0.08 * Math.sin(ph * TAU), 0.6 + 0.2 * Math.sin(ph * TAU));
        }
        if (Hg.visible) {
          ht = (ht + dt / 9) % 1;
          const a = 1 + 0.3 * ht, fade = Math.min(1, ht * 8, (1 - ht) * 8);
          for (let i = 0; i < NG; i++) { const [x, z] = gpos[i], rr = Math.hypot(x, z), k = Math.min(1, rr / 13); gal.set(i, x * a, 0, z * a); gal.paint(i, 0xffffff, fade); gal.col[i * 3 + 1] *= 1 - 0.7 * k; gal.col[i * 3 + 2] *= 1 - 0.9 * k; }
          gal.done();
          const rr = (s.dist / 50) * a, ang = -0.6; mark.position.set(rr * Math.cos(ang), 0.2, rr * Math.sin(ang)); dRing.scale.setScalar(rr);
          lMark.position.set(mark.position.x, 0.8, mark.position.z - 0.9); lMark.element.innerHTML = `${s.dist} Mpc away: receding at <b>${num(s.h0 * s.dist)} km/s</b>`;
        }
        const kk = `${rung}|${s.dpc.toFixed(0)}|${s.period}|${s.mag}|${s.dist}|${s.h0}`; if (kk !== key) { key = kk; bd.redraw(); }
      },
      readout(s) {
        if (s.rung === 'parallax') {
          const p = 1 / s.dpc, gaia = p > 0.00024, hip = p > 0.01;
          return lean(`<div class="big">Parallax ${p >= 0.001 ? (p * 1000).toFixed(1) + ' mas' : (p * 1e6).toFixed(0) + ' µas'}</div>
            <div class="row"><span>Distance</span><b>${num(s.dpc)} pc = ${num(s.dpc * PC_LY)} light-years</b></div>
            <div class="row"><span>Rule</span><b>p (arcsec) = 1 ÷ d (parsecs)</b></div>
            <div class="row"><span>Hipparcos (1997, about 1 mas)</span><b class="${hip ? 'ok' : 'no'}">${hip ? 'could measure it' : 'too small'}</b></div>
            <div class="row"><span>Gaia (0.024 mas for bright stars)</span><b class="${gaia ? 'ok' : 'no'}">${gaia ? 'measures it to ' + ((0.00024 / p) * 100).toFixed(1) + '%' : 'beyond reach'}</b></div>
            <div class="row"><span>Nearest star, Proxima</span><b>1.30 pc: 768 mas</b></div>
            <small>The star is drawn far too close, and the shift is exaggerated, so you can see it. Gaia DR3 (2022): parallaxes for about 1.5 billion stars.</small>`, [0, 1, 4]);
        }
        if (s.rung === 'cepheid') {
          const Mv = cephM(s.period), L = Math.pow(10, (MV_SUN - Mv) / 2.5), d = Math.pow(10, (s.mag - Mv + 5) / 5);
          return lean(`<div class="big">Period ${s.period} days → ${num(L)} Suns</div>
            <div class="row"><span>True brightness, M_V</span><b>${Mv.toFixed(2)}</b></div>
            <div class="row"><span>Looks like magnitude</span><b>${s.mag.toFixed(1)}</b></div>
            <div class="row"><span>So its distance is</span><b>${d < 1e4 ? num(d) + ' pc' : d < 1e6 ? (d / 1000).toFixed(0) + ' kpc' : (d / 1e6).toFixed(2) + ' Mpc'} = ${d * PC_LY < 1e6 ? num(d * PC_LY) + ' ly' : (d * PC_LY / 1e6).toFixed(2) + ' million ly'}</b></div>
            <div class="row"><span>Andromeda's Cepheids (Hubble 1924)</span><b>about m = 18, periods 10–50 days</b></div>
            <small>Leavitt 1912; calibration from Benedict et al. 2007. Dust dimming is ignored here; real work corrects for it.</small>`, [0, 2]);
        }
        if (s.rung === 'hubble') {
          const v = s.h0 * s.dist, z = v / C_KMS;
          return lean(`<div class="big">v = H₀ × d = ${num(v)} km/s</div>
            <div class="row"><span>Distance</span><b>${s.dist} Mpc = ${num(Math.round(s.dist * 3.2616))} million ly</b></div>
            <div class="row"><span>Redshift z ≈ v ÷ c</span><b>${z.toFixed(4)}</b></div>
            <div class="row"><span>Hydrogen's 656.3 nm line arrives at</span><b>${(656.28 * (1 + z)).toFixed(1)} nm</b></div>
            <div class="row"><span>Light left it</span><b>about ${num(Math.round(s.dist * 3.2616))} million years ago</b></div>
            <small>H₀ = 67.4 from the cosmic microwave background (Planck 2018) or about 73 from nearby Cepheids and supernovae: the "Hubble tension". Same figures as DopplerClear.</small>`, [0, 1]);
        }
        return lean(`<div class="big">Our Local Group</div>
          <div class="row"><span>Members</span><b>over 50 galaxies, most of them dwarfs (NASA)</b></div>
          <div class="row"><span>Across</span><b>nearly 10 million light-years</b></div>
          <div class="row"><span>Nearest big cluster</span><b>Virgo: over 2,000 galaxies, 54 million ly</b></div>
          <div class="row"><span>Observable universe</span><b>100–200 billion galaxies, or about 2 trillion counting the faint ones (2016)</b></div>
          <div class="row"><span>India watches with</span><b>GMRT (21 cm radio), AstroSat (2015), Hanle 2 m telescope</b></div>
          <small>Map to scale in the plane, 1 unit = 100,000 light-years; galaxy sizes roughly to scale. Positions on the sky simplified.</small>`, [0, 3, 4]);
      },
    };
  },
};
