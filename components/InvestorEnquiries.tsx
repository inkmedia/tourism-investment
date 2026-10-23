"use client";

import {
  BedDouble,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronDown,
  Landmark,
  Lightbulb,
  MapPin,
  MessageSquare,
  Radio,
  ArrowRight,
  Mail,
  UserRound,
  WalletCards,
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import EnquiryBackdrop from "./EnquiryBackdrop";
import PrivacyPolicyLink from "./PrivacyPolicyLink";

type FieldProps = {
  label: string;
  icon: ReactNode;
  required?: boolean;
  children: ReactNode;
  wide?: boolean;
};

function Field({ label, icon, required, children, wide }: FieldProps) {
  return (
    <label className={`enquiry-field ${wide ? "enquiry-field--wide" : ""}`}>
      <span className="enquiry-field__label">
        {icon}
        {label}
        {required ? " *" : ""}
      </span>
      <span className="enquiry-field__control">{children}</span>
    </label>
  );
}

export default function InvestorEnquiries() {
  const [step, setStep] = useState<1 | 2>(1);
  const [draftOpened, setDraftOpened] = useState(false);
  const [source, setSource] = useState("");
  const [sourceOther, setSourceOther] = useState("");
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);

  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    stepHeading.current?.focus({ preventScroll: true });
    // Keep the next step in view on smaller screens.
    stepHeading.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [step]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    const values = new FormData(event.currentTarget);
    const body = [
      `Full name: ${values.get("name") || ""}`,
      `Email address: ${values.get("email") || ""}`,
      `Job title: ${values.get("jobTitle") || ""}`,
      `Company / fund name: ${values.get("company") || ""}`,
      `Country of domicile: ${values.get("country") || ""}`,
      `Investment sector: ${values.get("sector") || ""}`,
      `Indicative investment range: ${values.get("investmentRange") || ""}`,
      `Keys / rooms: ${values.get("keys") || ""}`,
      `Preferred development timeline: ${values.get("timeline") || ""}`,
      "",
      `Brief concept description:\n${values.get("concept") || ""}`,
      "",
      `Message / additional context:\n${values.get("message") || ""}`,
      "",
      `How they heard about GMC Tourism Investment: ${source === "Other" ? `Other: ${sourceOther.trim()}` : source}`,
    ].join("\n");
    setDraftOpened(true);
    window.location.href = `mailto:ghevaram.suthar@inkmedia.in?subject=${encodeURIComponent("Tourism investment enquiry")}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section
      className="enquiries"
      id="enquiries"
      aria-labelledby="enquiries-title"
    >
      <EnquiryBackdrop />
      <div className="enquiries__inner">
        <div className="enquiries__intro">
          <p className="enquiries__eyebrow">Investor enquiries</p>
          <h2 id="enquiries-title">Discuss your investment plans</h2>
          <p className="enquiries__lead">
            We are seeking investors, developers and operators with
            the ambition to create the next generation of tourism and
            hospitality in Gelephu Mindfulness City.
          </p>
          <div className="enquiries__divider" />
          <div className="enquiries__invitation">
          <p className="enquiries__welcome">We welcome enquiries from</p>
          <ul className="enquiries__list">
            <li>International hotel and resort developers</li>
            <li>Specialist nature and wellness operators</li>
            <li>Family offices and private investors</li>
            <li>Hospitality brands seeking new markets</li>
            <li>Entrepreneurs with a distinctive vision</li>
          </ul>
          </div>
        </div>
        <form className="enquiries__form" onSubmit={submit} aria-label="Investor enquiry">
          <h3 className="enquiries__step-heading" ref={stepHeading} tabIndex={-1}>
            <span>0{step} / 02</span> {step === 1 ? "Your details" : "Your investment vision"}
          </h3>
          <fieldset className="enquiries__step" hidden={step !== 1} aria-label="Your details">
          <div className="enquiries__fields">
            <Field label="Full name" icon={<UserRound />} required>
              <input
                name="name"
                autoComplete="name"
                placeholder="Your name"
                required={step === 1}
              />
            </Field>
            <Field label="Job title" icon={<BriefcaseBusiness />}>
              <input
                name="jobTitle"
                autoComplete="organization-title"
                placeholder="e.g. Managing Director"
              />
            </Field>
            <Field label="Company or organisation" icon={<Building2 />} required>
              <input
                name="company"
                autoComplete="organization"
                placeholder="Organisation name"
                required={step === 1}
              />
            </Field>
            <Field label="Country" icon={<MapPin />}>
              <input
                name="country"
                autoComplete="country-name"
                placeholder="Country"
              />
            </Field>
            <Field label="Email address" icon={<Mail />} required>
              <input name="email" type="email" autoComplete="email" required={step === 1} />
            </Field>
            <Field label="Area of interest" icon={<Landmark />} required>
              <select name="sector" defaultValue="" required={step === 1}>
                <option value="" disabled>
                  Select category
                </option>
                <option>Luxury & Ultra-luxury</option>
                <option>Nature & Wildlife Lodges</option>
                <option>Wellness & Longevity</option>
                <option>MICE & Business Events</option>
                <option>Adventure & Outdoor Recreation</option>
                <option>Golf & Sports</option>
                <option>Culture, Food & Entertainment</option>
                <option>Tourism Services & Infrastructure</option>
                <option>Multiple / open to discussion</option>
                <option>Other</option>
              </select>
              <ChevronDown aria-hidden="true" />
            </Field>
          </div>
          </fieldset>
          <fieldset className="enquiries__step enquiries__step--vision" hidden={step !== 2} aria-label="Your investment vision">
            <div className="enquiries__fields">
            <Field
              label="Indicative investment range"
              icon={<WalletCards />}
              required
            >
              <select name="investmentRange" defaultValue="" required={step === 2}>
                <option value="" disabled>
                  Select range
                </option>
                <option>Under USD 5M</option>
                <option>USD 5–10M</option>
                <option>USD 10–25M</option>
                <option>USD 25–50M</option>
                <option>USD 50M+</option>
                <option>TBC / open to discussion</option>
              </select>
              <ChevronDown aria-hidden="true" />
            </Field>
            <Field label="Keys / rooms" icon={<BedDouble />}>
              <input
                name="keys"
                inputMode="numeric"
                placeholder="Estimated number"
              />
            </Field>
            <Field
              label="Preferred development timeline"
              icon={<CalendarDays />}
            >
              <select name="timeline" defaultValue="">
                <option value="" disabled>
                  Select timeline
                </option>
                <option>Within 12 months</option>
                <option>1–2 years</option>
                <option>2–5 years</option>
                <option>Long-term / exploratory</option>
              </select>
              <ChevronDown aria-hidden="true" />
            </Field>
            <Field
              label="How did you hear about us?"
              icon={<Radio />}
            >
              <select name="source" value={source} onChange={(event) => setSource(event.target.value)}>
                <option value="" disabled>
                  Select
                </option>
                <option>GMC website</option>
                <option>Google / search engine</option>
                <option>Word of mouth</option>
                <option>Direct referral</option>
                <option>Social media</option>
                <option>Other</option>
              </select>
              <ChevronDown aria-hidden="true" />
            </Field>
            {source === "Other" && (
              <Field label="Please specify how you heard about us" icon={<Radio />} wide required>
                <input
                  name="sourceOther"
                  value={sourceOther}
                  onChange={(event) => setSourceOther(event.target.value)}
                  placeholder="Tell us where you heard about us"
                  required={step === 2}
                  pattern=".*\S.*"
                  title="Please enter how you heard about us."
                />
              </Field>
            )}
            <Field label="Brief concept description" icon={<Lightbulb />}>
              <textarea
                name="concept"
                rows={2}
                placeholder="Outline your concept, experience profile or brand positioning..."
              />
            </Field>
            <Field
              label="Message / additional context"
              icon={<MessageSquare />}
            >
              <textarea
                name="message"
                rows={2}
                placeholder="Any additional information or questions..."
              />
            </Field>
          </div>
          </fieldset>
          <div className="enquiries__actions">
            {step === 2 && (
              <button className="enquiries__back" type="button" onClick={() => setStep(1)}>
                Back
              </button>
            )}
            <button key={step} className="button button--gold swap-button enquiries__submit" type="submit">
              <span className="swap-button__track">
                <span className="swap-button__face">
                  {step === 1 ? "Continue" : "Submit enquiry"}
                  <span className="swap-button__icon" aria-hidden="true"><ArrowRight /></span>
                </span>
                <span className="swap-button__face" aria-hidden="true">
                  {step === 1 ? "Continue" : "Submit enquiry"}
                  <span className="swap-button__icon"><ArrowRight /></span>
                </span>
              </span>
            </button>
            <span className="enquiries__progress" aria-live="polite">Step {step} of 2</span>
            <p className="enquiries__privacy">
              Please review GMC&apos;s{" "}
              <PrivacyPolicyLink />{" "}
              for information on how your personal data is handled.
            </p>
          </div>
          {draftOpened && <p className="enquiries__status" role="status">Your email app will open with your enquiry. Please send the email to complete your submission.</p>}
        </form>
      </div>
    </section>
  );
}
