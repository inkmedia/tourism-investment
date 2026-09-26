"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export default function SmoothScroll() {
  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | undefined;

    // Prevent a refresh from inheriting the position of the previous page visit.
    window.scrollTo(0, 0);

    // The intro locks the body until its animation finishes.
    const syncScrollLock = () => {
      if (!lenis) return;
      const locked = ["hidden", "clip"].includes(getComputedStyle(document.body).overflowY);
      if (locked) lenis.stop();
      else lenis.start();
    };

    const setup = () => {
      lenis?.destroy();
      lenis = undefined;
      window.scrollTo(0, 0);
      if (motionPreference.matches) return;

      lenis = new Lenis({
        autoRaf: true,
        lerp: 0.085,
        smoothWheel: true,
        syncTouch: false,
        anchors: true,
      });
      syncScrollLock();
    };

    setup();
    const observer = new MutationObserver(syncScrollLock);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style", "class"] });
    motionPreference.addEventListener("change", setup);

    return () => {
      observer.disconnect();
      motionPreference.removeEventListener("change", setup);
      lenis?.destroy();
    };
  }, []);

  return null;
}
