"use client";

import FitText from "@/components/FitText";

import InvestmentIcon from "@/components/InvestmentIcon";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const reasons = [
  {
    number: "01",
    title: "Early-mover advantage",
    description:
      "Strategic locations are available now. The market has not yet formed. This is the moment to define category leadership before it belongs to someone else.",
  },
  {
    number: "02",
    title: "Built from the ground up",
    description:
      "GMC is not an established destination being revitalised. It is a blank canvas — designed and planned with a long-term vision from the outset.",
  },
  {
    number: "03",
    title: "Infrastructure & connectivity",
    description:
      "A new international airport, road connections and purpose-built city infrastructure are under active development alongside the destination itself.",
  },
  {
    number: "04",
    title: "Royal mandate",
    description:
      "Personally conceived and championed by His Majesty the King of Bhutan. This is not a government project with a political cycle — it is a generational commitment.",
  },
  {
    number: "05",
    title: "Purpose-built legal and governance framework",
    description:
      "GMC operates under a dedicated Special Administrative Region framework, providing investors with a distinct legal and regulatory environment designed to support international business and long-term investment.",
  },
  {
    number: "06",
    title: "A growing ecosystem",
    description:
      "International investors, developers and operators are beginning to establish positions across the city. Momentum is building. The window is finite.",
  },
];

export default function WhyInvest() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredReason, setHoveredReason] = useState<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    section.classList.add("why-invest--ready");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.classList.add("why-invest--visible");
      return;
    }

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
    };
  }, []);

  return (
    <section ref={sectionRef} className="why-invest" id="why-invest" aria-labelledby="why-invest-title">
      <div className="why-invest__inner">
        <header className="why-invest__header">
          <p className="why-invest__eyebrow">The investment case</p>
          <h2 id="why-invest-title">Why invest in Gelephu<br />{" "}Mindfulness City?</h2>
          <div className="why-invest__icon-stage" aria-hidden="true">
            {hoveredReason !== null && (
              <span className="why-invest__active-icon" key={hoveredReason}>
                <InvestmentIcon index={hoveredReason} />
              </span>
            )}
          </div>
        </header>

        <div className="why-invest__grid" onPointerLeave={() => setHoveredReason(null)}>
          {reasons.map(({ number, title, description }, index) => (
            <article
              className="investment-card"
              key={number}
              onPointerEnter={(event) => {
                if (event.pointerType !== "touch") setHoveredReason(index);
              }}
              onPointerLeave={() => setHoveredReason(null)}
              onPointerCancel={() => setHoveredReason(null)}
              style={{ "--card-index": index } as CSSProperties}
            >
              <div className="investment-card__top">
                <span className="investment-card__number">{number}</span>
              </div>
              <div className="investment-card__copy">
                <h3><FitText singleLine>{title}</FitText></h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
