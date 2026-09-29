"use client";

import FitText from "@/components/FitText";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RotateCw,
} from "lucide-react";

import {
  categories,
  opportunities,
  opportunityDetails,
} from "./investmentData";

function SwapLabel({
  text,
  back = false,
  expanded,
}: {
  text: string;
  back?: boolean;
  expanded?: boolean;
}) {
  const Icon =
    expanded !== undefined
      ? expanded
        ? ChevronUp
        : ChevronDown
      : back
        ? ArrowLeft
        : ArrowRight;
  return (
    <span className="swap-button__track">
      <span className="swap-button__face">
        {text}
        <Icon size={14} aria-hidden="true" />
      </span>
      <span className="swap-button__face" aria-hidden="true">
        {text}
        <Icon size={14} />
      </span>
    </span>
  );
}

function InvestmentCard({
  item,
  index,
}: {
  item: (typeof opportunities)[number];
  index: number;
}) {
  const [flipped, setFlipped] = useState(false);
  const details = opportunityDetails[item.id];
  const frontRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const scrollStart = useRef(0);
  function flip(value: boolean) {
    setFlipped(value);
    requestAnimationFrame(() =>
      (value ? backRef : frontRef).current?.focus({ preventScroll: true }),
    );
  }
  const [category, color] = categories[item.category];
  return (
    <li
      data-investment-reveal
      className={`available-card${flipped ? " is-flipped" : ""}`}
      style={
        {
          "--category-color": color,
          "--reveal-delay": `${(index % 4) * 75}ms`,
        } as CSSProperties
      }
      onKeyDown={(event) => {
        if (event.key === "Escape" && flipped) flip(false);
      }}
    >
      <button
        ref={frontRef}
        tabIndex={flipped ? -1 : 0}
        aria-hidden={flipped}
        className="available-card__toggle"
        onClick={() => flip(true)}
        aria-pressed={flipped}
        aria-label={`${flipped ? "Back to overview" : "View details"}: ${item.title}`}
      />
      <div className="available-card__rotator">
        <article
          className="available-card__face available-card__front"
          inert={flipped}
          aria-hidden={flipped}
        >
          <div className="available-card__image">
            <Image
              src={item.image}
              alt=""
              fill
              sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 25vw"
            />
            <span className="available-card__flip-icon" aria-hidden="true">
              <RotateCw size={17} />
            </span>
            <span className="available-card__image-number" aria-hidden="true">
              {String(item.id + 1).padStart(2, "0")}
            </span>
          </div>
          <div className="available-card__body">
            <span className="available-card__category">{category}</span>
            <h3><FitText singleLine>{item.title}</FitText></h3>
            <div className="available-card__bottom">
              <div>
                <span className="available-card__label">Investment</span>
                <p>{item.investment}</p>
              </div>
              <span className="available-card__explore" aria-hidden="true">
                <SwapLabel text="Explore" />
              </span>
            </div>
          </div>
        </article>
        <article
          className="available-card__face available-card__back"
          inert={!flipped}
          aria-hidden={!flipped}
        >
          <div
            className="available-card__back-heading"
            onClick={() => flip(false)}
          >
            <div className="available-card__back-top">
              <span className="available-card__category">{category}</span>
              <RotateCw size={16} aria-hidden="true" />
            </div>
            <h3><FitText singleLine>{item.title}</FitText></h3>
          </div>
          <div
            ref={backRef}
            className="available-card__scroll"
            tabIndex={flipped ? 0 : -1}
            role="region"
            aria-label={`${item.title} details. Scroll to read more.`}
            data-lenis-prevent
            onPointerDown={(event) => {
              scrollStart.current = event.currentTarget.scrollTop;
            }}
            onClick={(event) => {
              if (
                (event.target as HTMLElement).closest("a, button") ||
                Math.abs(event.currentTarget.scrollTop - scrollStart.current) >
                  4 ||
                window.getSelection()?.toString()
              )
                return;
              flip(false);
            }}
          >
            {details ? (
              <>
                <dl className="available-card__metrics">
                  <div>
                    <dt>Target IRR</dt>
                    <dd>{details.irr}</dd>
                  </div>
                  <div>
                    <dt>Timeline</dt>
                    <dd>{details.timeline}</dd>
                  </div>
                  <div>
                    <dt>Investment</dt>
                    <dd>{item.investment}</dd>
                  </div>
                </dl>
                <div className="available-card__detail">
                  <h4>Overview</h4>
                  <p>{details.overview}</p>
                </div>
                <div className="available-card__detail">
                  <h4>Key highlights</h4>
                  <ul>
                    {details.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                </div>
                <a
                  className="available-card__enquire swap-button"
                  href="#enquiries"
                >
                  <SwapLabel text="Enquire now" />
                </a>
                <p className="available-card__legal">
                  Figures are indicative only. IRR targets are unaudited
                  projections and do not constitute a guarantee of returns.
                </p>
              </>
            ) : (
              <>
                <div className="available-card__detail">
                  <h4>The opportunity</h4>
                  <p>
                    {item.description ||
                      "Detailed opportunity information will be added soon."}
                  </p>
                </div>
                <div className="available-card__back-investment">
                  <span className="available-card__label">
                    Indicative investment
                  </span>
                  <p>{item.investment}</p>
                </div>
              </>
            )}
          </div>
          <button
            className="available-card__return swap-button"
            onClick={() => flip(false)}
          >
            <SwapLabel text="Back to overview" back />
          </button>
        </article>
      </div>
    </li>
  );
}

export default function AvailableInvestments() {
  const [category, setCategory] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = sectionRef.current;
    if (
      !section ||
      !window.IntersectionObserver ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const targets = section.querySelectorAll<HTMLElement>(
      "[data-investment-reveal]:not(.has-revealed)",
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("has-revealed");
          entry.target.classList.remove("reveal-pending");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08 },
    );
    targets.forEach((target) => {
      target.classList.add("reveal-pending");
      observer.observe(target);
    });
    return () => {
      observer.disconnect();
      targets.forEach((target) => target.classList.remove("reveal-pending"));
    };
  }, [category, expanded]);
  const filtered = opportunities.filter(
    (item) => category === null || item.category === category,
  );
  const visible = expanded ? filtered : filtered.slice(0, 8);
  return (
    <section
      ref={sectionRef}
      className="available-investments"
      id="available-investments"
      aria-labelledby="available-investments-title"
    >
      <div className="available-investments__inner">
        <header
          data-investment-reveal
          className="available-investments__header"
        >
          <div>
            <p className="available-investments__eyebrow">
              Current opportunities
            </p>
            <h2 id="available-investments-title">
              Available investment
              <br />
              opportunities
            </h2>
          </div>
          <p className="available-investments__disclaimer">
            All figures are indicative only and subject to change. IRR targets
            are unaudited projections and do not constitute a guarantee of
            returns. Click any card to discover more.
          </p>
        </header>
        <div
          data-investment-reveal
          className="available-investments__filters"
          ref={filterRef}
        >
          <div className="available-investments__filter-heading">
            <span id="investment-type-label">Find your opportunity</span>
            <span role="status" aria-live="polite">
              {filtered.length} opportunities
            </span>
          </div>
          <div
            className="available-investments__pills"
            role="group"
            aria-labelledby="investment-type-label"
          >
            <button
              aria-pressed={category === null}
              onClick={() => {
                setCategory(null);
                setExpanded(false);
              }}
            >
              All types
            </button>
            {categories.map(([name, color], index) => (
              <button
                key={name}
                style={{ "--category-color": color } as CSSProperties}
                aria-pressed={category === index}
                onClick={() => {
                  setCategory(index);
                  setExpanded(false);
                }}
              >
                <span aria-hidden="true" />
                {name}
              </button>
            ))}
          </div>
        </div>
        <ul className="available-investments__grid" id="investment-results">
          {visible.map((item, index) => (
            <InvestmentCard
              key={`${category}-${item.id}`}
              item={item}
              index={index}
            />
          ))}
        </ul>
        {filtered.length > 8 && (
          <div data-investment-reveal className="available-investments__more">
            <p>
              Showing {visible.length} of {filtered.length} opportunities
            </p>
            <button
              className="swap-button"
              aria-expanded={expanded}
              aria-controls="investment-results"
              onClick={() => {
                setExpanded(!expanded);
                if (expanded)
                  filterRef.current?.scrollIntoView({
                    block: "start",
                    behavior: "instant",
                  });
              }}
            >
              <SwapLabel
                text={
                  expanded
                    ? "Show fewer opportunities"
                    : "View all opportunities"
                }
                expanded={expanded}
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
