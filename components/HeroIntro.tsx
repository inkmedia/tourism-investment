"use client";

import gsap from "gsap";
import { useId, useLayoutEffect, useRef } from "react";

export default function HeroIntro({ logoSvg }: { logoSvg: string }) {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const clipPrefix = `preloader-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useLayoutEffect(() => {
    const preloader = preloaderRef.current;
    const hero = document.querySelector<HTMLElement>(".hero");
    const scene = document.querySelector<HTMLElement>(".hero__scene");
    if (!preloader || !hero || !scene) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    let disposed = false;
    let started = false;
    let fallback = 0;
    let removeMotion = () => {};
    const mountedAt = performance.now();
    const content = ".brand, .menu-toggle, .site-nav__link, .site-nav__cta, .hero__eyebrow, .hero__description, .hero__actions, .hero__bottom-label";

    const shapes = Array.from(preloader.querySelectorAll<SVGPathElement>(
      '[data-logo-part="mark"] path',
    ));
    const letters = Array.from(preloader.querySelectorAll<SVGGElement>("[data-char]"));
    const logo = preloader.querySelector<HTMLElement>(".preloader__logo");
    const svg = preloader.querySelector<SVGSVGElement>("svg");
    if (!svg) return;
    const namespace = "http://www.w3.org/2000/svg";
    const definitions = document.createElementNS(namespace, "defs");
    const drawing = document.createElementNS(namespace, "g");
    drawing.setAttribute("aria-hidden", "true");
    svg.prepend(definitions);
    svg.append(drawing);

    // Sweep diagonally through the geometry, rather than following asset order.
    const pieces = shapes.map((shape) => ({ shape, bounds: shape.getBBox() }))
      .sort((a, b) => (a.bounds.y + a.bounds.height / 2 + a.bounds.x * 0.35)
        - (b.bounds.y + b.bounds.height / 2 + b.bounds.x * 0.35));
    const strokes: { paths: SVGPathElement[]; guide: SVGPathElement; wipe: SVGRectElement;
      top: number; height: number; start: number; duration: number }[] = [];

    const context = gsap.context(() => {
      gsap.set(content, { autoAlpha: 0, y: 18 });
      gsap.set(".hero__line-inner", { autoAlpha: 0, yPercent: 110 });
      gsap.set(".hero__shade", { autoAlpha: 0 });
      gsap.set(logo, { autoAlpha: 1, scale: 0.94 });
      gsap.set(svg, { autoAlpha: 1 });
      // Animate opacity on glyph groups to preserve their supplied SVG matrices.
      gsap.set(letters, { opacity: 0 });
      pieces.forEach(({ shape, bounds }, index) => {
        const colour = shape.getAttribute("fill") ?? "none";
        const clip = document.createElementNS(namespace, "clipPath");
        clip.id = `${clipPrefix}-${index}`;
        clip.setAttribute("clipPathUnits", "userSpaceOnUse");
        const wipe = document.createElementNS(namespace, "rect");
        const top = bounds.y - 6;
        const height = bounds.height + 12;
        wipe.setAttribute("x", String(bounds.x - 6));
        wipe.setAttribute("width", String(bounds.width + 12));
        wipe.setAttribute("y", String(top + height));
        wipe.setAttribute("height", "0");
        clip.append(wipe);
        definitions.append(clip);
        shape.setAttribute("clip-path", `url(#${clip.id})`);

        const guide = shape.cloneNode(false) as SVGPathElement;
        guide.removeAttribute("clip-path");
        guide.removeAttribute("data-logo-part");
        guide.setAttribute("fill", "none");
        guide.setAttribute("stroke", colour);
        guide.setAttribute("stroke-width", "0.65");
        drawing.append(guide);
        gsap.set(guide, { opacity: 0 });

        // Trace each contour separately: compound ribbons have several cutouts.
        const contours = (shape.getAttribute("d") ?? "").match(/[Mm][^Mm]*/g) ?? [];
        const paths = contours.map((contour) => {
          const line = document.createElementNS(namespace, "path");
          line.setAttribute("d", contour);
          line.setAttribute("fill", "none");
          line.setAttribute("stroke", colour);
          line.setAttribute("stroke-width", "1.25");
          line.setAttribute("stroke-linecap", "round");
          line.setAttribute("stroke-linejoin", "round");
          line.setAttribute("vector-effect", "non-scaling-stroke");
          drawing.append(line);
          const length = line.getTotalLength();
          gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
          return line;
        });
        const duration = Math.min(0.95, Math.max(0.45, shape.getTotalLength() / 3800));
        strokes.push({ paths, guide, wipe, top, height, duration,
          start: index / Math.max(1, pieces.length - 1) * 1.15 });
      });
    });

    const timeline = gsap.timeline({
      paused: true,
      onComplete: () => {
        gsap.set(preloader, { display: "none" });
        document.body.style.overflow = previousOverflow;
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
        const moveX = gsap.quickTo(scene, "x", { duration: 1, ease: "power3.out" });
        const moveY = gsap.quickTo(scene, "y", { duration: 1, ease: "power3.out" });
        const onMove = (event: PointerEvent) => {
          if (event.pointerType !== "mouse") return;
          const bounds = hero.getBoundingClientRect();
          moveX(-((event.clientX - bounds.left) / bounds.width - 0.5) * 30);
          moveY(-((event.clientY - bounds.top) / bounds.height - 0.5) * 22);
        };
        const onLeave = () => { moveX(0); moveY(0); };
        hero.addEventListener("pointermove", onMove, { passive: true });
        hero.addEventListener("pointerleave", onLeave);
        removeMotion = () => {
          hero.removeEventListener("pointermove", onMove);
          hero.removeEventListener("pointerleave", onLeave);
          gsap.killTweensOf(scene);
          gsap.set(scene, { clearProps: "transform" });
        };
      },
    });

    strokes.forEach(({ paths, guide, wipe, top, height, start, duration }) => {
      timeline
        .to(guide, { opacity: 0.12, duration: 0.2 }, start)
        .to(paths, {
          strokeDashoffset: 0, duration, ease: "sine.inOut",
          stagger: { amount: paths.length > 1 ? 0.16 : 0 },
        }, start)
        .to(wipe, {
          attr: { y: top, height }, duration: 0.65, ease: "power2.inOut",
        }, start + duration * 0.75)
        .to([...paths, guide], { opacity: 0, duration: 0.3 }, start + duration + 0.4);
    });

    timeline
      .to(logo, { scale: 1, duration: 2.4, ease: "sine.out" }, 0)
      .to(letters, {
        opacity: 1, duration: 0.4, stagger: { amount: 0.4 }, ease: "power2.out",
      }, 1.9)
      .addLabel("handoff", 3.05)
      .to(logo, { autoAlpha: 0, scale: 1.035, duration: 0.35, ease: "power2.in" }, "handoff")
      .to(preloader, { autoAlpha: 0, duration: 0.5, ease: "power2.inOut" }, "handoff+=0.18")
      .to(".hero__shade", { autoAlpha: 1, duration: 0.4 }, "handoff+=0.25")
      .to(".brand, .menu-toggle, .site-nav__link, .site-nav__cta", {
        autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.025, ease: "power2.out",
      }, "handoff+=0.35")
      .to(".hero__eyebrow", { autoAlpha: 1, y: 0, duration: 0.45 }, "handoff+=0.45")
      .to(".hero__line-inner", {
        autoAlpha: 1, yPercent: 0, duration: 0.65, stagger: 0.1, ease: "power3.out",
      }, "handoff+=0.5")
      .to(".hero__description, .hero__actions, .hero__bottom-label", {
        autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.1, ease: "power2.out",
      }, "handoff+=0.9");

    const start = () => {
      if (disposed || started) return;
      started = true;
      window.clearTimeout(fallback);
      timeline.play();
    };
    const loadImage = (src: string) => new Promise<void>((resolve) => {
      const image = new window.Image();
      image.onload = () => { image.decode().catch(() => {}).then(resolve); };
      image.onerror = () => resolve();
      image.src = src;
    });
    let minimum = 0;
    fallback = window.setTimeout(start, 4000);
    Promise.allSettled([loadImage("/img/Hero-bg.webp"), document.fonts.ready]).then(() => {
      if (disposed || started) return;
      minimum = window.setTimeout(start, Math.max(0, 350 - (performance.now() - mountedAt)));
    });

    return () => {
      disposed = true;
      window.clearTimeout(fallback);
      window.clearTimeout(minimum);
      removeMotion();
      timeline.revert();
      context.revert();
      shapes.forEach((shape) => shape.removeAttribute("clip-path"));
      definitions.remove();
      drawing.remove();
      document.body.style.overflow = previousOverflow;
    };
  }, [clipPrefix]);

  return (
    <div className="preloader" ref={preloaderRef} aria-hidden="true">
      <div className="preloader__logo" dangerouslySetInnerHTML={{ __html: logoSvg }} />
    </div>
  );
}
