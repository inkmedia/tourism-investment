"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowRight, X } from "lucide-react";

const advantages = [
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
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [preview, setPreview] = useState(0);
  const letterTimelines = useRef(new Map<number, gsap.core.Timeline>());
  const previousTitle = useRef<number | null>(null);
  const floating = useRef<HTMLDivElement>(null);
  const floatingCard = useRef<HTMLDivElement>(null);
  const aim = useRef({ x: 0, y: 0 });
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const oldOverflow = useRef<string | null>(null);
  const closing = useRef(false);

  useEffect(() => {
    const section = sectionRef.current!;
    const header = headerRef.current!;
    const words = Array.from(wordsRef.current!.querySelectorAll<HTMLElement>(".advantages__word"));
    const footer = footerRef.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;
    gsap.set([header, footer], { autoAlpha: 0, y: 20 });
    gsap.set(words, { autoAlpha: 0, y: 28, rotateX: -8, transformOrigin: "left bottom" });
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      gsap.timeline().to(header, { autoAlpha: 1, y: 0, duration: .65, ease: "power3.out" }).to(words, { autoAlpha: 1, y: 0, rotateX: 0, duration: .72, stagger: .075, ease: "power3.out" }, "<.12").to(footer, { autoAlpha: 1, y: 0, duration: .5, ease: "power2.out" }, "<.18");
      observer.disconnect();
    }, { threshold: .16 });
    observer.observe(section);
    return () => { observer.disconnect(); gsap.killTweensOf([header, ...words, footer]); };
  }, []);

  // Two text faces roll through the same plane, as in Codrops' 3DLettersMenuHover.
  // See THIRD_PARTY_NOTICES.md for attribution and license.
  useLayoutEffect(() => {
    const timelines = letterTimelines.current;
    const context = gsap.context(() => {
      gsap.set(".advantages__face--clone .advantages__letter", { yPercent: -100, rotationX: 90, opacity: 0 });
    }, wordsRef);
    return () => {
      timelines.forEach((timeline) => timeline.kill());
      timelines.clear();
      previousTitle.current = null;
      context.revert();
    };
  }, []);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const buttons = wordsRef.current!.querySelectorAll<HTMLButtonElement>(".advantages__word button");
    const roll = (index: number, entering: boolean) => {
      const original = buttons[index].querySelectorAll(".advantages__face--original .advantages__letter");
      const clone = buttons[index].querySelectorAll(".advantages__face--clone .advantages__letter");
      letterTimelines.current.get(index)?.kill();
      if (reduced) {
        gsap.set(original, { yPercent: 0, rotationX: 0, opacity: 1 });
        gsap.set(clone, { yPercent: -100, rotationX: 90, opacity: 0 });
        return;
      }
      const timeline = gsap.timeline({
        delay: entering ? .1 : 0,
        defaults: { duration: .5, ease: "power2.out", stagger: .025 },
      });
      timeline
        .to(original, { yPercent: entering ? 100 : 0, rotationX: entering ? -90 : 0, opacity: entering ? 0 : 1 }, 0)
        .to(clone, { yPercent: entering ? 0 : -100, rotationX: entering ? 0 : 90, opacity: entering ? 1 : 0 }, 0);
      letterTimelines.current.set(index, timeline);
    };
    if (previousTitle.current !== null && previousTitle.current !== active) roll(previousTitle.current, false);
    if (active !== null) roll(active, true);
    previousTitle.current = active;
  }, [active]);

  // Swap copy only after the outgoing card has finished shrinking.
  // Killing the previous tween also cancels stale swaps during rapid hovering.
  useLayoutEffect(() => {
    const card = floatingCard.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tween: gsap.core.Tween;
    if (active === null) {
      tween = gsap.to(card, { autoAlpha: 0, scale: reduced ? 1 : .78, duration: reduced ? 0 : .2, ease: "power2.in" });
    } else if (active !== preview) {
      tween = gsap.to(card, {
        autoAlpha: 0, scale: reduced ? 1 : .78,
        duration: reduced || Number(gsap.getProperty(card, "opacity")) === 0 ? 0 : .18,
        ease: "power2.in",
        onComplete: () => setPreview(active),
      });
    } else {
      if (Number(gsap.getProperty(card, "opacity")) === 0) gsap.set(card, { scale: reduced ? 1 : .78 });
      tween = gsap.to(card, { autoAlpha: 1, scale: 1, duration: reduced ? 0 : .38, ease: "power3.out" });
    }
    return () => { tween.kill(); };
  }, [active, preview]);

  useEffect(() => {
    const box = floating.current!;
    const card = floatingCard.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (active === null) return;
    // The outer element follows the pointer; the inner card swings independently.
    const position = () => {
      const margin = reduced ? 12 : 38;
      const width = box.offsetWidth, height = box.offsetHeight;
      return {
        x: Math.max(margin, Math.min(innerWidth - width - margin, aim.current.x - width * .65)),
        y: Math.max(margin, Math.min(innerHeight - height - margin, aim.current.y + 28)),
      };
    };
    const target = position();
    const visible = Number(gsap.getProperty(card, "opacity")) > 0;
    let x = visible ? Number(gsap.getProperty(box, "x")) : target.x;
    let y = visible ? Number(gsap.getProperty(box, "y")) : target.y;
    let last = 0, frame = 0, tilt = reduced ? 0 : Number(gsap.getProperty(card, "rotation"));
    gsap.set(box, { x, y });
    const moveX = gsap.quickSetter(box, "x", "px");
    const moveY = gsap.quickSetter(box, "y", "px");
    const rotate = gsap.quickSetter(card, "rotation", "deg");
    const tick = (time: number) => {
      const dt = Math.min(32, time - (last || time - 16));
      last = time;
      const target = position();
      const dx = target.x - x;
      const ease = reduced ? 1 : 1 - Math.exp(-dt / 85);
      x += dx * ease;
      y += (target.y - y) * ease;
      tilt += ((reduced ? 0 : Math.max(-9, Math.min(9, dx * .12))) - tilt) * ease;
      moveX(x); moveY(y); rotate(tilt);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const dismiss = () => setActive(null);
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") dismiss(); };
    const outside = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest(".advantages__word button")) dismiss();
    };
    window.addEventListener("keydown", key);
    window.addEventListener("pointerdown", outside);
    window.addEventListener("scroll", dismiss, { passive: true });
    window.addEventListener("resize", dismiss);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", key);
      window.removeEventListener("pointerdown", outside);
      window.removeEventListener("scroll", dismiss);
      window.removeEventListener("resize", dismiss);
    };
  }, [active]);

  const reveal = (index: number, x: number, y: number) => {
    aim.current = { x, y };
    setActive(index);
  };

  useEffect(() => () => {
    if (oldOverflow.current !== null) document.body.style.overflow = oldOverflow.current;
    if (floatingCard.current) gsap.killTweensOf(floatingCard.current);
    if (panel.current) gsap.killTweensOf(panel.current);
    if (dialog.current) gsap.killTweensOf(dialog.current);
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
    setActive(null);
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
    <section ref={sectionRef} className="advantages" aria-labelledby="advantages-title">
      <div className="advantages__inner">
        <header ref={headerRef} className="advantages__header"><div><p className="advantages__eyebrow">Why GMC stands apart</p><h2 id="advantages-title">GMC’s unparalleled advantages</h2></div><p>A purpose-built legal, tax, banking and land tenure framework designed to give investors clarity and confidence before the destination fully matures.</p></header>
        <div ref={wordsRef} className="advantages__words">
          {advantages.map(([label, title, description], index) => (
            <div className="advantages__word" key={label}>
              <button
                type="button"
                aria-label={label}
                aria-describedby={`advantage-description-${index}`}
                data-active={active === index || undefined}
                onPointerEnter={(event) => { if (event.pointerType === "mouse") reveal(index, event.clientX, event.clientY); }}
                onPointerMove={(event) => { if (event.pointerType === "mouse") aim.current = { x: event.clientX, y: event.clientY }; }}
                onPointerLeave={(event) => { if (event.pointerType === "mouse") setActive(null); }}
                onFocus={(event) => {
                  if (!event.currentTarget.matches(":focus-visible")) return;
                  const rect = event.currentTarget.getBoundingClientRect();
                  reveal(index, rect.left + rect.width / 2, rect.bottom);
                }}
                onBlur={() => setActive(null)}
                onClick={(event) => {
                  if (event.detail > 0 && matchMedia("(hover: hover) and (pointer: fine)").matches) {
                    reveal(index, event.clientX, event.clientY);
                  } else {
                    const rect = event.currentTarget.getBoundingClientRect();
                    reveal(index, rect.left + rect.width / 2, rect.bottom);
                  }
                }}
              >
                <span className="advantages__label" aria-hidden="true">
                  {["original", "clone"].map((face) => (
                    <span className={`advantages__face advantages__face--${face}`} key={face}>
                      {label.split(" ").map((word, wordIndex) => <span className="advantages__token" key={wordIndex}>{wordIndex > 0 && "\u00a0"}{Array.from(word).map((letter, letterIndex) => <span className="advantages__letter" key={letterIndex}>{letter}</span>)}</span>)}
                    </span>
                  ))}
                </span>
                <small aria-hidden="true">{String(index + 1).padStart(2, "0")}</small>
              </button>
              <span className="advantages__sr" id={`advantage-description-${index}`}>{title}. {description}</span>
            </div>
          ))}
        </div>
        <footer ref={footerRef} className="advantages__footer"><p>Explore the advantages. Discover the framework behind them.</p><button ref={opener} type="button" onClick={open} className="button button--gold swap-button"><span className="swap-button__track"><span className="swap-button__face">View more <span className="swap-button__icon"><ArrowRight aria-hidden="true" /></span></span><span className="swap-button__face" aria-hidden="true">View more <span className="swap-button__icon"><ArrowRight /></span></span></span></button></footer>
      </div>
      <div ref={floating} className="advantages__floating" aria-hidden="true">
        <div ref={floatingCard} className="advantages__floating-card">
          <span className="advantages__eyebrow">{String(preview + 1).padStart(2, "0")} / Why GMC stands apart</span>
          <h3>{advantages[preview][1]}</h3>
          <p>{advantages[preview][2]}</p>
        </div>
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
