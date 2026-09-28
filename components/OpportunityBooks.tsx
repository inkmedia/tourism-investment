"use client";

import { useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { ArrowRight, X } from "lucide-react";
import {
  categories,
  opportunities,
  opportunityDetails,
} from "./investmentData";

function SwapLabel({ text }: { text: string }) {
  return (
    <span className="swap-button__track">
      <span className="swap-button__face">
        {text} <ArrowRight size={15} aria-hidden="true" />
      </span>
      <span className="swap-button__face" aria-hidden="true">
        {text} <ArrowRight size={15} />
      </span>
    </span>
  );
}

function TwoLineTitle({ title }: { title: string }) {
  const words = title.split(" ");
  let firstLine = "";
  let secondLine = "";
  const midpoint = title.length / 2;

  words.forEach((word) => {
    if (!secondLine && `${firstLine} ${word}`.trim().length <= midpoint) {
      firstLine = `${firstLine} ${word}`.trim();
    } else {
      secondLine = `${secondLine} ${word}`.trim();
    }
  });

  if (!secondLine) {
    const splitAt = Math.ceil(words.length / 2);
    firstLine = words.slice(0, splitAt).join(" ");
    secondLine = words.slice(splitAt).join(" ");
  }

  return (
    <>
      {firstLine}
      <br />
      {secondLine}
    </>
  );
}

function BookCard({ item, index }: { item: (typeof opportunities)[number]; index: number }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const details = opportunityDetails[item.id];
  const panelId = `opportunity-book-${item.id}`;
  function toggle(value: boolean) {
    setOpen(value);
    requestAnimationFrame(() =>
      (value ? close : trigger).current?.focus({ preventScroll: true }),
    );
  }
  return (
    <li
      className={`opportunity-book${open ? " is-open" : ""}`}
      style={{
        "--category-color": categories[item.category][1],
        "--book-delay": `${(index % 4) * 70}ms`,
      } as CSSProperties}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) toggle(false);
      }}
    >
      <article
        className="opportunity-book__page"
        id={panelId}
        inert={!open}
        aria-hidden={!open}
      >
        <div className="opportunity-book__page-top">
          <span className="opportunity-book__category">
            {categories[item.category][0]}
          </span>
          <button
            ref={close}
            onClick={() => toggle(false)}
            aria-label={`Close ${item.title}`}
          >
            <X size={18} />
          </button>
        </div>
        <h3>{item.title}</h3>
        <div
          className="opportunity-book__details"
          data-lenis-prevent
          tabIndex={open ? 0 : -1}
          role="region"
          aria-label={`${item.title} full details`}
        >
          <dl>
            <div>
              <dt>Indicative investment</dt>
              <dd>{item.investment}</dd>
            </div>
            {details && (
              <>
                <div>
                  <dt>Target IRR</dt>
                  <dd>{details.irr}</dd>
                </div>
                <div>
                  <dt>Timeline</dt>
                  <dd>{details.timeline}</dd>
                </div>
              </>
            )}
          </dl>
          <h4>{details ? "Overview" : "The opportunity"}</h4>
          <p>
            {details?.overview ||
              item.description ||
              "Detailed opportunity information will be added soon."}
          </p>
          {details && (
            <>
              <h4>Key highlights</h4>
              <ul>
                {details.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </>
          )}
          <a
            className="opportunity-book__enquire swap-button"
            href="#enquiries"
          >
            <SwapLabel text="Enquire now" />
          </a>
          <p className="opportunity-book__legal">
            Figures are indicative only. IRR targets are unaudited projections
            and do not constitute a guarantee of returns.
          </p>
        </div>
      </article>
      <button
        ref={trigger}
        className="opportunity-book__cover"
        data-category={categories[item.category][0]}
        inert={open}
        aria-hidden={open}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Explore ${item.title}`}
        onClick={() => toggle(true)}
      >
        <Image
          src={item.image}
          alt=""
          fill
          sizes="(max-width: 650px) 100vw, (max-width: 1100px) 50vw, 33vw"
        />
        <span className="opportunity-book__spine-label" aria-hidden="true">
          {categories[item.category][0]}
        </span>
        <div className="opportunity-book__cover-copy">
          {/* <span className="opportunity-book__category">
            {categories[item.category][0]}
          </span> */}
          <h3>
            <TwoLineTitle title={item.title} />
          </h3>
          <span className="opportunity-book__explore swap-button">
            <SwapLabel text="Explore" />
          </span>
        </div>
      </button>
    </li>
  );
}

export default function OpportunityBooks() {
  const [category, setCategory] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const section = useRef<HTMLElement>(null);
  const filtered = opportunities.filter(
    (item) => category === null || item.category === category,
  );
  const visible = expanded ? filtered : filtered.slice(0, 8);
  return (
    <section
      ref={section}
      className="opportunity-books"
      id="explore-opportunities"
      aria-labelledby="opportunity-books-title"
    >
      <header className="opportunity-books__header">
        <div>
          <p className="available-investments__eyebrow">
            Explore the possibilities
          </p>
          <h2 id="opportunity-books-title">Find your opportunity</h2>
        </div>
        <p>
          Every opportunity has a story.
          <br />
          Click to open a card and discover the details.
        </p>
      </header>
      <div
        className="available-investments__pills"
        role="group"
        aria-label="Filter opportunities by category"
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
        {categories.map(([name], index) => (
          <button
            key={name}
            style={
              { "--category-color": categories[index][1] } as CSSProperties
            }
            aria-pressed={category === index}
            onClick={() => {
              setCategory(index);
              setExpanded(false);
            }}
          >
            {name}
          </button>
        ))}
      </div>
      <p className="opportunity-books__count" role="status">
        {filtered.length} opportunities
      </p>
      <ul className="opportunity-books__grid">
        {visible.map((item, index) => (
          <BookCard key={`${category}-${item.id}`} item={item} index={index} />
        ))}
      </ul>
      {filtered.length > 8 && (
        <div className="opportunity-books__more">
          <button
            aria-expanded={expanded}
            onClick={() => {
              setExpanded(!expanded);
              if (expanded)
                section.current?.scrollIntoView({
                  block: "start",
                  behavior: "instant",
                });
            }}
          >
            {expanded ? "Show fewer opportunities" : "View all opportunities"}
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
