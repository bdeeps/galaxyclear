// Chapter 3: why spiral arms are not fixed things. 1 unit = 1 kpc.
// "Wind it up": 2,400 stars painted along two spiral arms, each then turning at the real angular speed
//   Ω(R) = v(R) ÷ R of the fitted rotation curve (galaxy.js: visible mass + 10¹² M☉ halo). Because the
//   inner stars lap faster, the arms wrap tighter and tighter: the winding problem (Lindblad; Oort 1962).
//   Over 1 Gyr a star at 4 kpc laps about 9 times, the Sun 4.5 times, a star at 15 kpc 2.5 times.
// "Density wave": a kinematic sketch of Lin & Shu's (1964) idea, drawn the way Kalnajs (1973) did it: each
//   star rides a slightly oval orbit, and the ovals' long axes turn with radius, so they crowd along two
//   spiral loci. The whole pattern turns at one slow pattern speed Ωp while the stars inside corotation
//   sweep through it like cars through a traffic jam. Gas entering an arm is compressed and lights up
//   with new blue stars and pink nebulae, which fade as they move on. Pattern speeds quoted for the
//   Milky Way's arms are roughly 20–30 km/s per kpc (illustrative here; the true value is debated).
import { THREE } from '../kit.js';
import { MW, COL, KMS_KPC_TO_RAD_GYR, cloud, starfield, layout, unlayout, space, lean, ring, ball, num, board, panelBg, title, axes, clipTo, curve, line, dot, text, vModel, omegaRadGyr, lapsIn, rng } from '../galaxy.js';

const HALO = 1.0e12;                                   // the halo from chapter 2 that fits the measured curve
const V = (R) => vModel(Math.max(R, 0.3), HALO);
const OMEGA = (R) => omegaRadGyr(V(R), Math.max(R, 0.3));   // rad per Gyr
const TAU = Math.PI * 2, PITCH = MW.PITCH;
const spiral = (R, m, R1 = 2.5) => (m * Math.PI) - Math.log(Math.max(R, R1) / R1) / Math.tan(PITCH);   // trailing, clockwise rotation

export default {
  id: 'arms',
  short: 'The arms',
  title: 'Spiral arms that are not made of the same stars',
  subtitle: 'Painted-on arms would wind up in a few turns. Real arms are slow-moving traffic jams that stars pass through.',
  view: { pos: [1, 52, 10], target: [0, 0, 0] },
  learn: `<p>Here is a puzzle. Suppose the arms were simply <b>lines of stars</b>, like the stripes on a pinwheel. The inner stars lap the Galaxy far more often than the outer ones: in a billion years a star 4 kpc out goes round about nine times, the Sun about four and a half, a star 15 kpc out only two and a half. Any painted-on arm would be wrapped round and round within a few hundred million years. Yet real arms are open, with a <b>pitch angle</b> of about 12°, and the Galaxy is 13 billion years old. This is the <b>winding problem</b>.</p>
    <p>In 1964 <b>C. C. Lin</b> and <b>Frank Shu</b> gave the answer that is still the standard picture: the arms are <b>density waves</b>. Think of a slow lorry on a highway. Cars pile up behind it, crawl past, then speed away. The jam is real and it moves, but far more slowly than the cars, and it is never made of the same cars for long. In a galaxy, stars on slightly <b>oval orbits</b> line up so that their orbits crowd along two spiral loci. That crowding, the <b>pattern</b>, turns at one slow rate everywhere, while the stars sweep through it faster inside the <b>corotation</b> radius and slower outside.</p>
    <p>Gas feels the jam hardest. Entering an arm it is <b>compressed</b>, clouds collapse, and <b>new stars</b> are born. The brightest are blue, burn out in a few million years, and light up the hydrogen around them pink: so arms glow with young stars and nebulae, while the old stars that make up most of the disc are spread more smoothly. Not every astronomer thinks the waves are long-lived: in many galaxies the arms may be <b>transient</b>, forming and dissolving over a few hundred million years, with the same compression lighting them up.</p>
    <p class="tip"><b>Try it:</b> in "wind it up", drag time forward and count the wraps. Then switch to the density wave and watch the stars overtake the pattern while new blue stars appear only in the arms.</p>`,
  terms: [
    { t: 'Winding problem', d: 'If arms were fixed lines of stars, differential rotation would wrap them tightly within a few hundred million years. They are not wrapped, so they are not fixed lines.' },
    { t: 'Density wave', d: 'A spiral-shaped crowding of orbits that turns slowly as a pattern while stars and gas pass through it.' },
    { t: 'Pattern speed', d: 'How fast the spiral pattern turns, the same at every radius, written Ωp.' },
    { t: 'Corotation', d: 'The radius where stars orbit at the pattern speed. Inside it stars overtake the arms; outside, the arms overtake the stars.' },
    { t: 'Pitch angle', d: 'How open a spiral is: the angle between an arm and a circle. About 12° for the Milky Way.' },
    { t: 'HII region', d: 'A pink glowing cloud of hydrogen lit by hot young stars, such as the Orion Nebula. They mark the arms.' },
  ],
  defaults: { mode: 'wind', time: 0, omegaP: 25, run: true },
  controls: [
    { key: 'mode', type: 'seg', label: 'Model', options: [{ v: 'wind', label: 'Wind it up' }, { v: 'wave', label: 'Density wave' }] },
    { key: 'time', type: 'range', label: 'Wind it up: time', min: 0, max: 1.5, step: 0.01, ends: ['now', '1.5 billion years'], fmt: (v) => `${Math.round(v * 1000)} million years` },
    { key: 'omegaP', type: 'range', label: 'Density wave: pattern speed', min: 12, max: 40, step: 1, ends: ['slow', 'fast'], fmt: (v) => `${v} km/s per kpc` },
    { key: 'run', type: 'toggle', label: 'Let time run' },
  ],
  quiz: [
    { q: 'Why can’t spiral arms be fixed lines of the same stars?', options: ['Stars are too faint', 'Inner stars lap faster than outer ones, so such arms would wrap up in a few hundred million years', 'Stars never move', 'Arms are made of dust only'], answer: 1, why: 'Differential rotation would wind a material arm tightly long before the Galaxy reached its present age. Real arms are open.' },
    { q: 'In the density-wave picture, what is an arm most like?', options: ['A solid spoke', 'A traffic jam that moves slowly while cars pass through it', 'A river flowing outward', 'A shadow of the bulge'], answer: 1, why: 'The crowding is real and turns slowly, but it is not made of the same stars for long: they move through it.' },
    { q: 'Why are arms bright with blue stars and pink nebulae?', options: ['Blue stars only orbit there', 'Gas is compressed in the arm, forms new stars, and the hot young ones light up the hydrogen', 'The arms are closer to us', 'The arms are hotter because of the black hole'], answer: 1, why: 'Star formation is triggered in the compressed gas. Blue giants die within a few million years, so they never get far from where they were born.' },
  ],
  reel: [
    { ms: 5600, caption: 'If the arms were fixed lines of stars, the faster inner stars would wrap them up within a few hundred million years.', set: { mode: 'wind', run: false }, anim: { time: [0, 1.0] }, view: { pos: [0, 38, 8], target: [0, 0, 0] }, spin: 0 },
    { ms: 5600, caption: 'Real arms are density waves: slow traffic jams of orbits that stars and gas sweep through, lighting up with new stars.', set: { mode: 'wave', omegaP: 25, run: true }, view: { pos: [0, 38, 8], target: [0, 0, 0] }, spin: 0 },
  ],

  build({ stage }) {
    space(stage);
    const root = new THREE.Group(); stage.root.add(root);
    root.add(starfield(900, 300, 9));
    root.add(ring(MW.R0, COL.sun, 0.3, 0.05));
    for (const R of [5, 10, 15]) root.add(ring(R, 0xffffff, 0.08, 0.03));

    // ---- wind it up: stars painted on two arms
    const NW = 2400, wind = cloud(NW, 0.5, 0.95); root.add(wind);
    const r1 = rng(21);
    const W = Array.from({ length: NW }, (_, i) => { const R = 2.5 + 12.5 * r1(), m = i % 2, phi0 = spiral(R, m) + (r1() - 0.5) * 0.18; return { R, phi0, k: 0.6 + 0.6 * r1(), m }; });
    const bulge = cloud(700, 0.5, 0.6); root.add(bulge);
    { const r = rng(5); for (let i = 0; i < 700; i++) { const rr = Math.abs(r() + r() - 1) * 2.2, a = r() * TAU; bulge.set(i, rr * Math.cos(a), (r() - 0.5) * 0.4, rr * Math.sin(a)); bulge.paint(i, COL.bulge, 0.35); } bulge.done(); }

    // ---- density wave: stars on ovals, plus gas that lights up in the arms
    const NS = 3200, NG = 3000, E = 0.26;
    const stars = cloud(NS, 0.42, 0.85), gas = cloud(NG, 0.75, 0.95); root.add(stars, gas);
    const r2 = rng(33);
    const Sd = Array.from({ length: NS }, () => ({ R: 2.5 + 12.5 * Math.sqrt(r2()), th0: r2() * TAU, k: 0.22 + 0.2 * r2() }));
    const Gd = Array.from({ length: NG }, () => ({ R: 2.5 + 12.5 * Math.sqrt(r2()), th0: r2() * TAU, pink: r2() < 0.3 }));
    const psi = (R) => Math.log(Math.max(R, 2.5) / 2.5) / Math.tan(PITCH);   // long-axis direction turns with R (trailing)
    const ovalR = (R, th, pt) => R * (1 - E * Math.cos(2 * (th - (pt - psi(R)))));   // centred oval, m = 2
    const sun = ball(0.2, COL.sun); root.add(sun);
    const lSun = stage.label('Sun', [MW.R0, 0.7, 0], root, 'hot'); lSun.element.style.setProperty('--c', '#ffd36b');
    const lCo = stage.label('corotation', [0, 0.6, 0], root);
    const coRing = ring(10, 0xffb547, 0.5, 0.06); root.add(coRing);
    const lJam = stage.label('arm: the traffic jam', [0, 0.6, 0], root);

    let S = null, md = 'wide', tWave = 0, tWind = 0, key = '';
    const bd = board(root, (g, w, h) => {
      panelBg(g, w, h); if (!S) return;
      if (S.mode === 'wind') {
        title(g, 'Laps completed against distance', `after ${Math.round(S.time * 1000)} million years, from the fitted rotation curve`);
        const ax = axes(g, w, h, { xMax: 16, yMax: 16, xTicks: [0, 4, 8, 12, 16], yTicks: [0, 4, 8, 12, 16], xLabel: 'distance from the centre (kpc)', yLabel: 'laps' });
        clipTo(g, ax, () => { curve(g, (R) => lapsIn(V(R), R, 1.0), 1, 16, ax.X, ax.Y, 'rgba(255,255,255,.35)', 2, [6, 6]); curve(g, (R) => lapsIn(V(R), R, S.time), 1, 16, ax.X, ax.Y, COL.hot, 5); });
        text(g, 'in 1 billion years', ax.X(9), ax.Y(lapsIn(V(9), 9, 1)) - 14, 'rgba(255,255,255,.6)', '18px sans-serif');
        for (const R of [4, MW.R0, 15]) { dot(g, ax.X(R), ax.Y(lapsIn(V(R), R, S.time)), R === MW.R0 ? '#ffd36b' : COL.cool, 7); text(g, `${R === MW.R0 ? 'Sun' : R + ' kpc'}: ${lapsIn(V(R), R, S.time).toFixed(1)}`, ax.X(R) + 10, ax.Y(lapsIn(V(R), R, S.time)) - 12, COL.text, '18px sans-serif'); }
      } else {
        title(g, 'Stars turn fast inside, the pattern turns at one speed', `Ω = v ÷ R against the pattern speed Ωp = ${S.omegaP} km/s per kpc`);
        const ax = axes(g, w, h, { xMax: 16, yMax: 80, xTicks: [0, 4, 8, 12, 16], yTicks: [0, 20, 40, 60, 80], xLabel: 'distance from the centre (kpc)', yLabel: 'km/s per kpc' });
        clipTo(g, ax, () => { curve(g, (R) => V(R) / R, 2, 16, ax.X, ax.Y, COL.cool, 5); line(g, [[0, S.omegaP], [16, S.omegaP]], ax.X, ax.Y, COL.hot, 4, [8, 6]); });
        const Rc = corotation(S.omegaP);
        if (Rc < 16) { dot(g, ax.X(Rc), ax.Y(S.omegaP), COL.hot, 8); text(g, `corotation at ${Rc.toFixed(1)} kpc`, ax.X(Rc) + 10, ax.Y(S.omegaP) - 14, COL.hot, 'bold 18px sans-serif'); }
        text(g, 'stars: Ω = v ÷ R', ax.X(4), ax.Y(V(4) / 4) - 14, COL.cool, '18px sans-serif');
        text(g, 'pattern: Ωp', ax.X(12.5), ax.Y(S.omegaP) + 24, COL.hot, '18px sans-serif');
        dot(g, ax.X(MW.R0), ax.Y(V(MW.R0) / MW.R0), '#ffd36b', 7);
      }
    });
    function corotation(op) { let lo = 1, hi = 40; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (V(m) / m > op) lo = m; else hi = m; } return (lo + hi) / 2; }

    return {
      dispose() { unlayout(stage); },
      update(dt, s) {
        dt = Math.max(0, dt); S = s;
        md = layout(stage, bd, [lCo, lJam]);
        const wave = s.mode === 'wave';
        wind.visible = bulge.visible = !wave; stars.visible = gas.visible = coRing.visible = wave;
        lCo.visible = lJam.visible = wave && md !== 'phone';
        if (!wave) {
          if (s.run) { tWind += dt; }
          const t = s.time;
          for (let i = 0; i < NW; i++) { const d = W[i], phi = d.phi0 - OMEGA(d.R) * t; wind.set(i, d.R * Math.cos(phi), 0, -d.R * Math.sin(phi)); wind.paint(i, d.m ? COL.blue : COL.pink, d.k); }
          wind.done();
          const phiS = -OMEGA(MW.R0) * t; sun.position.set(MW.R0 * Math.cos(phiS), 0.05, -MW.R0 * Math.sin(phiS)); lSun.position.set(sun.position.x, 0.7, sun.position.z);
        } else {
          // One second on screen = 10 million years.
          if (s.run) tWave += dt * 0.01;
          const op = s.omegaP * KMS_KPC_TO_RAD_GYR, pt = -op * tWave;     // pattern angle (clockwise)
          for (let i = 0; i < NS; i++) {
            const d = Sd[i], th = d.th0 - OMEGA(d.R) * tWave, rr = ovalR(d.R, th, pt);
            stars.set(i, rr * Math.cos(th), 0, -rr * Math.sin(th)); stars.paint(i, COL.disc, d.k);
          }
          stars.done();
          for (let i = 0; i < NG; i++) {
            const d = Gd[i], th = d.th0 - OMEGA(d.R) * tWave, rr = ovalR(d.R, th, pt);
            // Gas is squeezed where the ovals crowd (near the short axis of each oval, the arm). It lights up there and fades as it leaves.
            const phase = Math.cos(2 * (th - (pt - psi(d.R))));
            const lit = Math.max(0, phase - 0.4) / 0.6;
            gas.set(i, rr * Math.cos(th), 0.02, -rr * Math.sin(th));
            if (lit > 0) gas.paint(i, d.pink ? COL.pink : COL.blue, 0.5 + 2.0 * lit); else gas.paint(i, 0x4a6a9a, 0.2);
          }
          gas.done();
          const thS = -OMEGA(MW.R0) * tWave, rS = ovalR(MW.R0, thS, pt); sun.position.set(rS * Math.cos(thS), 0.05, -rS * Math.sin(thS)); lSun.position.set(sun.position.x, 0.7, sun.position.z);
          const Rc = corotation(s.omegaP); coRing.scale.setScalar(Math.min(Rc, 30) / 10); lCo.position.set(Rc * 0.7, 0.6, Rc * 0.7);
          const ja = pt - psi(10) + Math.PI / 2; lJam.position.set(10 * Math.cos(ja) * (1 - E), 0.6, -10 * Math.sin(ja) * (1 - E));
        }
        const k = `${s.mode}|${s.time.toFixed(2)}|${s.omegaP}`;
        if (k !== key) { key = k; bd.redraw(); }
      },
      readout(s) {
        if (s.mode === 'wind') {
          const l4 = lapsIn(V(4), 4, s.time), lS = lapsIn(V(MW.R0), MW.R0, s.time), l15 = lapsIn(V(15), 15, s.time);
          return lean(`<div class="big">${s.time < 0.02 ? 'Two fresh arms' : `${(l4 - l15).toFixed(1)} extra wraps inside`}</div>
            <div class="row"><span>Time</span><b>${Math.round(s.time * 1000)} million years</b></div>
            <div class="row"><span>Laps at 4 kpc (${V(4).toFixed(0)} km/s)</span><b>${l4.toFixed(2)}</b></div>
            <div class="row"><span>Laps for the Sun (${V(MW.R0).toFixed(0)} km/s)</span><b>${lS.toFixed(2)}</b></div>
            <div class="row"><span>Laps at 15 kpc (${V(15).toFixed(0)} km/s)</span><b>${l15.toFixed(2)}</b></div>
            <div class="row"><span>Real arms</span><b>open, pitch about 12°, in a 13-billion-year-old Galaxy</b></div>
            <small>Each star keeps the speed of the fitted rotation curve at its own radius. A lap = 2πR ÷ v.</small>`, [0, 2]);
        }
        const Rc = corotation(s.omegaP), oS = V(MW.R0) / MW.R0, rel = Math.abs(oS - s.omegaP);
        const between = rel > 0.01 ? (Math.PI / (rel * KMS_KPC_TO_RAD_GYR)) * 1000 : Infinity;   // two arms: half a relative turn between passages
        return lean(`<div class="big">Corotation at ${Rc.toFixed(1)} kpc</div>
          <div class="row"><span>Pattern speed Ωp</span><b>${s.omegaP} km/s per kpc, one turn in ${(TAU / (s.omegaP * KMS_KPC_TO_RAD_GYR) * 1000).toFixed(0)} million years</b></div>
          <div class="row"><span>Sun's Ω = v ÷ R</span><b>${oS.toFixed(1)} km/s per kpc</b></div>
          <div class="row"><span>The Sun is</span><b>${MW.R0 < Rc ? 'inside corotation: it overtakes the arms' : 'outside corotation: the arms overtake it'}</b></div>
          <div class="row"><span>Sun meets an arm every</span><b>${Number.isFinite(between) ? `${num(between)} million years` : 'never (it rides with the pattern)'}</b></div>
          <div class="row"><span>Blue stars live</span><b>a few million years: they die near where they were born</b></div>
          <small>A kinematic sketch of a two-armed density wave (Lin & Shu 1964; drawn after Kalnajs 1973). Orbits are ovals, exaggerated (e = ${E}); lit gas is illustrative.</small>`, [0, 2, 3]);
      },
    };
  },
};
