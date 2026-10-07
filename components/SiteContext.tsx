"use client";

import { useEffect, useRef } from "react";
import BhutanInteractiveMap from "./bhutan-map/BhutanInteractiveMap";

export default function SiteContext() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    section.classList.add("site-context--ready");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.classList.add("site-context--visible");
        observer.disconnect();
      },
      { threshold: 0.18 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="investment-map"
      ref={sectionRef}
      className="site-context"
      aria-labelledby="site-context-title"
    >
      <div className="site-context__inner">
        <header className="site-context__header">
          <div>
            <p className="site-context__eyebrow">Site context</p>
            <h2 id="site-context-title">The development landscape</h2>
          </div>
          <p className="site-context__note">
            Infrastructure, connectivity and urban ecosystem · For reference
            purposes only. Not to scale.
          </p>
        </header>
      </div>
      <BhutanInteractiveMap />
    </section>
  );
}
