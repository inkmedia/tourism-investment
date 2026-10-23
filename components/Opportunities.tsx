"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { observePlaybackVisibility } from "./playbackVisibility";

const areas = [
  {
    title: "Accommodation & Hospitality",
    image: "17.jpg",
    alt: "Terraced hospitality buildings surrounded by forested hills",
    description: "Resorts, eco-lodges, glamping retreats, capsule stays, wellness farms, boutique accommodation, and other distinctive stay formats.",
  },
  {
    title: "Attractions & Leisure",
    image: "19.jpg",
    alt: "Sculptural spiral interior with a sunlit central opening",
    description: "Theme parks, water parks, cable cars, adventure parks, promenades, family entertainment facilities, and scenic leisure products.",
  },
  {
    title: "Culture & Heritage",
    image: "39.jpg",
    alt: "Bhutanese architecture with richly painted traditional details",
    description: "Heritage villages, craft experiences, Bhutanese cuisine, cultural weekends, traditional games, storytelling, local design, performance, and visitor orientation experiences rooted in Bhutanese identity.",
  },
  {
    title: "Wellness & Mindfulness",
    image: "43.jpg",
    alt: "Quiet timber retreat overlooking the water and distant mountains",
    description: "Hot spring resorts, meditation programmes, yoga, wellness retreats, slow living experiences, farm-based restoration, mindful leadership retreats, and nature-based wellbeing.",
  },
  {
    title: "Nature & Eco-Tourism",
    image: "32.jpg",
    alt: "Lush green landscape and clear water surrounded by forest",
    description: "Birdwatching, eco-lodges, river activities, scenic cycling, nature walks, firefly experiences, outdoor learning, biodiversity interpretation, and low-impact nature-based tourism.",
  },
  {
    title: "Events & Activities",
    image: "9.jpg",
    alt: "People gathering in a landscaped public square",
    description: "Festivals, markets, races, night walks, food events, cultural weekends, outdoor film screenings, creative programming, and seasonal activities that bring regular energy to GMC.",
  },
  {
    title: "Retail, F&B & Lifestyle",
    image: "41.jpg",
    alt: "Lively shopping street framed by Bhutanese architecture",
    description: "Food halls, dessert streets, cafés, restaurants, lifestyle retail, pop-up markets, craft stalls, wellness products, and small business opportunities linked to visitor spending.",
  },
];

export default function Opportunities() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectionRevision, setSelectionRevision] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const active = areas[activeIndex];

  // Restart the three-second countdown after each manual selection.
  useEffect(() => {
    let timer = 0;
    const stop = observePlaybackVisibility(sectionRef.current!, (playing) => {
      window.clearTimeout(timer);
      if (playing) {
        timer = window.setTimeout(() => {
          setActiveIndex((current) => (current + 1) % areas.length);
        }, 3000);
      }
    });
    return () => {
      stop();
      window.clearTimeout(timer);
    };
  }, [activeIndex, selectionRevision]);

  function selectArea(index: number) {
    setActiveIndex(index);
    setSelectionRevision((current) => current + 1);
  }

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        next = (index + 1) % areas.length;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        next = (index - 1 + areas.length) % areas.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = areas.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    buttons.current[next]?.focus();
  }

  return (
    <section ref={sectionRef} className="tourism-areas" id="opportunities" aria-labelledby="tourism-areas-title">
      <div className="tourism-areas__inner">
        <div className="tourism-areas__selection">
          <header className="tourism-areas__header">
            <p className="how-to-invest__eyebrow">Tourism opportunity areas</p>
            <h2 id="tourism-areas-title">We welcome investment partners in the following areas:</h2>
          </header>
          <div className="tourism-areas__list" role="group" aria-label="Choose a tourism opportunity area">
            {areas.map((area, index) => (
              <button
                key={area.title}
                ref={(element) => { buttons.current[index] = element; }}
                type="button"
                className={`tourism-areas__item${index === activeIndex ? " is-active" : ""}`}
                aria-label={area.title}
                aria-pressed={index === activeIndex}
                aria-controls="tourism-area-detail"
                onMouseEnter={() => selectArea(index)}
                onFocus={() => selectArea(index)}
                onClick={() => selectArea(index)}
                onKeyDown={(event) => navigate(event, index)}
              >
                <span className="tourism-areas__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span className="tourism-areas__label">{area.title}</span>
              </button>
            ))}
          </div>
        </div>
        <figure className="tourism-areas__feature" id="tourism-area-detail" aria-labelledby="tourism-area-heading">
          {areas.map((area, index) => (
            <Image
              key={area.image}
              src={`/img/img/${area.image}`}
              alt={index === activeIndex ? area.alt : ""}
              aria-hidden={index !== activeIndex}
              fill
              sizes="(max-width: 760px) calc(100vw - 48px), (max-width: 1600px) 46vw, 736px"
              className={`tourism-areas__image${index === activeIndex ? " is-active" : ""}`}
            />
          ))}
          <figcaption className="tourism-areas__caption" key={active.title}>
            <h3 id="tourism-area-heading">{active.title}</h3>
            <p>{active.description}</p>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
