"use client";

import {
  Crown,
  DraftingCompass,
  Network,
  PlaneTakeoff,
  Scale,
  Timer,
} from "lucide-react";
import { useEffect, useRef, type CSSProperties } from "react";

const reasons = [
  {
    number: "01",
    title: "Early-mover advantage",
    description:
      "Strategic locations are available now. The market has not yet formed. This is the moment to define category leadership before it belongs to someone else.",
    icon: Timer,
  },
  {
    number: "02",
    title: "Built from the ground up",
    description:
      "GMC is not an established destination being revitalised. It is a blank canvas — designed and planned with a long-term vision from the outset.",
    icon: DraftingCompass,
  },
  {
    number: "03",
    title: "Infrastructure & connectivity",
    description:
      "A new international airport, road connections and purpose-built city infrastructure are under active development alongside the destination itself.",
    icon: PlaneTakeoff,
  },
  {
    number: "04",
    title: "Royal mandate",
    description:
      "Personally conceived and championed by His Majesty the King of Bhutan. This is not a government project with a political cycle — it is a generational commitment.",
    icon: Crown,
  },
  {
    number: "05",
    title: "Purpose-built legal and governance framework",
    description:
      "GMC operates under a dedicated Special Administrative Region framework, providing investors with a distinct legal and regulatory environment designed to support international business and long-term investment.",
    icon: Scale,
  },
  {
    number: "06",
    title: "A growing ecosystem",
    description:
      "International investors, developers and operators are beginning to establish positions across the city. Momentum is building. The window is finite.",
    icon: Network,
  },
];

export default function WhyInvest() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    section.classList.add("why-invest--ready");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.classList.add("why-invest--visible");
      return;
    }

    const cards = Array.from(section.querySelectorAll<HTMLElement>(".investment-card"));
    const cleanupTilt = cards.map((card) => {
      let frame = 0;

      const onPointerMove = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;

        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const rotateY = (x - 0.5) * 14;
          const rotateX = (0.5 - y) * 12;
          card.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
          card.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
          card.style.setProperty("--glare-x", `${(x * 100).toFixed(1)}%`);
          card.style.setProperty("--glare-y", `${(y * 100).toFixed(1)}%`);
          card.classList.add("investment-card--tilting");
        });
      };

      const onPointerLeave = () => {
        cancelAnimationFrame(frame);
        card.classList.remove("investment-card--tilting");
        card.style.removeProperty("--tilt-x");
        card.style.removeProperty("--tilt-y");
      };

      card.addEventListener("pointermove", onPointerMove);
      card.addEventListener("pointerleave", onPointerLeave);
      return () => {
        cancelAnimationFrame(frame);
        card.removeEventListener("pointermove", onPointerMove);
        card.removeEventListener("pointerleave", onPointerLeave);
      };
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.classList.add("why-invest--visible");
        observer.disconnect();
      },
      { threshold: 0.16 },
    );

    observer.observe(section);
    return () => {
      observer.disconnect();
      cleanupTilt.forEach((cleanup) => cleanup());
    };
  }, []);

  return (
    <section ref={sectionRef} className="why-invest" id="why-invest" aria-labelledby="why-invest-title">
      <div className="why-invest__inner">
        <header className="why-invest__header">
          <p className="why-invest__eyebrow">The investment case</p>
          <h2 id="why-invest-title">Why invest in Gelephu<br />{" "}Mindfulness City?</h2>
        </header>

        <div className="why-invest__grid">
          {reasons.map(({ number, title, description, icon: Icon }, index) => (
            <article
              className="investment-card"
              key={number}
              style={{ "--card-index": index } as CSSProperties}
            >
              <div className="investment-card__top">
                <span className="investment-card__icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="investment-card__number">{number}</span>
              </div>
              <div className="investment-card__copy">
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
