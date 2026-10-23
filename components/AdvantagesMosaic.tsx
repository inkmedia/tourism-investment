"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

type Advantage = readonly [string, string, string];

export default function AdvantagesMosaic({ items }: { items: Advantage[] }) {
  const [selected, setSelected] = useState(0);
  const copy = useRef<HTMLDivElement>(null);
  const options = useRef<HTMLDivElement>(null);
  const [, title, description] = items[selected];

  useLayoutEffect(() => {
    const root = options.current!;
    const context = document.createElement("canvas").getContext("2d");
    let frame = 0;
    let disposed = false;
    const fit = () => {
      if (!context || disposed) return;
      const labels = Array.from(root.querySelectorAll<HTMLElement>(".advantages-explorer__label"));
      let size = 22;
      labels.forEach((label) => {
        const style = getComputedStyle(label);
        context.font = `${style.fontWeight} 22px ${style.fontFamily}`;
        const width = context.measureText(label.textContent ?? "").width;
        if (width && label.clientWidth) size = Math.min(size, 22 * (label.clientWidth - 2) / width);
      });
      root.style.setProperty("--advantage-option-size", `${Math.floor(size * 4) / 4}px`);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    fit();
    document.fonts.ready.then(() => { if (!disposed) schedule(); });
    document.fonts.addEventListener("loadingdone", schedule);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", schedule);
    };
  }, [items]);

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
          <h3>{title}</h3>
          <p className="advantages-explorer__description">{description}</p>
        </div>
        <span className="advantages-explorer__signature" aria-hidden="true">Investment advantages</span>
      </div>
      <div ref={options} className="advantages-explorer__options" role="group" aria-label="Select an investment advantage">
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
