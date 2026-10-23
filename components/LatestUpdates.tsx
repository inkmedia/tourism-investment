import { ArrowUpRight } from "lucide-react";

// Curated news, newest first. Dates are publication dates from the linked source.
const updates = [
  {
    category: "Connectivity",
    date: "2026-10-22",
    dateLabel: "22 October 2026",
    title: "GMC immigration terminal opens with automated e-gates",
    description: "A new pedestrian terminal introduces biometric e-gates for Bhutanese and Indian nationals, improving cross-border connectivity in Gelephu.",
    href: "https://www.bbs.bt/247785/",
  },
  {
    category: "Culture & wellbeing",
    date: "2026-10-22",
    dateLabel: "22 October 2026",
    title: "A new milestone for Dewachen Spiritual Centre",
    description: "His Holiness the Je Khenpo presided over the Salang Tendrel ceremony for a new centre for Buddhist learning and spiritual practice in GMC.",
    href: "https://www.bbs.bt/247772/",
  },
  {
    category: "Visitor experiences",
    date: "2026-10-20",
    dateLabel: "20 October 2026",
    title: "Gelephu prepares accommodation for the 108 Stupas event",
    description: "Preparations for the raising of the 108 Stupas on 1 November include tent accommodation to welcome visitors to Gelephu.",
    href: "https://www.bbs.bt/247666/",
  },
];

export default function LatestUpdates() {
  return (
    <section className="latest-updates" id="latest-updates" aria-labelledby="latest-updates-title">
      <div className="latest-updates__inner">
        <header className="latest-updates__header">
          <div>
            <p className="latest-updates__eyebrow">News & developments</p>
            <h2 id="latest-updates-title">Latest updates</h2>
            <p className="latest-updates__intro">Follow the developments shaping Gelephu Mindfulness City.</p>
          </div>
          <a className="latest-updates__more" href="https://gmc.bt/news" target="_blank" rel="noopener noreferrer">
            More GMC news <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </header>
        <div className="latest-updates__grid">
          {updates.map((update) => (
            <a className="latest-updates__card" key={update.href} href={update.href} target="_blank" rel="noopener noreferrer" aria-label={`Read on BBS: ${update.title}`}>
              <p className="latest-updates__category">{update.category}</p>
              <time dateTime={update.date}>{update.dateLabel}</time>
              <h3>{update.title}</h3>
              <p className="latest-updates__description">{update.description}</p>
              <span className="latest-updates__read">
                Read on BBS <ArrowUpRight size={18} aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
