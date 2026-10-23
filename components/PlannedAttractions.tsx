"use client";

import { useEffect, useRef } from "react";
import FitText from "@/components/FitText";
import Image from "next/image";

const attractions = [
  "Light Festival",
  "Water Festival",
  "GMC Marathon Series",
  "Outdoor Film Festival",
  "GMC Treasure Hunt Race",
  "Street Art Weekends",
  "Riverfront Night Bazaar",
  "Lantern River Evenings",
  "Farmers & Wellness Market",
  "Bhutanese Food & Culture Weekend",
  "GMC Craft Trail",
  "Mindful Leadership Retreat",
  "Monsoon Festival",
  "Meditation Programs",
  "GMC Student Discovery Camp",
  "GMC Viewpoint Experience Series",
  "Riverside Yoga",
  "Traditional Games Weekend",
  "GMC Open-Air Music Evenings",
  "GMC Firefly & Night Nature Walks",
];

export default function PlannedAttractions() {
  const railRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let lastTime = 0;
    let position = rail.scrollLeft;
    let paused = false;
    let visible = false;
    const cards = Array.from(rail.querySelectorAll<HTMLElement>(".planned-attractions__cards li"));
    let lastParallaxPosition = -1;
    let lastRailWidth = -1;

    const updateParallax = () => {
      const bounds = rail.getBoundingClientRect();
      if (rail.scrollLeft === lastParallaxPosition && bounds.width === lastRailWidth) return;
      lastParallaxPosition = rail.scrollLeft;
      lastRailWidth = bounds.width;
      // Read positions together before updating styles to avoid repeated layout work.
      const offsets = cards.map((card) => {
        const rect = card.getBoundingClientRect();
        if (rect.right < bounds.left || rect.left > bounds.right) return null;
        const progress = (rect.left + rect.width / 2 - bounds.left - bounds.width / 2)
          / ((bounds.width + rect.width) / 2);
        return -Math.max(-1, Math.min(1, progress)) * rect.width * 0.12;
      });
      cards.forEach((card, index) => {
        if (offsets[index] !== null) {
          card.style.setProperty("--parallax-x", `${offsets[index]}px`);
        }
      });
    };

    const tick = (time: number) => {
      const elapsed = lastTime ? Math.min(time - lastTime, 50) : 0;
      lastTime = time;
      const collection = rail.firstElementChild as HTMLElement | null;
      if (!paused && visible && !document.hidden && !reducedMotion.matches && collection) {
        const loopWidth = collection.offsetWidth + 18;
        position = (position + elapsed * 0.04) % loopWidth;
        rail.scrollLeft = position;
      } else {
        position = rail.scrollLeft;
      }
      if (visible && !document.hidden && !reducedMotion.matches) updateParallax();
      frame = requestAnimationFrame(tick);
    };
    const pause = () => { paused = true; };
    const resume = () => {
      paused = rail.matches(":hover, :focus-within");
      position = rail.scrollLeft;
      lastTime = 0;
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      lastTime = 0;
    });
    observer.observe(rail);
    rail.addEventListener("pointerenter", pause);
    rail.addEventListener("pointerleave", resume);
    rail.addEventListener("focusin", pause);
    rail.addEventListener("focusout", resume);
    rail.addEventListener("touchstart", pause, { passive: true });
    rail.addEventListener("touchend", resume);
    rail.addEventListener("touchcancel", resume);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      rail.removeEventListener("pointerenter", pause);
      rail.removeEventListener("pointerleave", resume);
      rail.removeEventListener("focusin", pause);
      rail.removeEventListener("focusout", resume);
      rail.removeEventListener("touchstart", pause);
      rail.removeEventListener("touchend", resume);
      rail.removeEventListener("touchcancel", resume);
    };
  }, []);
  return (
    <section
      className="planned-attractions"
      aria-labelledby="planned-attractions-title"
    >
      <div className="planned-attractions__inner">
        <header className="planned-attractions__header">
          <p className="planned-attractions__eyebrow">Planned attractions</p>
          <h2 id="planned-attractions-title">
            <FitText>More to discover.</FitText>
            <FitText>
              <em>More reasons to return.</em>
            </FitText>
          </h2>
          <p>
            A growing mix of attractions and experiences, with something new to
            discover each time you visit.
          </p>
        </header>
        <div
          ref={railRef}
          className="planned-attractions__rail"
          role="region"
          tabIndex={0}
          aria-label="Planned attractions. Automatically scrolling; pause by hovering or focusing."
        >
          {[false, true].map((duplicate) => (
            <ul
              key={String(duplicate)}
              className="planned-attractions__cards"
              aria-hidden={duplicate || undefined}
            >
              {attractions.map((attraction) => (
                <li key={attraction}>
                  <Image
                    src={`/img/planned-attractions/${attraction.replaceAll(" ", "-")}.webp`}
                    alt=""
                    fill
                    sizes="(max-width: 600px) 386px, (max-width: 1138px) 338px, (max-width: 1502px) 30vw, 446px"
                    className="planned-attractions__image"
                  />
                  <h3>{attraction}</h3>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
