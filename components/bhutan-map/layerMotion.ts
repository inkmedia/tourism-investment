import gsap from "gsap";
import { MAP_SELECTORS as S, type LayerKey } from "./config";

/** Child motion stays separate from story-wrapper and filter opacity ownership. */
export function prepareLayerMotion(svg: SVGSVGElement) {
  const ns = "http://www.w3.org/2000/svg";
  const find = (selector: string) => svg.querySelector<SVGGraphicsElement>(selector)!;
  const rivers = Array.from(svg.querySelectorAll<SVGPathElement>(`${S.rivers} path`));
  const lengths = rivers.map((p) => p.getTotalLength());
  const airports = Array.from(svg.querySelectorAll<SVGGElement>(`${S.airports} > g`));
  const dams = Array.from(svg.querySelectorAll<SVGPathElement>(`${S.dams} > path`));
  const sites = Array.from(svg.querySelectorAll<SVGGElement>(`${S.sites} > g`));
  const bands = Array.from({ length: 6 }, () => document.createElementNS(ns, "g"));
  const boxes = sites.map((s) => s.getBBox());
  const west = Math.min(...boxes.map((b) => b.x));
  const east = Math.max(...boxes.map((b) => b.x + b.width));
  bands.forEach((band) => find(S.sites).appendChild(band));
  sites.forEach((site, i) => bands[Math.min(5, Math.floor((boxes[i].x - west) / (east - west) * 6))].appendChild(site));

  const defs = document.createElementNS(ns, "defs");
  const gradient = document.createElementNS(ns, "linearGradient");
  gradient.id = "bhutan-forest-reveal-gradient";
  [["0%", "white"], ["78%", "white"], ["100%", "black"]].forEach(([offset, color]) => {
    const stop = document.createElementNS(ns, "stop"); stop.setAttribute("offset", offset); stop.setAttribute("stop-color", color); gradient.appendChild(stop);
  });
  defs.appendChild(gradient);
  const forest = find(S.protectedForests), box = forest.getBBox();
  const mask = document.createElementNS(ns, "mask");
  mask.id = "bhutan-forest-reveal"; mask.setAttribute("maskUnits", "userSpaceOnUse");
  mask.setAttribute("x", String(box.x - 1)); mask.setAttribute("y", String(box.y - 1));
  mask.setAttribute("width", String(box.width + 2)); mask.setAttribute("height", String(box.height + 2));
  const rect = document.createElementNS(ns, "rect");
  rect.setAttribute("x", String(box.x - 1)); rect.setAttribute("y", String(box.y - 1));
  rect.setAttribute("height", String(box.height + 2)); rect.setAttribute("width", String(box.width * 1.3 + 2));
  rect.setAttribute("fill", `url(#${gradient.id})`); mask.appendChild(rect); defs.appendChild(mask); svg.prepend(defs);
  forest.setAttribute("mask", `url(#${mask.id})`);
  const maskMotion = {
    onUpdate: () => { if (!forest.hasAttribute("mask")) forest.setAttribute("mask", `url(#${mask.id})`); },
    onComplete: () => forest.removeAttribute("mask"),
  };

  const rings = airports.map((airport) => {
    const b = airport.getBBox(), ring = document.createElementNS(ns, "circle");
    ring.setAttribute("cx", String(b.x + b.width / 2)); ring.setAttribute("cy", String(b.y + b.height / 2));
    ring.setAttribute("r", String(Math.max(b.width, b.height) * .65)); ring.setAttribute("fill", "none");
    ring.setAttribute("stroke", "#f5f1ea"); ring.setAttribute("stroke-width", "1"); ring.setAttribute("opacity", "0");
    ring.setAttribute("pointer-events", "none"); airport.prepend(ring); return ring;
  });
  const filterTweens = new Map<LayerKey, gsap.core.Tween>();
  const trail = Array.from(svg.querySelectorAll<SVGPathElement>(`${S.trail} > path`));
  const trailLengths = trail.map((p) => p.getTotalLength());
  return {
    toggle(key: LayerKey, visible: boolean, reduced: boolean) {
      filterTweens.get(key)?.kill();
      if (!visible || reduced) return;
      let tween: gsap.core.Tween | undefined;
      if (key === "rivers" || key === "trail") {
        const paths = key === "rivers" ? rivers : trail;
        const distance = key === "rivers" ? lengths : trailLengths;
        tween = gsap.fromTo(paths, { strokeDasharray: (i) => distance[i], strokeDashoffset: (i) => distance[i] },
          { strokeDashoffset: 0, duration: .45, stagger: { amount: key === "trail" ? .18 : .06 }, ease: "power2.out" });
      } else if (key === "airports" || key === "dams") {
        tween = gsap.fromTo(key === "airports" ? airports : dams, { scale: .94 },
          { scale: 1, duration: .35, stagger: { amount: .06 }, ease: "power3.out" });
      } else if (key === "sites") {
        tween = gsap.fromTo(bands, { opacity: .35 }, { opacity: 1, duration: .3, stagger: { amount: .12 }, ease: "power2.out" });
      } else if (key === "protectedForests") {
        tween = gsap.fromTo(rect, { attr: { width: 0 } }, { attr: { width: box.width * 1.3 + 2 }, duration: .5, ease: "power2.inOut", ...maskMotion });
      } else if (key === "corridors") {
        tween = gsap.fromTo(find(S.corridors).children, { opacity: .7 }, { opacity: 1, duration: .65, ease: "sine.inOut" });
      }
      if (tween) filterTweens.set(key, tween);
    },
    resetFilters() {
      filterTweens.forEach((tween) => tween.kill()); filterTweens.clear();
      gsap.set([...rivers, ...trail], { strokeDashoffset: 0 });
      gsap.set([...airports, ...dams], { scale: 1 });
      gsap.set([...bands, ...Array.from(find(S.corridors).children)], { opacity: 1 });
      gsap.set(rect, { attr: { width: box.width * 1.3 + 2 } });
      forest.removeAttribute("mask");
    },
    reveal(timeline: gsap.core.Timeline, wrappers: Map<LayerKey, SVGGElement>, timing: { forests: number; corridors: number; rivers: number; dams: number; airports: number; sites: number }) {
      gsap.set(rivers, { strokeDasharray: (i) => lengths[i], strokeDashoffset: (i) => lengths[i] });
      gsap.set(rect, { attr: { width: 0 } });
      gsap.set([...airports, ...dams], { scale: .92, transformOrigin: "center" });
      gsap.set(bands, { opacity: 0 });
      gsap.set(rings, { opacity: 0, scale: .8, transformOrigin: "center" });
      timeline.to(wrappers.get("protectedForests")!, { opacity: 1, duration: .12 }, timing.forests)
        .to(rect, { attr: { width: box.width * 1.3 + 2 }, duration: .15, ease: "power2.inOut", ...maskMotion }, timing.forests)
        .to(wrappers.get("corridors")!, { opacity: 1, duration: .14, ease: "sine.inOut" }, timing.corridors)
        .to(wrappers.get("rivers")!, { opacity: 1, duration: .05 }, timing.rivers)
        .to(rivers, { strokeDashoffset: 0, duration: .13, stagger: { amount: .025 }, ease: "power2.out" }, timing.rivers)
        .to(wrappers.get("dams")!, { opacity: 1, duration: .07 }, timing.dams)
        .to(dams, { scale: 1, duration: .07, stagger: { amount: .02 }, ease: "power3.out" }, timing.dams)
        .to(wrappers.get("airports")!, { opacity: 1, duration: .07 }, timing.airports)
        .to(airports, { scale: 1, duration: .08, stagger: { amount: .025 }, ease: "power3.out" }, timing.airports)
        .to(rings, { opacity: .16, duration: .015, stagger: { amount: .015 } }, timing.airports)
        .to(rings, { opacity: 0, scale: 1.35, duration: .075, stagger: { amount: .015 } }, timing.airports + .02)
        .to(wrappers.get("sites")!, { opacity: 1, duration: .04 }, timing.sites)
        .to(bands, { opacity: 1, duration: .05, stagger: { amount: .04 } }, timing.sites);
    },
    dispose() {
      filterTweens.forEach((tween) => tween.kill());
      forest.removeAttribute("mask"); defs.remove(); rings.forEach((ring) => ring.remove());
      bands.forEach((band) => { while (band.firstChild) band.before(band.firstChild); band.remove(); });
    },
  };
}
