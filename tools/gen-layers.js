// Usage: node tools/gen-layers.js <z11-tiles-dir> assets/chart <z8-tiles-dir>
// Turns real Terrarium elevation tiles into stacked SVG layers of Gran Canaria.
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const [tilesDir, outDir, tiles8Dir] = process.argv.slice(2);
const Z = 11, TS = 256, X0 = 932, X1 = 937, Y0 = 855, Y1 = 860;

function readPng(file) {
  const b = fs.readFileSync(file); let p = 8, w, h, ct, plte = null; const idat = [];
  while (p < b.length) {
    const len = b.readUInt32BE(p), type = b.toString('latin1', p + 4, p + 8), d = b.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; if (d[8] !== 8 || d[12]) throw new Error('png format'); }
    if (type === 'PLTE') plte = d;
    if (type === 'IDAT') idat.push(d);
    p += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat)), ch = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ct], st = w * ch;
  const out = Buffer.alloc(h * st); let q = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[q++];
    for (let i = 0; i < st; i++) {
      const v = raw[q++], a = i >= ch ? out[y * st + i - ch] : 0, u = y ? out[(y - 1) * st + i] : 0, c = (y && i >= ch) ? out[(y - 1) * st + i - ch] : 0;
      let r;
      if (f === 0) r = v; else if (f === 1) r = v + a; else if (f === 2) r = v + u; else if (f === 3) r = v + ((a + u) >> 1);
      else { const pp = a + u - c, pa = Math.abs(pp - a), pb = Math.abs(pp - u), pc = Math.abs(pp - c); r = v + (pa <= pb && pa <= pc ? a : pb <= pc ? u : c); }
      out[y * st + i] = r & 255;
    }
  }
  return { w, h, ch, out, plte };
}

const W = (X1 - X0 + 1) * TS, H = (Y1 - Y0 + 1) * TS, dem = new Float32Array(W * H);
for (let ty = Y0; ty <= Y1; ty++) for (let tx = X0; tx <= X1; tx++) {
  const t = readPng(path.join(tilesDir, `${tx}_${ty}.png`));
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const i = (y * t.w + x) * t.ch;
    let r = t.out[i], g = t.out[i + 1], bl = t.out[i + 2];
    if (t.plte) { const k = t.out[i] * 3; r = t.plte[k]; g = t.plte[k + 1]; bl = t.plte[k + 2]; }
    dem[((ty - Y0) * TS + y) * W + (tx - X0) * TS + x] = r * 256 + g + bl / 256 - 32768;
  }
}

function blur(src, sigma) {
  const rad = Math.ceil(sigma * 2.5), k = []; let sum = 0;
  for (let i = -rad; i <= rad; i++) { const v = Math.exp(-i * i / (2 * sigma * sigma)); k.push(v); sum += v; }
  const tmp = new Float32Array(W * H), out = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let s = 0; for (let i = -rad; i <= rad; i++) s += src[y * W + Math.min(W - 1, Math.max(0, x + i))] * k[i + rad]; tmp[y * W + x] = s / sum; }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let s = 0; for (let i = -rad; i <= rad; i++) s += tmp[Math.min(H - 1, Math.max(0, y + i)) * W + x] * k[i + rad]; out[y * W + x] = s / sum; }
  return out;
}

// World pixel <-> geographic
const n = 2 ** Z * TS;
const wx = lon => (lon + 180) / 360 * n - X0 * TS;
const wy = lat => { const r = lat * Math.PI / 180; return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n - Y0 * TS; };

// View: 1000 units square around the island.
const CX = wx(-15.60), CY = wy(27.962), SPAN = 1120, U = SPAN / 1000; // dem pixels per unit
const toDemX = u => CX + (u - 500) * U, toDemY = v => CY + (v - 500) * U;
const toView = (lon, lat) => [Math.round((wx(lon) - CX) / U + 500), Math.round((wy(lat) - CY) / U + 500)];

const landDem = blur(dem, 1.1);
// Depths come from zoom 8 tiles (the zoom 11 ones are flat at sea level).
const W8 = 512, dem8 = new Float32Array(W8 * W8);
for (const [tx, ty] of [[116, 106], [117, 106], [116, 107], [117, 107]]) {
  const t = readPng(path.join(tiles8Dir, `${tx}_${ty}.png`));
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) { const i = (y * t.w + x) * t.ch; dem8[((ty - 106) * TS + y) * W8 + (tx - 116) * TS + x] = Math.min(0, t.out[i] * 256 + t.out[i + 1] + t.out[i + 2] / 256 - 32768); }
}
function blur8(src, sigma) { const rad = Math.ceil(sigma * 2.5), k = []; let sum = 0; for (let i = -rad; i <= rad; i++) { const v = Math.exp(-i * i / (2 * sigma * sigma)); k.push(v); sum += v; } const tmp = new Float32Array(W8 * W8), out = new Float32Array(W8 * W8); for (let y = 0; y < W8; y++) for (let x = 0; x < W8; x++) { let s = 0; for (let i = -rad; i <= rad; i++) s += src[y * W8 + Math.min(W8 - 1, Math.max(0, x + i))] * k[i + rad]; tmp[y * W8 + x] = s / sum; } for (let y = 0; y < W8; y++) for (let x = 0; x < W8; x++) { let s = 0; for (let i = -rad; i <= rad; i++) s += tmp[Math.min(W8 - 1, Math.max(0, y + i)) * W8 + x] * k[i + rad]; out[y * W8 + x] = s / sum; } return out; }
const sea8 = blur8(dem8, 1.4);
function sampleSea(x, y) {
  const gx = (x + X0 * TS) / 8 - 116 * TS, gy = (y + Y0 * TS) / 8 - 106 * TS;
  const xi = Math.max(0, Math.min(W8 - 2, Math.floor(gx))), yi = Math.max(0, Math.min(W8 - 2, Math.floor(gy))), fx = gx - xi, fy = gy - yi, a = sea8;
  return a[yi * W8 + xi] * (1 - fx) * (1 - fy) + a[yi * W8 + xi + 1] * fx * (1 - fy) + a[(yi + 1) * W8 + xi] * (1 - fx) * fy + a[(yi + 1) * W8 + xi + 1] * fx * fy;
}
function sample(a, x, y) {
  const xi = Math.max(0, Math.min(W - 2, Math.floor(x))), yi = Math.max(0, Math.min(H - 2, Math.floor(y))), fx = x - xi, fy = y - yi;
  return a[yi * W + xi] * (1 - fx) * (1 - fy) + a[yi * W + xi + 1] * fx * (1 - fy) + a[(yi + 1) * W + xi] * (1 - fx) * fy + a[(yi + 1) * W + xi + 1] * fx * fy;
}

const MIN = -8, MAX = 1008, STEP = 2, N = Math.round((MAX - MIN) / STEP);
function grid(fn) { const g = new Float32Array((N + 1) * (N + 1)); for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) g[j * (N + 1) + i] = fn(MIN + i * STEP, MIN + j * STEP); return g; }
function segDist(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l)); return Math.hypot(px - ax - t * dx, py - ay - t * dy); }

function contours(g, level) {
  const at = (i, j) => g[j * (N + 1) + i], key = (i, j, s) => `${i},${j},${s}`;
  const point = (i, j, s) => { const a = at(i, j), b = s === 0 ? at(i + 1, j) : at(i, j + 1), t = (level - a) / (b - a); return s === 0 ? [MIN + (i + t) * STEP, MIN + j * STEP] : [MIN + i * STEP, MIN + (j + t) * STEP]; };
  const links = new Map(), pts = new Map();
  const link = (p, q) => { (links.get(p) || links.set(p, []).get(p)).push(q); (links.get(q) || links.set(q, []).get(q)).push(p); };
  const table = { 1: [['L', 'B']], 2: [['B', 'R']], 3: [['L', 'R']], 4: [['T', 'R']], 5: [['L', 'T'], ['B', 'R']], 6: [['T', 'B']], 7: [['L', 'T']], 8: [['L', 'T']], 9: [['T', 'B']], 10: [['T', 'R'], ['L', 'B']], 11: [['T', 'R']], 12: [['L', 'R']], 13: [['B', 'R']], 14: [['L', 'B']] };
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const c = (at(i, j) > level ? 8 : 0) | (at(i + 1, j) > level ? 4 : 0) | (at(i + 1, j + 1) > level ? 2 : 0) | (at(i, j + 1) > level ? 1 : 0);
    if (c === 0 || c === 15) continue;
    const E = { T: [i, j, 0], B: [i, j + 1, 0], L: [i, j, 1], R: [i + 1, j, 1] };
    for (const [a, b] of table[c]) { const kp = key(...E[a]), kq = key(...E[b]); if (!pts.has(kp)) pts.set(kp, point(...E[a])); if (!pts.has(kq)) pts.set(kq, point(...E[b])); link(kp, kq); }
  }
  const seen = new Set(), loops = [];
  for (const start of links.keys()) {
    if (seen.has(start)) continue;
    const loop = []; let cur = start;
    while (cur && !seen.has(cur)) { seen.add(cur); loop.push(pts.get(cur)); cur = links.get(cur).find(x => !seen.has(x)); }
    if (loop.length > 6) loops.push(loop);
  }
  return loops;
}
function simplify(p, tol) {
  const keep = new Uint8Array(p.length); keep[0] = keep[p.length - 1] = 1; const st = [[0, p.length - 1]];
  while (st.length) { const [a, b] = st.pop(); let m = 0, id = -1; for (let i = a + 1; i < b; i++) { const d = segDist(p[i][0], p[i][1], p[a][0], p[a][1], p[b][0], p[b][1]); if (d > m) { m = d; id = i; } } if (m > tol) { keep[id] = 1; st.push([a, id], [id, b]); } }
  return p.filter((_, i) => keep[i]);
}
const area = l => Math.abs(l.reduce((s, p, i) => { const q = l[(i + 1) % l.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2);
const r1 = v => Math.round(v * 10) / 10;
function toPath(loops, tol, minArea) { return loops.filter(l => area(l) > minArea).map(l => { const s = simplify(l, tol); return 'M' + s.map(p => `${r1(p[0])} ${r1(p[1])}`).join('L') + 'Z'; }).join(''); }

// Land uses the sharp data. Sea uses the smooth data, closed off with a soft round rim.
const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
const fade = t => t * t * (3 - 2 * t);
const noise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), u = fade(x - xi), v = fade(y - yi), a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1); return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1; };
const lg = grid((u, v) => sample(landDem, toDemX(u), toDemY(v)));
// The public depth data is too coarse near the coast, so depth here is stylised:
// it grows with distance from the real coastline, bent by the real data and some noise.
const G = N + 1, dist = new Float32Array(G * G);
for (let i = 0; i < G * G; i++) dist[i] = lg[i] > 0 ? 0 : 1e9;
for (let pass = 0; pass < 2; pass++) {
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) { const k = j * G + i; let d = dist[k];
    if (i > 0) d = Math.min(d, dist[k - 1] + 1); if (j > 0) d = Math.min(d, dist[k - G] + 1);
    if (i > 0 && j > 0) d = Math.min(d, dist[k - G - 1] + 1.414); if (i < G - 1 && j > 0) d = Math.min(d, dist[k - G + 1] + 1.414); dist[k] = d; }
  for (let j = G - 1; j >= 0; j--) for (let i = G - 1; i >= 0; i--) { const k = j * G + i; let d = dist[k];
    if (i < G - 1) d = Math.min(d, dist[k + 1] + 1); if (j < G - 1) d = Math.min(d, dist[k + G] + 1);
    if (i < G - 1 && j < G - 1) d = Math.min(d, dist[k + G + 1] + 1.414); if (i > 0 && j < G - 1) d = Math.min(d, dist[k + G - 1] + 1.414); dist[k] = d; }
}
const sg = new Float32Array(G * G);
for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
  const u = MIN + i * STEP, v = MIN + j * STEP, k = j * G + i;
  if (lg[k] > 0) { sg[k] = 1; continue; }
  const units = dist[k] * STEP;
  const shelf = -Math.pow(units, 0.85) * 40 + sampleSea(toDemX(u), toDemY(v)) * 0.6 + noise(u * 0.01, v * 0.01) * 260;
  const d = Math.hypot(u - 500, v - 500) / 500 + noise(u * 0.012, v * 0.012) * 0.035;
  sg[k] = shelf - Math.max(0, d - 0.82) * 30000;
}

let lo = 1e9, hi = -1e9; for (const v of lg) { if (v < lo) lo = v; if (v > hi) hi = v; }
console.log('elevation range in view', Math.round(lo), Math.round(hi));
{ let a = 1e9, b = -1e9; for (const v of sg) { if (v < a) a = v; if (v > b) b = v; } { let a = 1e9; for (let i = 0; i < sea8.length; i++) if (sea8[i] < a) a = sea8[i]; console.log('deepest in tiles', Math.round(a)); }
  console.log('sea grid range', Math.round(a), Math.round(b)); }

fs.mkdirSync(outDir, { recursive: true });
const svg = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">${body}</svg>`;
const manifest = [];
// Each layer is cropped to the box its shapes cover (plus room for strokes and the wall offset),
// and that box is recorded in layers.json so the page can place it on the 1000 x 1000 map.
const boxes = {};
function cropBox(body) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const d of body.match(/ d="[^"]*"/g) || []) {
    const n = d.match(/-?\d+(\.\d+)?/g).map(Number);
    for (let i = 0; i + 1 < n.length; i += 2) { x0 = Math.min(x0, n[i]); x1 = Math.max(x1, n[i]); y0 = Math.min(y0, n[i + 1]); y1 = Math.max(y1, n[i + 1]); }
  }
  const pad = 6;
  x0 = Math.max(0, Math.floor(x0 - pad)); y0 = Math.max(0, Math.floor(y0 - pad));
  x1 = Math.min(1000, Math.ceil(x1 + pad)); y1 = Math.min(1000, Math.ceil(y1 + pad));
  return [x0, y0, x1 - x0, y1 - y0];
}
function write(name, body, z, kind) {
  const box = cropBox(body);
  boxes[name] = box;
  const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.join(' ')}">${body}</svg>`;
  fs.writeFileSync(path.join(outDir, name + '.svg'), s);
  manifest.push({ name, z, kind, bytes: s.length });
}

// Sea: real depth bands, pale offshore and darker toward the coast.
const seaLevels = [[-2700, '#e4f0f3', -66], [-2200, '#d8e9ee', -50], [-1700, '#c8e0e8', -35], [-1100, '#b4d6e2', -21], [-450, '#9ccbdc', -9]];
seaLevels.forEach(([lv, fill, z], i) => {
  const d = toPath(contours(sg, lv), 1.1, 200);
  write(`sea-${i + 1}`, `<path d="${d}" fill="#3f7f9c" fill-rule="evenodd" opacity=".18" transform="translate(0 2.5)"/><path d="${d}" fill="${fill}" fill-rule="evenodd" stroke="#6ea7bf" stroke-width=".7"/>`, z, 'sea');
});

// Land: one tier per 300 m, with a printed contour line halfway up each tier.
const tiers = [[1, '#e9d78e', '#8c7433'], [300, '#ecdc98', '#8f7836'], [600, '#efe1a5', '#937c3a'], [900, '#f2e7b3', '#97803e'], [1200, '#f5ecc2', '#9a8342'], [1500, '#f8f2d2', '#9e8746'], [1800, '#fbf8e4', '#a18a4a']];
tiers.forEach(([lv, fill, line], i) => {
  const tol = i === 0 ? 0.45 : 0.8;
  const d = toPath(contours(lg, lv), tol, i === 0 ? 8 : 16);
  const mid = i < tiers.length - 1 ? toPath(contours(lg, lv + 150), 0.9, 30) : '';
  const wall = i === 0 ? '#8a7434' : line;
  const edge = i === 0 ? `stroke="#13324b" stroke-width="1.4"` : `stroke="${line}" stroke-width=".9"`;
  write(`land-${i + 1}`, `<path d="${d}" fill="${wall}" fill-rule="evenodd" opacity="${i === 0 ? 0.85 : 0.55}" transform="translate(0 ${i === 0 ? 3 : 2})"/><path d="${d}" fill="${fill}" fill-rule="evenodd" ${edge} stroke-linejoin="round"/>${mid ? `<path d="${mid}" fill="none" stroke="${line}" stroke-width=".5" stroke-linejoin="round" opacity=".75"/>` : ''}`, 6 + i * 15, 'land');
});

// Clouds: soft trade-wind banks made from noise, in the same contour language as the chart.
function fbm(x, y) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 4; i++) { s += a * noise(x * f, y * f); a *= 0.5; f *= 2.1; } return s; }
const cg = grid((u, v) => {
  const a = 1 - Math.hypot((u - 520) / 210, (v - 120) / 70), b = 1 - Math.hypot((u - 640) / 170, (v - 640) / 70);
  return Math.max(a, b) * 0.55 + fbm(u * 0.012 + 50, v * 0.02 + 8) * 0.5;
});
const c1 = toPath(contours(cg, 0.12), 1.2, 400), c2 = toPath(contours(cg, 0.28), 1.2, 200);
fs.writeFileSync(path.join(outDir, 'clouds.svg'), svg(`<path d="${c1}" fill="#fff" fill-opacity=".62" fill-rule="evenodd"/><path d="${c2}" fill="#fff" fill-opacity=".62" fill-rule="evenodd" stroke="#7fa6b8" stroke-width=".6"/>`));

fs.writeFileSync(path.join(outDir, 'layers.json'), JSON.stringify(boxes, null, 1));
console.log(JSON.stringify(manifest.map(m => [m.name, m.z, m.bytes])));
console.log('total KB', Math.round(fs.readdirSync(outDir).reduce((s, f) => s + fs.statSync(path.join(outDir, f)).size, 0) / 1024));
const places = { 'Puerto de la Luz': [-15.41, 28.145], 'Puerto de las Nieves': [-15.71, 28.10], 'Puerto de Mogan': [-15.765, 27.815], 'Pico de las Nieves': [-15.573, 27.962], 'La Isleta': [-15.42, 28.17], Maspalomas: [-15.58, 27.74] };
for (const k in places) console.log(k, toView(...places[k]));
