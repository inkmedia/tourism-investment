"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import RoyalPortrait from "@/components/RoyalPortrait";

export default function HisMajesty() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current!;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const portrait = section.querySelector<HTMLElement>(".his-majesty__portrait")!;
      const imageSurface = portrait.querySelector(".his-majesty__image-layer");
      const copy = section.querySelector<HTMLElement>(".his-majesty__copy")!;
      const card = section.querySelector<HTMLElement>(".his-majesty__quote-card")!;
      const eyebrow = copy.querySelector(".his-majesty__eyebrow");
      const lines = copy.querySelectorAll(".his-majesty__name-inner");
      const quote = card.querySelectorAll(".his-majesty__quote-mark, .his-majesty__quote, .his-majesty__attribution");

      gsap.set(imageSurface, { clipPath: "inset(0 100% 0 0)" });
      gsap.set(eyebrow, { autoAlpha: 0, y: 18 });
      gsap.set(lines, { autoAlpha: 0, yPercent: 110 });
      gsap.set(quote, { autoAlpha: 0, y: 18 });

      const imageReveal = gsap.timeline({ paused: true }).to(imageSurface, {
        clipPath: "inset(0 0% 0 0)", duration: 1, ease: "sine.inOut", clearProps: "clipPath",
      });
      const headingReveal = gsap.timeline({ paused: true })
        .to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.45, clearProps: "opacity,visibility,transform" }, 0.12)
        .to(lines, {
          autoAlpha: 1, yPercent: 0, duration: 0.65, stagger: 0.1,
          ease: "power3.out", clearProps: "opacity,visibility,transform",
        }, 0.22);
      const quoteReveal = gsap.timeline({ paused: true }).to(quote, {
        autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.1,
        ease: "power2.out", clearProps: "opacity,visibility,transform",
      }, 0.3);
      const reveals = new Map([
        [portrait, imageReveal], [copy, headingReveal], [card, quoteReveal],
      ]);
      // Observe each part so stacked mobile content reveals only when it arrives.
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveals.get(entry.target as HTMLElement)?.play();
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
      reveals.forEach((_, element) => observer.observe(element));
      return () => observer.disconnect();
    }, section);
    return () => media.revert();
  }, []);

  return (
    <section ref={sectionRef} id="his-majesty" className="his-majesty" aria-labelledby="his-majesty-title">
      <div className="his-majesty__inner">
        <div className="his-majesty__copy">
          <h2 id="his-majesty-title">
            <span className="his-majesty__eyebrow">His Majesty</span>
            <span className="his-majesty__name-line"><span className="his-majesty__name-inner">King Jigme Khesar</span></span>{" "}
            <span className="his-majesty__name-line"><span className="his-majesty__name-inner">Namgyel Wangchuck</span></span>
          </h2>
        </div>
        <RoyalPortrait />
        <figure className="his-majesty__quote-card">
          <span className="his-majesty__quote-mark" aria-hidden="true">&ldquo;</span>
          <blockquote className="his-majesty__quote">
            <p>GMC is not just for the present generation but for all future generations...&rdquo;</p>
          </blockquote>
          <figcaption className="his-majesty__attribution">at Bhutan Innovation Forum 2024</figcaption>
        </figure>
      </div>
    </section>
  );
}
