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
    const wordmark = preloader.querySelector<SVGGElement>('[data-logo-part="wordmark"]');
    const logo = preloader.querySelector<HTMLElement>(".preloader__logo");
    const svg = preloader.querySelector<SVGSVGElement>("svg");
    if (!svg) return;
    const namespace = "http://www.w3.org/2000/svg";
    const definitions = document.createElementNS(namespace, "defs");
    const drawing = document.createElementNS(namespace, "g");
    drawing.setAttribute("aria-hidden", "true");
    svg.prepend(definitions);
    svg.append(drawing);

    // One feathered mask lets colour travel through the whole mark as a single gesture.
    const mark = preloader.querySelector<SVGGElement>('[data-logo-part="mark"]');
    if (!mark) return;
    const bounds = mark.getBBox();
    const maskHeight = (bounds.height + 12) * 1.25;
    const gradient = document.createElementNS(namespace, "linearGradient");
    gradient.id = `${clipPrefix}-feather`;
    gradient.setAttribute("x1", "0");
    gradient.setAttribute("x2", "0");
    gradient.setAttribute("y1", "0");
    gradient.setAttribute("y2", "1");
    [["0%", "white"], ["85%", "white"], ["100%", "black"]].forEach(([offset, colour]) => {
      const stop = document.createElementNS(namespace, "stop");
      stop.setAttribute("offset", offset);
      stop.setAttribute("stop-color", colour);
      gradient.append(stop);
    });
    const mask = document.createElementNS(namespace, "mask");
    mask.id = `${clipPrefix}-colour`;
    mask.setAttribute("maskUnits", "userSpaceOnUse");
    mask.setAttribute("x", String(bounds.x - 6));
    mask.setAttribute("y", String(bounds.y - 6));
    mask.setAttribute("width", String(bounds.width + 12));
    mask.setAttribute("height", String(bounds.height + 12));
    const sweep = document.createElementNS(namespace, "rect");
    sweep.setAttribute("x", String(bounds.x - 6));
    sweep.setAttribute("width", String(bounds.width + 12));
    sweep.setAttribute("height", String(maskHeight));
    sweep.setAttribute("y", String(bounds.y - 6 - maskHeight));
    sweep.setAttribute("fill", `url(#${gradient.id})`);
    mask.append(sweep);
    definitions.append(gradient, mask);
    mark.setAttribute("mask", `url(#${mask.id})`);

    const strokes: { paths: SVGPathElement[]; start: number; duration: number }[] = [];
    const context = gsap.context(() => {
      gsap.set(content, { autoAlpha: 0, y: 18 });
      gsap.set(".hero__line-inner", { autoAlpha: 0, yPercent: 110 });
      gsap.set(".hero__shade", { autoAlpha: 0 });
      gsap.set(logo, { autoAlpha: 1 });
      gsap.set(svg, { autoAlpha: 1 });
      gsap.set(wordmark, { opacity: 0 });
      shapes.forEach((shape, index) => {
        const colour = shape.getAttribute("data-color");
        const ribbon = colour === "orange" || colour === "coral";
        const structure = colour === "navy" || colour === "slate";
        // Neutral hairlines establish the structure before the brand colours arrive.
        const contours = (shape.getAttribute("d") ?? "").match(/[Mm][^Mm]*/g) ?? [];
        const paths = contours.map((contour) => {
          const line = document.createElementNS(namespace, "path");
          line.setAttribute("d", contour);
          line.setAttribute("fill", "none");
          line.setAttribute("stroke", "#737984");
          line.setAttribute("stroke-width", ribbon ? "0.85" : "0.7");
          line.setAttribute("stroke-linecap", "round");
          line.setAttribute("stroke-linejoin", "round");
          line.setAttribute("vector-effect", "non-scaling-stroke");
          drawing.append(line);
          const length = line.getTotalLength();
          gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
          return line;
        });
        strokes.push({ paths,
          start: ribbon ? 0.45 : (structure ? 0 : 0.22) + index * 0.009,
          duration: ribbon ? 1.25 : structure ? 1.05 : 0.8,
        });
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

    strokes.forEach(({ paths, start, duration }) => {
      timeline.to(paths, { strokeDashoffset: 0, duration, ease: "none" }, start);
    });

    timeline
      .to(sweep, {
        attr: { y: bounds.y - 6 }, duration: 1.8, ease: "power2.inOut",
      }, 0.9)
      .to(drawing, { opacity: 0, duration: 1.15, ease: "sine.inOut" }, 1.55)
      .to(wordmark, { opacity: 1, duration: 0.7, ease: "sine.out" }, 2.3)
      .addLabel("handoff", 3.65)
      .to(logo, { autoAlpha: 0, duration: 0.5, ease: "sine.inOut" }, "handoff")
      .to(preloader, { autoAlpha: 0, duration: 0.65, ease: "sine.inOut" }, "handoff+=0.22")
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
      mark.removeAttribute("mask");
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
