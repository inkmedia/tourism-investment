"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { Landmark, Scale, Globe2, Leaf, ShieldCheck, Blocks, Crown, Flag, Flower2 } from "lucide-react";

gsap.registerPlugin(Flip);

type Advantage = readonly [string, string, string];
const icons = [Landmark, Scale, Globe2, Leaf, ShieldCheck, Blocks, Crown, Flag, Flower2];
const colors = ["#e5e5d9", "#f1dbd0", "#dbddd4", "#e0e8d9", "#eee6d5", "#d3e3ec", "#e7dbe1", "#e8dfc8", "#f8f4e9"];
const accents = ["#8d9060", "#c4562f", "#73754d", "#386d35", "#b4934b", "#1776b2", "#993c48", "#a17e37", "#8d9060"];

export default function AdvantagesMosaic({ items, paused = false }: { items: Advantage[]; paused?: boolean }) {
  const [positions, setPositions] = useState(() => items.map((_, index) => index));
  const grid = useRef<HTMLDivElement>(null);
  const before = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const swapping = useRef<number[]>([]);
  const movement = useRef<gsap.core.Timeline | null>(null);
  const reveal = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const element = grid.current;
    if (!element) return;
    let frame = 0;
    let disposed = false;
    const context = document.createElement("canvas").getContext("2d");
    const fitTitles = () => {
      if (!context || disposed) return;
      const titles = Array.from(element.querySelectorAll<HTMLElement>('.advantages-mosaic__card:not([data-position="0"]) .advantages-mosaic__title'));
      if (!titles.length) return;
      const available = Math.min(...titles.map((title) => title.clientWidth)) - 2;
      if (available <= 0) return;
      const style = getComputedStyle(titles[0]);
      const maximumSize = 20;
      context.font = `${style.fontWeight} ${maximumSize}px ${style.fontFamily}`;
      const spacing = parseFloat(style.letterSpacing) / parseFloat(style.fontSize) || 0;
      // Include every title so changing the featured card keeps one shared size.
      const longest = Math.max(...items.map(([label]) => {
        const text = `${label} `;
        return context.measureText(text).width + spacing * maximumSize * text.length;
      }));
      const size = Math.floor(Math.min(maximumSize, maximumSize * available / longest) * 4) / 4;
      element.style.setProperty("--advantage-title-size", `${size}px`);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fitTitles);
    };
    const observer = new ResizeObserver(schedule);
    element.querySelectorAll(".advantages-mosaic__card").forEach((card) => observer.observe(card));
    fitTitles();
    document.fonts.ready.then(() => { if (!disposed) schedule(); });
    document.fonts.addEventListener("loadingdone", schedule);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", schedule);
    };
  }, [items]);

  useEffect(() => {
    const finish = () => {
      movement.current?.progress(1);
      reveal.current?.progress(1);
    };
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    preference.addEventListener("change", finish);
    window.addEventListener("resize", finish);
    return () => {
      preference.removeEventListener("change", finish);
      window.removeEventListener("resize", finish);
    };
  }, []);

  useLayoutEffect(() => {
    const state = before.current;
    before.current = null;
    if (!state || !grid.current) return;
    const context = gsap.context(() => {
      const cards = grid.current!.querySelectorAll<HTMLElement>(".advantages-mosaic__card");
      const featured = grid.current!.querySelector<HTMLElement>('[data-position="0"]')!;
      const contents = swapping.current.flatMap((index) => Array.from(cards[index].querySelectorAll(".advantages-mosaic__art, .advantages-mosaic__copy")));
      gsap.set(featured, { zIndex: 2 });
      movement.current = Flip.from(state, {
        duration: 0.85,
        ease: "power3.inOut",
        scale: true,
        prune: true,
        onComplete: () => { gsap.set(featured, { clearProps: "zIndex" }); },
      });
      gsap.set(contents, { opacity: 0 });
      reveal.current = gsap.timeline()
        .to(contents, { opacity: 1, duration: 0.25, clearProps: "opacity" }, 0.48)
        .fromTo(featured.querySelector("svg"), { scale: 0.82, rotation: -5, transformOrigin: "50% 50%" },
          { scale: 1, rotation: 0, duration: 0.8, ease: "power3.out", clearProps: "transform,transformOrigin" }, 0.48)
        .fromTo(featured.querySelectorAll(".advantages-mosaic__word"), { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.065, ease: "power3.out", clearProps: "transform,opacity" }, 0.62)
        .fromTo(featured.querySelector(".advantages-mosaic__description"), { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", clearProps: "transform,opacity" }, 0.82);
    }, grid);
    return () => context.revert();
  }, [positions]);

  const select = useCallback((index: number) => {
    if (positions[index] === 0) return;
    movement.current?.progress(1);
    reveal.current?.progress(1);
    if (grid.current && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      swapping.current = [positions.indexOf(0), index];
      const cards = grid.current.querySelectorAll(".advantages-mosaic__card");
      before.current = Flip.getState(swapping.current.map((cardIndex) => cards[cardIndex]));
    }
    setPositions((current) => {
      const next = [...current];
      next[current.indexOf(0)] = current[index];
      next[index] = 0;
      return next;
    });
  }, [positions]);

  // Use the same animated swap for automatic and manual selections.
  // Selecting another card restarts the four-second countdown.
  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => {
      select((positions.indexOf(0) + 1) % items.length);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [positions, select, items.length, paused]);

  return (
    <div ref={grid} className="advantages-mosaic" role="group" aria-label="GMC advantages. Select a card to explore.">
      {items.map(([label, title, description], index) => {
        const Icon = icons[index];
        const position = positions[index];
        return (
          <button
            type="button"
            key={label}
            className="advantages-mosaic__card"
            data-position={position}
            style={{
              "--card-color": colors[index],
              "--card-accent": accents[index],
              "--card-column": position === 0 ? 1 : 3 + (position - 1) % 4,
              "--card-row": position === 0 ? 1 : 1 + Math.floor((position - 1) / 4),
              "--compact-column": position === 0 ? 1 : 1 + (position - 1) % 4,
              "--compact-row": position === 0 ? 1 : 2 + Math.floor((position - 1) / 4),
              "--mobile-column": position === 0 ? 1 : 1 + (position - 1) % 2,
              "--mobile-row": position === 0 ? 1 : 2 + Math.floor((position - 1) / 2),
            } as CSSProperties}
            aria-pressed={position === 0}
            aria-label={`${label}: ${title}. ${description}`}
            onClick={() => select(index)}
          >
            <span className="advantages-mosaic__art" aria-hidden="true"><Icon strokeWidth={1.2} /></span>
            <span className="advantages-mosaic__copy">
              <span className="advantages-mosaic__title">
                {label.split(" ").map((word, wordIndex) => <span key={wordIndex} className="advantages-mosaic__word">{word}{" "}</span>)}
              </span>
              <span className="advantages-mosaic__description" hidden={position !== 0}>
                <span className="advantages-mosaic__subtitle">{title}</span>
                {description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
