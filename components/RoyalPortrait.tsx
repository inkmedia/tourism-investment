"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { observePlaybackVisibility } from "@/components/playbackVisibility";

export default function RoyalPortrait() {
  const portraitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const portrait = portraitRef.current!;
    const layer = portrait.querySelector<HTMLElement>(".his-majesty__image-layer")!;
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      let visible = false;
      let scrollFrame = 0;
      let currentOffset: number | undefined;
      let previousTime = 0;

      const updateParallax = (time: number) => {
        scrollFrame = 0;
        if (!visible) return;
        const bounds = portrait.getBoundingClientRect();
        const progress = (window.innerHeight / 2 - bounds.top - bounds.height / 2)
          / ((window.innerHeight + bounds.height) / 2);
        const travel = bounds.height * 0.085;
        const targetOffset = Math.max(-1, Math.min(1, progress)) * travel;
        const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 1 / 60;
        previousTime = time;
        // Frame-rate-independent easing gives the photograph a gentle trailing motion.
        currentOffset = Math.max(-travel, Math.min(travel, currentOffset ?? targetOffset));
        currentOffset += (targetOffset - currentOffset) * (1 - Math.exp(-delta * 8));
        const settled = Math.abs(targetOffset - currentOffset) < 0.05;
        if (settled) currentOffset = targetOffset;
        layer.style.transform = `translate3d(0, ${currentOffset}px, 0)`;
        if (!settled) scrollFrame = requestAnimationFrame(updateParallax);
        else previousTime = 0;
      };
      const scheduleParallax = () => {
        if (visible && !scrollFrame) scrollFrame = requestAnimationFrame(updateParallax);
      };

      const stopVisibility = observePlaybackVisibility(portrait, (playing) => {
        visible = playing;
        if (playing) {
          scheduleParallax();
        } else {
          cancelAnimationFrame(scrollFrame);
          scrollFrame = 0;
          previousTime = 0;
          currentOffset = undefined;
        }
      });
      window.addEventListener("scroll", scheduleParallax, { passive: true });
      window.addEventListener("resize", scheduleParallax, { passive: true });
      return () => {
        stopVisibility();
        cancelAnimationFrame(scrollFrame);
        window.removeEventListener("scroll", scheduleParallax);
        window.removeEventListener("resize", scheduleParallax);
        layer.style.removeProperty("transform");
      };
    });
    return () => media.revert();
  }, []);

  return (
    <div ref={portraitRef} className="his-majesty__portrait">
      <div className="his-majesty__image-layer">
        <Image
          src="/img/his-majesty.webp"
          alt="His Majesty King Jigme Khesar Namgyel Wangchuck at Bhutan Innovation Forum 2024"
          fill
          sizes="(max-width: 760px) 100vw, (max-width: 1760px) 55vw, 940px"
        />
      </div>
    </div>
  );
}
