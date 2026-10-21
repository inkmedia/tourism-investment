"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const navigation = [
  { label: "Why Invest", href: "#why-invest" },
  { label: "Opportunities", href: "#opportunities" },
  { label: "How to Invest", href: "#how-to-invest" },
  { label: "About GMC", href: "https://gmc.bt", external: true },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuToggle.current?.focus();
      }
    };
    const desktop = matchMedia("(min-width: 1001px)");
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [menuOpen]);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className={`site-header ${scrolled || menuOpen ? "site-header--solid" : ""} ${scrolled ? "site-header--sticky" : ""} ${menuOpen ? "site-header--menu-open" : ""}`}>
      <a className="brand" href="#top" aria-label="Tourism Investment — home">
        <Image src={scrolled || menuOpen ? "/img/logo_.svg" : "/img/logo-white-2.png"} alt="Gelephu Mindfulness City logo" width={56} height={56} priority />
        <span className="brand__copy">
          <strong>Tourism Investment</strong>
          <small>Gelephu Mindfulness City</small>
        </span>
      </a>

      <button
        ref={menuToggle}
        className="menu-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span /><span />
      </button>

      <nav id="primary-navigation" className={`site-nav ${menuOpen ? "site-nav--open" : ""}`} aria-label="Primary navigation">
        <div className="site-nav__links">
        {navigation.map((item, index) => (
          <a
            className={`site-nav__link site-nav__link--${index + 1}`}
            href={item.href}
            key={item.label}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            <span className="site-nav__link-track">
              <span className="site-nav__link-face">
                {item.label} {item.external && <span className="external-icon" aria-hidden="true">↗</span>}
              </span>
              <span className="site-nav__link-face" aria-hidden="true">
                {item.label} {item.external && <span className="external-icon">↗</span>}
              </span>
            </span>
          </a>
        ))}
        </div>
        <a className="site-nav__cta swap-button" href="#enquiries" onClick={() => setMenuOpen(false)}>
          <span className="swap-button__track">
            <span className="swap-button__face">Talk to our team <span className="swap-button__icon" aria-hidden="true"><ArrowRight /></span></span>
            <span className="swap-button__face" aria-hidden="true">Talk to our team <span className="swap-button__icon"><ArrowRight /></span></span>
          </span>
        </a>
      </nav>
    </header>
  );
}
