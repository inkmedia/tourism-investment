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
      <article className="partner-project" aria-labelledby="tenda-title">
        <div className="partner-project__description">
          <h3 id="tenda-title">Tenda by SCDA</h3>
          <p className="partner-project__subtitle">Luxury tented retreat in southern Bhutan</p>
          <p>Tenda is a proposed luxury retreat by SCDA, an award-winning architecture and design studio founded by Soo Chan. The pilot would bring eight prefabricated guest suites to southern Bhutan, with potential sites in Gelephu and Sarpang. The suites are designed to be raised above the ground to accommodate wildlife movement and reduce flood exposure. They can be dismantled and removed with minimal disturbance to the site.</p>
          <p>The retreat would draw on Bhutan’s rivers, forests and living culture, with experiences such as wildlife encounters and introductions to Bhutan’s 13 traditional arts, hosted by a predominantly Bhutanese team.</p>
        </div>
        <dl className="partner-project__facts">
          <div><dt>Partners sought</dt><dd>An equity investor and a hospitality operator with access to local networks</dd></div>
          <div><dt>Indicative pilot cost</dt><dd>USD 3.2 million for eight guest suites, one service unit and one amenities unit</dd></div>
          <div><dt>Project stage</dt><dd>Prototyped and tested, with modules built in Singapore and Bali</dd></div>
          <div><dt>Production timeline</dt><dd>Approximately four months from funding, plus shipping and customs clearance</dd></div>
        </dl>
        <div className="partner-project__actions">
          {[
            { label: "Download project presentation (PDF)", href: "/files/TendaXGMCPresentation.pdf", download: true },
            { label: "Enquire about Tenda", href: "#enquiries", download: false },
          ].map(({ label, href, download }) => (
            <a key={label} className="button button--gold swap-button partners-cta__button" href={href} download={download || undefined} data-investment-opportunity={download ? undefined : "tenda-scda"}>
              <span className="swap-button__track">
                <span className="swap-button__face">
                  {label}
                  <span className="swap-button__icon" aria-hidden="true"><ArrowRight /></span>
                </span>
                <span className="swap-button__face" aria-hidden="true">
                  {label}
                  <span className="swap-button__icon"><ArrowRight /></span>
                </span>
              </span>
            </a>
          ))}
        </div>
      </article>
    </section>
  );
}
