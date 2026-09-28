"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

type Item = { title: string; description: string; artwork: string };

export default function OpportunityJourney({ items }: { items: Item[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const navigation = useRef<(index: number) => void>(() => {});

  useEffect(() => {
    const section = sectionRef.current!;
    const viewport = viewportRef.current!;
    const track = trackRef.current!;
    const media = matchMedia(
      "(min-width: 900px) and (min-height: 800px) and (prefers-reduced-motion: no-preference)",
    );
    let frame = 0;
    let distance = 0;
    let holdDistance = 0;
    const update = () => {
      frame = 0;
      const offset = media.matches
        ? Math.max(
            0,
            Math.min(
              distance,
              -section.getBoundingClientRect().top - holdDistance,
            ),
          )
        : viewport.scrollLeft;
      if (media.matches)
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      const progress = distance ? offset / distance : 0;
      section.style.setProperty("--journey-progress", String(progress));
      setActive(Math.round(progress * (items.length - 1)));
      const bounds = viewport.getBoundingClientRect();
      track
        .querySelectorAll<HTMLElement>(".opportunity-card")
        .forEach((card) => {
          const rect = card.getBoundingClientRect();
          const visible =
            rect.right > bounds.left + 30 &&
            rect.left < bounds.right - 30 &&
            bounds.top < innerHeight &&
            bounds.bottom > 0;
          card.classList.toggle("is-in-view", visible);
        });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const measure = () => {
      section.classList.toggle("opportunities--pinned", media.matches);
      track.style.transform = "";
      distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
      // Reserve reading room before and after the horizontal movement.
      // These are scroll distances, so users remain in control of the pace.
      holdDistance = media.matches
        ? Math.min(324, Math.max(162, window.innerHeight * 0.2925))
        : 0;
      section.style.setProperty(
        "--journey-distance",
        `${distance + holdDistance * 2}px`,
      );
      if (media.matches) viewport.scrollLeft = 0;
      schedule();
    };
    navigation.current = (index) => {
      const target =
        (distance * Math.max(0, Math.min(items.length - 1, index))) /
        (items.length - 1);
      const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth";
      if (media.matches) {
        const sectionStart =
          window.scrollY + section.getBoundingClientRect().top;
        // Returning to the first card restores its full reading hold; reaching
        // the last card leaves the entire exit hold available.
        window.scrollTo({
          top: sectionStart + (target === 0 ? 0 : holdDistance + target),
          behavior,
        });
      } else viewport.scrollTo({ left: target, behavior });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(track);
    media.addEventListener("change", measure);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    viewport.addEventListener("scroll", schedule, { passive: true });
    measure();
    return () => {
      observer.disconnect();
      media.removeEventListener("change", measure);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      viewport.removeEventListener("scroll", schedule);
      cancelAnimationFrame(frame);
    };
  }, [items.length]);

  return (
    <section
      id="opportunities"
      className="opportunities"
      ref={sectionRef}
      aria-labelledby="opportunities-title"
    >
      <div className="opportunities__stage">
        <header className="opportunities__header">
          <div>
            <p className="why-invest__eyebrow">Tourism opportunity areas</p>
            <h2 id="opportunities-title">
              We welcome investment
              <br /> partners in the following areas.
            </h2>
          </div>
          <p className="opportunities__invitation">
            Seven ways to shape
            <br />
            an extraordinary destination.
          </p>
        </header>
        <div
          className="opportunities__viewport"
          ref={viewportRef}
          tabIndex={0}
          role="region"
          aria-label="Tourism investment areas; use left and right arrow keys to explore"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              navigation.current(
                active + (event.key === "ArrowRight" ? 1 : -1),
              );
            }
          }}
        >
          <div className="opportunities__track" ref={trackRef}>
            {items.map((item, index) => (
              <article className="opportunity-card" key={item.title}>
                <div
                  className="opportunity-card__art opportunity-card__art--background"
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: item.artwork }}
                />
                <div className="opportunity-card__top">
                  <span>Opportunity</span>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div
                  className="opportunity-card__art"
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: item.artwork }}
                />
                <div className="opportunity-card__copy">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <div className="opportunity-card__rule" aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>
        <div className="opportunities__navigation">
          <span className="opportunities__hint">
            <ArrowDown size={15} />
            <span className="opportunities__desktop-hint">
              Scroll to explore
            </span>
            <span className="opportunities__mobile-hint">Swipe to explore</span>
          </span>
          <div className="opportunities__progress" aria-hidden="true">
            <span />
          </div>
          <span className="opportunities__count">
            <b>{String(active + 1).padStart(2, "0")}</b>
            <span>/ 07</span>
          </span>
          <div className="opportunities__buttons">
            <button
              type="button"
              aria-label="Previous opportunity"
              disabled={active === 0}
              onClick={() => navigation.current(active - 1)}
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next opportunity"
              disabled={active === items.length - 1}
              onClick={() => navigation.current(active + 1)}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
