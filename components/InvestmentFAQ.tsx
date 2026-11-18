"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

const questions = [
  {
    "question": "What is Gelephu Mindfulness City (GMC) and what is its founding vision?",
    "paragraphs": [
      "Gelephu Mindfulness City (GMC) is His Majesty King Jigme Khesar Namgyel Wangchuck’s global vision to establish an oasis of mindfulness and prosperity amidst increasing global uncertainties and geostrategic challenges. It seeks to offer the world a different path of development, through “Mindful Prosperity”, where traditional Bhutanese values of spirituality and harmony with nature, blends with innovation, technology and economic vibrancy. GMC also serves as His Majesty’s domestic vision to act as a catalyst to lead Bhutan’s administrative reforms and economic advancement under the concept of “One Country, Two Systems” as part of a Special Administrative Region (SAR)."
    ]
  },
  {
    "question": "Where is GMC located, how was it established, and what is its governance structure?",
    "paragraphs": [
      "Located in Bhutan’s southern plains bordering the State of Assam in India and spanning one million acres (or 4,000 km²), and comprising 10 percent of Bhutan, GMC was established by Royal Charter in December 2024 as a highly autonomous SAR. Through the Royal mandate, GMC is accorded full executive and legislative powers, with an independent judiciary."
    ]
  },
  {
    "question": "Who leads GMC and what are its management principles?",
    "paragraphs": [
      "Under the direct guidance of His Majesty, GMC is managed by a global team to build an advanced economy by adopting and adapting the best governing policies and business practices worldwide."
    ]
  },
  {
    "question": "What is the 'Diamond Strategy' and how are GMC and Bhutan expected to evolve?",
    "paragraphs": [
      "Starting from 2025, Bhutan and GMC will implement His Majesty’s “Diamond Strategy” where both jurisdictions follow divergent paths in the initial two decades under the “One Country, Two Systems” framework. GMC is given full autonomy to take steps towards building an advanced economy from the ground-up, while Bhutan pursues its developmental trajectory. From 2045, Bhutan and GMC are expected to take steps to gradually remerge into an advanced economy as “One Country, One System” by 2065. While both Bhutan and GMC may have adopted divergent pathways under “Two Systems”, they will continue to coordinate closely to harmonise policies as and when required."
    ]
  },
  {
    "question": "What makes GMC different from Bhutan and other jurisdictions?",
    "paragraphs": [
      "What makes GMC different from Bhutan is the SAR’s highly autonomous mandate to adopt best-in-class systems or test new ideas in a sandbox in support of its goal to become an advanced economy. Importantly, under His Majesty’s direct guidance, GMC takes a long-term perspective, offers political stability and has the agility to do things differently. These include implementing laws, policies, incentives and systems to make GMC an attractive place to invest, work, live, and play."
    ]
  },
  {
    "question": "What legal and regulatory frameworks support GMC and how do they benefit investors?",
    "paragraphs": [
      "In actual terms, with the investor’s interests front and centre, GMC has adopted and adapted Common Law principles, using Singapore laws for corporate, commercial, and company governance matters (such as company law, employment, taxation matters and anti-corruption law) and Abu Dhabi Global Market regulations for financial services. GMC’s legislation is further supported by an independent judiciary with provisions for international commercial arbitration, when required, to provide assurance to foreign investors."
    ]
  },
  {
    "question": "How does GMC’s geography and infrastructure support its vision?",
    "paragraphs": [
      "Developed on Bhutan’s lower plains, GMC will build Gelephu International Airport that will significantly improve Bhutan’s existing air connectivity. With a runway to accommodate longer range aircraft and operate night and day, GMC will help link Bhutan to major aviation hubs around the world. GMC, with access to abundant renewable energy and land, will offer investors an attractive destination to base clean manufacturing. Located at the border with India and with favourable bilateral inter-governmental agreements, GMC offers manufacturers excellent market access to India. Through the special and unique ties with India, GMC can avail of the network of roads, railways and inland waterways that interconnect GMC to India and the wider region."
    ]
  },
  {
    "question": "What is the underlying philosophy of “Mindful Prosperity” and GMC’s core areas of focus?",
    "paragraphs": [
      "The idea of “Mindful Prosperity” is a recognition by His Majesty that the world cannot continue to develop with little regard for humanity’s need to respect nature and the spiritual. While development must continue for prosperity, it should not be at all costs. To help achieve this vision, GMC’s roadmap focuses on eight core priority industries and sectors."
    ]
  },
  {
    "question": "How will the development of the Gelephu Mindfulness City SAR unfold over time?",
    "paragraphs": [
      "The development of the SAR is expected to unfold in a series of phases."
    ]
  },
  {
    "question": "What is happening in Phase 0 (2025)?",
    "paragraphs": [
      "Phase 0: January to December 2025",
      "The initial phase establishes the SAR’s laws and policies, creates business development and investment frameworks, advances detailed master planning efforts, and launches the Gelephu International Airport (GIA) project. By end 2025, companies registered in GMC will operate from Gelephu, with GMC Authority opening offices in Thimphu and Gelephu. Over a dozen spiritual sites and new tourism programmes will be launched, and key GMC laws and regulations published."
    ]
  },
  {
    "question": "What is envisioned for Phase 1 (2025-2030)?",
    "paragraphs": [
      "Phase 1: 2025 to 2030",
      "Phase 1A: By 2027, Gelephu’s Old Town will be revitalised to feature “showcase” commercial projects to transform the city’s core business centre into a vibrant living and work space.",
      "Phase 1B: By 2030, GIA and railway connectivity with India will be operational, with the core city centre expanded outwards to accommodate more investors, businesses and long-term residents."
    ]
  },
  {
    "question": "What is the focus of Phases 2 & 3 (2030-2045)?",
    "paragraphs": [
      "Phases 2 & 3: 2030 to 2045",
      "The 15-year phase focuses on building a thriving Mindfulness City that will support 200,000 residents with sectoral clusters established in all eight areas."
    ]
  },
  {
    "question": "What is the aim of Phase 4 (2045 onwards)?",
    "paragraphs": [
      "Phase 4: 2045 onwards",
      "This phase aims to complete all the major transformations required to enable GMC to become an advanced economy and recognised as the leading Mindfulness City in the world."
    ]
  },
  {
    "question": "How can investors engage with GMC, and what support is provided?",
    "paragraphs": [
      "For investors, GMC offers a “one stop shop” that provides end-to-end solutions and support. This includes the identification of suitable land plots, guidance on lease agreements, company incorporation and regulatory clearances, coordination with government agencies, visa and employment matters, and investor aftercare. GMC also offers flexible long-term leases designed to provide stability and value to investors."
    ]
  },
  {
    "question": "What are GMC’s business incentives and tax policies for investors?",
    "paragraphs": [
      "GMC offers a simplified and highly competitive corporate tax system with additional incentives available to companies that meet GMC’s requirements. These internationally recognised policies, incentives, and frameworks will provide investors with a sense of familiarity and clarity, and the early confidence to do business in GMC, alongside an attractive, friendly and predictable tax system."
    ]
  },
  {
    "question": "Who regulates the financial sector in GMC and what is its role?",
    "paragraphs": [
      "The Gelephu Financial Services Office (GFSO) serves as an integrated regulator of all financial services activities in GMC (e.g., banking, capital markets, payments, insurance and digital assets). GFSO welcomes financial institutions seeking to carry out regulated financial services in GMC to apply for a license."
    ]
  }
];

function AnimatedQuestion({ children, expanded, onToggle }: { children: ReactNode; expanded: boolean; onToggle: () => void }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const animationRef = useRef<Animation | null>(null);

  useEffect(() => () => { animationRef.current?.cancel(); }, []);

  useEffect(() => {
    const details = detailsRef.current;
    if (!details || (!expanded && !details.open)) return;
    const startHeight = details.getBoundingClientRect().height;
    animationRef.current?.cancel();
    details.dataset.expanded = String(expanded);
    details.open = true;
    const summary = details.querySelector("summary")!;
    const endHeight = expanded ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height + 1;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      details.open = expanded;
      return;
    }
    const animation = details.animate(
      [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
      { duration: 300, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
    animationRef.current = animation;
    animation.onfinish = () => {
      details.open = expanded;
      animationRef.current = null;
    };
  }, [expanded]);

  function toggle(event: MouseEvent<HTMLDetailsElement>) {
    if (!(event.target as Element).closest("summary")) return;
    event.preventDefault();
    onToggle();
  }

  return <details ref={detailsRef} className="investment-faq__item" onClick={toggle}>{children}</details>;
}

export default function InvestmentFAQ() {
  const [showAll, setShowAll] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  function toggleList() {
    if (showAll && activeIndex !== null && activeIndex >= 10) setActiveIndex(null);
    setShowAll(!showAll);
  }

  return (
    <section className="investment-faq" id="faq" aria-labelledby="investment-faq-title">
      <div className="investment-faq__inner">
        <header className="investment-faq__header">
          <p className="investment-faq__eyebrow">Investor information</p>
          <h2 id="investment-faq-title">Frequently Asked Questions</h2>
        </header>
        <div className="investment-faq__content">
        <div className="investment-faq__list" id="investment-faq-questions">
          {questions.slice(0, showAll ? questions.length : 10).map((item, index) => (
            <AnimatedQuestion key={item.question} expanded={activeIndex === index} onToggle={() => setActiveIndex((current) => current === index ? null : index)}>
              <summary className="investment-faq__question">
                <span className="investment-faq__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span>{item.question}</span>
                <span className="investment-faq__icon" aria-hidden="true" />
              </summary>
              <div className="investment-faq__answer">
                {item.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </AnimatedQuestion>
          ))}
        </div>
        <button
          type="button"
          className="investment-faq__toggle"
          aria-expanded={showAll}
          aria-controls="investment-faq-questions"
          onClick={toggleList}
        >
          {showAll ? "Show fewer questions" : "View all Questions"}
          <span aria-hidden="true">{showAll ? "−" : "+"}</span>
        </button>
        </div>
      </div>
    </section>
  );
}
