import * as THREE from "three";
import type { CloudState } from "./config";

function randomGenerator(seed: number) {
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
}

let decodedTextures: Promise<HTMLImageElement[]> | undefined;

/** Decode the original baked density fields once, before revealing the scene. */
export function loadCloudTextures() {
  decodedTextures ??= Promise.all([1, 2, 3, 4].map(async (index) => {
    const image = new Image(); image.src = `/img/map-clouds/cloud-${index}.png`;
    await image.decode(); return image;
  })).catch((error) => { decodedTextures = undefined; throw error; });
  return decodedTextures;
}

const unavailable = () => ({ update() {}, suspend() {}, resume() {}, dispose() {} });

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

export function createClouds(host: HTMLElement, state: CloudState, images: HTMLImageElement[]) {
  let renderer: THREE.WebGLRenderer;
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", { alpha: true, antialias: false, powerPreference: "low-power" });
    if (!context) return unavailable();
    renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: false, powerPreference: "low-power" });
  } catch { return unavailable(); }
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.pointerEvents = "none";
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, .08, 30);
  const altitude = 8.4;
  const textures = images.map((image) => {
    const texture = new THREE.Texture(image);
    texture.colorSpace = THREE.SRGBColorSpace; texture.needsUpdate = true;
    return texture;
  });
  const geometry = new THREE.PlaneGeometry(1, 1);
  // Three distant, low-opacity cards stay at the mountainous edge after descent.
  const atmosphere = [-.85, 0, .85].map((x, i) => {
    const material = new THREE.MeshBasicMaterial({ map: textures[2], transparent: true, depthWrite: false, depthTest: false, opacity: 0 });
    const mesh = new THREE.Mesh(geometry, material); mesh.renderOrder = 0;
    mesh.rotation.z = (i - 1) * .15; scene.add(mesh); return { mesh, x };
  });
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
  let frame = 0, visible = true, disposed = false, lost = false, cleared = false, suspended = false;
  let elapsed = 0, previous = 0, pointerX = 0, pointerY = 0;
  let lastOpacity = NaN, lastDescent = NaN, lastAmbient = NaN;
  let drawCount = 0, resizeCount = 0, renderTotal = 0;
  const clear = () => { if (!cleared && !lost) { renderer.clear(); cleared = true; } };
  const stop = () => { cancelAnimationFrame(frame); frame = 0; previous = 0; };
  const draw = (time: number) => {
    frame = 0;
    // Keep the backing frame through pinning, refresh and offscreen observer changes.
    if (disposed || lost || suspended || !visible || document.hidden) { previous = 0; return; }
    if (state.opacity < .002 && state.ambient < .002) { clear(); previous = 0; return; }
    const changing = state.opacity !== lastOpacity || state.descent !== lastDescent || state.ambient !== lastAmbient;
    const responding = Math.abs(state.pointerX - pointerX) + Math.abs(state.pointerY - pointerY) > .001;
    // Slow residual fog needs fewer GPU draws; active scrolling and pointer response stay at full rate.
    if (!changing && !responding && state.opacity < .002 && previous && time - previous < 1000 / 30 - .5) {
      frame = requestAnimationFrame(draw); return;
    }
    if (previous) elapsed += Math.min((time - previous) / 1000, .05);
    previous = time;
    lastOpacity = state.opacity; lastDescent = state.descent; lastAmbient = state.ambient;
    // The camera crosses each cloud family's world Z, rather than fading a screen overlay.
    camera.position.z = altitude - state.descent * 9.4;
    pointerX = THREE.MathUtils.lerp(pointerX, state.pointerX, .025);
    pointerY = THREE.MathUtils.lerp(pointerY, state.pointerY, .025);
    atmosphere.forEach(({ mesh, x }, i) => {
      const distance = 2.6, halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
      const halfWidth = halfHeight * camera.aspect;
      mesh.position.set((x + Math.sin(elapsed * .035 + i) * .015 + pointerX * .012) * halfWidth,
        (.97 + Math.cos(elapsed * .025 + i) * .012 - pointerY * .008) * halfHeight, camera.position.z - distance);
      mesh.scale.set(halfWidth * (mobile ? 1 : .85), halfHeight * .7, 1);
      mesh.material.opacity = .075 * state.ambient * THREE.MathUtils.smoothstep(state.descent, .4, .9);
      mesh.visible = mesh.material.opacity > .002;
    });
    let visibleCards = 0;
    for (const card of cards) {
      if (state.opacity < .002) { card.mesh.visible = false; continue; }
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
    if (!visibleCards && !atmosphere.some(({ mesh }) => mesh.visible)) { clear(); previous = 0; return; }
    cleared = false;
    if (process.env.NODE_ENV === "development") {
      const start = performance.now(); renderer.render(scene, camera);
      renderTotal += performance.now() - start; drawCount++;
      if (drawCount % 30 === 0) {
        host.dataset.cloudRenderMs = (renderTotal / drawCount).toFixed(3);
        host.dataset.cloudDraws = String(drawCount);
      }
    } else renderer.render(scene, camera);
    frame = requestAnimationFrame(draw);
  };
  const update = () => {
    if (disposed || lost || suspended) return;
    if (document.hidden || !visible) stop();
    else if (state.opacity < .002 && state.ambient < .002) { stop(); clear(); }
    else if (!frame) frame = requestAnimationFrame(draw);
  };
  let lastWidth = 0, lastHeight = 0, lastDpr = 0, resizePending = false;
  const resizeScene = () => {
    if (suspended) { resizePending = true; return; }
    resizePending = false;
    const { width, height } = host.getBoundingClientRect();
    const w = Math.round(width), h = Math.round(height);
    if (w <= 0 || h <= 0) return;
    const wasMobile = mobile, wasTablet = tablet;
    mobile = matchMedia("(max-width: 700px)").matches;
    tablet = !mobile && matchMedia("(max-width: 1100px)").matches;
    const dpr = Math.min(window.devicePixelRatio, mobile ? 1 : 1.25);
    if (w === lastWidth && h === lastHeight && dpr === lastDpr && mobile === wasMobile && tablet === wasTablet) return;
    lastWidth = w; lastHeight = h; lastDpr = dpr;
    stop(); renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    if (!cards.length || wasMobile !== mobile || wasTablet !== tablet) arrange();
    else cards.forEach((card) => {
      card.halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (altitude - card.z);
      card.halfWidth = card.halfHeight * camera.aspect;
      card.mesh.scale.set(card.halfWidth * 2 * card.size, card.halfWidth * 2 * card.size * .75, 1);
    });
    lastOpacity = NaN;
    if (process.env.NODE_ENV === "development") host.dataset.cloudResizes = String(++resizeCount);
    // A real resize clears WebGL's drawing buffer. Repaint in this same task, before presentation.
    draw(performance.now());
  };
  resizeScene();
  const resize = new ResizeObserver(resizeScene);
  resize.observe(host);
  const observer = new IntersectionObserver(() => {
    const bounds = host.getBoundingClientRect();
    visible = bounds.bottom > 0 && bounds.top < window.innerHeight && bounds.right > 0 && bounds.left < window.innerWidth;
    update();
  });
  observer.observe(host);
  document.addEventListener("visibilitychange", update);
  const contextLost = (event: Event) => { event.preventDefault(); lost = true; stop(); host.style.opacity = "0"; };
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  return {
    update,
    suspend() { suspended = true; stop(); },
    resume() { suspended = false; if (resizePending) resizeScene(); update(); },
    dispose() {
      disposed = true; stop(); resize.disconnect(); observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      cards.forEach((card) => card.mesh.material.dispose());
      atmosphere.forEach(({ mesh }) => mesh.material.dispose());
      geometry.dispose(); textures.forEach((texture) => texture.dispose());
      renderer.dispose(); renderer.domElement.remove();
      delete host.dataset.cloudCount; delete host.dataset.cloudFamilies;
      delete host.dataset.cloudRenderMs; delete host.dataset.cloudDraws; delete host.dataset.cloudResizes;
    },
  };
}
