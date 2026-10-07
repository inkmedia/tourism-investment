"use client";

import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, type CSSProperties } from "react";

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

const stops = [0, 0.265, 0.50, 0.745, 1];
const brandColors = ["--brand-orange", "--brand-burgundy", "--brand-coral", "--brand-indigo", "--brand-slate"];

export default function InvestmentJourney({ curve, icons }: { curve: string; icons: string[] }) {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || !curve) return;
    const media = gsap.matchMedia();
    let disposed = false;
    const context = gsap.context(() => {
      const path = section.querySelector<SVGPathElement>(".investment-journey__track")!;
      const progress = section.querySelector<SVGPathElement>(".investment-journey__progress")!;
      const dots = gsap.utils.toArray<SVGCircleElement>(".investment-journey__dot", section);
      const placements = gsap.utils.toArray<HTMLElement>(".investment-journey__stage", section);
      const length = path.getTotalLength();
      const colors = brandColors.map((name) => getComputedStyle(section).getPropertyValue(name).trim());
      dots.forEach((dot, index) => {
        const point = path.getPointAtLength(length * stops[index]);
        dot.setAttribute("cx", String(point.x));
        dot.setAttribute("cy", String(point.y));
        placements[index].style.setProperty("--anchor-x", `${point.x / 16}%`);
        // Clear the curve across the full label width, including its steep ends.
        const alignment = index === 0 ? .15 : index === stops.length - 1 ? .85 : .5;
        const labelLeft = point.x - 1600 * .18 * alignment;
        const labelEdge = labelLeft + (index % 2 === 0 ? 0 : 1600 * .18);
        let low = 0, high = length;
        for (let sample = 0; sample < 24; sample++) {
          const middle = (low + high) / 2;
          if (path.getPointAtLength(middle).x < labelEdge) low = middle;
          else high = middle;
        }
        const edge = path.getPointAtLength((low + high) / 2);
        placements[index].style.setProperty("--anchor-y", `${edge.y / 5.2}%`);
      });
      media.add({
        motion: "(prefers-reduced-motion: no-preference)",
      }, (match) => {
        if (!match.conditions?.motion) return;
        section.classList.add("investment-journey--animated");
        const stages = section.querySelector<HTMLOListElement>(".investment-journey__stages")!;
        gsap.set(progress, { strokeDasharray: length, strokeDashoffset: length });
        gsap.set(dots, { autoAlpha: 1, attr: { r: 6.5 }, stroke: "#b8b5ac" });
        gsap.set(stages, { "--journey-progress": 0 });
        gsap.set(placements, { "--stage-reveal": .5, "--marker-color": "#b8b5ac" });
        gsap.set(".investment-journey__letter, .investment-journey__number", { color: "#899096" });
        gsap.set(".investment-journey__stage p", { autoAlpha: 0, y: 14 });
        const iconDrawings = gsap.utils.toArray<HTMLElement>(".investment-journey__icon-draw", section);
        const iconPreviews = gsap.utils.toArray<HTMLElement>(".investment-journey__icon-preview", section);
        const iconStrokes = iconDrawings.map((icon) => Array.from(icon.querySelectorAll<SVGGeometryElement>("path, circle, rect")));
        gsap.set(iconDrawings, { autoAlpha: 0 });
        gsap.set(iconPreviews, { autoAlpha: 1 });
        iconStrokes.flat().forEach((stroke) => {
          const strokeLength = stroke.getTotalLength();
          gsap.set(stroke, { strokeDasharray: strokeLength, strokeDashoffset: strokeLength });
        });

        const timeline = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            id: "investment-journey",
            trigger: section,
            start: "top 75%",
            toggleActions: "play none none none",
            once: true,
          },
        });
        stops.forEach((stop, index) => {
          const time = index * .9;
          const revealTime = index === 0 ? 0 : time + .62;
          const number = placements[index].querySelector(".investment-journey__number");
          const letters = placements[index].querySelectorAll(".investment-journey__letter");
          const description = placements[index].querySelector("p");
          timeline.to(progress, { strokeDashoffset: length * (1 - stop), duration: .72, ease: "none" }, time)
            .to(stages, { "--journey-progress": stop, duration: .72, ease: "none" }, time)
            .to(dots[index], { stroke: colors[index], duration: .25 }, revealTime)
            .to(placements[index], { "--stage-reveal": 1, "--marker-color": colors[index], duration: .25 }, revealTime)
            .to(number, { color: colors[index], duration: .4 }, revealTime + .02)
            .to(iconDrawings[index], { autoAlpha: 1, duration: .25 }, revealTime + .02)
            .to(iconPreviews[index], { autoAlpha: 0, duration: .5 }, revealTime + .02)
            .to(iconStrokes[index], { strokeDashoffset: 0, duration: .42, stagger: .028, ease: "power2.inOut" }, revealTime + .04)
            .to(letters, { color: "#15232c", duration: .5, stagger: .035 }, revealTime + .07);
          timeline.to(description, { autoAlpha: 1, y: 0, duration: .55 }, revealTime + .24);
        });
        return () => {
          section.classList.remove("investment-journey--animated");
        };
      }, section);
    }, section);
    const stageList = section.querySelector<HTMLOListElement>(".investment-journey__stages")!;
    const updateTrackHeight = () => {
      const stages = stageList.querySelectorAll<HTMLElement>(".investment-journey__stage");
      stageList.style.setProperty("--journey-track-height", `${stages[stages.length - 1].offsetTop - stages[0].offsetTop}px`);
    };
    const trackResize = new ResizeObserver(updateTrackHeight);
    trackResize.observe(stageList);
    updateTrackHeight();
    // Earlier chapters can resize after fonts load, a breakpoint changes, or
    // an opportunity list expands. Keep the entry trigger aligned with the section.
    let refreshFrame = 0;
    const refresh = () => {
      if (disposed || refreshFrame) return;
      refreshFrame = requestAnimationFrame(() => {
        refreshFrame = 0;
        if (!disposed) ScrollTrigger.refresh();
      });
    };
    const upstreamResize = new ResizeObserver(refresh);
    for (let sibling = section.previousElementSibling; sibling; sibling = sibling.previousElementSibling) {
      upstreamResize.observe(sibling);
    }
    document.fonts.ready.then(refresh);
    return () => {
      disposed = true;
      cancelAnimationFrame(refreshFrame);
      upstreamResize.disconnect();
      trackResize.disconnect();
      media.revert();
      context.revert();
    };

  }, [curve, icons]);

  return (
    <section ref={sectionRef} className="investment-journey" id="how-to-invest" aria-labelledby="investment-journey-title">
      <div className="investment-journey__inner">
        <header className="how-to-invest__header">
          <p className="how-to-invest__eyebrow">How to invest</p>
          <h2 className="investment-journey__title" id="investment-journey-title" aria-label="From first conversation to opening day.">
            {"From first conversation to opening day.".split(" ").map((word, index) => (
              <span className="investment-journey__word how-to-invest__word" aria-hidden="true" key={`${word}-${index}`}><span className={index > 3 ? "is-italic" : undefined}>{word}</span>{" "}</span>
            ))}
          </h2>
        </header>
        <div className="investment-journey__landscape">
          <svg className="investment-journey__curve" viewBox="0 0 1600 520" preserveAspectRatio="none" fill="none" aria-hidden="true">
            <path className="investment-journey__track" d={curve} stroke="currentColor" strokeWidth="1" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            {curve && <path className="investment-journey__progress" d={curve} stroke="currentColor" strokeWidth="3" strokeLinecap="round" />}
            {[[50,430],[405,282],[790,250],[1165,225],[1550,115]].map(([x,y], index) => <circle key={index} className="investment-journey__dot" style={{ stroke: `var(${brandColors[index]})` }} cx={x} cy={y} r={6.5} vectorEffect="non-scaling-stroke" />)}
          </svg>
          <ol className="investment-journey__stages">
            {steps.map((step, index) => (
              <li className={`investment-journey__stage investment-journey__stage--${step.number}`} style={{ "--stage-color": `var(${brandColors[index]})`, "--anchor-x": `${[5.125,25.3125,49.375,72.8125,93.125][index]}%`, "--anchor-y": `${[79.42,54.23,48.08,43.27,26.54][index]}%` } as CSSProperties} key={step.number}>
                <div className="investment-journey__stage-content">
                  <div className="investment-journey__stage-heading">
                    <div>
                      <span className="investment-journey__number">{step.number}</span>
                      <h3 aria-label={step.title}>
                        {Array.from(step.title).map((letter, letterIndex) => (
                          <span className="investment-journey__letter-mask" aria-hidden="true" key={letterIndex}>
                            <span className="investment-journey__letter">{letter}</span>
                          </span>
                        ))}
                      </h3>
                    </div>
                    <span className="investment-journey__icon" aria-hidden="true">
                      <span className="investment-journey__icon-preview" dangerouslySetInnerHTML={{ __html: icons[index] }} />
                      <span className="investment-journey__icon-draw" dangerouslySetInnerHTML={{ __html: icons[index] }} />
                    </span>
                  </div>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="investment-journey__footer how-to-invest__footer">
          <p>Each stage is clear, considered and built around the opportunity.</p>
          <a className="how-to-invest__link" href="#enquiries">
            Start a conversation <ArrowRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
