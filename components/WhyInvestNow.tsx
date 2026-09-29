"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import FitText from "@/components/FitText";

const milestones = [
  {
    title: "Prime Land Still Available",
    timing: "Now",
    image: "/img/Prime-Land-Still-Available.png",
    description: "Strategic sites across key precincts remain accessible before demand intensifies and values appreciate.",
  },
  {
    title: "Early Investor Privileges",
    timing: "Now",
    image: "/img/Early-Investor-Privileges.png",
    description: "Access to current incentives, favourable terms, and first-mover advantage in one of Asia’s newest destination developments.",
  },
  {
    title: "Championship Golf Course",
    timing: "2028",
    image: "/img/Championship-Golf-Course.png",
    description: "One of the first major lifestyle assets within GMC, attracting high-net-worth visitors and establishing a premium leisure hub.",
  },
  {
    title: "International Airport",
    timing: "2029",
    image: "/img/International-Airport.png",
    description: "Direct international access expected to transform connectivity and unlock significant growth in tourism and business travel.",
  },
  {
    title: "Tourism Infrastructure",
    timing: "From 2027",
    image: "/img/Tourism-Infrastructure.png",
    description: "Hotels, attractions, wellness facilities and visitor experiences coming online, creating a stronger tourism ecosystem.",
  },
];

export default function WhyInvestNow() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cards = Array.from(sectionRef.current!.querySelectorAll<HTMLElement>(".invest-now__card"));
    const cleanups = cards.map((card) => {
      let frame = 0;
      const reset = () => {
        cancelAnimationFrame(frame);
        card.classList.remove("invest-now__card--tilting");
        card.style.removeProperty("--tilt-x");
        card.style.removeProperty("--tilt-y");
      };
      const move = (event: PointerEvent) => {
        if (event.pointerType !== "mouse" || motion.matches) return;
        const bounds = card.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
        const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          card.style.setProperty("--tilt-x", `${(0.5 - y) * 12}deg`);
          card.style.setProperty("--tilt-y", `${(x - 0.5) * 14}deg`);
          card.style.setProperty("--glare-x", `${x * 100}%`);
          card.style.setProperty("--glare-y", `${y * 100}%`);
          card.classList.add("invest-now__card--tilting");
        });
      };
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", reset);
      card.addEventListener("pointercancel", reset);
      motion.addEventListener("change", reset);
      window.addEventListener("blur", reset);
      return () => {
        reset();
        card.removeEventListener("pointermove", move);
        card.removeEventListener("pointerleave", reset);
        card.removeEventListener("pointercancel", reset);
        motion.removeEventListener("change", reset);
        window.removeEventListener("blur", reset);
      };
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return (
    <section ref={sectionRef} className="invest-now" aria-labelledby="invest-now-title">
      <div className="invest-now__inner">
        <header className="invest-now__header">
          <div>
            <p className="invest-now__eyebrow">The window before take-off</p>
            <h2 id="invest-now-title">Why invest now?</h2>
          </div>
          <p className="invest-now__intro">Gelephu Mindfulness City is entering a critical pre-growth phase. The investors who move now secure positioning, terms and sites that will not be available once the destination matures.</p>
        </header>
        <div className="invest-now__grid">
          {milestones.map((milestone, index) => (
            <article id={milestone.title === "International Airport" ? "airport-origin" : undefined} className={`invest-now__card${index < 2 ? " invest-now__card--wide" : ""}`} key={milestone.title}>
              <Image src={milestone.image} alt="" fill sizes={index < 2 ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw"} className="invest-now__image" />
              <div className="invest-now__copy">
                <span className="invest-now__timing">{milestone.timing}</span>
                <h3><FitText singleLine>{milestone.title}</FitText></h3>
                <p>{milestone.description}</p>
              </div>
            </article>
          ))}
        </div>
        <footer className="invest-now__footer">
          <p>The window for early engagement with the GMC tourism ecosystem is open now. These advantages are finite.</p>
          <a href="#enquiries" className="button button--gold swap-button invest-now__cta">
            <span className="swap-button__track">
              <span className="swap-button__face">Start a conversation <span className="swap-button__icon" aria-hidden="true"><ArrowRight /></span></span>
              <span className="swap-button__face" aria-hidden="true">Start a conversation <span className="swap-button__icon"><ArrowRight /></span></span>
            </span>
          </a>
        </footer>
      </div>
    </section>
  );
}
