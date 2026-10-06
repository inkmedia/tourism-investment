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
  ShieldCheck,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";
import EnquiryBackdrop from "./EnquiryBackdrop";

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
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const oldOverflow = useRef<string | null>(null);
  const closing = useRef(false);

  useEffect(() => () => {
    animation.current?.kill();
    if (oldOverflow.current !== null) document.body.style.overflow = oldOverflow.current;
  }, []);

  const open = () => {
    if (!dialog.current || !panel.current || dialog.current.open) return;
    closing.current = false;
    oldOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current.scrollTop = 0;
    dialog.current.showModal();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const content = panel.current.querySelectorAll(".enquiry-dialog__header, .enquiry-field, .enquiries__submit, .enquiries__privacy");
    animation.current?.kill();
    animation.current = gsap.timeline()
      .fromTo(dialog.current, { "--backdrop-opacity": 0 }, { "--backdrop-opacity": 1, duration: reduced ? 0 : .45 }, 0)
      .fromTo(panel.current, { yPercent: 105, scaleX: .94, borderTopLeftRadius: 48, borderTopRightRadius: 48 }, { yPercent: 0, scaleX: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, duration: reduced ? 0 : .85, ease: "power4.out" }, 0)
      .fromTo(content, { autoAlpha: 0, y: reduced ? 0 : 18 }, { autoAlpha: 1, y: 0, duration: reduced ? 0 : .4, stagger: reduced ? 0 : .025, ease: "power2.out" }, reduced ? 0 : .28);
  };

  const close = () => {
    if (!dialog.current?.open || closing.current) return;
    closing.current = true;
    animation.current?.kill();
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : .4;
    animation.current = gsap.timeline({ onComplete: () => dialog.current?.close() })
      .to(dialog.current, { "--backdrop-opacity": 0, duration }, 0)
      .to(panel.current, { yPercent: 105, scaleX: .97, duration, ease: "power3.in" }, 0);
  };

  const restore = () => {
    animation.current?.kill();
    if (oldOverflow.current !== null) document.body.style.overflow = oldOverflow.current;
    oldOverflow.current = null;
    closing.current = false;
    trigger.current?.focus({ preventScroll: true });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const body = [
      `Full name: ${values.get("name") || ""}`,
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
      `How they heard about GMC Tourism Investment: ${values.get("source") || ""}`,
    ].join("\n");
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
          <h2 id="enquiries-title">Build with us.</h2>
          <p className="enquiries__lead">
            We are seeking exceptional investors, developers and operators with
            the ambition to create the next generation of tourism and
            hospitality in Gelephu Mindfulness City.
          </p>
        </div>
        <div className="enquiries__invitation">
          <p className="enquiries__welcome">We welcome enquiries from</p>
          <ul className="enquiries__list">
            <li>International hotel and resort developers</li>
            <li>Specialist nature and wellness operators</li>
            <li>Family offices and private investors</li>
            <li>Hospitality brands seeking new markets</li>
            <li>Entrepreneurs with a distinctive vision</li>
          </ul>
          <button ref={trigger} className="button button--gold swap-button enquiries__start" type="button" onClick={open} aria-haspopup="dialog" aria-controls="enquiry-dialog">
            <span className="swap-button__track">
              <span className="swap-button__face">Start a Conversation <span className="swap-button__icon" aria-hidden="true"><ArrowRight /></span></span>
              <span className="swap-button__face" aria-hidden="true">Start a Conversation <span className="swap-button__icon"><ArrowRight /></span></span>
            </span>
          </button>
        </div>
      </div>

      <dialog ref={dialog} id="enquiry-dialog" className="enquiry-dialog" aria-labelledby="enquiry-dialog-title" onCancel={(event) => { event.preventDefault(); close(); }} onClose={restore} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
        <div ref={panel} className="enquiry-dialog__panel" data-lenis-prevent>
          <header className="enquiry-dialog__header">
            <div>
              <p className="enquiries__eyebrow">Investor enquiries</p>
              <h2 id="enquiry-dialog-title">Start a conversation.</h2>
              <p>Tell us about your vision for Gelephu Mindfulness City.</p>
            </div>
            <button className="enquiry-dialog__close" type="button" onClick={close} aria-label="Close enquiry form" autoFocus><X aria-hidden="true" /></button>
          </header>
        <form className="enquiries__form" onSubmit={submit}>
          <div className="enquiries__fields">
            <Field label="Full name" icon={<UserRound />} required>
              <input
                name="name"
                autoComplete="name"
                placeholder="Your name"
                required
              />
            </Field>
            <Field label="Job title" icon={<BriefcaseBusiness />}>
              <input
                name="jobTitle"
                autoComplete="organization-title"
                placeholder="e.g. Managing Director"
              />
            </Field>
            <Field label="Company / fund name" icon={<Building2 />} required>
              <input
                name="company"
                autoComplete="organization"
                placeholder="Organisation name"
                required
              />
            </Field>
            <Field label="Country of domicile" icon={<MapPin />}>
              <input
                name="country"
                autoComplete="country-name"
                placeholder="Country"
              />
            </Field>
            <Field label="Investment sector" icon={<Landmark />} required>
              <select name="sector" defaultValue="" required>
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
              </select>
              <ChevronDown aria-hidden="true" />
            </Field>
            <Field
              label="Indicative investment range"
              icon={<WalletCards />}
              required
            >
              <select name="investmentRange" defaultValue="" required>
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
            <Field label="Brief concept description" icon={<Lightbulb />} wide>
              <textarea
                name="concept"
                rows={2}
                placeholder="Outline your concept, experience profile or brand positioning..."
              />
            </Field>
            <Field
              label="Message / additional context"
              icon={<MessageSquare />}
              wide
            >
              <textarea
                name="message"
                rows={2}
                placeholder="Any additional information or questions..."
              />
            </Field>
            <Field
              label="How did you hear about GMC Tourism Investment"
              icon={<Radio />}
              wide
            >
              <select name="source" defaultValue="">
                <option value="" disabled>
                  Select
                </option>
                <option>GMC website</option>
                <option>Investment conference</option>
                <option>Industry publication</option>
                <option>Direct referral</option>
                <option>Social media</option>
                <option>Other</option>
              </select>
              <ChevronDown aria-hidden="true" />
            </Field>
          </div>
          <button
            className="button button--gold swap-button enquiries__submit"
            type="submit"
          >
            <span className="swap-button__track">
              <span className="swap-button__face">
                Submit enquiry{" "}
                <span className="swap-button__icon" aria-hidden="true">
                  <ArrowRight />
                </span>
              </span>
              <span className="swap-button__face" aria-hidden="true">
                Submit enquiry{" "}
                <span className="swap-button__icon">
                  <ArrowRight />
                </span>
              </span>
            </span>
          </button>
          <p className="enquiries__privacy">
            <ShieldCheck aria-hidden="true" /> Your information is treated in
            strict confidence.
          </p>
        </form>
        </div>
      </dialog>
    </section>
  );
}
