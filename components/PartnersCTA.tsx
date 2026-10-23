"use client";

import { ArrowRight } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FooterMark from "./FooterMark";

gsap.registerPlugin(ScrollTrigger);

export default function PartnersCTA() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const paths = Array.from(section.querySelectorAll<SVGPathElement>(".partners-cta__artwork path"));
      paths.forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length, fillOpacity: 0 });
      });

      gsap.timeline({
        scrollTrigger: { trigger: section, start: "top 85%", once: true },
      })
        .to(paths, {
          strokeDashoffset: 0,
          duration: 2.2,
          stagger: { amount: 0.8, from: "center" },
          ease: "power2.inOut",
        })
        .to(paths, { fillOpacity: 0.06, duration: 1, ease: "power2.out" }, "-=0.8");
    }, section);

    return () => media.revert();
  }, []);

  return (
    <section ref={sectionRef} className="partners-cta" aria-labelledby="partners-cta-title">
      <div className="partners-cta__artwork" aria-hidden="true">
        <FooterMark monochrome preserveAspectRatio="xMidYMid slice" />
      </div>
      <div className="partners-cta__inner">
        <div className="partners-cta__copy">
          <p className="partners-cta__eyebrow">Discuss your investment plans</p>
          <h2 id="partners-cta-title">Partners required</h2>
          <p>
            Explore established project concepts with partners ready to bring them
            to life in Gelephu Mindfulness City. We’re seeking investors and
            collaborators to help take these tourism ventures forward.
          </p>
        </div>
          <a className="button button--gold swap-button partners-cta__button" href="#enquiries">
            <span className="swap-button__track">
              <span className="swap-button__face">
                Become a partner
                <span className="swap-button__icon" aria-hidden="true"><ArrowRight /></span>
              </span>
              <span className="swap-button__face" aria-hidden="true">
                Become a partner
                <span className="swap-button__icon"><ArrowRight /></span>
              </span>
            </span>
          </a>
      </div>
    </section>
  );
}
