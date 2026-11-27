"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { opportunityCopy } from "./opportunityCopy";

export default function OpportunityModal({ title, onClose }: { title: string; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);
  const headingId = useId();
  const copy = opportunityCopy[title];

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(onClose, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180);
    return () => window.clearTimeout(timer);
  }, [closing, onClose]);

  return createPortal(
    <dialog
      ref={dialogRef}
      className={`opportunity-modal${closing ? " is-closing" : ""}`}
      aria-labelledby={headingId}
      onCancel={(event) => { event.preventDefault(); event.stopPropagation(); setClosing(true); }}
      onKeyDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) setClosing(true);
        }
      }}
    >
      <header className="opportunity-modal__header">
        <h2 id={headingId}>{title}</h2>
        <button type="button" aria-label="Close opportunity details" onClick={() => setClosing(true)} autoFocus><X size={21} /></button>
      </header>
      <div className="opportunity-modal__content" data-lenis-prevent>
        {[
          ["The opportunity", copy.opportunity],
          ["What it could include", copy.includes],
          ["How it could be tailored", copy.tailoring],
        ].map(([heading, text]) => (
          <section key={heading}>
            <h3>{heading}</h3>
            <p>{text}</p>
          </section>
        ))}
      </div>
    </dialog>,
    document.body,
  );
}
