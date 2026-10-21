"use client";

import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";

/** The supplied artwork, with separate SVG parts for each animation. */
export default function InvestmentIcon({ index }: { index: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const motion = gsap.matchMedia(svg);
    motion.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(svg, { opacity: 0, y: 5 }, {
        opacity: 1, y: 0, duration: 0.3, ease: "power2.out",
      });
      const loop = { repeat: -1, yoyo: true, ease: "sine.inOut" };

      switch (index) {
        case 0:
          gsap.to(".timer-hand", {
            rotation: 360, svgOrigin: "32 37", duration: 3,
            repeat: -1, ease: "none",
          });
          break;
        case 1:
          gsap.to(".compass-left", { rotation: 7, svgOrigin: "29 17", duration: 1.2, ...loop });
          gsap.to(".compass-right", { rotation: -7, svgOrigin: "35 17", duration: 1.2, ...loop });
          gsap.to(".compass-arc", { scaleX: 0.85, transformOrigin: "50% 50%", duration: 1.2, ...loop });
          break;
        case 2:
          gsap.to(".plane-body", { x: 3, y: -4, duration: 1.4, ...loop });
          break;
        case 3:
          gsap.to(".crown-body", { y: -4, rotation: 4, svgOrigin: "32 45", duration: 1.3, ...loop });
          break;
        case 4:
          gsap.fromTo(".scale-balance", { rotation: -8 }, {
            rotation: 8, svgOrigin: "32 19", duration: 1.6, ...loop,
          });
          break;
        case 5: {
          const links = svg.querySelectorAll<SVGPathElement>(".network-link");
          links.forEach((path) => {
            const length = path.getTotalLength();
            gsap.fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, {
              strokeDashoffset: 0, duration: 1.2, repeat: -1,
              repeatDelay: 0.8, ease: "power1.inOut",
            });
          });
          gsap.to(".network-node", {
            scale: 0.88, transformOrigin: "50% 50%", duration: 0.7,
            stagger: 0.2, ...loop,
          });
          break;
        }
      }
    });
    return () => motion.revert();
  }, [index]);

  return (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" width="64" height="64"
      viewBox="0 0 64 64" fill="none" stroke="#B17D24" strokeWidth="3.2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {index === 0 && <>
        <path d="M27 7H37" />
        <circle cx="32" cy="37" r="20" />
        <path className="timer-hand" d="M32 37L40 29" />
      </>}
      {index === 1 && <>
        <circle cx="32" cy="12" r="5" />
        <path className="compass-left" d="M29 17L10 54" />
        <path className="compass-right" d="M35 17L54 54" />
        <path className="compass-arc" d="M13 31Q32 49 51 31" />
      </>}
      {index === 2 && <>
        <path d="M7 55H57" />
        <path className="plane-body" d="M13 30L23 28L15 13L19 10L35 24L48 17C52 15 57 16 57 20C57 22 55 24 52 25L17 43C14 44 12 42 11 40L7 32Z" />
      </>}
      {index === 3 && <>
        <path className="crown-body" d="M7 16L21 27L32 9L43 27L57 16L49 45H15L7 16Z" />
        <path d="M15 55H49" />
      </>}
      {index === 4 && <>
        <path d="M32 8V54" />
        <path d="M20 54H44" />
        <g className="scale-balance">
          <path d="M9 19H55" />
          <path d="M16 19L7 42Q16 52 25 42L16 19Z" />
          <path d="M48 19L39 42Q48 52 57 42L48 19Z" />
        </g>
      </>}
      {index === 5 && <>
        <rect className="network-node" x="24" y="6" width="16" height="16" rx="1.5" />
        <path className="network-link" d="M32 22V36" />
        <path className="network-link" d="M14 43V36H50V43" />
        <rect className="network-node" x="6" y="43" width="16" height="15" rx="1.5" />
        <rect className="network-node" x="42" y="43" width="16" height="15" rx="1.5" />
      </>}
    </svg>
  );
}
