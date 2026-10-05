import { readFile } from "node:fs/promises";
import path from "node:path";
import Header from "@/components/Header";
import HeroIntro from "@/components/HeroIntro";
import Footer from "@/components/Footer";
import WhyInvest from "@/components/WhyInvest";
import Opportunities from "@/components/Opportunities";
import InvestorEnquiries from "@/components/InvestorEnquiries";
import InvestmentJourney from "@/components/InvestmentJourney";
import OpportunityBooks from "@/components/OpportunityBooks";
import AvailableInvestments from "@/components/AvailableInvestments";
import PlannedAttractions from "@/components/PlannedAttractions";
import SiteContext from "@/components/SiteContext";
import WhyInvestNow from "@/components/WhyInvestNow";
import AirportStory from "@/components/AirportStory";
import Advantages from "@/components/Advantages";
import { ArrowRight } from "lucide-react";

const heading = ["A new destination.", "A rare hospitality", "opportunity."];

export default async function Home() {
  // Use the supplied asset for both the track and its animated stroke.
  const journeySvg = await readFile(
    path.join(process.cwd(), "public/img/investment-path-clean.svg"),
    "utf8",
  );
  const investmentCurve =
    journeySvg.match(
      /<path\b[^>]*\bid="journey-curve"[^>]*\bd="([^"]+)"/,
    )?.[1] ?? "";
  const journeyIcons = await Promise.all(
    [
      "01_explore.svg",
      "02_connect.svg",
      "03_assess.svg",
      "04_structure.svg",
      "05_develop.svg",
    ].map(async (filename) => {
      const svg = await readFile(
        path.join(process.cwd(), "public/img/svg", filename),
        "utf8",
      );
      // Scope the supplied artwork's styles and parts to this component.
      return svg
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, "")
        .replace(/\bid="([^"]+)"/g, 'data-icon-part="$1"');
    }),
  );
  return (
    <main id="top">
      <HeroIntro />
      <Header />
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__scene" aria-hidden="true" />
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
        </div>
        <div className="hero__bottom-label reveal reveal--label">
          Special Administrative Region
        </div>
      </section>
      <WhyInvest />
      <Opportunities />
      <AvailableInvestments />
      <OpportunityBooks />
      <PlannedAttractions />
      <SiteContext />
      <WhyInvestNow />
      <AirportStory />
      <Advantages />
      <InvestmentJourney curve={investmentCurve} icons={journeyIcons} />
      <InvestorEnquiries />
      <Footer />
    </main>
  );
}
