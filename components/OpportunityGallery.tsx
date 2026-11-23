"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { areas } from "./opportunityAreas";
import styles from "./OpportunityGallery.module.css";

export default function OpportunityGallery() {
  const [active, setActive] = useState<number | null>(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<number | null>(0);
  const animateRef = useRef<((index: number | null, immediate?: boolean) => void) | null>(null);

  useLayoutEffect(() => {
    const gallery = galleryRef.current!;
    const panels = Array.from(gallery.children) as HTMLElement[];
    const media = gsap.matchMedia();
    media.add({
      mobile: "(max-width: 900px)",
      small: "(max-width: 480px)",
      desktop: "(min-width: 901px)",
      reduced: "(prefers-reduced-motion: reduce)",
    }, (context) => {
      const { mobile, small, reduced } = context.conditions!;
      let timeline: gsap.core.Timeline | undefined;
      let previous = activeRef.current;
      const animate = (selected: number | null, immediate = false) => {
        // Keep current interpolated values when a visitor changes direction mid-animation.
        timeline?.kill();
        const instant = immediate || reduced;
        timeline = gsap.timeline({ defaults: { ease: "power3.inOut", duration: instant ? 0 : 0.85 } });
        panels.forEach((panel, index) => {
          const expanded = index === selected;
          const image = panel.querySelector(`.${styles.image}`);
          const description = panel.querySelector(`.${styles.description}`);
          const title = panel.querySelector(`.${styles.title}`);
          timeline!.to(panel, mobile
            ? { minHeight: expanded ? (small ? 520 : 480) : 84 }
            : { flexGrow: expanded ? 8 : 1 }, 0);
          timeline!.to(image, { scale: expanded ? 1.035 : 1 }, 0);
          timeline!.to(description, {
            autoAlpha: expanded ? 1 : 0,
            y: expanded ? 0 : 18,
            duration: instant ? 0 : expanded ? 0.45 : 0.16,
            ease: "power2.out",
          }, instant || !expanded ? 0 : 0.35);
          if (!mobile && !instant && (index === selected || index === previous)) {
            // Cross-fade the label as its orientation changes, avoiding a visible snap.
            timeline!.fromTo(title, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }, 0.2);
          } else {
            timeline!.set(title, { autoAlpha: 1 }, 0);
          }
        });
        previous = selected;
      };
      animateRef.current = animate;
      animate(activeRef.current, true);
      return () => {
        timeline?.kill();
        animateRef.current = null;
        gsap.set(panels, { clearProps: "flexGrow,minHeight" });
        gsap.set(gallery.querySelectorAll(`.${styles.image}, .${styles.title}, .${styles.description}`), {
          clearProps: "transform,opacity,visibility",
        });
      };
    });
    return () => media.revert();
  }, []);

  useLayoutEffect(() => {
    activeRef.current = active;
    animateRef.current?.(active);
  }, [active]);

  return (
    <section className={styles.section} aria-labelledby="opportunity-gallery-title">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className="how-to-invest__eyebrow">Tourism opportunity areas</p>
          <h2 id="opportunity-gallery-title">We welcome investment partners in the following areas:</h2>
        </header>
        <div ref={galleryRef} className={styles.gallery}>
          {areas.map((area, index) => {
            const expanded = active === index;
            return (
              <article key={area.title} className={`${styles.panel} ${expanded ? styles.active : ""}`}>
                <Image src={area.image} alt={area.alt} fill sizes="(max-width: 900px) 100vw, 65vw" className={styles.image} />
                <div className={styles.shade} />
                <h3 className={styles.heading}>
                  <button type="button" className={styles.trigger} aria-expanded={expanded} aria-controls={`gallery-description-${index}`} onClick={() => setActive(expanded ? null : index)}>
                    <span className={styles.title}>{area.title}</span>
                    <span className={styles.indicator} aria-hidden="true">{expanded ? "−" : "+"}</span>
                  </button>
                </h3>
                <div className={styles.description} id={`gallery-description-${index}`} aria-hidden={!expanded}>
                  <p>{area.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
