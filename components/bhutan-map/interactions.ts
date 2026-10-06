import gsap from "gsap";
import { MAP_INTERACTION as I } from "./config";
import type { CloudState } from "./config";

type Options = {
  svg: SVGSVGElement;
  stage: HTMLElement;
  artwork: HTMLElement;
  cities: SVGGElement[];
  atmosphere: CloudState;
  reduced: MediaQueryList;
  enabled: () => boolean;
  focus: (id: string) => void;
};

/** Cached SVG coordinates; one coalesced frame per pointer event, no React updates. */
export function createMapInteractions(o: Options) {
  const desktop = matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine)");
  const infrastructure = Array.from(o.svg.querySelectorAll<SVGGraphicsElement>(".airport, .religious-site, #layer-dams > path"))
    .map((element) => { const b = element.getBBox(); return { element, x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
  const markers = o.cities.map((city) => {
    const dot = city.querySelector<SVGGraphicsElement>(".city-dot")!;
    const box = dot.getBBox();
    const major = (I.majorCities as readonly string[]).includes(city.id);
    city.dataset.hierarchy = major ? "primary" : "secondary";
    const labelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    labelGroup.dataset.labelHierarchy = major ? "primary" : "secondary";
    const labelResponse = document.createElementNS("http://www.w3.org/2000/svg", "g");
    city.querySelectorAll("text").forEach((text) => labelResponse.appendChild(text));
    labelGroup.appendChild(labelResponse);
    city.appendChild(labelGroup);
    const markerResponse = document.createElementNS("http://www.w3.org/2000/svg", "g");
    dot.before(markerResponse); markerResponse.appendChild(dot);
    city.setAttribute("role", "button");
    city.setAttribute("aria-label", `Focus on ${Array.from(city.querySelectorAll("text")).map((t) => t.textContent).join(" ")}`);
    gsap.set(markerResponse, { transformOrigin: "center" });
    return { city, dot, markerResponse, labelResponse, x: box.x + box.width / 2, y: box.y + box.height / 2, major,
      opacity: gsap.quickTo(city, "opacity", { duration: .35, ease: "power2.out" }),
      scaleX: gsap.quickTo(markerResponse, "scaleX", { duration: .4, ease: "power2.out" }),
      scaleY: gsap.quickTo(markerResponse, "scaleY", { duration: .4, ease: "power2.out" }),
      labels: [gsap.quickTo(labelResponse, "opacity", { duration: .35, ease: "power2.out" })],
    };
  });
  const rotateX = gsap.quickTo(o.artwork, "rotationX", { duration: .8, ease: "power2.out" });
  const rotateY = gsap.quickTo(o.artwork, "rotationY", { duration: .8, ease: "power2.out" });
  let frame = 0, pointer: { x: number; y: number } | null = null;
  let focused = "", preview = "", keyboard = "", emphasized = "";
  let infrastructureTween: gsap.core.Tween | undefined;
  const emphasize = (id: string) => {
    if (emphasized === id) return;
    emphasized = id;
    const marker = markers.find((m) => m.city.id === id);
    const near = marker ? infrastructure.filter((f) => Math.hypot(f.x - marker.x, f.y - marker.y) < I.infrastructureRadius) : [];
    const local = new Set(near.map((f) => f.element));
    infrastructureTween?.kill();
    infrastructureTween = gsap.to(infrastructure.map((f) => f.element), {
      opacity: (_, element) => !marker || local.has(element) ? 1 : .55,
      duration: o.reduced.matches ? 0 : .45, ease: "power2.out", overwrite: false,
    });
  };
  const render = () => {
    frame = 0;
    if (!o.enabled()) return;
    const ctm = o.svg.getScreenCTM();
    if (!ctm) return;
    const point = pointer ? new DOMPoint(pointer.x, pointer.y).matrixTransform(ctm.inverse()) : null;
    const radius = I.radius / Math.max(.01, Math.hypot(ctm.a, ctm.b));
    const nearest = point ? markers.reduce((best, m) => Math.hypot(m.x - point.x, m.y - point.y) < Math.hypot(best.x - point.x, best.y - point.y) ? m : best) : null;
    preview = keyboard || (nearest && point && Math.hypot(nearest.x - point.x, nearest.y - point.y) < radius * .55 ? nearest.city.id : "");
    const active = preview || focused;
    emphasize(active);
    markers.forEach((m) => {
      const weight = point ? Math.max(0, 1 - Math.hypot(m.x - point.x, m.y - point.y) / radius) : 0;
      const selected = m.city.id === active;
      const opacity = selected ? 1 : active ? (m.major ? .8 : .6) : 1;
      // Reduced motion keeps contextual emphasis without animated marker movement.
      if (o.reduced.matches) {
        gsap.set(m.city, { opacity });
        gsap.set(m.markerResponse, { scale: 1 });
        gsap.set(m.labelResponse, { opacity: selected || m.major ? 1 : .78 });
      } else {
        m.opacity(opacity);
        const scale = 1 + I.markerScale * (selected ? 1 : weight);
        m.scaleX(scale); m.scaleY(scale);
        m.labels.forEach((label) => label(selected || m.major ? 1 : .78 + weight * .22));
      }
      m.city.dataset.emphasized = String(selected);
    });
    if (pointer && desktop.matches && !o.reduced.matches && !focused) {
      const b = o.stage.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (pointer.x - b.left) / b.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (pointer.y - b.top) / b.height * 2 - 1));
      rotateX(-y * I.tiltDegrees); rotateY(x * I.tiltDegrees);
      o.atmosphere.pointerX = x; o.atmosphere.pointerY = y;
    } else {
      rotateX(0); rotateY(0); o.atmosphere.pointerX = 0; o.atmosphere.pointerY = 0;
    }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
  const move = (e: PointerEvent) => {
    if (!o.enabled() || !desktop.matches || o.reduced.matches || e.pointerType !== "mouse") return;
    pointer = { x: e.clientX, y: e.clientY }; schedule();
  };
  const leave = () => { pointer = null; schedule(); };
  const focusIn = (e: FocusEvent) => {
    keyboard = (e.target as Element).closest(".city")?.id || ""; schedule();
  };
  const focusOut = () => { keyboard = ""; schedule(); };
  const keydown = (e: KeyboardEvent) => {
    const city = (e.target as Element).closest(".city");
    if (city && o.enabled() && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); o.focus(city.id); }
  };
  o.stage.addEventListener("pointermove", move, { passive: true });
  o.stage.addEventListener("pointerleave", leave);
  o.svg.addEventListener("focusin", focusIn); o.svg.addEventListener("focusout", focusOut);
  o.svg.addEventListener("keydown", keydown);
  return {
    focus(id: string) { focused = id; pointer = null; keyboard = ""; schedule(); },
    enable(value: boolean) {
      markers.forEach((m) => m.city.setAttribute("tabindex", value ? "0" : "-1"));
      if (value) schedule();
      else {
        cancelAnimationFrame(frame); frame = 0;
        focused = preview = keyboard = emphasized = ""; pointer = null;
        infrastructureTween?.kill();
        gsap.set(infrastructure.map((f) => f.element), { opacity: 1 });
        markers.forEach((m) => {
          // Separate wrappers let hover settle without fighting the reversing story's dot/text tweens.
          if (o.reduced.matches) {
            gsap.set([m.city, m.labelResponse], { opacity: 1 }); gsap.set(m.markerResponse, { scale: 1 });
          } else {
            m.opacity(1); m.scaleX(1); m.scaleY(1); m.labels.forEach((label) => label(1));
          }
          delete m.city.dataset.emphasized;
        });
        rotateX(0); rotateY(0);
        o.atmosphere.pointerX = o.atmosphere.pointerY = 0;
      }
    },
    dispose() {
      cancelAnimationFrame(frame); infrastructureTween?.kill();
      markers.forEach((m) => { m.opacity.tween.kill(); m.scaleX.tween.kill(); m.scaleY.tween.kill(); m.labels.forEach((l) => l.tween.kill()); });
      rotateX.tween.kill(); rotateY.tween.kill();
      o.stage.removeEventListener("pointermove", move); o.stage.removeEventListener("pointerleave", leave);
      o.svg.removeEventListener("focusin", focusIn); o.svg.removeEventListener("focusout", focusOut); o.svg.removeEventListener("keydown", keydown);
    },
  };
}
