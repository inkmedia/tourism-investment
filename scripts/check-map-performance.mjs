// Run with node scripts/check-map-performance.mjs. No browser or GPU required.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function compile(path, context) {
  const code = ts.transpileModule(fs.readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(code, context);
  return context.exports;
}

async function main() {
  const { mapCameraTransform } = compile("components/bhutan-map/camera.ts", { exports: {} });
  // Compare camera coordinates with the original SVG viewBox projection, including edge-clamped focus.
  for (const aspect of [1.96, 1.14]) {
    const reference = { x: 120, y: 300, width: 2100, height: 2100 / aspect };
    for (const factor of [1.2, 1.12, 1, .62, .38]) {
      const view = { x: 240, y: 370, width: reference.width * factor, height: reference.height * factor };
      const transform = mapCameraTransform(reference, view);
      for (const point of [{ x: 0, y: 0 }, { x: 1111, y: 822 }, { x: 3200, y: 2000 }]) {
        const x = (point.x - reference.x) / reference.width * transform.scale + transform.x / 100;
        const y = (point.y - reference.y) / reference.height * transform.scale + transform.y / 100;
        assert.ok(Math.abs(x - (point.x - view.x) / view.width) < 1e-10);
        assert.ok(Math.abs(y - (point.y - view.y) / view.height) < 1e-10);
      }
    }
  }
  for (let i = 1; i <= 4; i++) {
    const png = fs.readFileSync(`public/img/map-clouds/cloud-${i}.png`);
    assert.equal(png.readUInt32BE(16), 512); assert.equal(png.readUInt32BE(20), 320);
  }

  const THREE = await import("three");
  const observers = { resize: [], intersection: [] }, frames = new Map();
  const stats = { sizes: 0, clears: 0, renders: 0, disposed: 0, scene: null };
  let bounds = { width: 1200, height: 612, top: 84, bottom: 696, left: 20, right: 1220 };
  let viewport = 1280, frameId = 0, time = 0;
  const canvas = { style: {}, setAttribute() {}, addEventListener() {}, removeEventListener() {}, remove() {}, getContext: () => ({}) };
  const host = { dataset: {}, style: {}, appendChild() {}, getBoundingClientRect: () => bounds };
  const window = { innerWidth: 1280, innerHeight: 900, devicePixelRatio: 2 };
  class Renderer {
    constructor() { this.domElement = canvas; }
    setClearColor() {}
    setPixelRatio() {}
    setSize() { stats.sizes++; }
    clear() { stats.clears++; }
    render(scene, camera) { stats.renders++; stats.scene = scene; stats.cameraZ = camera.position.z; }
    dispose() { stats.disposed++; }
  }
  const context = {
    exports: {}, require: () => ({ ...THREE, WebGLRenderer: Renderer }),
    document: { hidden: false, createElement: () => canvas, addEventListener() {}, removeEventListener() {} },
    window, performance: { now: () => time }, process: { env: { NODE_ENV: "production" } },
    matchMedia: (query) => ({ matches: viewport <= (query.includes("700") ? 700 : 1100) }),
    requestAnimationFrame: (callback) => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: (id) => frames.delete(id),
    ResizeObserver: class { constructor(callback) { observers.resize.push(callback); } observe() {} disconnect() {} },
    IntersectionObserver: class { constructor(callback) { observers.intersection.push(callback); } observe() {} disconnect() {} },
  };
  const { createClouds } = compile("components/bhutan-map/clouds.ts", context);
  const state = { opacity: 1, descent: .08, ambient: 1, pointerX: 0, pointerY: 0 };
  const clouds = createClouds(host, state, Array.from({ length: 4 }, () => ({ width: 512, height: 320 })));
  assert.equal(stats.sizes, 1); assert.equal(stats.renders, 1, "first cloud frame must be ready under the loader");
  const tick = (count) => {
    for (let i = 0; i < count; i++) {
      time += 1000 / 60;
      const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach((cb) => cb(time));
    }
  };
  const ids = stats.scene.children.map((mesh) => mesh.id).join(",");
  for (let i = 0; i < 12; i++) observers.resize[0]();
  observers.intersection[0]([{ isIntersecting: false }]); // A transient observer entry during pinning.
  tick(2);
  assert.equal(stats.sizes, 1, "unchanged pin size must not clear/reallocate the canvas");
  assert.equal(stats.clears, 0, "pinning must preserve cloud pixels");
  assert.equal(stats.scene.children.map((mesh) => mesh.id).join(","), ids);
  clouds.suspend();
  const savedCamera = stats.cameraZ;
  state.descent = 0; // ScrollTrigger's temporary measurement rewind must never reach the GPU.
  bounds = { ...bounds, width: 1100, height: 561 };
  observers.resize[0](); tick(4);
  assert.equal(stats.sizes, 1, "refresh must not resize the buffer while its timeline is rewound");
  const beforeResume = stats.renders;
  state.descent = .08;
  clouds.resume();
  assert.equal(stats.sizes, 2); assert.equal(stats.renders, beforeResume + 1, "resize must repaint synchronously");
  assert.equal(stats.cameraZ, savedCamera, "refresh must resume the restored camera, not its measurement rewind");
  assert.equal(stats.scene.children.map((mesh) => mesh.id).join(","), ids, "same device tier keeps its meshes");
  bounds = { ...bounds, top: 1000, bottom: 1600 };
  observers.intersection[0]([{ isIntersecting: false }]); tick(3);
  assert.equal(stats.clears, 0, "offscreen suspension must preserve the backing frame");
  bounds = { ...bounds, top: 84, bottom: 645 };
  observers.intersection[0]([{ isIntersecting: true }]);
  state.opacity = 0; state.descent = 1;
  tick(3); const idleBefore = stats.renders; tick(120);
  const idleDraws = stats.renders - idleBefore;
  assert.ok(idleDraws >= 58 && idleDraws <= 62, `ambient render budget: ${idleDraws}`);
  const activeBefore = stats.renders;
  for (let i = 0; i < 60; i++) { state.ambient -= .005; tick(1); }
  assert.equal(stats.renders - activeBefore, 60, "active scrolling must not be throttled");
  viewport = 390; window.innerWidth = 390;
  bounds = { width: 350, height: 307, top: 84, bottom: 391, left: 20, right: 370 };
  observers.resize[0]();
  assert.equal(host.dataset.cloudCount, "11");
  clouds.dispose(); assert.equal(frames.size, 0); assert.equal(stats.disposed, 1);
  console.log("PASS: camera projection, baked textures, pin/refresh continuity, resize reuse, offscreen pause, idle/active cadence, mobile tier and disposal");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
