import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const context = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('components/bhutan-map/satellite.ts','utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
const { satelliteTiles, MERCATOR_WORLD } = context.exports;
const data = JSON.parse(fs.readFileSync('public/img/108-alignment-detail.json','utf8'));
assert.equal(data.projection, 'EPSG:3857');
// Source KMZ marker 54: ensure its projection agrees with the global tile grid.
const marker = data.points.find(p => p.name === '54');
const lon = 90.52025911437092, lat = 26.8910315096838;
const worldX = (lon + 180) / 360 * MERCATOR_WORLD;
const worldY = (1 - Math.asinh(Math.tan(lat * Math.PI/180)) / Math.PI) / 2 * MERCATOR_WORLD;
assert.ok(Math.abs(marker.x + data.origin.x + MERCATOR_WORLD/2 - worldX) < .01);
assert.ok(Math.abs(marker.y - data.origin.y + MERCATOR_WORLD/2 - worldY) < .01);
for (const [pw,ph] of [[320,400],[390,650],[844,280],[1440,760]]) {
  for (const zoom of [1,2,16,32]) {
    const height = data.bounds.height * 1.14 / zoom, width = height * pw/ph;
    const view = { x: marker.x-width/2, y: marker.y-height/2, width, height };
    const tiles = satelliteTiles(view,data.origin,pw);
    assert.ok(tiles.length > 0 && tiles.length <= 80);
    for (const x of [view.x,view.x+width]) for (const y of [view.y,view.y+height]) {
      assert.ok(tiles.some(t => x >= t.x-1e-6 && x <= t.x+t.size+1e-6 && y >= t.y-1e-6 && y <= t.y+t.size+1e-6), 'viewport corner must have imagery coverage');
    }
    const t = tiles.find(t => marker.x >= t.x && marker.x < t.x+t.size && marker.y >= t.y && marker.y < t.y+t.size);
    assert.ok(t);
    const [level,row,col] = t.key.split('/').map(Number);
    assert.equal(col,Math.floor(worldX/MERCATOR_WORLD*2**level));
    assert.equal(row,Math.floor(worldY/MERCATOR_WORLD*2**level));
  }
}
console.log('PASS: source marker projection, tile registration, viewport coverage and tile budgets at phone/landscape/desktop sizes and zoom levels');
