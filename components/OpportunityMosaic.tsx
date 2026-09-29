"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);
type Item = { title: string; description: string; artwork: string };
const colors = ["var(--brand-orange)", "var(--brand-burgundy)", "var(--brand-coral)", "var(--brand-indigo)", "#4e7966", "var(--gold)", "var(--brand-slate)"];

export default function OpportunityMosaic({ items }: { items: Item[] }) {
  const [positions, setPositions] = useState(() => items.map((_, index) => index));

  const gridRef = useRef<HTMLDivElement>(null);
  const before = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const swapping = useRef<number[]>([]);
  const movement = useRef<gsap.core.Timeline | null>(null);
  const reveal = useRef<gsap.core.Timeline | null>(null);

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
    if (!state || !gridRef.current) return;

    const context = gsap.context(() => {
      const featured = gridRef.current!.querySelector<HTMLElement>('[data-position="0"]')!;
      const words = featured.querySelectorAll(".opportunity-mosaic__word");
      const description = featured.querySelector(".opportunity-mosaic__description");
      const svg = featured.querySelector("svg");
      const parts = featured.querySelectorAll("[data-part]");
      const cards = gridRef.current!.querySelectorAll(".opportunity-mosaic__card");
      const contents = swapping.current.flatMap((index) => Array.from(cards[index].querySelectorAll(".opportunity-mosaic__copy, .opportunity-mosaic__art")));

      // FLIP keeps the card motion on transforms instead of reflowing each frame.
      gsap.set(cards, { zIndex: 0 });
      gsap.set(featured, { zIndex: 2 });
      movement.current = Flip.from(state, {
        duration: 0.85,
        ease: "power3.inOut",
        scale: true,
        prune: true,
        onComplete: () => { gsap.set(cards, { clearProps: "zIndex" }); },
      });

      // Keep text out of the scaling phase, then reveal the selected title word by word.
      gsap.set(contents, { opacity: 0 });
      gsap.set(words, { y: 16, opacity: 0 });
      gsap.set(description, { y: 14, opacity: 0 });
      reveal.current = gsap.timeline()
        .to(contents, { opacity: 1, duration: 0.25, clearProps: "opacity" }, 0.48)
        .fromTo(svg, { scale: 0.82, rotation: -5, transformOrigin: "50% 50%" },
          { scale: 1, rotation: 0, duration: 0.8, ease: "power3.out", clearProps: "transform,transformOrigin" }, 0.48)
        .fromTo(parts, { y: 3, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, stagger: 0.065, ease: "power2.out", clearProps: "transform,opacity" }, 0.52)
        .to(words, { y: 0, opacity: 1, duration: 0.5, stagger: 0.065, ease: "power3.out", clearProps: "transform,opacity" }, 0.62)
        .to(description, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", clearProps: "transform,opacity" }, 0.82);
    }, gridRef);
    return () => context.revert();
  }, [positions]);

  function selectStep(index: number) {
    if (positions[index] === 0) return;
    // Finish an interrupted swap before measuring so fast clicks never leave stale transforms.
    movement.current?.progress(1);
    reveal.current?.progress(1);
    if (gridRef.current && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      swapping.current = [positions.indexOf(0), index];
      const cards = gridRef.current.querySelectorAll(".opportunity-mosaic__card");
      before.current = Flip.getState(swapping.current.map((cardIndex) => cards[cardIndex]));
    }
    setPositions((current) => {
      if (current[index] === 0) return current;
      const next = [...current];
      const featured = current.indexOf(0);
      next[featured] = current[index];
      next[index] = 0;
      return next;
    });
  }

  return (
    <section className="opportunity-mosaic" id="tourism-opportunities-option-2" aria-labelledby="opportunity-mosaic-title">
      <div className="opportunity-mosaic__inner">
        <header className="how-to-invest__header">
          <p className="how-to-invest__eyebrow">Tourism opportunity areas</p>
          <h2 id="opportunity-mosaic-title">We welcome investment partners <em>in the following areas.</em></h2>
        </header>
        <div ref={gridRef} className="opportunity-mosaic__grid" role="group" aria-label="Tourism opportunity areas. Select a card to explore each category.">
          {items.map((step, index) => (
            <button
              type="button"
              key={step.title}
              className="opportunity-mosaic__card"
              style={{ "--step-color": colors[index] } as CSSProperties}
              data-position={positions[index]}
              aria-pressed={positions[index] === 0}
              aria-label={`${step.title}: ${step.description}`}
              onClick={() => selectStep(index)}
            >
              <span className="opportunity-mosaic__art opportunity-card__art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: step.artwork }} />
              <span className="opportunity-mosaic__copy">
                <span className="opportunity-mosaic__title">
                  {step.title.split(" ").map((word, wordIndex) => (
                    <span key={wordIndex}><span className="opportunity-mosaic__word">{word}</span>{" "}</span>
                  ))}
                </span>
                <span className="opportunity-mosaic__description" aria-hidden={positions[index] !== 0}>{step.description}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="how-to-invest__footer">
          <p>Select a category to explore the possibilities.</p>
          <a className="how-to-invest__link" href="#enquiries">Start a conversation <ArrowRight aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}
