// Usage: node tools/fetch-tiles.js <out-dir> <zoom: 11 for land, 8 for sea>
// Downloads Terrarium elevation tiles (AWS Open Data, Mapzen Terrain Tiles) around Gran Canaria.
const fs = require('fs'), path = require('path');
const dir = process.argv[2];
const Z = Number(process.argv[3] || 11), n = 2 ** Z;
const tx = lon => (lon + 180) / 360 * n;
const ty = lat => { const r = lat * Math.PI / 180; return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n; };
const x0 = Math.floor(tx(-16.05)), x1 = Math.floor(tx(-15.15)), y0 = Math.floor(ty(28.36)), y1 = Math.floor(ty(27.55));
(async () => {
  console.log('tiles', x0, x1, y0, y1, (x1 - x0 + 1) * (y1 - y0 + 1));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${Z}/${x}/${y}.png`;
    const res = await fetch(url, { headers: { 'User-Agent': 'portfolio-chart-generator' } });
    if (!res.ok) throw new Error(url + ' ' + res.status);
    fs.writeFileSync(path.join(dir, `${x}_${y}.png`), Buffer.from(await res.arrayBuffer()));
  }
  console.log('done');
})();
