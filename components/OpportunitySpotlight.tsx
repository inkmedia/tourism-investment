"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import gsap from "gsap";
import { observePlaybackVisibility } from "./playbackVisibility";
import { areas } from "./opportunityAreas";
import styles from "./OpportunitySpotlight.module.css";

export default function OpportunitySpotlight() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [selectionRevision, setSelectionRevision] = useState(0);
  const indexRef = useRef<HTMLElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (paused) return;
    let timer = 0;
    const stop = observePlaybackVisibility(sectionRef.current!, (playing) => {
      window.clearTimeout(timer);
      if (playing) {
        timer = window.setTimeout(() => {
          setActive((current) => (current + 1) % areas.length);
        }, 3000);
      }
    });
    return () => {
      stop();
      window.clearTimeout(timer);
    };
  }, [active, paused, selectionRevision]);
  const imagesRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLElement>(null);
  const area = areas[active];
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const index = indexRef.current;
    const selected = index?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if (index && selected && index.scrollWidth > index.clientWidth) {
      index.scrollTo({
        left: selected.offsetLeft - (index.clientWidth - selected.offsetWidth) / 2,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    }
  }, [active]);

  function move(direction: number) {
    setActive((current) => (current + direction + areas.length) % areas.length);
  }

  function navigate(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    }
  }

  useLayoutEffect(() => {
    const images = Array.from(imagesRef.current!.querySelectorAll("img"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeline = gsap.timeline();
    images.forEach((image, index) => {
      timeline.to(image, {
        opacity: index === active ? 1 : 0,
        scale: index === active ? 1 : 1.025,
        duration: reduced ? 0 : 0.65,
        ease: "power2.inOut",
      }, 0);
    });
    timeline.fromTo(captionRef.current, { opacity: reduced ? 1 : 0, y: reduced ? 0 : 10 }, {
      opacity: 1, y: 0, duration: reduced ? 0 : 0.45, ease: "power2.out",
    }, 0);
    return () => { timeline.kill(); };
  }, [active]);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="opportunity-spotlight-title"
      aria-roledescription="carousel"
      onKeyDown={navigate}
      onTouchStart={(event) => {
        if ((event.target as HTMLElement).closest("button, nav")) return;
        const touch = event.touches[0];
        touchStart.current = { x: touch.clientX, y: touch.clientY };
      }}
      onTouchCancel={() => { touchStart.current = null; }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (!start) return;
        const touch = event.changedTouches[0];
        const dx = touch.clientX - start.x;
        const dy = touch.clientY - start.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
      }}
    >
      <div ref={imagesRef} className={styles.images}>
        {areas.map((item, index) => (
          <Image key={item.image} src={item.image} alt={index === active ? item.alt : ""} aria-hidden={index !== active} fill sizes="100vw" className={styles.image} style={{ opacity: index === 0 ? 1 : 0 }} />
        ))}
      </div>
      <div className={styles.shade} />
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Tourism opportunity areas</p>
          <h2 id="opportunity-spotlight-title">We welcome investment partners in the following areas:</h2>
        </header>
        <nav ref={indexRef} className={styles.index} aria-label="All tourism opportunities">
          {areas.map((item, index) => (
            <button
              key={item.title}
              type="button"
              aria-pressed={index === active}
              aria-controls="opportunity-spotlight-detail"
              onClick={() => {
                setActive(index);
                setSelectionRevision((current) => current + 1);
              }}
            >
              <span className={styles.indexNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span>{item.title}</span>
            </button>
          ))}
        </nav>
        <div className={styles.bottom}>
          <div className={styles.navigation}>
            <article ref={captionRef} className={styles.caption} id="opportunity-spotlight-detail" aria-live={paused ? "polite" : "off"} aria-atomic="true" aria-roledescription="slide" aria-label={`${active + 1} of ${areas.length}`}>
              <h3>{area.title}</h3>
              <p>{area.description}</p>
            </article>
            <div className={styles.controls}>
              <span className={styles.count} aria-hidden="true">{String(active + 1).padStart(2, "0")} <span>/ {String(areas.length).padStart(2, "0")}</span></span>
              <button type="button" aria-label={paused ? "Play slideshow" : "Pause slideshow"} onClick={() => setPaused((current) => !current)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">{paused ? <path d="m9 5 10 7-10 7Z" /> : <path d="M9 5v14M15 5v14" />}</svg>
              </button>
              <button type="button" aria-label="Previous opportunity" onClick={() => move(-1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg></button>
              <button type="button" aria-label="Next opportunity" onClick={() => move(1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6" /></svg></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
