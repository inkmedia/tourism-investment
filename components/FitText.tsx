"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Keep short headings on one line, measuring the actual loaded typeface. */
export default function FitText({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current!;
    let active = true;
    const fit = () => {
      if (!active) return;
      element.style.fontSize = "";
      const width = element.clientWidth;
      const naturalWidth = element.scrollWidth;
      if (width > 0 && naturalWidth > width) {
        const size = parseFloat(getComputedStyle(element).fontSize);
        element.style.fontSize = `${size * (width / naturalWidth) * 0.98}px`;
      }
    };
    let lastWidth = -1;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width === lastWidth) return;
      lastWidth = entry.contentRect.width;
      fit();
    });
    observer.observe(element);
    fit();
    document.fonts.ready.then(fit);
    window.addEventListener("resize", fit);
    return () => {
      active = false;
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [children]);

  return (
    <span
      ref={ref}
      style={{ display: "block", width: "100%", whiteSpace: "nowrap" }}
    >
      {children}
    </span>
  );
}
