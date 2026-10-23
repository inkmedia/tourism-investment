import { readFile } from "node:fs/promises";
import path from "node:path";
import Image from "next/image";
import Header from "@/components/Header";
import HeroIntro from "@/components/HeroIntro";
import HisMajesty from "@/components/HisMajesty";
import Footer from "@/components/Footer";
import WhyInvest from "@/components/WhyInvest";
import Opportunities from "@/components/Opportunities";
import InvestorEnquiries from "@/components/InvestorEnquiries";
import InvestmentJourney from "@/components/InvestmentJourney";
import AvailableInvestments from "@/components/AvailableInvestments";
import PartnersCTA from "@/components/PartnersCTA";
import PlannedAttractions from "@/components/PlannedAttractions";
import LatestUpdates from "@/components/LatestUpdates";
import SiteContext from "@/components/SiteContext";
import WhyInvestNow from "@/components/WhyInvestNow";
import AirportStory from "@/components/AirportStory";
import Advantages from "@/components/Advantages";
import { ArrowRight, FileText, Plane, UsersRound } from "lucide-react";

const heading = ["A new destination.", "A rare hospitality", "opportunity."];

export default async function Home() {
  const logoColours: Record<string, string> = {
    navy: "#3F4A75", slate: "#5C6A7F", burgundy: "#8B2939",
    orange: "#FF7E45", coral: "#FF5C4F", yellow: "#FFD217",
  };
  // Inline the local vector so GSAP can animate its individual shapes.
  const preloaderLogo = (await readFile(
    path.join(process.cwd(), "public/img/logo.svg"), "utf8",
  ))
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, "")
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/g, "")
    .replace(/aria-labelledby="[^"]*"/g, 'aria-hidden="true"')
    .replace(/\bid="([^"]+)"/g, 'data-logo-part="$1"')
    .replace(/class="piece (\w+)"/g, (_, colour: string) =>
      `class="preloader__piece" fill="${logoColours[colour]}"`);

  return (
    <main id="top">
      <HeroIntro logoSvg={preloaderLogo} />
      <Header />
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__scene" aria-hidden="true">
          {["1.jpg", "15.jpg", "16.jpg"].map((image, index) => (
            <div
              key={image}
              className="hero__slide"
            >
              <Image
                src={`/img/${image}`}
                alt=""
                fill
                sizes="110vw"
                preload={index === 0}
                quality={85}
                className="hero__image"
              />
            </div>
          ))}
        </div>
        <div className="hero__shade" aria-hidden="true" />
        <div className="hero__content">
          <p className="hero__eyebrow reveal reveal--eyebrow">
            Gelephu Mindfulness City <span aria-hidden="true">·</span> Kingdom
            of Bhutan
          </p>
          <h1 id="hero-title" className="hero__title">
            {heading.map((line, index) => (
              <span className="hero__line" key={line}>
                <span
                  className={`hero__line-inner hero__line-inner--${index + 1}`}
                >
                  {line}
                </span>
              </span>
            ))}
          </h1>
          <p className="hero__description reveal reveal--description">
            A rare opportunity to invest in a destination being built for
            generations. Be part of His Majesty the King&apos;s visionary
            Gelephu Mindfulness City — where economic ambition, nature,
            wellbeing and responsible development converge. Be part of
            Bhutan&apos;s most ambitious development project and one of
            Asia&apos;s most compelling investment opportunities.
          </p>
          <div className="hero__actions reveal reveal--actions">
            <a
              className="button button--gold swap-button"
              href="#opportunities"
            >
              <span className="swap-button__track">
                <span className="swap-button__face">
                  Explore tourism opportunities{" "}
                  <span className="swap-button__icon" aria-hidden="true">
                    <ArrowRight />
                  </span>
                </span>
                <span className="swap-button__face" aria-hidden="true">
                  Explore tourism opportunities{" "}
                  <span className="swap-button__icon">
                    <ArrowRight />
                  </span>
                </span>
              </span>
            </a>
            <a className="button button--outline swap-button" href="#enquiries">
              <span className="swap-button__track">
                <span className="swap-button__face">
                  Talk to our investment team{" "}
                  <span className="swap-button__icon" aria-hidden="true">
                    <ArrowRight />
                  </span>
                </span>
                <span className="swap-button__face" aria-hidden="true">
                  Talk to our investment team{" "}
                  <span className="swap-button__icon">
                    <ArrowRight />
                  </span>
                </span>
              </span>
            </a>
          </div>
          <dl className="hero__stats" aria-label="Investment highlights">
            <div className="hero__stat">
              <Plane className="hero__stat-icon" strokeWidth={1.4} aria-hidden="true" />
              <dt>International airport opens</dt>
              <dd>December 2029</dd>
            </div>
            <div className="hero__stat">
              <UsersRound className="hero__stat-icon" strokeWidth={1.4} aria-hidden="true" />
              <dt>Passengers a year by 2044</dt>
              <dd>3.1M</dd>
            </div>
            <div className="hero__stat">
              <FileText className="hero__stat-icon" strokeWidth={1.4} aria-hidden="true" />
              <dt>Hotel &amp; retail land lease</dt>
              <dd className="hero__lease-value">60 - 90 <span>years leasehold</span></dd>
            </div>
          </dl>
        </div>
        <div className="hero__bottom-label reveal reveal--label">
          Special Administrative Region
        </div>
      </section>
      <WhyInvest />
      <Opportunities />
      <AvailableInvestments />
      <PartnersCTA />
      <PlannedAttractions />
      <LatestUpdates />
      <SiteContext />
      <WhyInvestNow />
      <AirportStory />
      <Advantages />
      <HisMajesty />
      <InvestmentJourney />
      <InvestorEnquiries />
      <Footer />
    </main>
  );
}
