"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ArrowUpRight, X } from "lucide-react";

const policyUrl = "https://gmc.bt/privacy-policy";

export default function PrivacyPolicyLink() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  const titleId = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const panel = panelRef.current;
    if (!dialog || !panel) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animation = gsap.timeline()
      .fromTo(dialog, { opacity: 0 }, { opacity: 1, duration: reducedMotion ? 0 : 0.25 })
      .fromTo(panel, { y: reducedMotion ? 0 : 24 }, { y: 0, duration: reducedMotion ? 0 : 0.4, ease: "power3.out" }, 0);
    return () => {
      animation.kill();
      gsap.killTweensOf([dialog, panel]);
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.killTweensOf([dialogRef.current, panelRef.current]);
    gsap.to(dialogRef.current, {
      opacity: 0,
      duration: reducedMotion ? 0 : 0.2,
      onComplete: () => {
        setOpen(false);
        closingRef.current = false;
      },
    });
    gsap.to(panelRef.current, { y: reducedMotion ? 0 : 12, duration: reducedMotion ? 0 : 0.2 });
  };

  return (
    <>
      <a
        className="privacy-policy-link"
        href={policyUrl}
        aria-haspopup="dialog"
        onClick={(event) => {
          if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          setOpen(true);
        }}
      >
        Privacy Policy
      </a>
      {open && createPortal(<dialog
        ref={dialogRef}
        className="privacy-modal"
        aria-labelledby={titleId}
        onCancel={(event) => { event.preventDefault(); close(); }}
        onClick={(event) => { if (event.target === event.currentTarget) close(); }}
        data-lenis-prevent
      >
        <div ref={panelRef} className="privacy-modal__panel">
          <header className="privacy-modal__header">
            <div>
              <p>Gelephu Mindfulness City</p>
              <h2 id={titleId}>Privacy Policy</h2>
            </div>
            <button type="button" className="privacy-modal__close" onClick={close} aria-label="Close privacy policy" autoFocus>
              <X aria-hidden="true" size={22} />
            </button>
          </header>
          <div className="privacy-modal__content" tabIndex={0} aria-label="Privacy statement" data-lenis-prevent>
            <div className="privacy-modal__meta">
              <h3>Privacy statement</h3>
              <p>V1.0 (CAA 09052025)</p>
            </div>
            <ol className="privacy-modal__clauses">
              <li>This is a Gelephu Mindfulness City Authority (&quot;GMCA&quot;) digital service.</li>
              <li>We may use &quot;cookies&quot;, where a small data file is sent to your browser to store and track information about you when you enter our digital services. The cookie is used to track information such as the number of users and their frequency of use, profiles of users and their preferred digital services. While this cookie can tell us when you enter our digital services and which pages you visit, it cannot read data off your hard disk.</li>
              <li>You can choose to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. This may prevent you from taking full advantage of the digital service.</li>
              <li>If you provide us with personally identifiable data
                <ol type="a">
                  <li>Where appropriate, we may share necessary data with other GMCA entities, agencies and/or institutions, so as to improve the discharge of public functions, and to serve you in the most efficient and effective way unless such sharing is prohibited by law.</li>
                  <li>We will NOT share your personal data with non-GMCA entities, except where such entities have been authorized to carry out specific GMCA services.</li>
                  <li>For your convenience, we may also display to you data you had previously supplied us or other GMCA entities, agencies and/or institutions. This will speed up the transaction and save you the trouble of repeating previous submissions. Should the data be out-of-date, please supply the latest data</li>
                </ol>
              </li>
              <li>To safeguard your personal data, all electronic storage and transmission of personal data is secured with appropriate security technologies.</li>
              <li>This digital service may contain links to non-GMCA digital services whose data protection and privacy practices may differ from ours. We are not responsible for the content and privacy practices of these other websites and encourage you to consult the privacy notices of those digital services</li>
              <li>Please contact <a href="mailto:dpo@gmc.bt">dpo@gmc.bt</a> if you:
                <ol type="a">
                  <li>have any enquires or feedback on our data protection policies and procedures,</li>
                  <li>need more information on or access to data which you have provided to us in the past.</li>
                </ol>
              </li>
            </ol>
          </div>
          <footer className="privacy-modal__footer">
            <span>Official GMC privacy policy</span>
            <a href={policyUrl} target="_blank" rel="noopener noreferrer">
              Open on GMC website <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </footer>
        </div>
      </dialog>, document.body)}
    </>
  );
}
