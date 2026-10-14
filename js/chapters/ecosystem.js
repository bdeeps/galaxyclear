// Chapter 5: the galactic ecosystem. A loop drawn in 3D, not to scale: cold gas clouds collapse into star
// clusters, the massive stars explode as supernovae, their hot enriched gas cools and joins the clouds again.
// Numbers: star formation 1.65 ± 0.19 M☉ a year (Licquia & Newman 2015); core-collapse supernovae 1.9 ± 1.1
// a century (Diehl et al. 2006); gas supply about 10¹⁰ M☉ (model, see galaxy.js). The star-formation law is
// Kennicutt (1998, ApJ 498, 541): rate ∝ gas^1.4, scaled so the real gas gives the real rate. Feedback: the
// black hole's jets and supernova winds heat or push gas out, which lowers the rate in the model by a chosen
// fraction (illustrative). The Sun's lap is 2πR0 ÷ V0 with GRAVITY's R0 and Eilers' V0: 220 million years;
// NASA quotes about 230 million. The Sun is 4.6 billion years old (NASA), so it has gone round about 20 times.
import { THREE, M } from '../kit.js';
import { MW, LAP_GYR, COL, cloud, starfield, layout, unlayout, space, lean, ring, ball, num, msun, rng, gauss, board, panelBg, title, axes, clipTo, curve, dot, text } from '../galaxy.js';

const TAU = Math.PI * 2;
const STATIONS = [
  { id: 'cloud', name: 'Cold gas cloud', at: [-4.5, 0, 2.5], col: 0x5b8cff },
  { id: 'stars', name: 'New star cluster', at: [0, 0, 4.8], col: 0x8fb8ff },
  { id: 'sn', name: 'Supernova', at: [4.5, 0, 2.5], col: 0xff7a59 },
  { id: 'hot', name: 'Hot, enriched gas', at: [3.5, 0, -3.5], col: 0xffb547 },
  { id: 'cool', name: 'Cooling, falling back', at: [-3.5, 0, -3.5], col: 0x9fd8ff },
];
const sfr = (gas, fb) => MW.SFR * Math.pow(gas / MW.M_GAS, 1.4) * (fb ? 0.5 : 1);   // Kennicutt 1998 slope 1.4; feedback halves it (model)

export default {
  id: 'ecosystem',
  short: 'The ecosystem',
  title: 'Gas to stars to dust to gas: the galactic ecosystem',
  subtitle: 'A galaxy recycles. Stars are made from gas, give it back enriched, and the black hole has a say.',
  view: { pos: [0, 12, 11], target: [0, 0, 0] },
  learn: `<p>A galaxy is not a finished thing. It is a <b>cycle</b>. Cold clouds of hydrogen gas, a few degrees above absolute zero, collapse under their own gravity and light up as <b>new stars</b>, about <b>1.65 Suns' worth a year</b> across the whole Milky Way (Licquia & Newman 2015). Small stars like the Sun live for billions of years. Big ones burn through their fuel in a few million and explode as <b>supernovae</b>: about <b>two a century</b> in our Galaxy (Diehl et al. 2006), though dust hides most of them from us.</p>
    <p>Those explosions matter twice over. They blow <b>hot bubbles</b> in the gas and push it out of the disc, which slows star formation down. And they <b>enrich</b> it. The young universe made only hydrogen and helium (with a trace of lithium). Every atom of <b>carbon</b>, <b>oxygen</b> and <b>iron</b> in you was cooked inside a star and thrown out when it died: carbon and oxygen mostly from stars like the Sun shedding their outer layers, iron largely from exploding white dwarfs, gold and other heavy elements from colliding neutron stars. We are, quite literally, <b>star stuff</b>. The gas falls back, cools, and the next generation of stars is a little richer. The Sun is a third-generation star at least.</p>
    <p>The central black hole joins in. When gas falls onto <b>Sagittarius A*</b> it can fire <b>jets</b> and winds that heat the gas around the centre and stop it cooling: <b>feedback</b>. In big galaxies this is thought to be what switches star formation off and keeps the giant ellipticals red and dead. Our own black hole is quiet now, but gamma-ray bubbles 25,000 light-years tall above and below the centre suggest it was busy a few million years ago.</p>
    <p>All this goes round while the whole disc turns. The Sun, at 229 km/s, takes about <b>220 million years</b> for one lap (NASA says about 230), so in its 4.6-billion-year life it has been round about 20 times. The last time it was here, dinosaurs were only just beginning.</p>
    <p class="tip"><b>Try it:</b> add more gas and watch the star-formation rate climb faster than the gas does. Then switch feedback on and see the loop slow.</p>`,
  terms: [
    { t: 'Star formation rate', d: 'How much gas turns into stars each year. The Milky Way: about 1.65 solar masses a year.' },
    { t: 'Supernova', d: 'The explosion of a massive star (or an overfed white dwarf). It scatters new elements and blasts the gas around it.' },
    { t: 'Enrichment', d: 'Stars adding carbon, oxygen, iron and the rest to the gas, so each generation of stars is richer in heavy elements.' },
    { t: 'Feedback', d: 'Energy from stars and the central black hole that heats or pushes gas and slows star formation.' },
    { t: 'Galactic year', d: 'One lap of the Sun around the Galaxy: about 220 to 230 million years.' },
    { t: 'Kennicutt–Schmidt law', d: 'The star-formation rate grows with the gas roughly as gas to the power 1.4, so denser gas makes stars faster than you would guess.' },
  ],
  defaults: { gas: 1.0e10, feedback: false, run: true },
  controls: [
    { key: 'gas', type: 'range', label: 'Gas in the disc', min: 0.3e10, max: 3e10, step: 1e9, ends: ['3 billion Suns', '30 billion'], fmt: (v) => `${(v / 1e9).toFixed(0)} billion Suns` },
    { key: 'feedback', type: 'toggle', label: 'Black-hole and supernova feedback on', hint: 'Jets and winds heat the gas and push some out. The model halves the rate.' },
    { key: 'run', type: 'toggle', label: 'Let the cycle run' },
  ],
  quiz: [
    { q: 'Where did the carbon and oxygen in your body come from?', options: ['The Big Bang made them', 'They were cooked inside earlier stars and thrown out when the stars died', 'They formed in the Earth’s core', 'They came from the Sun’s light'], answer: 1, why: 'The young universe made only hydrogen, helium and a trace of lithium. Heavier elements are made in stars and spread by their deaths.' },
    { q: 'About how much gas does the Milky Way turn into stars each year?', options: ['About 1.65 solar masses', 'About 1,000 solar masses', 'About one star every second', 'None: it finished long ago'], answer: 0, why: 'Licquia and Newman (2015) find 1.65 ± 0.19 solar masses a year, a few stars a year.' },
    { q: 'What does feedback from the black hole and supernovae do to a galaxy?', options: ['Makes it spin faster', 'Heats or expels gas and slows star formation', 'Turns it into a spiral', 'Makes more dark matter'], answer: 1, why: 'Jets, winds and blast waves heat the gas and push it out of the disc, so less of it can cool and collapse into stars.' },
  ],
  reel: [
    { ms: 5600, caption: 'A galaxy recycles: gas makes stars, stars explode and give the gas back richer in carbon, oxygen and iron.', set: { gas: 1.0e10, feedback: false, run: true }, view: { pos: [0, 10, 10], target: [0, 0, 0] }, spin: 0.3 },
  ],

  build({ stage }) {
    space(stage);
    const root = new THREE.Group(); stage.root.add(root);
    root.add(starfield(800, 300, 17));
    // The loop: a soft ring the particles follow, with five stations.
    root.add(ring(5.2, 0x6b7a9a, 0.25, 0.08));
    const st = STATIONS.map((d) => { const g = new THREE.Group(); g.position.set(...d.at); root.add(g); const halo = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 16), new THREE.MeshBasicMaterial({ color: d.col, transparent: true, opacity: 0.12, depthWrite: false, toneMapped: false })); g.add(halo); const l = stage.label(d.name, [0, 1.3, 0], g); return { ...d, g, halo, l }; });
    // Station props.
    const cl = cloud(260, 0.5, 0.8); st[0].g.add(cl); { const r = rng(3); for (let i = 0; i < 260; i++) { cl.set(i, gauss(r) * 0.4, gauss(r) * 0.3, gauss(r) * 0.4); cl.paint(i, 0x5b8cff, 0.45); } cl.done(); }
    const clus = cloud(90, 0.3, 1); st[1].g.add(clus); { const r = rng(4); for (let i = 0; i < 90; i++) { clus.set(i, gauss(r) * 0.25, gauss(r) * 0.25, gauss(r) * 0.25); clus.paint(i, i % 4 ? 0x8fb8ff : 0xffffff, 1.3); } clus.done(); }
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: 0xff7a59, transparent: true, opacity: 0.35, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })); st[2].g.add(shell);
    const flash = ball(0.15, 0xffffff); st[2].g.add(flash);
    const hotC = cloud(220, 0.6, 0.8); st[3].g.add(hotC); { const r = rng(5); for (let i = 0; i < 220; i++) { hotC.set(i, gauss(r) * 0.6, gauss(r) * 0.5, gauss(r) * 0.6); hotC.paint(i, 0xffb547, 0.5); } hotC.done(); }
    const coolC = cloud(220, 0.5, 0.8); st[4].g.add(coolC); { const r = rng(6); for (let i = 0; i < 220; i++) { coolC.set(i, gauss(r) * 0.5, gauss(r) * 0.3, gauss(r) * 0.5); coolC.paint(i, 0x9fd8ff, 0.4); } coolC.done(); }
    // The centre: Sagittarius A* with two jets that switch on with feedback.
    const bh = ball(0.18, 0x111111); root.add(bh);
    const bhRing = ring(0.45, 0xffb547, 0.9, 0.12); root.add(bhRing);
    const jetMat = new THREE.MeshBasicMaterial({ color: 0xc49bff, transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false });
    const jetU = new THREE.Mesh(new THREE.ConeGeometry(0.35, 4, 16, 1, true), jetMat); jetU.position.y = 2.2; root.add(jetU);
    const jetD = jetU.clone(); jetD.rotation.x = Math.PI; jetD.position.y = -2.2; root.add(jetD);
    const lBH = stage.label('Sagittarius A*: jets and winds (feedback)', [0, 4.6, 0], root);
    const lLoop = stage.label('the cycle, drawn as a loop: not to scale', [0, -0.2, 6.6], root);
    // Flowing particles: each moves round the loop; colour by stage. Some are ejected when feedback is on.
    const NF = 900, flow = cloud(NF, 0.26, 0.95); root.add(flow);
    const r = rng(8);
    const F = Array.from({ length: NF }, () => ({ u: r(), off: gauss(r) * 0.35, y: gauss(r) * 0.2, out: 0 }));
    // The loop runs through the five stations as a closed Catmull-Rom curve.
    const pathPts = [...STATIONS.map((d) => new THREE.Vector3(...d.at))];
    const path = new THREE.CatmullRomCurve3(pathPts, true, 'catmullrom', 0.6);
    const tmp = new THREE.Vector3();
    const colAt = (u) => (u < 0.2 ? 0x5b8cff : u < 0.4 ? 0x8fb8ff : u < 0.6 ? 0xff7a59 : u < 0.8 ? 0xffb547 : 0x9fd8ff);

    let t = 0, S = null, key = '';
    const bd = board(root, (g, w, h) => {
      panelBg(g, w, h); if (!S) return;
      title(g, 'More gas, disproportionately more stars', 'Kennicutt 1998: rate ∝ gas^1.4, scaled to the Milky Way');
      const ax = axes(g, w, h, { xMax: 30, yMax: 8, xTicks: [0, 10, 20, 30], yTicks: [0, 2, 4, 6, 8], xLabel: 'gas in the disc (billion Suns)', yLabel: 'Suns made per year' });
      clipTo(g, ax, () => { curve(g, (x) => sfr(x * 1e9, false), 1, 30, ax.X, ax.Y, COL.cool, 4); curve(g, (x) => sfr(x * 1e9, true), 1, 30, ax.X, ax.Y, COL.law, 3, [6, 6]); });
      dot(g, ax.X(S.gas / 1e9), ax.Y(sfr(S.gas, S.feedback)), COL.hot, 8);
      dot(g, ax.X(10), ax.Y(MW.SFR), '#ffd36b', 6); text(g, 'Milky Way today: 1.65 a year', ax.X(10) + 10, ax.Y(MW.SFR) + 28, '#ffd36b', '18px sans-serif');
      text(g, 'with feedback (model: half)', ax.X(17), ax.Y(sfr(17e9, true)) + 26, COL.law, '17px sans-serif');
    });

    return {
      dispose() { unlayout(stage); },
      update(dt, s) {
        dt = Math.max(0, dt); S = s;
        const md = layout(stage, bd, [lLoop, ...st.map((x) => x.l)]);
        const rate = sfr(s.gas, s.feedback) / MW.SFR;         // relative to today
        if (s.run) t += dt * 0.07 * (0.6 + 0.4 * rate);
        const fb = s.feedback;
        jetU.visible = jetD.visible = fb; lBH.visible = md !== 'phone';
        jetMat.opacity = 0.35 + 0.2 * Math.sin(t * 40);
        bhRing.rotation.z = t * 3;
        for (let i = 0; i < NF; i++) {
          const p = F[i];
          const u = (p.u + t * (0.9 + 0.2 * (i % 5))) % 1;
          path.getPointAt(u, tmp);
          const a = Math.atan2(tmp.z, tmp.x), R = Math.hypot(tmp.x, tmp.z) + p.off;
          let x = R * Math.cos(a), y = p.y, z = R * Math.sin(a), k = 0.9;
          // With feedback on, a share of the hot gas (u near 0.6–0.8) is blown up out of the plane and fades.
          if (fb && i % 4 === 0 && u > 0.6 && u < 0.85) { const q = (u - 0.6) / 0.25; y += q * 3.5; k = 0.9 * (1 - q); x *= 1 + q * 0.3; z *= 1 + q * 0.3; }
          flow.set(i, x, y, z); flow.paint(i, colAt(u), k);
        }
        flow.done();
        // Supernova shell pulses: one burst per cycle at the supernova station.
        const ph = (t * 1.1) % 1; shell.scale.setScalar(0.2 + ph * 1.4); shell.material.opacity = 0.45 * (1 - ph); flash.scale.setScalar(ph < 0.1 ? 1 + 2 * (1 - ph / 0.1) : 1);
        st[0].halo.scale.setScalar(0.6 + 0.5 * Math.min(2, s.gas / 1e10)); cl.material.opacity = 0.5 + 0.3 * Math.min(1, s.gas / 2e10);
        st[1].halo.scale.setScalar(0.5 + 0.4 * Math.min(2.5, rate));
        const kk = `${s.gas}|${s.feedback}`; if (kk !== key) { key = kk; bd.redraw(); }
      },
      readout(s) {
        const rate = sfr(s.gas, s.feedback), deplete = s.gas / rate / 1e9, snPerC = MW.SN_PER_CENTURY * (rate / MW.SFR);
        return lean(`<div class="big">${rate.toFixed(2)} Suns of new stars a year</div>
          <div class="row"><span>Gas in the disc</span><b>${msun(s.gas, 0)}${s.gas === 1e10 ? ' (about today)' : ''}</b></div>
          <div class="row"><span>Supernovae (scaled from 1.9 a century)</span><b>about ${snPerC.toFixed(1)} a century</b></div>
          <div class="row"><span>Gas would last, with no refill</span><b>${deplete.toFixed(1)} billion years</b></div>
          <div class="row"><span>Feedback</span><b>${s.feedback ? 'on: jets and winds heat and expel gas' : 'off'}</b></div>
          <div class="row"><span>Sun's lap, 2π × 8.18 kpc ÷ 229 km/s</span><b>${Math.round(LAP_GYR * 1000)} million years</b></div>
          <div class="row"><span>Laps in the Sun's 4.6 billion years</span><b>about ${(4.6 / LAP_GYR).toFixed(0)}</b></div>
          <small>Rates from Licquia & Newman 2015 and Diehl et al. 2006; the gas supply and the feedback factor are model choices. Stars do refill the gas: about 30–40% of what they take comes back over time.</small>`, [0, 2, 4]);
      },
    };
  },
};
