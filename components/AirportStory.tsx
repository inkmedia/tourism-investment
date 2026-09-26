"use client";

import { useEffect, useRef } from "react";

export default function AirportStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const transferRef = useRef<HTMLDivElement>(null);
  const passengersRef = useRef<HTMLElement>(null);
  const growthRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current!;
    const hero = imageRef.current!;
    const transfer = transferRef.current!;
    const source = document.getElementById("airport-origin");
    if (!source) return;
    const media = matchMedia("(min-width: 1001px) and (min-height: 740px) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    const clamp = (n: number) => Math.max(0, Math.min(1, n));
    const update = () => {
      frame = 0;
      if (!media.matches) return;
      const origin = source.getBoundingClientRect();
      const destination = hero.getBoundingClientRect();
      const sectionTop = section.getBoundingClientRect().top;
      const start = window.scrollY + origin.top - 160;
      const end = window.scrollY + sectionTop - 100;
      const progress = clamp((window.scrollY - start) / Math.max(1, end - start));
      const eased = progress * progress * (3 - 2 * progress);
      const transferring = progress > 0 && progress < 1;
      transfer.style.display = transferring ? "block" : "none";
      hero.style.visibility = progress < 1 ? "hidden" : "visible";
      if (transferring) {
        const mix = (a: number, b: number) => a + (b - a) * eased;
        transfer.style.left = `${mix(origin.left, destination.left)}px`;
        transfer.style.top = `${mix(origin.top, destination.top)}px`;
        transfer.style.width = `${mix(origin.width, destination.width)}px`;
        transfer.style.height = `${mix(origin.height, destination.height)}px`;
        transfer.style.setProperty("--transfer-shade", String(.45 * (1 - eased)));
      }
      const story = clamp((100 - sectionTop) / (innerHeight * .48));
      section.style.setProperty("--airport-reveal", String(story));
      section.style.setProperty("--airport-lift", `${(1 - story) * 24}px`);
      section.style.setProperty("--airport-progress", String(story));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const setup = () => {
      section.classList.toggle("airport-story--animated", media.matches);
      hero.style.visibility = "";
      transfer.style.display = "none";
      section.style.removeProperty("--airport-reveal");
      section.style.removeProperty("--airport-lift");
      schedule();
    };
    media.addEventListener("change", setup);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(hero);
    document.fonts.ready.then(schedule);
    setup();
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", setup);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resize.disconnect();
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current!;
    const passengers = passengersRef.current!;
    const growth = growthRef.current!;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const render = (progress: number) => {
      const eased = 1 - Math.pow(1 - progress, 4);
      passengers.textContent = `${(3.1 * eased).toFixed(1)}M`;
      growth.textContent = `${Math.round(16 * eased)}%`;
    };
    const start = () => {
      if (reducedMotion.matches) { render(1); return; }
      const began = performance.now();
      const tick = (time: number) => {
        const progress = Math.min(1, (time - began) / 1450);
        render(progress);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      start();
      observer.disconnect();
    }, { threshold: 0.34 });
    observer.observe(section);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);

  return (
    <section ref={sectionRef} className="airport-story" aria-labelledby="airport-story-title">
      <div ref={transferRef} className="airport-story__transfer" aria-hidden="true" />
      <div className="airport-story__journey">
        <div className="airport-story__stage">
          <header className="airport-story__header">
            <div><p className="airport-story__eyebrow">Infrastructure &amp; access</p><h2 id="airport-story-title">Improved connectivity<br /><em>opening GMC to the world.</em></h2></div>
            <p className="airport-story__chapter"><span>01 — The gateway</span><span className="airport-story__track"><span /></span></p>
          </header>
          <div ref={imageRef} className="airport-story__hero">
            <img src="/img/International-Airport.png" alt="Artist’s impression of Gelephu International Airport, with a series of timber-inspired terminal roofs" width={1600} height={900} loading="lazy" />
            <div className="airport-story__caption">
              <div><span className="invest-now__timing">Operational by December 2029</span><h3>Gelephu International Airport</h3><p>Artist’s impression</p></div>
              <dl className="airport-story__stats"><div><dt>Passengers by 2044</dt><dd ref={passengersRef}>0.0M</dd></div><div><dt>CAGR 2030–2044</dt><dd ref={growthRef}>0%</dd></div></dl>
            </div>
          </div>
        </div>
      </div>
      <div className="airport-story__details">
        <article><p className="airport-story__eyebrow">02 — Gateway to South Asia</p><h3>A region within reach.</h3><p>Within a short flight radius lies one of the largest concentrations of population and economic activity on Earth — northern India, Bangladesh, Nepal, western China, and portions of Southeast Asia.</p><p>This may ultimately position GMC not merely as a Bhutanese destination, but as a Himalayan interface between South Asia, Southeast Asia, and environmentally aligned global capital.</p></article>
        <article><p className="airport-story__eyebrow">03 — Railway connectivity</p><h3>69-km Kokrajhar–Gelephu Rail Line</h3><p>India’s first-ever railway link to Bhutan, declared a Special Railway Project by Indian Railways and backed by the Government of India.</p><p>Improved rail access will fundamentally reduce travel friction, providing a seamless entry corridor from India and materially increasing long-term confidence in regional integration.</p></article>
      </div>
      <p className="airport-story__note">Traffic forecasts benchmarked against comparable regional airports. Railway timeline subject to Government of India approvals.</p>
    </section>
  );
}
