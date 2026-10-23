"use client";

import FitText from "@/components/FitText";

import InvestmentIcon from "@/components/InvestmentIcon";
import FooterMark from "@/components/FooterMark";
import gsap from "gsap";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const reasons = [
  {
    number: "01",
    title: "Secure your place early",
    description:
      "Access strategic sites while the destination is taking shape. For hotel owners, developers and operators, early entry offers greater scope to secure the right location, establish a flagship property and influence the tourism landscape around it.",
  },
  {
    number: "02",
    title: "Build within a bigger vision",
    description:
      "Develop your project within a coordinated city masterplan, with tourism considered alongside infrastructure, public spaces and the natural environment. Create a property that benefits from—and contributes to—the destination’s long-term appeal.",
  },
  {
    number: "03",
    title: "Connect with future demand",
    description:
      "A new international airport, improved road connections and planned city infrastructure are central to GMC’s development. These investments will support accessibility and create the foundations for tourism, business travel and longer stays.",
  },
  {
    number: "04",
    title: "Invest in a Royal vision",
    description:
      "Conceived and championed by His Majesty the King of Bhutan, GMC reflects a commitment that spans generations. Tourism investors have the opportunity to contribute to a national vision grounded in Bhutanese values and built for the future.",
  },
  {
    number: "05",
    title: "A framework for international investment",
    description:
      "GMC’s dedicated Special Administrative Region framework is designed to support international business and long-term investment. It provides a distinct legal and regulatory environment for investors establishing and growing their presence in the city.",
  },
  {
    number: "06",
    title: "Help define the destination",
    description:
      "As international investors, developers and operators establish their presence, opportunities are emerging to connect hospitality with wellness, culture, nature and business. Bring a distinctive concept and help give travellers a reason to choose GMC.",
  },
];

export default function WhyInvest() {
  const sectionRef = useRef<HTMLElement>(null);
  const watermarkTimeline = useRef<gsap.core.Timeline | null>(null);
  const activeReason = useRef<number | null>(null);
  const watermarkVisible = useRef(false);
  const [hoveredReason, setHoveredReason] = useState<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const motion = gsap.matchMedia();
    motion.add("(prefers-reduced-motion: no-preference)", () => {
      const pieces = Array.from(section.querySelectorAll<SVGPathElement>(".why-invest__watermark path"));
      pieces.forEach((piece, index) => {
        const length = piece.getTotalLength();
        gsap.set(piece, {
          opacity: 0,
          fillOpacity: 0,
          strokeOpacity: 1,
          strokeDasharray: length,
          strokeDashoffset: length,
          x: index % 2 === 0 ? -40 : 40,
          y: 35,
        });
      });

      const timeline = gsap.timeline({ paused: true })
          .to(pieces, {
            opacity: 1, x: 0, y: 0, strokeDashoffset: 0,
            duration: 1.5, stagger: { amount: 0.7, from: "center" }, ease: "power2.out",
          })
          .to(pieces, {
            fillOpacity: 1, strokeOpacity: 0,
            duration: 0.8, stagger: { amount: 0.5, from: "center" }, ease: "sine.inOut",
          }, 0.9);
      watermarkTimeline.current = timeline;

      const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        watermarkVisible.current = true;
        if (activeReason.current === null) timeline?.play();
        observer.disconnect();
      }, { threshold: 0.16 });
      observer.observe(section);
      return () => {
        observer.disconnect();
        timeline?.kill();
        watermarkTimeline.current = null;
      };
    });
    return () => motion.revert();
  }, []);

  useEffect(() => {
    activeReason.current = hoveredReason;
    const timeline = watermarkTimeline.current;
    if (!timeline) return;
    if (hoveredReason === null && watermarkVisible.current) timeline.timeScale(1.5).play();
    else timeline.timeScale(3).reverse();
  }, [hoveredReason]);

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
    <section ref={sectionRef} className="why-invest" data-hovering={hoveredReason !== null} id="why-invest" aria-labelledby="why-invest-title">
      <div className="why-invest__watermark why-invest__watermark--top-left" aria-hidden="true">
        <FooterMark monochrome />
      </div>
      <div className="why-invest__watermark why-invest__watermark--bottom-right" aria-hidden="true">
        <FooterMark monochrome />
      </div>
      <div className="why-invest__icon-stage" aria-hidden="true">
        {hoveredReason !== null && (
          <span className="why-invest__active-icon" key={hoveredReason}>
            <InvestmentIcon index={hoveredReason} />
          </span>
        )}
      </div>
      <div className="why-invest__inner">
        <header className="why-invest__header">
          <p className="why-invest__eyebrow">The investment case</p>
          <h2 id="why-invest-title">Help shape Bhutan’s next tourism destination</h2>
          <p className="why-invest__intro">Gelephu Mindfulness City offers investors the opportunity to help build a destination from its earliest stages, bringing together Bhutan’s distinctive appeal, a long-term Royal vision and a city designed for international investment.</p>
          <div className="why-invest__header-icon" aria-hidden="true">
            {hoveredReason !== null && (
              <InvestmentIcon key={hoveredReason} index={hoveredReason} />
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
