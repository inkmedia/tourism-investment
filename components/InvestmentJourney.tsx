"use client";

import { ArrowRight, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    title: "Explore",
    description: "Browse the investment landscape. Identify categories and sites that align with your strategy.",
  },
  {
    number: "02",
    title: "Connect",
    description: "Speak with our team. Understand the opportunity in detail and explore your options.",
  },
  {
    number: "03",
    title: "Assess",
    description: "Conduct due diligence with access to masterplan information, site data and planning guidance.",
  },
  {
    number: "04",
    title: "Structure",
    description: "Agree land allocation, development terms and phasing within the GMC investment framework.",
  },
  {
    number: "05",
    title: "Develop",
    description: "Build, operate and participate in the long-term growth of a new global destination.",
  },
];

export default function InvestmentJourney() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const media = gsap.matchMedia();
    media.add({
      motion: "(prefers-reduced-motion: no-preference)",
      stacked: "(max-width: 1100px)",
    }, (context) => {
      if (!context.conditions?.motion) return;
      const cards = section.querySelectorAll(".investment-journey__stage-content");
      const reveal = { opacity: 0, y: 12, duration: 0.45, ease: "power2.out" };

      if (context.conditions.stacked) {
        // Each stacked card waits until the reader scrolls to that step.
        gsap.set(cards, { opacity: 0, y: 12 });
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            gsap.to(entry.target, {
              opacity: 1, y: 0, duration: reveal.duration, ease: reveal.ease,
            });
            observer.unobserve(entry.target);
          });
        }, { rootMargin: "0px 0px -15% 0px" });
        cards.forEach((card) => observer.observe(card));
        return () => {
          observer.disconnect();
          gsap.killTweensOf(cards);
        };
      } else {
        gsap.from(cards, {
          ...reveal,
          stagger: 0.16,
          scrollTrigger: {
            trigger: section.querySelector(".investment-journey__stages"),
            start: "top 85%",
            once: true,
          },
        });
      }
    }, section);

    return () => media.revert();
  }, []);

  return (
    <section ref={sectionRef} className="investment-journey" id="how-to-invest" aria-labelledby="investment-journey-title">
      <div className="investment-journey__inner">
        <header className="how-to-invest__header investment-journey__header">
          <div>
            <p className="how-to-invest__eyebrow">How to invest</p>
            <h2 id="investment-journey-title">
              From first conversation to <em>opening day.</em>
            </h2>
          </div>
          <a className="button button--outline swap-button investment-journey__cta" href="#enquiries">
            <span className="swap-button__track">
              <span className="swap-button__face">
                Start a conversation
                <span className="swap-button__icon" aria-hidden="true"><ArrowRight /></span>
              </span>
              <span className="swap-button__face" aria-hidden="true">
                Start a conversation
                <span className="swap-button__icon"><ArrowRight /></span>
              </span>
            </span>
          </a>
        </header>
        <ol className="investment-journey__stages">
          {steps.map((step, index) => (
            <li className="investment-journey__stage" key={step.number}>
              <div className="investment-journey__stage-content">
                <span className="investment-journey__number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              {index < steps.length - 1 && <ChevronRight className="investment-journey__connector" aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
