"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MAP_SELECTORS as S,
  MAP_ANIMATION as T,
  MAP_LAYERS,
  type LayerKey,
  type CloudState,
} from "./config";

import {
  fitViewBoxToBBox,
  centerViewBox,
  altitudeViewBox,
  interpolateViewBox,
} from "./framing";
import { createMapInteractions } from "./interactions";
import { prepareLayerMotion } from "./layerMotion";
import { mapCameraTransform } from "./camera";

gsap.registerPlugin(ScrollTrigger);
type City = { id: string; label: string };
type MapApi = {
  focus: (id: string) => void;
  overview: () => void;
  layer: (key: LayerKey | null) => void;
};

// Follow actual segment endpoints, reversing the drawing direction when required.
function orderTrail(paths: SVGPathElement[]) {
  const segments = paths.map((path) => {
    const length = path.getTotalLength();
    return {
      path,
      length,
      start: path.getPointAtLength(0),
      end: path.getPointAtLength(length),
      reverse: false,
    };
  });
  let point = segments
    .flatMap((segment) => [segment.start, segment.end])
    .reduce((left, point) => (point.x < left.x ? point : left));
  const ordered: typeof segments = [];
  while (segments.length) {
    let best = 0,
      distance = Infinity,
      reverse = false;
    segments.forEach((segment, i) => {
      [segment.start, segment.end].forEach((end, j) => {
        const d = Math.hypot(point.x - end.x, point.y - end.y);
        if (d < distance) {
          best = i;
          distance = d;
          reverse = j === 1;
        }
      });
    });
    const segment = segments.splice(best, 1)[0];
    segment.reverse = reverse;
    ordered.push(segment);
    point = reverse ? segment.start : segment.end;
  }
  return ordered;
}

export default function BhutanInteractiveMap() {
  const stageRef = useRef<HTMLDivElement>(null);
  const artworkRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const apiRef = useRef<MapApi | null>(null);
  const [ready, setReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [explore, setExplore] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [hiddenLayers, setHiddenLayers] = useState<LayerKey[]>([]);

  useLayoutEffect(() => {
    const controls = controlsRef.current!;
    const map = stageRef.current!.parentElement!;
    // Reserve the actual controls height, including category rows that wrap.
    const measureControls = () =>
      map.style.setProperty(
        "--map-controls-height",
        `${controls.getBoundingClientRect().height}px`,
      );
    measureControls();
    const observer = new ResizeObserver(measureControls);
    observer.observe(controls);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const stage = stageRef.current!,
      artwork = artworkRef.current!,
      camera = cameraRef.current!;
    const controls = controlsRef.current!,
      caption = captionRef.current!,
      progress = progressRef.current!;
    const abort = new AbortController();
    let disposed = false;
    let teardown = () => {};
    // Fetch once near the section, keeping the loader visible until the map is ready.
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        try {
          const cloudAssets = matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? Promise.resolve(null)
            : import("./clouds")
                .then(async (module) => ({
                  module,
                  images: await module.loadCloudTextures(),
                }))
                .catch(() => null);
          const response = await fetch("/img/bhutan-map-production.svg", {
            signal: abort.signal,
          });
          if (!response.ok) throw new Error("Map unavailable");
          const markup = await response.text();
          const image = new Image();
          image.src = "/img/bhutan-satellite.webp";
          const [, preparedClouds] = await Promise.all([
            image.decode(),
            cloudAssets,
          ]);
          if (disposed) return;
          // This markup is a trusted local production asset, never user/remote HTML.
          camera.innerHTML = markup;
          const svg = camera.querySelector<SVGSVGElement>("svg")!;
          // The accessible label below replaces the asset title and its native hover tooltip.
          svg.querySelectorAll("title").forEach((title) => title.remove());
          svg.setAttribute("role", "group");
          svg.setAttribute(
            "aria-label",
            "Bhutan: satellite terrain, natural systems, Mindfulness Trail and settlements. Use the controls below to explore.",
          );
          svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
          svg
            .querySelectorAll(".city-label")
            .forEach((label) => label.removeAttribute("textLength"));
          const q = (selector: string) =>
            svg.querySelector<SVGElement>(selector)!;
          const cityGroups = Array.from(
            svg.querySelectorAll<SVGGElement>(`${S.cities} > .city`),
          );
          setCities(
            cityGroups.map((city) => ({
              id: city.id,
              label: Array.from(city.querySelectorAll("text"))
                .map((text) => text.textContent)
                .join(" "),
            })),
          );
          const boundaryBBox = (q(S.boundary) as SVGGraphicsElement).getBBox();
          const sourceExtent = (q(S.satellite) as SVGGraphicsElement).getBBox();
          const legendBBox = (q(S.legend) as SVGGraphicsElement).getBBox();
          const stageAspect = () => {
            const bounds = stage.getBoundingClientRect();
            return bounds.width / bounds.height;
          };
          const original = fitViewBoxToBBox(
            boundaryBBox,
            stageAspect(),
            sourceExtent,
          );
          let altitude = altitudeViewBox(
            original,
            sourceExtent,
            matchMedia("(max-width: 700px)").matches,
          );
          const approach = { progress: 0 };
          const view = { ...original };
          const setProjection = () =>
            svg.setAttribute(
              "viewBox",
              `${original.x} ${original.y} ${original.width} ${original.height}`,
            );
          setProjection();
          let lastCameraTransform = "";
          const writeView = () => {
            if (disposed) return;
            const { x, y, scale } = mapCameraTransform(original, view);
            const transform = `translate(${x.toFixed(5)}%, ${y.toFixed(5)}%) scale(${scale.toFixed(6)})`;
            if (transform === lastCameraTransform) return;
            lastCameraTransform = transform;
            camera.style.transform = transform;
          };
          const placeLegend = () => {
            const scale = Math.min(
              0.7,
              (original.width * 0.94) / legendBBox.width,
              (original.height * 0.13) / legendBBox.height,
            );
            const x = original.x + original.width * 0.02 - legendBBox.x * scale;
            const y =
              original.y +
              original.height * 0.97 -
              (legendBBox.y + legendBBox.height) * scale;
            q(S.legend).setAttribute(
              "transform",
              `translate(${x} ${y}) scale(${scale})`,
            );
          };
          placeLegend();
          writeView();
          let viewTween: gsap.core.Tween | undefined;
          let interactive = false,
            zoomed = false,
            exiting = false;
          let focusedCityId = "";
          const hidden = new Set<LayerKey>();
          const preference = matchMedia("(prefers-reduced-motion: reduce)");
          let cloud:
            | ReturnType<typeof import("./clouds").createClouds>
            | undefined;
          let cloudLoading = false;
          const ensureClouds = async () => {
            if (cloud || cloudLoading || preference.matches) return;
            cloudLoading = true;
            try {
              const assets =
                preparedClouds ??
                (await import("./clouds").then(async (module) => ({
                  module,
                  images: await module.loadCloudTextures(),
                })));
              if (assets && !disposed && !preference.matches) {
                cloud = assets.module.createClouds(
                  cloudRef.current!,
                  cloudState,
                  assets.images,
                );
                cloud.update();
              }
            } catch {
              /* The SVG story works independently of WebGL. */
            } finally {
              cloudLoading = false;
            }
          };
          const cloudState: CloudState = {
            opacity: 1,
            descent: 0,
            pointerX: 0,
            pointerY: 0,
            ambient: 1,
          };
          // Compile/upload the first cloud frame under the loader, before any pin or reveal.
          await ensureClouds();
          if (disposed) {
            cloud?.dispose();
            return;
          }
          const layerTargets = MAP_LAYERS.map((layer) => q(S[layer.key]));
          const nativeOpacity = new Map(
            layerTargets.map((el) => [
              el,
              Number(el.getAttribute("opacity") ?? 1) *
                (el === q(S.sites) ? 0.65 : 1),
            ]),
          );
          // Separate opacity ownership: story wrappers reveal geography; the original
          // SVG groups remain independently toggleable even while scrub settles.
          const storyLayers = new Map<LayerKey, SVGGElement>();
          MAP_LAYERS.forEach(({ key }, index) => {
            const layer = layerTargets[index];
            const wrapper = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "g",
            );
            wrapper.setAttribute("data-story-layer", key);
            layer.before(wrapper);
            wrapper.appendChild(layer);
            storyLayers.set(key, wrapper);
            gsap.set(layer, { opacity: nativeOpacity.get(layer)! });
          });
          const layerMotion = prepareLayerMotion(svg);
          // Exploration must not overwrite or kill the scrubbed story's SVG tweens.
          const explorationTweens = new Map<SVGElement, gsap.core.Tween>();
          const exploreTo = (
            targets: SVGElement | SVGElement[],
            vars: gsap.TweenVars,
          ) => {
            (Array.isArray(targets) ? targets : [targets]).forEach((target) => {
              explorationTweens.get(target)?.kill();
              explorationTweens.set(
                target,
                gsap.to(target, { ...vars, overwrite: false }),
              );
            });
          };
          const animateView = (target: typeof view) => {
            viewTween?.kill();
            gsap.to(artwork, { rotateX: 0, rotateY: 0, duration: 0.3 });
            if (preference.matches) {
              Object.assign(view, target);
              writeView();
              return;
            }
            camera.style.willChange = "transform";
            viewTween = gsap.to(view, {
              ...target,
              duration: 1.1,
              ease: "power3.inOut",
              onUpdate: writeView,
              onComplete: () => {
                camera.style.willChange = "auto";
              },
            });
          };
          const reset = () => {
            zoomed = false;
            focusedCityId = "";
            stage.dataset.focused = "false";
            animateView(original);
            setSelectedCity("");
            interactions?.focus("");
          };
          const selectLayer = (key: LayerKey | null) => {
            if (!interactive || exiting) return;
            if (key === null) hidden.clear();
            else if (hidden.has(key)) hidden.delete(key);
            else hidden.add(key);
            if (key === null) layerMotion.resetFilters();
            else layerMotion.toggle(key, !hidden.has(key), preference.matches);
            setHiddenLayers([...hidden]);
            MAP_LAYERS.forEach((layer, index) => {
              exploreTo(layerTargets[index], {
                opacity: hidden.has(layer.key)
                  ? 0
                  : nativeOpacity.get(layerTargets[index])!,
                duration: preference.matches ? 0.15 : 0.4,
              });
            });
          };
          const focus = (id: string) => {
            if (!interactive || exiting) return;
            const city = cityGroups.find((group) => group.id === id);
            if (!city) return;
            selectLayer(null);
            zoomed = true;
            stage.dataset.focused = "true";
            setSelectedCity(id);
            const box = city
              .querySelector<SVGGraphicsElement>(".city-dot")!
              .getBBox();
            focusedCityId = id;
            const factor = matchMedia("(max-width: 700px)").matches
              ? 0.62
              : 0.38;
            animateView(
              centerViewBox(
                box.x + box.width / 2,
                box.y + box.height / 2,
                original.width * factor,
                original.height * factor,
                sourceExtent,
              ),
            );
            interactions?.focus(id);
          };
          const interactions = createMapInteractions({
            svg,
            stage,
            artwork,
            cities: cityGroups,
            atmosphere: cloudState,
            reduced: preference,
            enabled: () => interactive && !exiting,
            focus,
          });
          interactions.enable(false);
          apiRef.current = {
            focus,
            overview: () => {
              if (interactive) {
                reset();
                selectLayer(null);
              }
            },
            layer: selectLayer,
          };
          const legendNames: Record<LayerKey, string> = {
            protectedForests: "protected-forest",
            corridors: "ecological-corridor",
            rivers: "river",
            dams: "dam",
            airports: "airports",
            trail: "mindfulness-trail",
            sites: "religious-sites",
          };
          MAP_LAYERS.forEach(({ key }) => {
            const label = svg.querySelector(
              `#legend-label-${legendNames[key]}`,
            );
            label?.setAttribute("data-map-layer", key);
          });
          cityGroups.forEach((city) => {
            const box = city
              .querySelector<SVGGraphicsElement>(".city-dot")!
              .getBBox();
            const hit = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "circle",
            );
            hit.setAttribute("cx", String(box.x + box.width / 2));
            hit.setAttribute("cy", String(box.y + box.height / 2));
            hit.setAttribute(
              "r",
              matchMedia("(max-width: 700px)").matches ? "36" : "26",
            );
            hit.setAttribute("fill", "transparent");
            city.appendChild(hit);
          });
          const click = (event: MouseEvent) => {
            const city = (event.target as Element).closest<SVGGElement>(
              ".city",
            );
            if (city) focus(city.id);
            const legend = (event.target as Element).closest(
              "[data-map-layer]",
            );
            const key = legend?.getAttribute("data-map-layer") as
              | LayerKey
              | undefined;
            if (key) selectLayer(key);
          };
          svg.addEventListener("click", click);
          const writeStoryView = () => {
            Object.assign(
              view,
              interpolateViewBox(altitude, original, approach.progress),
            );
            writeView();
          };
          const enableControls = (value: boolean) => {
            setExplore(value);
            interactions.enable(value);
            controls.inert = !value;
            controls.setAttribute("aria-disabled", String(!value));
            controls.style.pointerEvents = value ? "auto" : "none";
            controls
              .querySelectorAll<
                HTMLButtonElement | HTMLSelectElement
              >("button, select")
              .forEach((control) => {
                control.disabled = !value;
              });
          };
          const mode = (value: boolean) => {
            if (disposed || interactive === value) return;
            interactive = value;
            stage.dataset.mode = value ? "explore" : "story";
            camera.style.willChange = value ? "auto" : "transform";
            enableControls(value && !exiting);
            // One reversible handoff owns visual and native interaction state together.
            gsap.to(controls, {
              autoAlpha: value ? 1 : 0,
              duration: preference.matches ? 0 : 0.3,
              ease: "power2.out",
              overwrite: "auto",
            });
            if (value) {
              Object.assign(view, original);
              writeView();
            } else {
              layerMotion.resetFilters();
              viewTween?.kill();
              zoomed = false;
              focusedCityId = "";
              stage.dataset.focused = "false";
              setSelectedCity("");
              hidden.clear();
              setHiddenLayers([]);
              explorationTweens.forEach((tween) => tween.kill());
              explorationTweens.clear();
              gsap.set(cityGroups, { opacity: 1 });
              layerTargets.forEach((el) =>
                gsap.set(el, { opacity: nativeOpacity.get(el)! }),
              );
              gsap.to(artwork, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.3,
                overwrite: true,
              });
            }
          };
          let resizeFrame = 0,
            refreshTimer: ReturnType<typeof setTimeout> | undefined;
          let lastWidth = stage.clientWidth,
            lastHeight = stage.clientHeight;
          const resize = new ResizeObserver(() => {
            if (
              stage.clientWidth === lastWidth &&
              stage.clientHeight === lastHeight
            )
              return;
            lastWidth = stage.clientWidth;
            lastHeight = stage.clientHeight;
            cancelAnimationFrame(resizeFrame);
            resizeFrame = requestAnimationFrame(() => {
              if (disposed) return;
              Object.assign(
                original,
                fitViewBoxToBBox(boundaryBBox, stageAspect(), sourceExtent),
              );
              setProjection();
              altitude = altitudeViewBox(
                original,
                sourceExtent,
                matchMedia("(max-width: 700px)").matches,
              );
              placeLegend();
              const layers = [...hidden];
              if (interactive && focusedCityId) focus(focusedCityId);
              else if (interactive) {
                viewTween?.kill();
                Object.assign(view, original);
                writeView();
              } else writeStoryView();
              if (interactive && focusedCityId) layers.forEach(selectLayer);
              clearTimeout(refreshTimer);
              refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 160);
            });
          });
          resize.observe(stage);
          const media = gsap.matchMedia();
          const ctx = gsap.context(() => {
            media.add(
              {
                reduced: "(prefers-reduced-motion: reduce)",
                mobile: "(max-width: 700px)",
                desktop: "(min-width: 701px)",
              },
              (context) => {
                const reduced = context.conditions!.reduced,
                  mobile = context.conditions!.mobile;
                exiting = false;
                stage.dataset.exiting = "false";
                setLeaving(false);
                mode(false);
                hidden.clear();
                zoomed = false;
                focusedCityId = "";
                stage.dataset.focused = "false";
                viewTween?.kill();
                Object.assign(view, original);
                writeView();
                setSelectedCity("");
                setHiddenLayers([]);
                if (reduced) {
                  layerMotion.resetFilters();
                  cloudState.opacity = 0;
                  cloudState.ambient = 0;
                  cloud?.update();
                  gsap.set(q(S.veil), { opacity: 0 });
                  gsap.set(shadowRef.current, { opacity: 0 });
                  layerTargets.forEach((el) =>
                    gsap.set(el, { opacity: nativeOpacity.get(el)! }),
                  );
                  mode(true);
                  gsap.set(controls, { opacity: 1, visibility: "visible" });
                  caption.textContent = "Explore Bhutan";
                  progress.style.transform = "scaleX(1)";
                  return;
                }
                void ensureClouds();
                const boundary = Array.from(
                  svg.querySelectorAll<SVGPathElement>(
                    `${S.boundary} path[stroke]:not([stroke='none'])`,
                  ),
                );
                boundary.forEach((path) => {
                  const length = path.getTotalLength();
                  gsap.set(path, {
                    strokeDasharray: length,
                    strokeDashoffset: length,
                  });
                });
                const trail = orderTrail(
                  Array.from(
                    svg.querySelectorAll<SVGPathElement>(
                      `${S.trail} path[id^='mindfulness-trail-']`,
                    ),
                  ),
                );
                trail.forEach(({ path, length, reverse }) =>
                  gsap.set(path, {
                    strokeDasharray: length,
                    strokeDashoffset: reverse ? -length : length,
                  }),
                );
                gsap.set(q(S.base), { opacity: 0.85 });
                gsap.set(controls, { opacity: 0, visibility: "hidden" });
                approach.progress = 0;
                writeStoryView();
                gsap.set(
                  [
                    q(S.veil),
                    ...storyLayers.values(),
                    q(S.cities),
                    q(S.legend),
                    q(S.boundary),
                  ],
                  { opacity: 0 },
                );
                gsap.set(
                  cityGroups.flatMap((city) =>
                    Array.from(city.querySelectorAll("text")),
                  ),
                  { y: 5, opacity: 0 },
                );
                gsap.set(
                  cityGroups.flatMap((city) =>
                    Array.from(city.querySelectorAll(".city-dot")),
                  ),
                  { scale: 0.7, transformOrigin: "center" },
                );
                cloudState.opacity = 1;
                cloudState.descent = 0;
                cloudState.ambient = 1;
                cloud?.update();
                let phase = -1;
                let refreshing = false;
                let refreshFrame = 0;
                let refreshExit = () => {};
                let lastApproach = -1;
                const syncInteraction = (
                  scrollProgress: number,
                  storyProgress: number,
                ) => {
                  mode(
                    scrollProgress >= T.interaction &&
                      storyProgress >= T.interaction,
                  );
                };
                const captions = [
                  "Above the Himalayan landscape",
                  "Descending through the clouds",
                  "The geography emerges",
                  "Forests, corridors and rivers",
                  "The Mindfulness Trail",
                  "Places, culture and arrival",
                  "Explore the landscape",
                ];
                const timeline = gsap.timeline({
                  defaults: { ease: "none" },
                  scrollTrigger: {
                    // This upstream pin mounts after its SVG fetch; measure it before
                    // downstream scenes even when those triggers were created first.
                    id: "bhutan-map",
                    refreshPriority: 1,
                    trigger: stage.parentElement!,
                    start: "top top+=84",
                    end: () =>
                      `+=${window.innerHeight * (mobile ? 0.85 : 1.7)}`,
                    pin: stage.parentElement!,
                    scrub: 0.55,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onRefreshInit: () => {
                      refreshing = true;
                      cloud?.suspend();
                    },
                    onUpdate: (self) => {
                      // Pin refresh briefly rewinds progress to measure layout. It is
                      // not a reverse-scroll gesture and must not erase exploration.
                      if (disposed || refreshing) return;
                      // Let scrub settle naturally; do not jump the remaining reveal to its endpoint.
                      syncInteraction(
                        self.progress,
                        self.animation?.progress() ?? 0,
                      );
                    },
                    onRefresh: (self) => {
                      cancelAnimationFrame(refreshFrame);
                      refreshFrame = requestAnimationFrame(() => {
                        if (disposed) return;
                        // ScrollTrigger restores its scrubbed playhead after measuring the pin.
                        refreshing = false;
                        refreshExit();
                        syncInteraction(
                          self.progress,
                          self.animation?.progress() ?? 0,
                        );
                        if (!interactive) writeStoryView();
                        cloud?.resume();
                      });
                    },
                  },
                  onUpdate: () => {
                    if (disposed || refreshing) return;
                    const p = timeline.progress();
                    stage.dataset.storyProgress = p.toFixed(4);

                    if (!interactive && approach.progress !== lastApproach) {
                      lastApproach = approach.progress;
                      writeStoryView();
                    }
                    syncInteraction(timeline.scrollTrigger?.progress ?? 0, p);
                    progress.style.transform = `scaleX(${p})`;
                    const next =
                      p < 0.12
                        ? 0
                        : p < 0.32
                          ? 1
                          : p < 0.43
                            ? 2
                            : p < 0.65
                              ? 3
                              : p < 0.78
                                ? 4
                                : p < 0.94
                                  ? 5
                                  : 6;
                    if (next !== phase) {
                      phase = next;
                      caption.textContent = captions[next];
                    }
                    cloud?.update();
                  },
                });
                timeline
                  .to(
                    approach,
                    { progress: 0.06, duration: 0.12, ease: "sine.inOut" },
                    0,
                  )
                  .to(
                    cloudState,
                    { descent: 1, duration: T.descentDuration },
                    T.descent,
                  )
                  .to(cloudState, { opacity: 0, duration: 0.14 }, 0.48)
                  .fromTo(
                    shadowRef.current,
                    { opacity: 0.1, xPercent: -2, yPercent: -1 },
                    { opacity: 0, xPercent: 3, yPercent: 2, duration: 0.55 },
                    0.06,
                  )
                  .to(
                    approach,
                    { progress: 1, duration: 0.48, ease: "sine.inOut" },
                    T.approach,
                  )
                  .to(q(S.base), { opacity: 1, duration: 0.37 }, T.satellite)
                  .to(q(S.boundary), { opacity: 1, duration: 0.1 }, T.boundary)
                  .to(
                    boundary,
                    { strokeDashoffset: 0, duration: 0.12 },
                    T.boundary,
                  )
                  .to(
                    storyLayers.get("trail")!,
                    { opacity: 1, duration: 0.01 },
                    T.trail,
                  );
                layerMotion.reveal(timeline, storyLayers, T);
                const total = trail.reduce(
                  (sum, segment) => sum + segment.length,
                  0,
                );
                let time = T.trail as number;
                trail.forEach(({ path, length }) => {
                  const duration = (T.trailDuration * length) / total;
                  timeline.to(path, { strokeDashoffset: 0, duration }, time);
                  time += duration;
                });
                timeline
                  .to(q(S.cities), { opacity: 1, duration: 0.12 }, T.cities)
                  .to(
                    cityGroups.flatMap((city) =>
                      Array.from(city.querySelectorAll("text")),
                    ),
                    {
                      opacity: 1,
                      y: 0,
                      duration: 0.06,
                      stagger: { amount: 0.07 },
                    },
                    T.cities,
                  )
                  .to(
                    cityGroups.flatMap((city) =>
                      Array.from(city.querySelectorAll(".city-dot")),
                    ),
                    { scale: 1, duration: 0.06, stagger: { amount: 0.07 } },
                    T.cities,
                  )
                  .to(q(S.legend), { opacity: 1, duration: 0.08 }, T.legend);
                // Keep normalized narrative progress at exactly one, independent of tween endpoints.
                timeline.to({}, { duration: 1 }, 0);
                const updateExit = (progress: number) => {
                  const next = progress > 0.35;
                  if (next === exiting) return;
                  exiting = next;
                  stage.dataset.exiting = String(next);
                  setLeaving(next);
                  if (next) {
                    if (zoomed) reset();
                    hidden.clear();
                    setHiddenLayers([]);
                    layerMotion.resetFilters();
                    layerTargets.forEach((el) =>
                      exploreTo(el, {
                        opacity: nativeOpacity.get(el)!,
                        duration: 0.4,
                      }),
                    );
                  }
                  enableControls(interactive && !next);
                  caption.textContent = next
                    ? "From landscape to opportunity"
                    : "Explore the landscape";
                };
                const exit = gsap.timeline({
                  scrollTrigger: {
                    trigger: stage.parentElement!,
                    // Leave room to reach controls on shorter screens before quietening the scene.
                    start: () =>
                      timeline.scrollTrigger!.end +
                      Math.max(
                        120,
                        stage.parentElement!.offsetHeight +
                          84 -
                          window.innerHeight +
                          80,
                      ),
                    end: () =>
                      timeline.scrollTrigger!.end +
                      Math.max(
                        120,
                        stage.parentElement!.offsetHeight +
                          84 -
                          window.innerHeight +
                          80,
                      ) +
                      window.innerHeight * 0.65,
                    scrub: 0.6,
                    onUpdate: (self) => {
                      if (!disposed && !refreshing) updateExit(self.progress);
                    },
                  },
                });
                refreshExit = () =>
                  updateExit(exit.scrollTrigger?.progress ?? 0);
                exit
                  .to(
                    svg.querySelectorAll('[data-label-hierarchy="secondary"]'),
                    { opacity: 0.35, duration: 1 },
                    0,
                  )
                  .to(artwork, { scale: 0.985, duration: 1 }, 0)
                  .fromTo(
                    controls,
                    { opacity: 1 },
                    { opacity: 0.35, duration: 1, immediateRender: false },
                    0,
                  )
                  .to(
                    cloudState,
                    {
                      ambient: 0,
                      duration: 1,
                      onUpdate: () => cloud?.update(),
                    },
                    0,
                  );
                return () => {
                  cancelAnimationFrame(refreshFrame);
                  cloud?.resume();
                  viewTween?.kill();
                  interactions?.enable(false);
                  gsap.killTweensOf([...layerTargets, ...cityGroups, artwork]);
                };
              },
            );
          }, stage);
          teardown = () => {
            resize.disconnect();
            cancelAnimationFrame(resizeFrame);
            clearTimeout(refreshTimer);
            media.revert();
            ctx.revert();
            interactions?.dispose();
            layerMotion.dispose();
            cloud?.dispose();
            viewTween?.kill();
            gsap.killTweensOf([
              ...layerTargets,
              ...cityGroups,
              ...Array.from(svg.querySelectorAll(".city-dot")),
              artwork,
            ]);
            svg.removeEventListener("click", click);
            apiRef.current = null;
          };
          setReady(true);
          ScrollTrigger.refresh();
        } catch (error) {
          if (!disposed && !abort.signal.aborted) {
            setLoadFailed(true);
            console.warn("Bhutan map could not load:", error);
          }
        }
      },
      { rootMargin: "800px" },
    );
    observer.observe(stage);
    return () => {
      disposed = true;
      abort.abort();
      observer.disconnect();
      teardown();
    };
  }, []);

  return (
    <div className="bhutan-map" data-ready={ready}>
      <div ref={stageRef} className="bhutan-map-stage" data-mode="story">
        {!ready && (
          <div className="bhutan-map__loader" role="status">
            {!loadFailed && (
              <span className="bhutan-map__spinner" aria-hidden="true" />
            )}
            <span>
              {loadFailed
                ? "The landscape couldn’t load. Please refresh to try again."
                : "Loading the landscape"}
            </span>
          </div>
        )}
        <div
          ref={artworkRef}
          className="bhutan-map__artwork"
          aria-busy={!ready && !loadFailed}
        >
          <div ref={cameraRef} className="bhutan-map__camera" />
        </div>
        <div
          ref={shadowRef}
          className="bhutan-map__shadow"
          aria-hidden="true"
        />
        <div ref={cloudRef} className="bhutan-map__clouds" aria-hidden="true" />
        <div className="bhutan-map__caption">
          <span>Kingdom of Bhutan</span>
          <span ref={captionRef}>Discover the landscape through scrolling</span>
        </div>
        <div className="bhutan-map__progress" aria-hidden="true">
          <span ref={progressRef} />
        </div>
      </div>
      <div
        ref={controlsRef}
        className="bhutan-map__controls"
        aria-label="Explore the Bhutan map"
        aria-disabled={!explore}
      >
        <div className="bhutan-map__navigation">
          <button
            disabled={!explore}
            onClick={() => apiRef.current?.overview()}
            aria-label="Restore the overview of Bhutan"
          >
            ← Return to Map
          </button>
          <label>
            Focus on a place
            <select
              disabled={!explore}
              value={selectedCity}
              onChange={(event) =>
                event.target.value
                  ? apiRef.current?.focus(event.target.value)
                  : apiRef.current?.overview()
              }
            >
              <option value="">All Bhutan</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.label}
                </option>
              ))}
            </select>
          </label>
          <span className="bhutan-map__status" role="status">
            {leaving
              ? "Continue to the investment opportunity"
              : explore
                ? "Select a place or a layer to explore"
                : "Scroll to discover Bhutan"}
          </span>
        </div>
        <div className="bhutan-map__layers" aria-label="Map layers">
          {MAP_LAYERS.map((layer) => (
            <button
              key={layer.key}
              disabled={!explore}
              aria-pressed={!hiddenLayers.includes(layer.key)}
              onClick={() => apiRef.current?.layer(layer.key)}
            >
              <span
                style={{ backgroundColor: layer.color }}
                aria-hidden="true"
              />
              {layer.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
