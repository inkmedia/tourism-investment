"use client";

import FitText from "@/components/FitText";

import { ArrowRight } from "lucide-react";
import { useEffect, useRef, type CSSProperties } from "react";

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

export default function HowToInvest() {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    section.classList.add("process--ready");
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      section.classList.add("process--visible");
      observer.disconnect();
    }, { threshold: 0.15 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="how-to-invest" id="how-to-invest" aria-labelledby="how-to-invest-title">
      <div className="how-to-invest__inner">
        <header className="how-to-invest__header">
          <p className="how-to-invest__eyebrow">How to invest</p>
          <h2 id="how-to-invest-title" aria-label="From first conversation to opening day.">
            {"From first conversation to opening day.".split(" ").map((word, index) => (
              <span className="how-to-invest__word" aria-hidden="true" key={word}>
                <span style={{ "--word-index": index } as CSSProperties} className={index > 3 ? "is-italic" : undefined}>{word}</span>
                {" "}
              </span>
            ))}
          </h2>
        </header>

          <ol className="how-to-invest__steps">
            {steps.map((step, index) => (
              <li className={`how-to-invest__step how-to-invest__step--${step.number}`} style={{ "--step-index": index } as CSSProperties} key={step.number}>
                <div className="how-to-invest__card">
                <span className="how-to-invest__number">{step.number}</span>
                <h3><FitText singleLine>{step.title}</FitText></h3>
                <p>{step.description}</p>
                </div>
                {index < steps.length - 1 && <ArrowRight className="how-to-invest__connector" aria-hidden="true" />}
              </li>
            ))}
          </ol>

        <div className="how-to-invest__footer">
          <p>Each stage is clear, considered and built around the opportunity.</p>
          <a className="how-to-invest__link" href="#enquiries">
            Start a conversation <ArrowRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
