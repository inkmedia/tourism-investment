"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import AdvantagesMosaic from "./AdvantagesMosaic";
import FooterMark from "./FooterMark";

const advantages: [string, string, string][] = [
  ["First-mover opportunity", "First-mover opportunity", "Shape a new economic hub from the ground floor before the market matures."],
  ["Legal framework", "Investor-friendly legal framework", "Singapore common law, ADGM regulations, international arbitration, and anti-corruption safeguards."],
  ["Market access", "Strategic market access", "Direct India access via free trade arrangements and border proximity — a gateway to South Asia."],
  ["Clean energy", "Renewable energy advantage", "Powered by clean hydropower within one of the world’s only carbon-negative countries."],
  ["Long-term stability", "Political stability", "Bhutan’s long-standing peace and trusted institutions provide a secure foundation for long-term capital."],
  ["Integrated planning", "Purpose-built city", "Designed from the ground up around mindfulness, sustainability, innovation, and liveability."],
  ["National commitment", "High-level national commitment", "A national priority with coordinated government support across planning, approvals, and implementation."],
  ["Administrative autonomy", "Special Administrative Region", "Established under Royal Charter with executive, legislative, and judicial autonomy."],
  ["Quality of life", "Talent, wellness & quality of life", "Bhutan’s wellness, nature and cultural assets attract talent, residents, and long-stay visitors."],
];
const tenure = [["Residential", "99 years"], ["Hotel & Retail", "60 - 90 years leasehold"], ["Ultra High-End Integrated", "99 years"], ["Commercial Office", "60 years"], ["Industrial", "30 + 30 years"], ["Agricultural", "30 + 30 years"]];

export default function Advantages() {
  const advantagesSection = useRef<HTMLElement>(null);
  const framework = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = advantagesSection.current!;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const pieces = Array.from(section.querySelectorAll<SVGPathElement>(".advantages__watermark path"));
      pieces.forEach((piece, index) => {
        const length = piece.getTotalLength();
        gsap.set(piece, {
          opacity: 0, fillOpacity: 0, strokeOpacity: 1,
          strokeDasharray: length, strokeDashoffset: length,
          x: index % 2 === 0 ? -40 : 40, y: 35,
        });
      });
      // Match the outline drawing and soft fill used in The investment case.
      const timeline = gsap.timeline({ paused: true })
        .to(pieces, {
          opacity: 1, x: 0, y: 0, strokeDashoffset: 0,
          duration: 1.5, stagger: { amount: 0.7, from: "center" }, ease: "power2.out",
        })
        .to(pieces, {
          fillOpacity: 1, strokeOpacity: 0,
          duration: 0.8, stagger: { amount: 0.5, from: "center" }, ease: "sine.inOut",
        }, 0.9);
      const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        timeline.play();
        observer.disconnect();
      }, { threshold: 0.16 });
      observer.observe(section);
      return () => observer.disconnect();
    }, section);
    return () => media.revert();
  }, []);

  useLayoutEffect(() => {
    const section = framework.current!;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const timelines = new Map<Element, gsap.core.Timeline>();
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          timelines.get(entry.target)?.play();
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

      // Reveal each block as it arrives, including the stacked mobile layout.
      const blocks = section.querySelectorAll<HTMLElement>(
        ".investor-framework__header, .investor-framework__grid > article, .investor-framework__path, .investor-framework__inner > .investor-framework__note",
      );
      blocks.forEach((block) => {
        const details = block.querySelectorAll(
          "h3, h4, p, hr, .investor-framework__tax > div, .investor-framework__tenure > div, li",
        );
        gsap.set([block, ...details], { opacity: 0, y: 20 });
        const timeline = gsap.timeline({ paused: true })
          .to(block, { opacity: 1, y: 0, duration: 0.42, ease: "power3.out" });
        if (details.length) {
          timeline.to(details, {
            opacity: 1, y: 0, duration: 0.3, stagger: 0.045, ease: "power2.out",
          }, 0.08);
        }
        block.querySelectorAll<HTMLElement>("[data-ticker]").forEach((element) => {
          const counter = { value: 0 };
          element.textContent = "0%";
          timeline.to(counter, {
            value: Number(element.dataset.ticker), duration: 1.15, ease: "power3.out",
            onUpdate: () => { element.textContent = `${Math.round(counter.value)}%`; },
          }, 0.3);
        });
        timelines.set(block, timeline);
        observer.observe(block);
      });
      return () => {
        observer.disconnect();
        section.querySelectorAll<HTMLElement>("[data-ticker]").forEach((element) => {
          element.textContent = `${element.dataset.ticker}%`;
        });
      };
    }, section);
    return () => media.revert();
  }, []);
  return (
    <>
    <section
      ref={advantagesSection}
      className="advantages advantages--mosaic"
      aria-labelledby="advantages-title"
    >
      <div className="advantages__watermark advantages__watermark--top-right" aria-hidden="true"><FooterMark monochrome /></div>
      <div className="advantages__watermark advantages__watermark--bottom-left" aria-hidden="true"><FooterMark monochrome /></div>
      <div className="advantages__inner">
        <header className="advantages__header"><div><p className="advantages__eyebrow">Why GMC stands apart</p><h2 id="advantages-title">The advantages of investing in GMC</h2></div><p>Explore the city’s approach to business, governance and development.</p></header>
        <AdvantagesMosaic items={advantages} />
        <footer className="advantages__footer"><p>Select an advantage to read more.</p></footer>
      </div>
    </section>
    <section ref={framework} id="investor-framework" className="investor-framework" aria-labelledby="investor-framework-title">
      <div className="investor-framework__inner">
        <header className="investor-framework__header"><div><p className="advantages__eyebrow">The investor framework</p><h2 id="investor-framework-title">Clarity. Confidence. Opportunity.</h2></div></header>
          <div className="investor-framework__grid">
            <article><h3>Tax competitiveness</h3><dl className="investor-framework__tax">{[["Corporate tax", 15], ["Dividends", 0], ["Interest", 10], ["Royalties", 5]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd aria-label={`${value}%`}><span aria-hidden="true" data-ticker={value}>{value}%</span></dd></div>)}</dl></article>
            <article><h3>Banking &amp; capital flows</h3><h4>DK Bank — Fully Digital</h4><p>GMC-incorporated companies access BTN and USD corporate accounts. Individual employee accounts available from day one.</p><hr /><h4>No FX Controls</h4><p>No foreign exchange controls other than for ngultrum. Dual-currency accounts support efficient capital repatriation.</p></article>
            <article><h3>Land tenure</h3><dl className="investor-framework__tenure">{tenure.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className="investor-framework__note">Each assessed on a case-by-case basis.</p></article>
          </div>
          <div className="investor-framework__path"><h3>GMCA investor facilitation — a single end-to-end pathway</h3><ol>{["Proposal review", "Land identification", "Incorporation", "Approvals", "Ongoing operational support"].map((step, index) => <li key={step}><small>{String(index + 1).padStart(2, "0")}</small><span>{step}</span>{index < 4 && <ArrowRight aria-hidden="true" size={15} />}</li>)}</ol></div>
          <p className="investor-framework__note">Tax rates and tenure terms are indicative and subject to confirmation by the GMC Authority.</p>
        </div>
    </section>
    </>
  );
}
