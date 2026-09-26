import Image from "next/image";

const exploreLinks = [
  { label: "Why Invest", href: "#why-invest" },
  { label: "Opportunities", href: "#opportunities" },
  { label: "Investment Map", href: "#investment-map" },
  { label: "How to Invest", href: "#how-to-invest" },
  { label: "FAQ", href: "#faq", external: true },
];

function FooterLink({ label, href, external }: { label: string; href: string; external?: boolean }) {
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      <span className="footer-link__track">
        <span className="footer-link__face">
          {label}{external && <span className="footer-link__external" aria-hidden="true">↗</span>}
        </span>
        <span className="footer-link__face" aria-hidden="true">
          {label}{external && <span className="footer-link__external">↗</span>}
        </span>
      </span>
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__background" aria-hidden="true" />
      <div className="site-footer__overlay" aria-hidden="true" />

      <div className="site-footer__inner">
        <div className="site-footer__main">
          <div className="site-footer__intro">
            <a className="footer-brand" href="#top" aria-label="Tourism Investment — home">
              <Image src="/img/Logo.png" alt="" width={52} height={52} />
              <span className="footer-brand__copy">
                <strong>Tourism Investment</strong>
                <small>Gelephu Mindfulness City</small>
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
          <p>© 2025 Gelephu Mindfulness City Tourism Investment. Special Administrative Region, Kingdom of Bhutan.</p>
          <p>All investment figures are indicative only. This website does not constitute investment advice.</p>
        </div>
      </div>
    </footer>
  );
}
