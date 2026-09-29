"use client";

import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";

export default function HeroIntro() {
  const preloaderRef = useRef<HTMLDivElement>(null);

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

    const context = gsap.context(() => {
      gsap.set(content, { autoAlpha: 0, y: 18 });
      gsap.set(".hero__line-inner", { autoAlpha: 0, yPercent: 110 });
      gsap.set(".hero__shade", { autoAlpha: 0 });
      gsap.set(".preloader__hero", { x: 0, y: 0, xPercent: -50, yPercent: -50, scale: 0 });
      gsap.set(".preloader__hero-image", {
        scale: 0,
        xPercent: 0,
        yPercent: 0,
        transformOrigin: "50% 50%",
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

    timeline
      // Keep the original preloader cadence; only the photograph has its own scale-in.
      .to(".preloader__hero", { scale: 1, duration: 1, ease: "power2.inOut" }, 0)
      .to(".preloader__hero-image", {
        scale: 1.15,
        yPercent: 4,
        duration: 1,
        ease: "power2.inOut",
      }, 0)
      // Then open the card to the viewport, independently easing the image crop.
      .to(".preloader__hero", {
        width: "100%", height: "100%", borderRadius: 0,
        duration: 1.12, ease: "power4.inOut",
      }, 1.05)
      .to(".preloader__hero-image", {
        scale: 1,
        yPercent: 0,
        duration: 1.12,
        ease: "power4.inOut",
      }, 1.05)
      .to(".preloader__logo", { autoAlpha: 0, duration: 0.35, ease: "power1.inOut" }, 1.55)
      // Both images have the same crop at handoff, so there is no visible jump.
      .to(preloader, { autoAlpha: 0, duration: 0.14 }, 2.4)
      .to(".hero__shade", { autoAlpha: 1, duration: 0.4 }, 2.4)
      .to(".brand, .menu-toggle, .site-nav__link, .site-nav__cta", {
        autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.025, ease: "power2.out",
      }, 2.48)
      .to(".hero__eyebrow", { autoAlpha: 1, y: 0, duration: 0.45 }, 2.58)
      .to(".hero__line-inner", {
        autoAlpha: 1, yPercent: 0, duration: 0.65, stagger: 0.1, ease: "power3.out",
      }, 2.63)
      .to(".hero__description, .hero__actions, .hero__bottom-label", {
        autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.1, ease: "power2.out",
      }, 3.03);

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
    Promise.allSettled([loadImage("/img/Hero-bg.webp"), loadImage("/img/logo.svg"), document.fonts.ready]).then(() => {
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
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="preloader" ref={preloaderRef} aria-hidden="true">
      <div className="preloader__hero">
        <div className="preloader__hero-image" />
        <div className="preloader__logo">
          <img src="/img/logo.svg" alt="" width="400" height="400" />
        </div>
      </div>
    </div>
  );
}
