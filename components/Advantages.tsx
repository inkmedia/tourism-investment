"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowRight, X } from "lucide-react";
import AdvantagesMosaic from "./AdvantagesMosaic";

const advantages: [string, string, string][] = [
  ["Autonomy", "Special Administrative Region", "Established under Royal Charter with executive, legislative, and judicial autonomy."],
  ["Legal clarity", "Investor-friendly legal framework", "Singapore common law, ADGM regulations, international arbitration, and anti-corruption safeguards."],
  ["Market access", "Strategic market access", "Direct India access via free trade arrangements and border proximity — a gateway to South Asia."],
  ["Clean energy", "Renewable energy advantage", "Powered by clean hydropower within one of the world’s only carbon-negative countries."],
  ["Stability", "Political stability", "Bhutan’s long-standing peace and trusted institutions provide a secure foundation for long-term capital."],
  ["Purpose-built", "Purpose-built city", "Designed from the ground up around mindfulness, sustainability, innovation, and liveability."],
  ["National commitment", "High-level national commitment", "A national priority with coordinated government support across planning, approvals, and implementation."],
  ["First-mover", "First-mover opportunity", "Shape a new economic hub from the ground floor before the market matures."],
  ["Quality of life", "Talent, wellness & quality of life", "Bhutan’s wellness, nature and cultural assets attract talent, residents, and long-stay visitors."],
];
const tenure = [["Residential", "99 years"], ["Hotel & Retail", "60 + 30 years"], ["Ultra High-End Integrated", "99 years"], ["Commercial Office", "60 years"], ["Industrial", "30 + 30 years"], ["Agricultural", "30 + 30 years"]];

export default function Advantages() {
  const [autoPaused, setAutoPaused] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const oldOverflow = useRef<string | null>(null);
  const closing = useRef(false);

  useEffect(() => {
    const panelElement = panel.current;
    const dialogElement = dialog.current;
    return () => {
      if (oldOverflow.current !== null) document.body.style.overflow = oldOverflow.current;
      if (panelElement) gsap.killTweensOf(panelElement);
      if (dialogElement) gsap.killTweensOf(dialogElement);
    };
  }, []);

  const restore = () => {
    if (oldOverflow.current !== null) { document.body.style.overflow = oldOverflow.current; oldOverflow.current = null; }
    closing.current = false;
    opener.current?.focus({ preventScroll: true });
  };
  const animateTickers = (root: HTMLElement, reduced: boolean) => {
    root.querySelectorAll<HTMLElement>("[data-ticker]").forEach((element) => {
      const target = Number(element.dataset.ticker);
      const state = { value: 0 };
      element.textContent = "0%";
      gsap.to(state, { value: target, duration: reduced ? 0 : 1.15, delay: reduced ? 0 : .45, ease: "power3.out", onUpdate: () => { element.textContent = `${Math.round(state.value)}%`; } });
    });
  };
  const open = () => {
    if (dialog.current!.open) return;
    oldOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current!.showModal();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? 0 : .7;
    const header = panel.current!.querySelector(".advantages-dialog__header")!;
    const articles = Array.from(panel.current!.querySelectorAll(".advantages-dialog__grid > article"));
    const details = articles.flatMap((article) => Array.from(article.querySelectorAll("h3, h4, p, hr, .advantages-dialog__tax > div, .advantages-dialog__tenure > div")));
    const path = panel.current!.querySelector(".advantages-dialog__path")!;
    const pathDetails = Array.from(path.querySelectorAll("h3, li"));
    const note = panel.current!.querySelector(":scope > .advantages-dialog__note")!;
    const elements = [header, ...articles, ...details, path, ...pathDetails, note];
    gsap.killTweensOf(elements);
    gsap.set(elements, { autoAlpha: 0, y: 20 });
    gsap.timeline()
      .fromTo(panel.current, { yPercent: 100, borderTopLeftRadius: 36, borderTopRightRadius: 36 }, { yPercent: 0, borderTopLeftRadius: 22, borderTopRightRadius: 22, duration, ease: "power4.out" })
      .to(header, { autoAlpha: 1, y: 0, duration: reduced ? 0 : .42, ease: "power3.out" }, duration ? "-.25" : 0)
      .to(articles, { autoAlpha: 1, y: 0, duration: reduced ? 0 : .38, stagger: .08, ease: "power3.out" }, "<.08")
      .to(details, { autoAlpha: 1, y: 0, duration: reduced ? 0 : .3, stagger: .035, ease: "power2.out" }, "<.06")
      .to(path, { autoAlpha: 1, y: 0, duration: reduced ? 0 : .4, ease: "power3.out" }, "<.08")
      .to(pathDetails, { autoAlpha: 1, y: 0, duration: reduced ? 0 : .28, stagger: .045, ease: "power2.out" }, "<.04")
      .to(note, { autoAlpha: 1, y: 0, duration: reduced ? 0 : .28, ease: "power2.out" }, "<.04");
    animateTickers(panel.current!, reduced);
    gsap.fromTo(dialog.current, { "--backdrop-opacity": 0 }, { "--backdrop-opacity": 1, duration: duration * .65 });
  };
  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const duration = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : .4;
    gsap.to(dialog.current, { "--backdrop-opacity": 0, duration, overwrite: true });
    gsap.to(panel.current, { yPercent: 100, duration, ease: "power3.in", overwrite: true, onComplete: () => dialog.current?.close() });
  };

  return (
    <section
      className="advantages advantages--mosaic"
      aria-labelledby="advantages-title"
      onMouseEnter={() => setAutoPaused(true)}
      onMouseLeave={() => setAutoPaused(false)}
    >
      <div className="advantages__inner">
        <header className="advantages__header"><div><p className="advantages__eyebrow">Why GMC stands apart</p><h2 id="advantages-title">GMC’s unparalleled advantages</h2></div><p>A purpose-built legal, tax, banking and land tenure framework designed to give investors clarity and confidence before the destination fully matures.</p></header>
        <AdvantagesMosaic items={advantages} paused={autoPaused} />
        <footer className="advantages__footer"><p>Select an advantage to explore. Discover the framework behind it.</p><button ref={opener} type="button" onClick={open} className="button button--gold swap-button"><span className="swap-button__track"><span className="swap-button__face">View more <span className="swap-button__icon"><ArrowRight aria-hidden="true" /></span></span><span className="swap-button__face" aria-hidden="true">View more <span className="swap-button__icon"><ArrowRight /></span></span></span></button></footer>
      </div>
      <dialog ref={dialog} className="advantages-dialog" aria-labelledby="advantages-dialog-title" onCancel={(event) => { event.preventDefault(); close(); }} onClose={restore} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
        <div ref={panel} className="advantages-dialog__panel" data-lenis-prevent>
          <header className="advantages-dialog__header"><div><p className="advantages__eyebrow">The investor framework</p><h2 id="advantages-dialog-title">Clarity. Confidence. Opportunity.</h2></div><button type="button" onClick={close} aria-label="Close investor framework" autoFocus><X /></button></header>
          <div className="advantages-dialog__grid">
            <article><h3>Tax competitiveness</h3><dl className="advantages-dialog__tax">{[["Corporate tax", 15], ["Dividends", 0], ["Interest", 10], ["Royalties", 5]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd data-ticker={value}>0%</dd></div>)}</dl></article>
            <article><h3>Banking &amp; capital flows</h3><h4>DK Bank — Fully Digital</h4><p>GMC-incorporated companies access BTN and USD corporate accounts. Individual employee accounts available from day one.</p><hr /><h4>No FX Controls</h4><p>No foreign exchange controls other than for ngultrum. Dual-currency accounts support efficient capital repatriation.</p></article>
            <article><h3>Land tenure</h3><dl className="advantages-dialog__tenure">{tenure.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className="advantages-dialog__note">Each assessed on a case-by-case basis.</p></article>
          </div>
          <div className="advantages-dialog__path"><h3>GMCA investor facilitation — a single end-to-end pathway</h3><ol>{["Proposal review", "Land identification", "Incorporation", "Approvals", "Ongoing operational support"].map((step, index) => <li key={step}><small>{String(index + 1).padStart(2, "0")}</small><span>{step}</span>{index < 4 && <ArrowRight aria-hidden="true" size={15} />}</li>)}</ol></div>
          <p className="advantages-dialog__note">Tax rates and tenure terms are indicative and subject to confirmation by the GMC Authority.</p>
        </div>
      </dialog>
    </section>
  );
}
