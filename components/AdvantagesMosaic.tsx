"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

type Advantage = readonly [string, string, string];

const titleLines: Record<string, readonly [string, string]> = {
  "Special Administrative Region": ["Special Administrative", "Region"],
  "First-mover opportunity": ["First-mover", "opportunity"],
  "Investor-friendly legal framework": ["Investor-friendly", "legal framework"],
  "Strategic market access": ["Strategic", "market access"],
  "Renewable energy advantage": ["Renewable energy", "advantage"],
  "Political stability": ["Political", "stability"],
  "Purpose-built city": ["Purpose-built", "city"],
  "High-level national commitment": ["High-level national", "commitment"],
  "Talent, wellness & quality of life": ["Talent, wellness &", "quality of life"],
};

export default function AdvantagesMosaic({ items }: { items: Advantage[] }) {
  const [selected, setSelected] = useState(0);
  const copy = useRef<HTMLDivElement>(null);
  const [, title, description] = items[selected];

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(copy.current!.children, { opacity: 0, y: 12 }, {
        opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: "power2.out",
        clearProps: "opacity,transform",
      });
    }, copy);
    return () => media.revert();
  }, [selected]);

  return (
    <div className="advantages-explorer">
      <div className="advantages-explorer__detail" id="advantage-detail" role="region" aria-label="Selected investment advantage" aria-live="polite" aria-atomic="true">
        <div ref={copy} className="advantages-explorer__copy">
          <p className="advantages-explorer__count">{String(selected + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</p>
          <h3>{titleLines[title] ? <>{titleLines[title][0]}<br />{titleLines[title][1]}</> : title}</h3>
          <p className="advantages-explorer__description">{description}</p>
        </div>
        <span className="advantages-explorer__signature" aria-hidden="true">Investment advantages</span>
      </div>
      <div className="advantages-explorer__options" role="group" aria-label="Select an investment advantage">
        {items.map(([label], index) => (
          <button
            key={label}
            type="button"
            className="advantages-explorer__option"
            aria-pressed={selected === index}
            aria-controls="advantage-detail"
            onClick={() => setSelected(index)}
          >
            <span className="advantages-explorer__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <span className="advantages-explorer__label">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
