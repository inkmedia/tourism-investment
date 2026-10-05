import * as THREE from "three";
import type { CloudState } from "./config";

function randomGenerator(seed: number) {
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
}

/** Locally generated density fields: warped, multi-frequency noise, never white planes. */
function cloudTexture(seed: number, variant: number) {
  const random = randomGenerator(seed);
  const canvas = document.createElement("canvas");
  canvas.width = 768; canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const grids = [6, 15, 37, 89, 211].map((size) => ({ size, values: Float32Array.from({ length: (size + 1) ** 2 }, random) }));
  const sample = (x: number, y: number, octave: number) => {
    const { size, values } = grids[octave];
    const px = Math.max(0, Math.min(.9999, x)) * size, py = Math.max(0, Math.min(.9999, y)) * size;
    const ix = Math.floor(px), iy = Math.floor(py);
    const sx = px - ix, sy = py - iy;
    const fx = sx * sx * (3 - 2 * sx), fy = sy * sy * (3 - 2 * sy);
    const at = (dx: number, dy: number) => values[(iy + dy) * (size + 1) + ix + dx];
    return THREE.MathUtils.lerp(THREE.MathUtils.lerp(at(0, 0), at(1, 0), fx), THREE.MathUtils.lerp(at(0, 1), at(1, 1), fx), fy);
  };
  const noise = (x: number, y: number) => [.25, .24, .22, .18, .11].reduce((n, weight, i) => n + sample(x, y, i) * weight, 0);
  const wispy = variant === 2;
  const lobes = Array.from({ length: wispy ? 8 : 12 }, () => ({
    x: .2 + random() * .6, y: .28 + random() * .44,
    rx: .09 + random() * (variant === 3 ? .2 : .14), ry: .06 + random() * (wispy ? .09 : .18),
  }));
  const densityAt = (x: number, y: number) => {
    const wx = x + (sample(x, y, 1) - .5) * .14;
    const wy = y + (sample(y, x, 2) - .5) * .13;
    let envelope = 0;
    for (const lobe of lobes) {
      const radius = ((wx - lobe.x) / lobe.rx) ** 2 + ((wy - lobe.y) / lobe.ry) ** 2;
      envelope = Math.max(envelope, Math.exp(-radius * 1.5));
    }
    const turbulent = noise(wx, wy);
    // Noise carves holes and tendrils into the silhouette, rather than tinting round puffs.
    const density = Math.max(0, envelope * (turbulent * 1.7 + .15) - (wispy ? .27 : .18));
    const edge = THREE.MathUtils.smoothstep(Math.min(x, y, 1 - x, 1 - y), .015, .13);
    return (1 - Math.exp(-density * (variant === 1 ? 3.8 : wispy ? 1.6 : 2.8))) * edge;
  };
  const image = ctx.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const u = x / canvas.width, v = y / canvas.height;
      const density = densityAt(u, v);
      if (!density) continue;
      const n = noise(u, v);
      const light = THREE.MathUtils.clamp(.79 + (density - densityAt(u - .008, v - .012)) * 1.2 + (n - .4) * .55, .66, 1);
      const offset = (y * canvas.width + x) * 4;
      image.data[offset] = 248 * light;
      image.data[offset + 1] = 250 * light;
      image.data[offset + 2] = Math.min(255, 253 * light + (1 - light) * 12);
      image.data[offset + 3] = Math.pow(density, wispy ? 1.15 : .8) * 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const FAMILIES = [
  { z: 5.9, size: .51, opacity: .88, travel: .85, count: 4, mobileCount: 2,
    positions: [[-.86, .64], [.83, .68], [-.86, -.63], [.88, -.60]] },
  { z: 3.7, size: .4, opacity: .79, travel: .62, count: 6, mobileCount: 3,
    positions: [[-.46, .2], [.5, -.18], [.3, .62], [-.32, -.65], [.81, .05], [-.79, -.15], [-.13, .38]] },
  { z: 1.7, size: .28, opacity: .62, travel: .12, count: 7, mobileCount: 4,
    positions: [[-.52, .5], [.07, .45], [.58, .3], [-.5, -.3], [.28, -.48], [.75, -.52], [-.13, -.18]] },
  { z: .15, size: .14, opacity: .4, travel: .025, count: 4, mobileCount: 2,
    positions: [[-.08, .06], [.12, -.07], [-.2, -.16], [.23, .14]] },
] as const;

export function createClouds(host: HTMLElement, state: CloudState) {
  let renderer: THREE.WebGLRenderer;
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", { alpha: true, antialias: false, powerPreference: "low-power" });
    if (!context) return { update() {}, dispose() {} };
    renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: false, powerPreference: "low-power" });
  } catch { return { update() {}, dispose() {} }; }
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.pointerEvents = "none";
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, .08, 30);
  const altitude = 8.4;
  const textures: THREE.CanvasTexture[] = [];
  try { [137, 721, 1931, 3109].forEach((seed, variant) => textures.push(cloudTexture(seed, variant))); }
  catch {
    textures.forEach((texture) => texture.dispose()); renderer.dispose(); renderer.domElement.remove();
    return { update() {}, dispose() {} };
  }
  const geometry = new THREE.PlaneGeometry(1, 1);
  type CloudCard = { mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>; family: number; nx: number; ny: number; z: number; size: number; opacity: number; phase: number; halfWidth: number; halfHeight: number };
  let cards: CloudCard[] = [];
  let mobile = false;
  let tablet = false;
  const arrange = () => {
    for (const card of cards) { scene.remove(card.mesh); card.mesh.material.dispose(); }
    cards = [];
    const random = randomGenerator(481);
    FAMILIES.forEach((family, index) => {
      const count = mobile ? family.mobileCount : tablet ? Math.max(family.mobileCount, family.count - 1) : family.count;
      for (let i = 0; i < count; i++) {
        const [nx, ny] = family.positions[i];
        const z = family.z + (random() - .5) * .7;
        const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (altitude - z);
        const halfWidth = halfHeight * camera.aspect;
        const material = new THREE.MeshBasicMaterial({ map: textures[(i + index) % textures.length], transparent: true, depthWrite: false, depthTest: false, opacity: family.opacity });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.set((random() - .5) * .12, (random() - .5) * .12, (random() - .5) * .4);
        mesh.renderOrder = 3 - index;
        const size = family.size * (.85 + random() * .35);
        mesh.scale.set(halfWidth * 2 * size, halfWidth * 2 * size * .75, 1);
        scene.add(mesh);
        cards.push({ mesh, family: index, nx, ny, z, size, opacity: family.opacity, phase: random() * Math.PI * 2, halfWidth, halfHeight });
      }
    });
    host.dataset.cloudCount = String(cards.length);
    host.dataset.cloudFamilies = "4";
  };
  let frame = 0, visible = false, disposed = false, lost = false, cleared = false;
  let elapsed = 0, previous = 0;
  const clear = () => { if (!cleared && !lost) { renderer.clear(); cleared = true; } };
  const stop = () => { cancelAnimationFrame(frame); frame = 0; previous = 0; };
  const draw = (time: number) => {
    frame = 0;
    if (disposed || lost || !visible || document.hidden || state.opacity < .002) { clear(); previous = 0; return; }
    if (previous) elapsed += Math.min((time - previous) / 1000, .05);
    previous = time;
    // The camera crosses each cloud family's world Z, rather than fading a screen overlay.
    camera.position.z = altitude - state.descent * 9.4;
    let visibleCards = 0;
    for (const card of cards) {
      const family = FAMILIES[card.family];
      const passage = THREE.MathUtils.smoothstep(state.descent, (altitude - card.z) / 9.4 - .2, (altitude - card.z) / 9.4 + .02);
      const travel = family.travel * (mobile ? .72 : 1);
      const x = card.nx + (Math.sign(card.nx) * .85 + Math.sin(card.phase) * .35) * passage * travel;
      const y = card.ny + (Math.sign(card.ny) * .55 + Math.cos(card.phase) * .3) * passage * travel;
      card.mesh.position.set(
        (x + Math.sin(elapsed * .06 + card.phase) * .009) * card.halfWidth,
        (y + Math.cos(elapsed * .045 + card.phase) * .006) * card.halfHeight,
        card.z + state.descent * .18 * family.travel,
      );
      const distance = camera.position.z - card.mesh.position.z;
      const screenHalfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
      card.mesh.visible = distance > .08
        && Math.abs(card.mesh.position.x) < screenHalfHeight * camera.aspect + card.mesh.scale.x / 2
        && Math.abs(card.mesh.position.y) < screenHalfHeight + card.mesh.scale.y / 2;
      if (card.mesh.visible) visibleCards++;
      // A short near-camera dissolve only softens passage; perspective and exit do the work.
      card.mesh.material.opacity = card.opacity * state.opacity * THREE.MathUtils.smoothstep(distance, .08, .65);
    }
    if (!visibleCards) { clear(); previous = 0; return; }
    cleared = false; renderer.render(scene, camera);
    frame = requestAnimationFrame(draw);
  };
  const update = () => {
    if (disposed || lost) return;
    if (document.hidden || !visible || state.opacity < .002) { stop(); clear(); }
    else if (!frame) frame = requestAnimationFrame(draw);
  };
  const resize = new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect();
    mobile = matchMedia("(max-width: 700px)").matches;
    tablet = !mobile && matchMedia("(max-width: 1100px)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1 : 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1); camera.updateProjectionMatrix();
    arrange(); update();
  });
  resize.observe(host);
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
  observer.observe(host);
  document.addEventListener("visibilitychange", update);
  const contextLost = (event: Event) => { event.preventDefault(); lost = true; stop(); host.style.opacity = "0"; };
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  return {
    update,
    dispose() {
      disposed = true; stop(); resize.disconnect(); observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      cards.forEach((card) => card.mesh.material.dispose());
      geometry.dispose(); textures.forEach((texture) => texture.dispose());
      renderer.dispose(); renderer.domElement.remove();
      delete host.dataset.cloudCount; delete host.dataset.cloudFamilies;
    },
  };
}
