// Shared parts for GalaxyClear: constants, the Milky Way's mass model and rotation curve, a particle
// Milky Way, chart boards pinned to the screen, a starfield, formatting and layout helpers.
// Galaxy scenes use 1 unit = 1 kiloparsec (kpc) unless a chapter says otherwise. The disc lies in the
// x–z plane, +y is the north galactic pole, and seen from +y the Galaxy turns clockwise, the way the
// Milky Way does seen from its north pole (its rotation is "retrograde" in that convention).
import { THREE, M, box, sphere, clamp, lerp } from './kit.js';

// ---------------------------------------------------------------- constants
export const TAU = Math.PI * 2;
export const D2R = Math.PI / 180;
export const G_KPC = 4.30091e-6;         // G in kpc (km/s)² per solar mass (CODATA G, IAU 2015 nominal units)
export const KPC_KM = 3.0857e16;         // km in a kiloparsec (IAU: 1 pc = 3.0857 × 10¹³ km)
export const KPC_LY = 3261.56;           // light-years in a kiloparsec
export const GYR_S = 3.15576e16;         // seconds in a billion Julian years
export const KMS_KPC_TO_RAD_GYR = GYR_S / KPC_KM;   // 1 km/s per kpc = 1.0227 rad per Gyr
export const C_KMS = 299792.458;
export const PC_LY = 3.26156;
export const MPC_LY = 3.26156e6;

// The Milky Way, with each number's source:
//   R0 = 8.178 kpc (GRAVITY Collaboration 2019, A&A 625, L10: 8178 ± 13 ± 22 pc) = 26,700 light-years.
//   V0 = 229.0 ± 0.2 km/s at R0, falling 1.7 ± 0.1 km/s per kpc from 5 to 25 kpc (Eilers, Hogg, Rix
//        & Ness 2019, ApJ 871, 120). NASA's Sun fact sheet quotes 720,000 km/h (200 km/s) and about
//        230 million years a lap.
//   Sgr A* = 4.30 × 10⁶ M☉ ± 0.25% (GRAVITY Collaboration 2022, A&A 657, L12); "four million" (EHT, 12 May 2022).
//   Stellar mass 6.08 ± 1.14 × 10¹⁰ M☉, of which bulge + bar 0.91 ± 0.07 × 10¹⁰; star formation
//        1.65 ± 0.19 M☉ a year (Licquia & Newman 2015, ApJ 806, 96).
//   Core-collapse supernovae 1.9 ± 1.1 a century (Diehl et al. 2006, Nature 439, 45).
//   Dark halo virial mass 7.25 ± 0.26 × 10¹¹ M☉ (Eilers et al. 2019).
export const MW = {
  R0: 8.178, V0: 229.0, SLOPE: -1.7,
  M_SGRA: 4.30e6,
  M_BULGE: 0.91e10, A_BULGE: 0.7,          // Hernquist bulge; scale length is a model choice
  M_DISC: 5.17e10, RD_DISC: 2.6,          // exponential stellar disc: 6.08 − 0.91 × 10¹⁰; 2.6 kpc scale length is the usual value (Bland-Hawthorn & Gerhard 2016 review)
  M_GAS: 1.0e10, RD_GAS: 5.0,             // gas disc, a round model number (about 10⁹–10¹⁰ M☉ of HI and H₂ in the literature)
  RS_HALO: 16,                            // NFW scale radius, a model choice typical of Milky-Way fits
  SFR: 1.65, SN_PER_CENTURY: 1.9,
  R_DISC: 15,                             // kpc, where the drawn stellar disc fades out (about 50,000 ly)
  Z_THIN: 0.3, Z_THICK: 0.9,              // scale heights: thin disc 220–450 pc, thick 2.6 kpc "thickness" (Bland-Hawthorn & Gerhard 2016, via Wikipedia)
  BAR_HALF: 5, BAR_ANGLE: 27 * D2R,       // half-length 1–5 kpc, angle to the Sun–centre line about 27° (Bland-Hawthorn & Gerhard 2016)
  PITCH: 12.5 * D2R,                      // spiral pitch angle, typical for the Milky Way (model)
};
export const LAP_GYR = (TAU * MW.R0 * KPC_KM) / MW.V0 / GYR_S;   // 0.22 Gyr for one solar lap from R0 and V0

// ---------------------------------------------------------------- Bessel functions (Abramowitz & Stegun 9.8)
function I0(x) { const t = x / 3.75; if (x <= 3.75) { const u = t * t; return 1 + u * (3.5156229 + u * (3.0899424 + u * (1.2067492 + u * (0.2659732 + u * (0.0360768 + u * 0.0045813))))); } const v = 1 / t; return (Math.exp(x) / Math.sqrt(x)) * (0.39894228 + v * (0.01328592 + v * (0.00225319 + v * (-0.00157565 + v * (0.00916281 + v * (-0.02057706 + v * (0.02635537 + v * (-0.01647633 + v * 0.00392377)))))))); }
function I1(x) { const t = x / 3.75; if (x <= 3.75) { const u = t * t; return x * (0.5 + u * (0.87890594 + u * (0.51498869 + u * (0.15084934 + u * (0.02658733 + u * (0.00301532 + u * 0.00032411)))))); } const v = 1 / t; return (Math.exp(x) / Math.sqrt(x)) * (0.39894228 + v * (-0.03988024 + v * (-0.00362018 + v * (0.00163801 + v * (-0.01031555 + v * (0.02282967 + v * (-0.02895312 + v * (0.01787654 - v * 0.00420059)))))))); }
function K0(x) { if (x <= 2) { const u = (x / 2) ** 2; return -Math.log(x / 2) * I0(x) - 0.57721566 + u * (0.4227842 + u * (0.23069756 + u * (0.0348859 + u * (0.00262698 + u * (0.0001075 + u * 0.0000074))))); } const v = 2 / x; return (Math.exp(-x) / Math.sqrt(x)) * (1.25331414 + v * (-0.07832358 + v * (0.02189568 + v * (-0.01062446 + v * (0.00587872 + v * (-0.0025154 + v * 0.00053208)))))); }
function K1(x) { if (x <= 2) { const u = (x / 2) ** 2; return (x * Math.log(x / 2) * I1(x) + 1 + u * (0.15443144 + u * (-0.67278579 + u * (-0.18156897 + u * (-0.01919402 + u * (-0.00110404 - u * 0.00004686)))))) / x; } const v = 2 / x; return (Math.exp(-x) / Math.sqrt(x)) * (1.25331414 + v * (0.23498619 + v * (-0.0365562 + v * (0.01504268 + v * (-0.00780353 + v * (0.00325614 - v * 0.00068245)))))); }

// ---------------------------------------------------------------- the rotation curve (km/s at R kpc)
// Exponential disc (Freeman 1970): v² = 4πGΣ₀Rd y² [I₀(y)K₀(y) − I₁(y)K₁(y)], y = R / 2Rd, Σ₀ = M / 2πRd².
export function vDisc2(R, Md, Rd) { if (R < 1e-4) return 0; const y = R / (2 * Rd), S0 = Md / (TAU * Rd * Rd); return 4 * Math.PI * G_KPC * S0 * Rd * y * y * (I0(y) * K0(y) - I1(y) * K1(y)); }
// Hernquist (1990) bulge: M(r) = M r² / (r + a)².
export function vBulge2(R, Mb = MW.M_BULGE, a = MW.A_BULGE) { return (G_KPC * Mb * R) / ((R + a) * (R + a)); }
// A point mass at the centre (the black hole, or the whole Solar System's Sun).
export const vPoint2 = (R, Mp) => (R < 1e-6 ? 0 : (G_KPC * Mp) / R);
// NFW (Navarro, Frenk & White 1996) halo, set by the mass inside 200 kpc and a scale radius.
const nfwF = (x) => Math.log(1 + x) - x / (1 + x);
export function mHalo(R, M200, rs = MW.RS_HALO) { return (M200 * nfwF(R / rs)) / nfwF(200 / rs); }
export function vHalo2(R, M200, rs = MW.RS_HALO) { return R < 1e-6 ? 0 : (G_KPC * mHalo(R, M200, rs)) / R; }
export function vVisible(R) { return Math.sqrt(vPoint2(R, MW.M_SGRA) + vBulge2(R) + vDisc2(R, MW.M_DISC, MW.RD_DISC) + vDisc2(R, MW.M_GAS, MW.RD_GAS)); }
export function vModel(R, M200) { return Math.sqrt(vVisible(R) ** 2 + vHalo2(R, M200)); }
// Measured: a straight line through the Eilers et al. (2019) curve, valid from 5 to 25 kpc.
export const vMeasured = (R) => MW.V0 + MW.SLOPE * (R - MW.R0);
// Mass of the visible parts inside R (for the readouts): the point, the bulge and the two discs.
export function mVisible(R) {
  const mDisc = (Md, Rd) => Md * (1 - Math.exp(-R / Rd) * (1 + R / Rd));
  return MW.M_SGRA + (MW.M_BULGE * R * R) / ((R + MW.A_BULGE) ** 2) + mDisc(MW.M_DISC, MW.RD_DISC) + mDisc(MW.M_GAS, MW.RD_GAS);
}
// "Kepler" mass: what v tells you is inside R if gravity is Newton's: M = v² R / G.
export const mFromV = (R, v) => (v * v * R) / G_KPC;
export const omegaRadGyr = (v, R) => (v / R) * KMS_KPC_TO_RAD_GYR;   // angular speed in rad/Gyr
export const lapsIn = (v, R, gyr) => (omegaRadGyr(v, R) * gyr) / TAU;

// ---------------------------------------------------------------- formatting
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
export const sup = (n) => String(n).split('').map((c) => SUP[c] ?? c).join('');
export const num = (v, d = 0) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
export function sci(v, d = 2) { if (v === 0) return '0'; const e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e); return `${m.toFixed(d)} × 10${sup(e)}`; }
export const msun = (v, d = 2) => (v >= 1e9 ? `${(v / 1e9).toFixed(d)} billion` : v >= 1e6 ? `${(v / 1e6).toFixed(d)} million` : num(v)) + ' Suns';
export const ly = (kpc) => (kpc * KPC_LY >= 1e6 ? `${(kpc * KPC_LY / 1e6).toFixed(1)} million ly` : `${num(Math.round(kpc * KPC_LY / 100) * 100)} ly`);

// ---------------------------------------------------------------- deterministic random
export function rng(seed = 1) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
export function gauss(r) { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); }

// ---------------------------------------------------------------- sprites and point clouds
let _spot = null;
export function spotTexture() {
  if (_spot) return _spot;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  _spot = new THREE.CanvasTexture(c); _spot.colorSpace = THREE.SRGBColorSpace;
  return _spot;
}
// A cloud of n soft glowing points with per-point colour. set(i, x, y, z) then done(). Additive blending so
// crowds of stars glow brighter together, like a real galaxy's light.
export function cloud(n, size = 0.25, opacity = 0.9, additive = true) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage));
  const mat = new THREE.PointsMaterial({ size, map: spotTexture(), vertexColors: true, transparent: true, opacity, depthWrite: false, sizeAttenuation: true, toneMapped: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending });
  const p = new THREE.Points(g, mat);
  p.frustumCulled = false;
  const c = new THREE.Color();
  p.set = (i, x, y, z) => { pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; };
  p.paint = (i, hex, k = 1) => { c.set(hex); col[i * 3] = c.r * k; col[i * 3 + 1] = c.g * k; col[i * 3 + 2] = c.b * k; };
  p.done = () => { g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true; };
  p.n = n; p.pos = pos; p.col = col;
  return p;
}
// Stars far away, for space scenes.
export function starfield(n = 900, R = 400, seed = 5) {
  const r = rng(seed), pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const u = r() * 2 - 1, a = r() * TAU, s = Math.sqrt(1 - u * u); pos[i * 3] = R * s * Math.cos(a); pos[i * 3 + 1] = R * u; pos[i * 3 + 2] = R * s * Math.sin(a); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, sizeAttenuation: false, transparent: true, opacity: 0.6, depthWrite: false }));
}

// ---------------------------------------------------------------- the Milky Way as particles
// Star colours: the bulge is old and yellow-orange, the thin disc white-yellow, the arms carry young blue
// stars and pink glowing hydrogen clouds (HII regions), the thick disc and halo are old and faint.
export const COL = { bulge: 0xffc98a, disc: 0xfff1d6, blue: 0x8fb8ff, pink: 0xff7fb0, thick: 0xe6c9a8, halo: 0xd8d2ff, gc: 0xfff4cc, sun: 0xffd36b, bh: 0xffb547, hot: '#ffb547', cool: '#8ef0ff', law: '#c49bff', good: '#5ce1a9', red: '#ff5a8a', soft: 'rgba(255,255,255,.55)', text: '#e8eef8' };

// Angle of arm m (of n) at radius R: a trailing logarithmic spiral φ = φ0 + ln(R / R1) / tan(pitch).
// The Galaxy turns clockwise seen from +y, so trailing arms have φ decreasing outward in our x–z frame.
export function armAngle(R, m, n = 4, pitch = MW.PITCH, R1 = 3) {
  const phi0 = (m / n) * TAU + MW.BAR_ANGLE + (m % 2 ? 0.35 : 0);  // the two major arms spring from the bar's ends
  return phi0 - Math.log(Math.max(R, R1) / R1) / Math.tan(pitch);
}
// How close an angle φ at radius R is to any arm: 1 on the arm, falling off as a Gaussian in angle.
export function armStrength(R, phi, width = 0.28) {
  let best = 0;
  for (let m = 0; m < 4; m++) {
    let d = phi - armAngle(R, m);
    d = Math.atan2(Math.sin(d), Math.cos(d));
    const w = width * (m % 2 ? 1.6 : 1), amp = m % 2 ? 0.45 : 1;   // the minor arms are weaker and broader
    best = Math.max(best, amp * Math.exp(-(d * d) / (2 * w * w)));
  }
  return best;
}

// Build the Galaxy. Returns a group plus the parts, each a point cloud, and per-particle orbital data
// (R, φ) so chapters can turn the disc at the real differential rate. Counts are kept modest for 8 GB laptops.
export function makeGalaxy({ seed = 11, nBulge = 3200, nDisc = 9000, nArms = 7000, nThick = 2200, nHalo = 900, nGC = 150 } = {}) {
  const r = rng(seed), g = new THREE.Group();
  const parts = {};
  const place = (p, data) => { data.forEach((d, i) => { p.set(i, d.R * Math.cos(d.phi), d.y, -d.R * Math.sin(d.phi)); p.paint(i, d.c, d.k); }); p.done(); return p; };

  // Bulge and bar: a flattened spheroid plus a bar of half-length 5 kpc along BAR_ANGLE.
  const bulge = [];
  for (let i = 0; i < nBulge; i++) {
    const inBar = i < nBulge * 0.45;
    let x, y, z;
    if (inBar) { const u = gauss(r) * 0.42 * MW.BAR_HALF; x = u; y = gauss(r) * 0.35; z = gauss(r) * 0.6; }
    else { const rr = 0.3 + Math.abs(gauss(r)) * 1.0, u = r() * 2 - 1, a = r() * TAU, s = Math.sqrt(1 - u * u); x = rr * s * Math.cos(a); z = rr * s * Math.sin(a); y = rr * u * 0.65; }
    const ca = Math.cos(MW.BAR_ANGLE), sa = Math.sin(MW.BAR_ANGLE);
    const X = x * ca - z * sa, Z = x * sa + z * ca;                      // rotate the bar in the plane
    const R = Math.hypot(X, Z), phi = Math.atan2(-Z, X);
    bulge.push({ R, phi, y, c: COL.bulge, k: 0.3 + 0.3 * r() });
  }
  parts.bulge = place(cloud(nBulge, 0.42), bulge);

  // Thin disc: exponential in R, sech-ish in z, with mild arm crowding.
  const disc = [];
  for (let i = 0; i < nDisc; i++) {
    let R = -MW.RD_DISC * Math.log(1 - r() * (1 - Math.exp(-MW.R_DISC / MW.RD_DISC)));
    R = Math.max(0.6, R);
    const phi = r() * TAU, y = gauss(r) * MW.Z_THIN * 0.9;
    disc.push({ R, phi, y, c: COL.disc, k: 0.3 + 0.3 * r() });
  }
  parts.disc = place(cloud(nDisc, 0.42), disc);

  // Arms: young blue stars and pink HII regions, sampled where armStrength is high.
  const arms = [];
  let guard = 0;
  while (arms.length < nArms && guard++ < nArms * 40) {
    const R = 2.5 + r() * (MW.R_DISC - 2.5), phi = r() * TAU, w = armStrength(R, phi);
    if (r() > w * Math.exp(-R / 9) * 2.2) continue;
    const pink = r() < 0.22;
    arms.push({ R, phi, y: gauss(r) * 0.12, c: pink ? COL.pink : COL.blue, k: pink ? 0.8 + 0.5 * r() : 0.6 + 0.5 * r() });
  }
  parts.arms = place(cloud(arms.length, 0.5), arms);

  // Thick disc: older, puffier, slightly shorter.
  const thick = [];
  for (let i = 0; i < nThick; i++) {
    const R = Math.max(0.5, -2.0 * Math.log(1 - r() * (1 - Math.exp(-13 / 2.0))));
    thick.push({ R, phi: r() * TAU, y: gauss(r) * MW.Z_THICK, c: COL.thick, k: 0.3 + 0.3 * r() });
  }
  parts.thick = place(cloud(nThick, 0.4), thick);

  // Stellar halo: sparse old stars in a round cloud out to about 30 kpc (density falling steeply).
  const halo = [];
  for (let i = 0; i < nHalo; i++) {
    const rr = 2 + 28 * Math.pow(r(), 2.2), u = r() * 2 - 1, a = r() * TAU, s = Math.sqrt(1 - u * u);
    halo.push({ R: rr * s, phi: a, y: rr * u, c: COL.halo, k: 0.35 + 0.35 * r() });
  }
  parts.halo = place(cloud(nHalo, 0.4), halo);

  // Globular clusters: about 150 known (the Harris catalogue lists 157); drawn as bright soft dots.
  const gcs = [];
  for (let i = 0; i < nGC; i++) {
    const rr = 1.5 + 35 * Math.pow(r(), 2.6), u = r() * 2 - 1, a = r() * TAU, s = Math.sqrt(1 - u * u);
    gcs.push({ R: rr * s, phi: a, y: rr * u, c: COL.gc, k: 1.4 });
  }
  parts.gc = place(cloud(nGC, 0.9, 0.95), gcs);

  // The centre: Sagittarius A*, a tiny glow (it is far too small to draw to scale).
  const bh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), M.glow(0xffffff));
  const bhHalo = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 12), new THREE.MeshBasicMaterial({ color: COL.bh, transparent: true, opacity: 0.35, depthWrite: false, toneMapped: false }));
  // The Sun, at R0 along +x (so the bar leans away from the Sun–centre line by BAR_ANGLE).
  const sun = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), M.glow(COL.sun));
  sun.position.set(MW.R0, 0.02, 0);
  const sunRing = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.36, 48), new THREE.MeshBasicMaterial({ color: COL.sun, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
  sunRing.rotation.x = -Math.PI / 2; sunRing.position.copy(sun.position);
  g.add(parts.bulge, parts.disc, parts.arms, parts.thick, parts.halo, parts.gc, bh, bhHalo, sun, sunRing);
  const data = { bulge, disc, arms, thick, halo, gcs };
  return {
    group: g, parts, data, sun, sunRing, bh, bhHalo,
    // Dim everything except the named parts (k = 1 shows all).
    highlight(names = null) {
      for (const [k, p] of Object.entries(parts)) { const on = !names || names.includes(k); p.material.opacity = on ? 0.9 : 0.08; }
    },
    // Re-place a disc component with every particle turned by dphi(R) (clockwise seen from +y means phi decreases).
    turn(name, dphi) {
      const p = parts[name], d = data[name === 'gc' ? 'gcs' : name];
      for (let i = 0; i < d.length; i++) { const q = d[i], phi = q.phi - dphi(q.R); p.set(i, q.R * Math.cos(phi), q.y, -q.R * Math.sin(phi)); }
      p.done();
    },
  };
}

// ---------------------------------------------------------------- boards
export function panelBg(g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(10,12,18,.9)'; g.fillRect(0, 0, w, h); }
// A chart drawn on a canvas. Every board is 800 × 420 and is placed by layout() each frame.
export function board(root, draw, w = 4, h = 2.1, pxW = 800, pxH = 420) {
  const c = document.createElement('canvas'); c.width = pxW; c.height = pxH;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const redraw = () => { draw(g, pxW, pxH); tex.needsUpdate = true; };
  redraw();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, side: THREE.DoubleSide, depthTest: false, depthWrite: false }));
  m.renderOrder = 50; m.frustumCulled = false; root.add(m);
  return { tex, redraw, canvas: c, mesh: m };
}
export function title(g, s, sub = '') {
  g.textAlign = 'left'; g.fillStyle = COL.text; g.font = 'bold 32px sans-serif'; g.fillText(s, 22, 44);
  if (sub) { g.font = '21px sans-serif'; g.fillStyle = 'rgba(255,255,255,.65)'; g.fillText(sub, 22, 74); }
}
export function axes(g, w, h, { x0 = 96, x1 = w - 30, y0 = h - 70, y1 = 100, xMax, yMax, xMin = 0, yMin = 0, xTicks, yTicks, xFmt = String, yFmt = String, xLabel = '', yLabel = '' }) {
  const X = (x) => x0 + ((x - xMin) / (xMax - xMin)) * (x1 - x0);
  const Y = (y) => y0 - ((y - yMin) / (yMax - yMin)) * (y0 - y1);
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; g.fillStyle = 'rgba(255,255,255,.7)'; g.font = '21px sans-serif'; g.textAlign = 'left';
  for (const t of xTicks) { g.beginPath(); g.moveTo(X(t), y1); g.lineTo(X(t), y0); g.stroke(); const s = xFmt(t); g.fillText(s, X(t) - g.measureText(s).width / 2, y0 + 28); }
  for (const t of yTicks) { g.beginPath(); g.moveTo(x0, Y(t)); g.lineTo(x1, Y(t)); g.stroke(); const s = yFmt(t); g.fillText(s, x0 - 10 - g.measureText(s).width, Y(t) + 7); }
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0); g.lineTo(x1, y0); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.8)'; g.font = '21px sans-serif';
  if (xLabel) g.fillText(xLabel, x1 - g.measureText(xLabel).width, y0 + 56);
  if (yLabel) g.fillText(yLabel, x0 + 8, y1 - 10);
  return { X, Y, x0, x1, y0, y1 };
}
export function clipTo(g, ax, fn) { g.save(); g.beginPath(); g.rect(ax.x0, ax.y1, ax.x1 - ax.x0, ax.y0 - ax.y1); g.clip(); fn(); g.restore(); }
export function dot(g, x, y, col, r = 9) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); }
export function line(g, pts, X, Y, col, wdt = 4, dash = null) {
  if (pts.length < 2) return;
  g.strokeStyle = col; g.lineWidth = wdt; g.setLineDash(dash || []); g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))));
  g.stroke(); g.setLineDash([]);
}
export function curve(g, fn, a, b, X, Y, col, wdt = 4, dash = null, n = 120) { const pts = []; for (let i = 0; i <= n; i++) { const x = a + ((b - a) * i) / n; pts.push([x, fn(x)]); } line(g, pts, X, Y, col, wdt, dash); }
export function band(g, lo, hi, a, b, X, Y, col, n = 60) {
  g.fillStyle = col; g.beginPath();
  for (let i = 0; i <= n; i++) { const x = a + ((b - a) * i) / n; i ? g.lineTo(X(x), Y(hi(x))) : g.moveTo(X(x), Y(hi(x))); }
  for (let i = n; i >= 0; i--) { const x = a + ((b - a) * i) / n; g.lineTo(X(x), Y(lo(x))); }
  g.closePath(); g.fill();
}
export function text(g, s, x, y, col = 'rgba(255,255,255,.8)', font = '21px sans-serif', align = 'left') { g.fillStyle = col; g.font = font; g.textAlign = align; g.fillText(s, x, y); g.textAlign = 'left'; }

// ---------------------------------------------------------------- stage helpers
export const inReel = () => document.body.classList.contains('gb-reel');
// Three shapes: 'wide' (desktop, readout upper left), 'phone' (narrow) and 'reel' (the video recorder).
export function mode(stage) { return inReel() ? 'reel' : stage.host.clientWidth < 560 ? 'phone' : 'wide'; }
// Slide the picture clear of the readout and pin a chart board to the screen like a head-up display so it
// is readable and never behind the readout. Returns the mode. minor = labels to hide on a phone.
export function layout(stage, b, minor = [], freeShift = null) {
  const W = stage.host.clientWidth, H = stage.host.clientHeight, md = mode(stage), A = 420 / 800;
  minor.forEach((l) => { if (l) l.visible = md !== 'phone'; });
  let shift = [0, 0], r = null;
  if (md === 'wide') { const w = clamp(W - 364, 220, 470); shift = [0, -0.2]; r = [W - 14 - w / 2, 78 + (w * A) / 2, w]; }
  else if (md === 'phone') { const w = Math.round(W * 0.56); shift = [0, -0.06]; r = [10 + w / 2, H - 8 - (w * A) / 2, w]; }
  else if (W / H < 0.8) { const w = W * 0.94; shift = [0, -0.15]; r = [W / 2, 40 + (w * A) / 2, w]; }
  else if (W / H < 1.3) { const w = W * 0.5; shift = [0, -0.13]; r = [W - 16 - w / 2, 16 + (w * A) / 2, w]; }
  else { const w = W * 0.3; shift = [-0.1, 0.05]; r = [W - 50 - w / 2, 150 + (w * A) / 2, w]; }
  if (!b) shift = freeShift?.[md] || (md === 'wide' ? [0, -0.14] : md === 'phone' ? [0, -0.1] : [0, 0]);
  // the video frames are bigger than the page's stage, so fill them: zoom the lens a little
  const zoom = md === 'reel' ? (W / H < 1.3 ? 1.25 : 0.95) : 1;
  if (stage.camera.zoom !== zoom) { stage.camera.zoom = zoom; stage.camera.updateProjectionMatrix(); }
  if (!stage.shift || stage.shift[0] !== shift[0] || stage.shift[1] !== shift[1]) stage.setShift(...shift);
  if (b) {
    const cam = stage.camera, [sx, sy] = shift, d = 4;
    const nx = ((r[0] - sx * W) / W) * 2 - 1, ny = 1 - ((r[1] + sy * H) / H) * 2;
    const Hv = (2 * d * Math.tan((cam.fov * D2R) / 2)) / cam.zoom, Wv = Hv * cam.aspect;
    b.mesh.position.set((nx * Wv) / 2, (ny * Hv) / 2, -d).applyQuaternion(cam.quaternion).add(cam.position);
    b.mesh.quaternion.copy(cam.quaternion);
    b.mesh.scale.setScalar(((r[2] / W) * Wv) / b.mesh.geometry.parameters.width);
  }
  return md;
}
// Put the stage back as the kit expects it when a chapter closes.
export function unlayout(stage) { stage.setWorldMode(false); stage.floor.visible = true; stage.lights.visible = true; stage.camera.zoom = 1; stage.setShift(0, 0); stage.scene.background = null; }
// Space: no floor grid, no studio lights (point clouds are self-lit), a near-black sky.
export function space(stage, hex = 0x05060b) { stage.setWorldMode(true); stage.floor.visible = false; stage.scene.background = new THREE.Color(hex); }
export const slim = (html) => `<div style="max-width:296px">${html}</div>`;
// Readout rows: on a phone keep only the headline and the named rows.
export function lean(html, keep = []) {
  if (document.documentElement.clientWidth >= 560) return slim(html);
  const rows = html.split('<div class="row">');
  return rows[0] + rows.slice(1).filter((_, i) => keep.includes(i)).map((r) => '<div class="row">' + r.replace(/<small>[\s\S]*$/, '')).join('');
}
// A thin glowing ring in the x–z plane (an orbit).
export function ring(R, color, opacity = 0.5, w = 0.03) {
  const m = new THREE.Mesh(new THREE.RingGeometry(R - w / 2, R + w / 2, 128), new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
  m.rotation.x = -Math.PI / 2; return m;
}
// A small glowing ball.
export function ball(R, color, seg = 16) { return new THREE.Mesh(new THREE.SphereGeometry(R, seg, Math.max(6, seg / 2)), M.glow(color)); }
export { clamp, lerp, THREE, M, box, sphere };
