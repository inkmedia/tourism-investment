"use client";

import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";

export default function HeroIntro() {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const logoObjectRef = useRef<HTMLObjectElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelImageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const preloader = preloaderRef.current;
    const logo = logoRef.current;
    const panel = panelRef.current;
    const panelImage = panelImageRef.current;
    const logoObject = logoObjectRef.current;
    const progress = progressRef.current;
    const hero = document.querySelector<HTMLElement>(".hero");
    const scene = document.querySelector<HTMLElement>(".hero__scene");
    const shade = document.querySelector<HTMLElement>(".hero__shade");
    if (!preloader || !logo || !logoObject || !progress || !panel || !panelImage || !hero || !scene || !shade) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      preloader.style.display = "none";
      return;
    }

    const brand = document.querySelector<HTMLElement>(".brand");
    const menuToggle = document.querySelector<HTMLElement>(".menu-toggle");
    const menuItems = gsap.utils.toArray<HTMLElement>(".site-nav__link, .site-nav__cta");
    const eyebrow = document.querySelector<HTMLElement>(".hero__eyebrow");
    const titleLines = gsap.utils.toArray<HTMLElement>(".hero__line-inner");
    const description = document.querySelector<HTMLElement>(".hero__description");
    const actions = document.querySelector<HTMLElement>(".hero__actions");
    const label = document.querySelector<HTMLElement>(".hero__bottom-label");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const startWidth = Math.min(240, window.innerWidth * 0.48);
    const startHeight = startWidth * 0.56;
    gsap.set(panel, {
      autoAlpha: 0,
      width: startWidth,
      height: startHeight,
      borderRadius: 2,
    });
    gsap.set(panelImage, { yPercent: 7, scale: 1.24 });
    gsap.set(".preloader__stage", { autoAlpha: 0, scale: 0.94 });
    gsap.set(".preloader__meta > *", { autoAlpha: 0, y: 8 });
    gsap.set(".preloader__progress-fill", { scaleX: 0, transformOrigin: "left center" });
    gsap.set(hero, { autoAlpha: 1, scale: 1, clipPath: "none", boxShadow: "none" });
    gsap.set(scene, { autoAlpha: 1, yPercent: 0, scale: 1 });
    gsap.set(shade, { autoAlpha: 0 });
    gsap.set([brand, menuToggle, ...menuItems, eyebrow, description, actions, label], {
      autoAlpha: 0,
      y: 18,
    });
    gsap.set(titleLines, { autoAlpha: 0, yPercent: 115 });

    let removePointerMotion = () => {};
    const counter = { value: 0 };
    const timeline = gsap.timeline({
      paused: true,
      onComplete: () => {
        gsap.set(preloader, { display: "none" });
        document.body.style.overflow = previousOverflow;

        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          const moveX = gsap.quickTo(scene, "x", { duration: 0.75, ease: "power3.out" });
          const moveY = gsap.quickTo(scene, "y", { duration: 0.75, ease: "power3.out" });
          const onPointerMove = (event: PointerEvent) => {
            if (event.pointerType !== "mouse") return;
            const bounds = hero.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;
            moveX(-x * 44);
            moveY(-y * 34);
          };
          const onPointerLeave = () => {
            moveX(0);
            moveY(0);
          };
          hero.addEventListener("pointermove", onPointerMove, { passive: true });
          hero.addEventListener("pointerleave", onPointerLeave);
          removePointerMotion = () => {
            hero.removeEventListener("pointermove", onPointerMove);
            hero.removeEventListener("pointerleave", onPointerLeave);
          };
        }
      },
    });

    timeline
      .to(".preloader__stage", { autoAlpha: 1, scale: 1, duration: 0.8, ease: "power3.out" }, 0)
      .to(".preloader__meta > *", { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.06, ease: "power2.out" }, 0.42)
      .to(".preloader__progress-fill", { scaleX: 1, duration: 1.65, ease: "power2.inOut" }, 0.32)
      .to(counter, { value: 100, duration: 1.65, ease: "power2.inOut", onUpdate: () => { progress.textContent = String(Math.round(counter.value)).padStart(3, "0"); } }, 0.32)
      .to(".preloader__stage", { autoAlpha: 0, y: -10, duration: 0.5, ease: "power2.in" }, 3.85)
      .to(".preloader__meta", { autoAlpha: 0, y: 7, duration: 0.35, ease: "power2.in" }, 3.85)
      .to(panel, { autoAlpha: 1, duration: 0.32, ease: "power2.out" }, 4.1)
      .to(panel, {
        width: () => window.innerWidth,
        height: () => window.innerHeight,
        borderRadius: 0,
        duration: 1.55,
        ease: "power4.inOut",
      }, 4.3)
      .to(panelImage, {
        yPercent: 0,
        scale: 1,
        duration: 1.8,
        ease: "power3.inOut",
      }, 4.2)
      .to(preloader, { autoAlpha: 0, duration: 0.22, ease: "power1.out" }, 5.8)
      .to(shade, { autoAlpha: 1, duration: 1.25, ease: "power2.out" }, 5.82)
      .to(brand, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" }, 5.92)
      .to(menuToggle, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" }, 5.97)
      .to(menuItems, {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.14,
        ease: "power2.out",
      }, 6.0)
      .to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.75, ease: "power2.out" }, 6.17)
      .to(titleLines, {
        autoAlpha: 1,
        yPercent: 0,
        duration: 1.05,
        stagger: 0.2,
        ease: "power3.out",
      }, 6.31)
      .to(description, { autoAlpha: 1, y: 0, duration: 0.85, ease: "power2.out" }, 6.94)
      .to(actions, { autoAlpha: 1, y: 0, duration: 0.85, ease: "power2.out" }, 7.21)
      .to(label, { autoAlpha: 1, y: 0, duration: 0.75, ease: "power2.out" }, 7.37);

    let disposed = false;
    let started = false;
    let fallback = 0;
    let minimum = 0;
    const mountedAt = performance.now();
    const start = () => {
      if (disposed || started) return;
      started = true;
      window.clearTimeout(fallback);
      timeline.play();
    };
    let svgPrepared = false;
    let resolveSvgReady: () => void = () => {};
    const svgReady = new Promise<void>((resolve) => { resolveSvgReady = resolve; });
    const prepareSvg = () => {
      if (svgPrepared) return;
      const svg = logoObject.contentDocument;
      if (!svg) return;
      svgPrepared = true;
      const emblemPaths = Array.from(svg.querySelectorAll<SVGPathElement>("#emblem path"));
      const wordmarkPaths = Array.from(svg.querySelectorAll<SVGPathElement>("#wordmark path"));
      emblemPaths.forEach((path) => {
        const color = path.getAttribute("fill") || getComputedStyle(path).fill;
        const length = path.getTotalLength();
        path.style.fillOpacity = "0";
        path.style.stroke = color;
        path.style.strokeWidth = "1.25";
        path.style.strokeLinecap = "round";
        path.style.strokeLinejoin = "round";
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${length}`;
      });
      wordmarkPaths.forEach((path) => {
        path.style.opacity = "0";
      });
      const wordmarkCharacters = Array.from(
        wordmarkRef.current?.querySelectorAll<HTMLElement>(".preloader__wordmark-char") ?? [],
      );
      gsap.set(wordmarkCharacters, { autoAlpha: 0, y: 7 });
      timeline
        .to(emblemPaths, {
          strokeDashoffset: 0,
          duration: 0.42,
          stagger: { each: 0.005, from: "start" },
          ease: "power2.inOut",
        }, 0.12)
        .to(emblemPaths, {
          fillOpacity: 1,
          strokeOpacity: 0,
          duration: 0.25,
          stagger: 0.005,
          ease: "power2.out",
        }, 0.75)
        .to(wordmarkCharacters, {
          autoAlpha: 1,
          y: 0,
          duration: 0.16,
          stagger: { each: 0.07, from: "start" },
          ease: "power2.out",
        }, 1.36)
      resolveSvgReady();
    };
    const handleSvgError = () => resolveSvgReady();
    logoObject.addEventListener("load", prepareSvg);
    logoObject.addEventListener("error", handleSvgError);
    if (logoObject.contentDocument?.readyState === "complete") prepareSvg();
    const loadImage = (src: string) => new Promise<void>((resolve) => {
      const image = new window.Image();
      image.onload = () => resolve();
      image.onerror = () => resolve();
      image.src = src;
      if (image.complete) resolve();
    });

    fallback = window.setTimeout(start, 5000);
    Promise.allSettled([
      loadImage("/img/Hero-bg.webp"),
      svgReady,
      document.fonts.ready,
    ]).then(() => {
      if (disposed || started) return;
      minimum = window.setTimeout(start, Math.max(0, 700 - (performance.now() - mountedAt)));
    });

    return () => {
      disposed = true;
      window.clearTimeout(fallback);
      window.clearTimeout(minimum);
      removePointerMotion();
      logoObject.removeEventListener("load", prepareSvg);
      logoObject.removeEventListener("error", handleSvgError);
      timeline.kill();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="preloader" ref={preloaderRef} aria-hidden="true">
      <div className="preloader__hero" ref={panelRef}>
        <div className="preloader__hero-image" ref={panelImageRef} />
      </div>
      <div className="preloader__stage">
        <div className="preloader__logo" ref={logoRef}>
          <object ref={logoObjectRef} data="/img/logo.svg" type="image/svg+xml" tabIndex={-1} aria-label="" />
        </div>
        <div className="preloader__wordmark" ref={wordmarkRef} aria-label="Gelephu Mindfulness City">
          {Array.from("Gelephu Mindfulness City").map((character, index) => (
            <span className="preloader__wordmark-char" key={`${character}-${index}`} aria-hidden="true">
              {character === " " ? "\u00a0" : character}
            </span>
          ))}
        </div>
      </div>
      <div className="preloader__meta">
        <span>Kingdom of Bhutan</span>
        <div className="preloader__progress"><i className="preloader__progress-fill" /></div>
        <span><b ref={progressRef}>000</b> / 100</span>
      </div>
    </div>
  );
}
