"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MAP_SELECTORS as S, MAP_ANIMATION as T, MAP_LAYERS, type LayerKey, type CloudState } from "./config";

import { fitViewBoxToBBox, centerViewBox, altitudeViewBox, interpolateViewBox } from "./framing";

gsap.registerPlugin(ScrollTrigger);
type City = { id: string; label: string };
type MapApi = { focus: (id: string) => void; overview: () => void; layer: (key: LayerKey | null) => void };

// Follow actual segment endpoints, reversing the drawing direction when required.
function orderTrail(paths: SVGPathElement[]) {
  const segments = paths.map((path) => {
    const length = path.getTotalLength();
    return { path, length, start: path.getPointAtLength(0), end: path.getPointAtLength(length), reverse: false };
  });
  let point = segments.flatMap((segment) => [segment.start, segment.end]).reduce((left, point) => point.x < left.x ? point : left);
  const ordered: typeof segments = [];
  while (segments.length) {
    let best = 0, distance = Infinity, reverse = false;
    segments.forEach((segment, i) => {
      [segment.start, segment.end].forEach((end, j) => {
        const d = Math.hypot(point.x - end.x, point.y - end.y);
        if (d < distance) { best = i; distance = d; reverse = j === 1; }
      });
    });
    const segment = segments.splice(best, 1)[0];
    segment.reverse = reverse; ordered.push(segment);
    point = reverse ? segment.start : segment.end;
  }
  return ordered;
}

export default function BhutanInteractiveMap() {
  const stageRef = useRef<HTMLDivElement>(null);
  const artworkRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const apiRef = useRef<MapApi | null>(null);
  const [ready, setReady] = useState(false);
  const [explore, setExplore] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [hiddenLayers, setHiddenLayers] = useState<LayerKey[]>([]);

  useLayoutEffect(() => {
    const stage = stageRef.current!, artwork = artworkRef.current!;
    const controls = controlsRef.current!, caption = captionRef.current!, progress = progressRef.current!;
    const abort = new AbortController();
    let disposed = false;
    let teardown = () => {};
    // Fetch once near the section, keeping the original image visible on slow connections.
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      try {
        const response = await fetch("/img/bhutan-map-production.svg", { signal: abort.signal });
        if (!response.ok) throw new Error("Map unavailable");
        const markup = await response.text();
        const image = new Image(); image.src = "/img/bhutan-satellite.webp";
        await image.decode();
        if (disposed) return;
        // This markup is a trusted local production asset, never user/remote HTML.
        artwork.innerHTML = markup;
        const svg = artwork.querySelector<SVGSVGElement>("svg")!;
        svg.setAttribute("role", "img");
        svg.setAttribute("aria-label", "Bhutan: satellite terrain, natural systems, Mindfulness Trail and settlements. Use the controls below to explore.");
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        svg.querySelectorAll(".city-label").forEach((label) => label.removeAttribute("textLength"));
        const q = (selector: string) => svg.querySelector<SVGElement>(selector)!;
        const cityGroups = Array.from(svg.querySelectorAll<SVGGElement>(`${S.cities} > .city`));
        setCities(cityGroups.map((city) => ({ id: city.id, label: Array.from(city.querySelectorAll("text")).map((text) => text.textContent).join(" ") })));
        const boundaryBBox = (q(S.boundary) as SVGGraphicsElement).getBBox();
        const sourceExtent = (q(S.satellite) as SVGGraphicsElement).getBBox();
        const legendBBox = (q(S.legend) as SVGGraphicsElement).getBBox();
        const stageAspect = () => { const bounds = stage.getBoundingClientRect(); return bounds.width / bounds.height; };
        const original = fitViewBoxToBBox(boundaryBBox, stageAspect(), sourceExtent);
        let altitude = altitudeViewBox(original, sourceExtent, matchMedia("(max-width: 700px)").matches);
        const approach = { progress: 0 };
        const view = { ...original };
        const writeView = () => { if (disposed) return; svg.setAttribute("viewBox", `${view.x.toFixed(3)} ${view.y.toFixed(3)} ${view.width.toFixed(3)} ${view.height.toFixed(3)}`); };
        const placeLegend = () => {
          const scale = Math.min(.7, original.width * .94 / legendBBox.width, original.height * .13 / legendBBox.height);
          const x = original.x + original.width * .02 - legendBBox.x * scale;
          const y = original.y + original.height * .97 - (legendBBox.y + legendBBox.height) * scale;
          q(S.legend).setAttribute("transform", `translate(${x} ${y}) scale(${scale})`);
        };
        placeLegend(); writeView();
        let viewTween: gsap.core.Tween | undefined;
        let interactive = false, zoomed = false;
        let focusedCityId = "";
        const hidden = new Set<LayerKey>();
        const preference = matchMedia("(prefers-reduced-motion: reduce)");
        let cloud: { update: () => void; dispose: () => void } | undefined;
        let cloudLoading = false;
        const ensureClouds = async () => {
          if (cloud || cloudLoading || preference.matches) return;
          cloudLoading = true;
          try {
            const { createClouds } = await import("./clouds");
            if (!disposed && !preference.matches) { cloud = createClouds(cloudRef.current!, cloudState); cloud.update(); }
          } catch { /* The SVG story works independently of WebGL. */ }
          finally { cloudLoading = false; }
        };
        const cloudState: CloudState = { opacity: 1, descent: 0 };
        const layerTargets = MAP_LAYERS.map((layer) => q(S[layer.key]));
        const nativeOpacity = new Map(layerTargets.map((el) => [el, Number(el.getAttribute("opacity") ?? 1) * (el === q(S.sites) ? .65 : 1)]));
        // Separate opacity ownership: story wrappers reveal geography; the original
        // SVG groups remain independently toggleable even while scrub settles.
        const storyLayers = new Map<LayerKey, SVGGElement>();
        MAP_LAYERS.forEach(({ key }, index) => {
          const layer = layerTargets[index];
          const wrapper = document.createElementNS("http://www.w3.org/2000/svg", "g");
          wrapper.setAttribute("data-story-layer", key);
          layer.before(wrapper); wrapper.appendChild(layer); storyLayers.set(key, wrapper);
          gsap.set(layer, { opacity: nativeOpacity.get(layer)! });
        });
        // Exploration must not overwrite or kill the scrubbed story's SVG tweens.
        const explorationTweens = new Map<SVGElement, gsap.core.Tween>();
        const exploreTo = (targets: SVGElement | SVGElement[], vars: gsap.TweenVars) => {
          (Array.isArray(targets) ? targets : [targets]).forEach((target) => {
            explorationTweens.get(target)?.kill();
            explorationTweens.set(target, gsap.to(target, { ...vars, overwrite: false }));
          });
        };
        const animateView = (target: typeof view) => {
          viewTween?.kill();
          gsap.to(artwork, { rotateX: 0, rotateY: 0, duration: .3 });
          viewTween = gsap.to(view, { ...target, duration: preference.matches ? .15 : 1.1, ease: "power3.inOut", onUpdate: writeView });
        };
        const reset = () => {
          zoomed = false; focusedCityId = ""; stage.dataset.focused = "false"; animateView(original); setSelectedCity("");
          exploreTo(cityGroups, { opacity: 1, duration: .35 });
        };
        const selectLayer = (key: LayerKey | null) => {
          if (!interactive) return;
          if (key === null) hidden.clear();
          else if (hidden.has(key)) hidden.delete(key);
          else hidden.add(key);
          setHiddenLayers([...hidden]);
          MAP_LAYERS.forEach((layer, index) => {
            exploreTo(layerTargets[index], { opacity: hidden.has(layer.key) ? 0 : nativeOpacity.get(layerTargets[index])!, duration: preference.matches ? .15 : .4 });
          });
        };
        const focus = (id: string) => {
          if (!interactive) return;
          const city = cityGroups.find((group) => group.id === id);
          if (!city) return;
          selectLayer(null);
          zoomed = true; stage.dataset.focused = "true"; setSelectedCity(id);
          const box = city.querySelector<SVGGraphicsElement>(".city-dot")!.getBBox();
          focusedCityId = id;
          const factor = matchMedia("(max-width: 700px)").matches ? .62 : .38;
          animateView(centerViewBox(box.x + box.width / 2, box.y + box.height / 2, original.width * factor, original.height * factor, sourceExtent));
          cityGroups.forEach((group) => exploreTo(group, { opacity: group === city ? 1 : .4, duration: .4 }));
          exploreTo(q(S.sites), { opacity: 1, duration: .4 });
        };
        apiRef.current = { focus, overview: () => { if (interactive) { reset(); selectLayer(null); } }, layer: selectLayer };
        const legendNames: Record<LayerKey, string> = {
          protectedForests: "protected-forest", corridors: "ecological-corridor", rivers: "river",
          dams: "dam", airports: "airports", trail: "mindfulness-trail", sites: "religious-sites",
        };
        MAP_LAYERS.forEach(({ key }) => {
          const label = svg.querySelector(`#legend-label-${legendNames[key]}`);
          label?.setAttribute("data-map-layer", key);
        });
        cityGroups.forEach((city) => {
          const box = city.querySelector<SVGGraphicsElement>(".city-dot")!.getBBox();
          const hit = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          hit.setAttribute("cx", String(box.x + box.width / 2)); hit.setAttribute("cy", String(box.y + box.height / 2));
          hit.setAttribute("r", "26"); hit.setAttribute("fill", "transparent"); city.appendChild(hit);
        });
        const click = (event: MouseEvent) => {
          const city = (event.target as Element).closest<SVGGElement>(".city");
          if (city) focus(city.id);
          const legend = (event.target as Element).closest("[data-map-layer]");
          const key = legend?.getAttribute("data-map-layer") as LayerKey | undefined;
          if (key) selectLayer(key);
        };
        const hover = (event: PointerEvent) => {
          if (!interactive || preference.matches || event.pointerType !== "mouse") return;
          const dot = (event.target as Element).closest(".city")?.querySelector(".city-dot");
          if (dot) exploreTo(dot as SVGElement, { scale: event.type === "pointerover" ? 1.12 : 1, transformOrigin: "center", duration: .25 });
        };
        const move = (event: PointerEvent) => {
          if (!interactive || zoomed || preference.matches || event.pointerType !== "mouse" || !matchMedia("(min-width: 900px)").matches) return;
          const rect = stage.getBoundingClientRect();
          gsap.to(artwork, { rotateY: ((event.clientX - rect.left) / rect.width - .5) * 1.2, rotateX: -((event.clientY - rect.top) / rect.height - .5) * 1.2, duration: .7, overwrite: true });
        };
        const leave = () => gsap.to(artwork, { rotateX: 0, rotateY: 0, duration: .5, overwrite: true });
        svg.addEventListener("click", click);
        svg.addEventListener("pointerover", hover); svg.addEventListener("pointerout", hover);
        stage.addEventListener("pointermove", move); stage.addEventListener("pointerleave", leave);
        const writeStoryView = () => {
          Object.assign(view, interpolateViewBox(altitude, original, approach.progress)); writeView();
        };
        const mode = (value: boolean) => {
          if (disposed || interactive === value) return;
          interactive = value; setExplore(value); stage.dataset.mode = value ? "explore" : "story";
          // One reversible handoff owns visual and native interaction state together.
          controls.style.opacity = value ? "1" : "0";
          controls.style.visibility = value ? "visible" : "hidden";
          controls.style.pointerEvents = value ? "auto" : "none";
          controls.inert = !value;
          controls.setAttribute("aria-disabled", String(!value));
          controls.querySelectorAll<HTMLButtonElement | HTMLSelectElement>("button, select").forEach((control) => { control.disabled = !value; });
          if (value) {
            Object.assign(view, original); writeView();
          } else {
            viewTween?.kill(); zoomed = false; focusedCityId = ""; stage.dataset.focused = "false";
            setSelectedCity(""); hidden.clear(); setHiddenLayers([]);
            explorationTweens.forEach((tween) => tween.kill()); explorationTweens.clear();
            gsap.set(cityGroups, { opacity: 1 });
            layerTargets.forEach((el) => gsap.set(el, { opacity: nativeOpacity.get(el)! }));
            gsap.to(artwork, { rotateX: 0, rotateY: 0, duration: .3, overwrite: true });
          }
        };
        let resizeFrame = 0, refreshTimer: ReturnType<typeof setTimeout> | undefined;
        let lastWidth = stage.clientWidth, lastHeight = stage.clientHeight;
        const resize = new ResizeObserver(() => {
          if (stage.clientWidth === lastWidth && stage.clientHeight === lastHeight) return;
          lastWidth = stage.clientWidth; lastHeight = stage.clientHeight;
          cancelAnimationFrame(resizeFrame);
          resizeFrame = requestAnimationFrame(() => {
            if (disposed) return;
            Object.assign(original, fitViewBoxToBBox(boundaryBBox, stageAspect(), sourceExtent));
            altitude = altitudeViewBox(original, sourceExtent, matchMedia("(max-width: 700px)").matches);
            placeLegend();
            const layers = [...hidden];
            if (interactive && focusedCityId) focus(focusedCityId);
            else if (interactive) { viewTween?.kill(); Object.assign(view, original); writeView(); }
            else writeStoryView();
            if (interactive && focusedCityId) layers.forEach(selectLayer);
            clearTimeout(refreshTimer); refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 160);
          });
        });
        resize.observe(stage);
        const media = gsap.matchMedia();
        const ctx = gsap.context(() => {
          media.add({ reduced: "(prefers-reduced-motion: reduce)", mobile: "(max-width: 700px)", desktop: "(min-width: 701px)" }, (context) => {
            const reduced = context.conditions!.reduced, mobile = context.conditions!.mobile;
            mode(false); hidden.clear(); zoomed = false; focusedCityId = ""; stage.dataset.focused = "false"; viewTween?.kill(); Object.assign(view, original); writeView();
            setSelectedCity(""); setHiddenLayers([]);
            if (reduced) {
              cloudState.opacity = 0; cloud?.update(); gsap.set(q(S.veil), { opacity: 0 });
              layerTargets.forEach((el) => gsap.set(el, { opacity: nativeOpacity.get(el)! }));
              mode(true);
              gsap.set(controls, { opacity: 1, visibility: "visible" });
              caption.textContent = "Explore Bhutan";
              progress.style.transform = "scaleX(1)";
              return;
            }
            void ensureClouds();
            const boundary = Array.from(svg.querySelectorAll<SVGPathElement>(`${S.boundary} path[stroke]:not([stroke='none'])`));
            boundary.forEach((path) => { const length = path.getTotalLength(); gsap.set(path, { strokeDasharray: length, strokeDashoffset: length }); });
            const trail = orderTrail(Array.from(svg.querySelectorAll<SVGPathElement>(`${S.trail} path[id^='mindfulness-trail-']`)));
            trail.forEach(({ path, length, reverse }) => gsap.set(path, { strokeDasharray: length, strokeDashoffset: reverse ? -length : length }));
            gsap.set(q(S.base), { opacity: .85 });
            gsap.set(controls, { opacity: 0, visibility: "hidden" });
            approach.progress = 0; writeStoryView();
            gsap.set([q(S.veil), ...storyLayers.values(), q(S.cities), q(S.legend), q(S.boundary)], { opacity: 0 });
            gsap.set(cityGroups.flatMap((city) => Array.from(city.querySelectorAll("text"))), { y: 5, opacity: 0 });
            gsap.set(cityGroups.flatMap((city) => Array.from(city.querySelectorAll(".city-dot"))), { scale: .7, transformOrigin: "center" });
            cloudState.opacity = 1; cloudState.descent = 0; cloud?.update();
            let phase = -1;
            let refreshing = false;
            const captions = ["Through the Himalayan clouds", "Descending through the clouds", "The landscape emerges", "Forests, corridors and rivers", "The Mindfulness Trail", "Places, culture and arrival", "Explore Bhutan"];
            const timeline = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: {
              // This upstream pin mounts after its SVG fetch; measure it before
              // downstream scenes even when those triggers were created first.
              id: "bhutan-map", refreshPriority: 1,
              trigger: stage.parentElement!, start: "top top+=84", end: () => `+=${window.innerHeight * (mobile ? .85 : 1.7)}`,
              pin: stage.parentElement!, scrub: .95, anticipatePin: 1, invalidateOnRefresh: true,
              onRefreshInit: () => { refreshing = true; },
              onUpdate: (self) => {
                // Pin refresh briefly rewinds progress to measure layout. It is
                // not a reverse-scroll gesture and must not erase exploration.
                if (disposed || refreshing) return;
                // Raw scroll progress owns interaction; a lagging scrub tween must
                // never leave visible controls disabled after a fast trackpad gesture.
                if (self.progress >= T.interaction && !interactive) {
                  self.getTween()?.progress(1);
                  writeStoryView();
                  mode(true);
                } else if (self.progress < T.interaction) mode(false);
              },
              onRefresh: (self) => {
                refreshing = false;
                if (disposed) return;
                mode(self.progress >= T.interaction);
              },
            }, onUpdate: () => {
              if (disposed) return;
              const p = timeline.progress();
              stage.dataset.storyProgress = p.toFixed(4);

              if (!interactive) writeStoryView();
              progress.style.transform = `scaleX(${p})`;
              const next = p < .15 ? 0 : p < .38 ? 1 : p < .5 ? 2 : p < .67 ? 3 : p < .79 ? 4 : p < .96 ? 5 : 6;
              if (next !== phase) { phase = next; caption.textContent = captions[next]; }
              cloud?.update();
            } });
            timeline.to(cloudState, { descent: 1, duration: T.descentDuration }, T.descent)
              .to(cloudState, { opacity: 0, duration: .04 }, .58)
              .to(approach, { progress: 1, duration: .48, ease: "sine.inOut" }, T.approach)
              .to(q(S.base), { opacity: 1, duration: .37 }, T.satellite)
              .to(q(S.boundary), { opacity: 1, duration: .1 }, T.boundary)
              .to(boundary, { strokeDashoffset: 0, duration: .12 }, T.boundary)
              .to(storyLayers.get("protectedForests")!, { opacity: 1, duration: .1 }, T.forests)
              .to(storyLayers.get("corridors")!, { opacity: 1, duration: .1 }, T.corridors)
              .to(storyLayers.get("rivers")!, { opacity: 1, duration: .1 }, T.rivers)
              .to(storyLayers.get("dams")!, { opacity: 1, duration: .08 }, T.dams)
              .to(storyLayers.get("trail")!, { opacity: 1, duration: .01 }, T.trail);
            const total = trail.reduce((sum, segment) => sum + segment.length, 0);
            let time = T.trail as number;
            trail.forEach(({ path, length }) => { const duration = T.trailDuration * length / total; timeline.to(path, { strokeDashoffset: 0, duration }, time); time += duration; });
            timeline.to(q(S.cities), { opacity: 1, duration: .12 }, T.cities)
              .to(cityGroups.flatMap((city) => Array.from(city.querySelectorAll("text"))), { opacity: 1, y: 0, duration: .06, stagger: { amount: .07 } }, T.cities)
              .to(cityGroups.flatMap((city) => Array.from(city.querySelectorAll(".city-dot"))), { scale: 1, duration: .06, stagger: { amount: .07 } }, T.cities)
              .to(storyLayers.get("airports")!, { opacity: 1, duration: .12 }, T.airports)
              .to(storyLayers.get("sites")!, { opacity: 1, duration: .09 }, T.sites)
              .to(q(S.legend), { opacity: 1, duration: .08 }, T.legend);
            // Keep normalized narrative progress at exactly one, independent of tween endpoints.
            timeline.to({}, { duration: 1 }, 0);
            return () => { viewTween?.kill(); gsap.killTweensOf([...layerTargets, ...cityGroups, artwork]); };
          });
        }, stage);
        teardown = () => {
          resize.disconnect(); cancelAnimationFrame(resizeFrame); clearTimeout(refreshTimer);
          media.revert(); ctx.revert(); cloud?.dispose(); viewTween?.kill();
          gsap.killTweensOf([...layerTargets, ...cityGroups, ...Array.from(svg.querySelectorAll(".city-dot")), artwork]);
          svg.removeEventListener("click", click); svg.removeEventListener("pointerover", hover); svg.removeEventListener("pointerout", hover);
          stage.removeEventListener("pointermove", move); stage.removeEventListener("pointerleave", leave); apiRef.current = null;
        };
        setReady(true);
        ScrollTrigger.refresh();

      } catch (error) {
        if (!abort.signal.aborted) console.warn("Bhutan map preview retained:", error);
      }
    }, { rootMargin: "800px" });
    observer.observe(stage);
    return () => { disposed = true; abort.abort(); observer.disconnect(); teardown(); };
  }, []);

  return (
    <div className="bhutan-map" data-ready={ready}>
      <div ref={stageRef} className="bhutan-map-stage" data-mode="story">
        <img aria-hidden={ready} className="bhutan-map__preview" loading="lazy" src="/img/bhutan-map-preview.webp" alt="Development landscape map showing infrastructure and connectivity" />
        <div ref={artworkRef} className="bhutan-map__artwork" />
        <div ref={cloudRef} className="bhutan-map__clouds" aria-hidden="true" />
        <div className="bhutan-map__caption"><span>Kingdom of Bhutan</span><span ref={captionRef}>Discover the landscape through scrolling</span></div>
        <div className="bhutan-map__progress" aria-hidden="true"><span ref={progressRef} /></div>
      </div>
      <div ref={controlsRef} className="bhutan-map__controls" aria-label="Explore the Bhutan map" aria-disabled={!explore}>
        <div className="bhutan-map__navigation">
          <button disabled={!explore} onClick={() => apiRef.current?.overview()} aria-label="Restore the overview of Bhutan">← Overview</button>
          <label>Focus on a place<select disabled={!explore} value={selectedCity} onChange={(event) => event.target.value ? apiRef.current?.focus(event.target.value) : apiRef.current?.overview()}><option value="">All Bhutan</option>{cities.map((city) => <option key={city.id} value={city.id}>{city.label}</option>)}</select></label>
          <span className="bhutan-map__status" role="status">{explore ? "Select a place or a layer to explore" : "Scroll to discover Bhutan"}</span>
        </div>
        <div className="bhutan-map__layers" aria-label="Map layers">{MAP_LAYERS.map((layer) => <button key={layer.key} disabled={!explore} aria-pressed={!hiddenLayers.includes(layer.key)} onClick={() => apiRef.current?.layer(layer.key)}><span style={{ backgroundColor: layer.color }} aria-hidden="true" />{layer.label}</button>)}</div>
      </div>
    </div>
  );
}
