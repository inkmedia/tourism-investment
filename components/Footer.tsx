"use client";

import { useEffect, useRef } from "react";
import FooterMark from "./FooterMark";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

const exploreLinks = [
  { label: "Why Invest", href: "#why-invest" },
  { label: "Opportunities", href: "#opportunities" },
  { label: "Investment Map", href: "#investment-map" },
  { label: "How to Invest", href: "#how-to-invest" },
  { label: "FAQ", href: "#faq" },
];

function FooterLink({ label, href, external }: { label: string; href: string; external?: boolean }) {
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      <span className="footer-link__track">
        <span className="footer-link__face">
          {label}
        </span>
        <span className="footer-link__face" aria-hidden="true">
          {label}
        </span>
      </span>
    </a>
  );
}

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    if (!("IntersectionObserver" in window)) return;

    gsap.registerPlugin(DrawSVGPlugin);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      let observer: IntersectionObserver | undefined;
      const context = gsap.context(() => {
        const artwork = footer.querySelector(".site-footer__watermark svg");
        const paths = Array.from(footer.querySelectorAll<SVGPathElement>(".site-footer__watermark path"));
        // Build outward from the symbol's centre, rather than following file order.
        const pieces = paths.map((path) => {
          const bounds = path.getBBox();
          const distance = Math.hypot(bounds.x + bounds.width / 2 - 680, bounds.y + bounds.height / 2 - 680);
          return { path, distance, length: path.getTotalLength() };
        }).sort((a, b) => a.distance - b.distance);

        gsap.set(paths, {
          drawSVG: "50% 50%",
          fillOpacity: 0,
          strokeOpacity: 0,
          stroke: "#aa9873",
        });
        const drawing = gsap.timeline({ paused: true });
        drawing.fromTo(artwork, { scale: 0.985, transformOrigin: "50% 50%" }, {
          scale: 1,
          duration: 5,
          ease: "sine.out",
        }, 0);

        pieces.forEach(({ path, length }, index) => {
          const start = index / Math.max(pieces.length - 1, 1) * 1.1;
          const duration = gsap.utils.clamp(2.2, 3.4, 2.2 + length / 7000);
          drawing
            .to(path, { strokeOpacity: 0.8, duration: 0.6, ease: "sine.out" }, start)
            .to(path, {
              drawSVG: "0% 100%",
              duration,
              ease: "power2.inOut",
            }, start)
            .to(path, {
              fillOpacity: 1,
              duration: 1.4,
              ease: "sine.inOut",
            }, start + duration - 0.15)
            .to(path, {
              strokeOpacity: 0,
              duration: 1.1,
              ease: "sine.inOut",
            }, start + duration + 0.2);
        });

        observer = new IntersectionObserver(([entry]) => {
          if (!entry.isIntersecting) return;
          drawing.play();
          observer?.disconnect();
        }, { threshold: 0.12 });
        observer.observe(footer);
      }, footer);
      return () => {
        observer?.disconnect();
        context.revert();
      };
    });
    return () => media.revert();
  }, []);

  return (
    <footer ref={footerRef} className="site-footer">
      <div className="site-footer__watermark" aria-hidden="true">
        <FooterMark monochrome />
      </div>

      <div className="site-footer__inner">
        <div className="site-footer__main">
          <div className="site-footer__intro">
            <a className="footer-brand" href="#top" aria-label="Gelephu Mindfulness City — home">
              <FooterMark />
              <span className="footer-brand__copy">
                <strong>Gelephu</strong>
                <small>Mindfulness City</small>
              </span>
            </a>
            <p>
              Connecting exceptional investors with the opportunity to shape a new
              global destination in the Kingdom of Bhutan.
            </p>
          </div>

          <nav className="site-footer__column" aria-label="Footer navigation">
            <h2>Explore</h2>
            <ul>
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink {...link} />
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-footer__column site-footer__contact">
            <h2>Contact</h2>
            <ul>
              <li>
                <FooterLink label="GMC official website" href="https://gmc.bt" external />
              </li>
              <li>
                <FooterLink label="Investment enquiries" href="#enquiries" />
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer__legal">
          <p>© {new Date().getFullYear()} Gelephu Mindfulness City Tourism Investment. Special Administrative Region, Kingdom of Bhutan.</p>
          <p>All investment figures are indicative only. This website does not constitute investment advice.</p>
        </div>
      </div>
    </footer>
  );
}
