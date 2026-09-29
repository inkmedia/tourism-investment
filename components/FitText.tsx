"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

type TitleGroup = { refresh: () => void; release: () => void; users: number };
const groups = new WeakMap<HTMLElement, TitleGroup>();

/** Every card title in a section uses the same size, set by its longest title. */
function createGroup(section: HTMLElement): TitleGroup {
  let frame = 0;
  let active = true;
  const widths = new WeakMap<Element, number>();
  const fit = () => {
    frame = 0;
    if (!active) return;
    const titles = Array.from(section.querySelectorAll<HTMLElement>(".fit-text--single-line"))
      .filter((title) => title.clientWidth > 0);
    if (!titles.length) return;
    let size = Math.min(...titles.map((title) => parseFloat(getComputedStyle(title.parentElement!).fontSize)));
    const apply = () => titles.forEach((title) => {
      title.style.fontSize = `${size}px`;
      (title.firstElementChild as HTMLElement).style.whiteSpace = "nowrap";
    });
    apply();
    const ratio = Math.min(1, ...titles.map((title) =>
      Math.max(1, title.clientWidth - 3) / (title.firstElementChild as HTMLElement).scrollWidth,
    ));
    size *= ratio;
    apply();
    // Check actual glyph widths, including letter spacing, at the shared size.
    while (size > 1 && titles.some((title) =>
      (title.firstElementChild as HTMLElement).scrollWidth > title.clientWidth,
    )) {
      size -= .25;
      apply();
    }
  };
  const schedule = () => {
    if (active && !frame) frame = requestAnimationFrame(fit);
  };
  const observer = new ResizeObserver((entries) => {
    if (entries.some((entry) => {
      const changed = widths.get(entry.target) !== entry.contentRect.width;
      widths.set(entry.target, entry.contentRect.width);
      return changed;
    })) schedule();
  });
  const refresh = () => {
    section.querySelectorAll(".fit-text--single-line").forEach((title) => observer.observe(title));
    fit();
  };
  document.fonts.ready.then(schedule);
  document.fonts.addEventListener("loadingdone", schedule);
  window.addEventListener("resize", schedule);
  return {
    users: 0,
    refresh,
    release: () => {
      active = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", schedule);
      window.removeEventListener("resize", schedule);
    },
  };
}

export default function FitText({ children, singleLine = false }: { children: ReactNode; singleLine?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    if (!singleLine) return;
    const section = ref.current!.closest("section") ?? ref.current!.parentElement!;
    let group = groups.get(section);
    if (!group) {
      group = createGroup(section);
      groups.set(section, group);
    }
    group.users++;
    group.refresh();
    return () => {
      if (--group.users === 0) {
        group.release();
        groups.delete(section);
      }
    };
  }, [children, singleLine]);

  return <span ref={ref} className={`fit-text${singleLine ? " fit-text--single-line" : ""}`}><span>{children}</span></span>;
}
