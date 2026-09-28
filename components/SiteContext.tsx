"use client";

import { useEffect, useRef } from "react";

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
        <div className="site-context__image-wrap">
          <img
            className="site-context__image"
            src="/img/site-context.png"
            alt="Development landscape showing planned infrastructure, attractions and urban districts"
          />
        </div>
      </div>
    </section>
  );
}
