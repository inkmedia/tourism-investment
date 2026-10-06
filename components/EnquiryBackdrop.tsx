"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Original symbol geometry from public/img/logo.svg.
const paths = [
  "M 50 35 L 338 323 L 338 35 Z",
  "M 652 35 L 368 35 L 368 319 Z",
  "M 673 65 L 554 182 L 703 182 L 694 123 Z",
  "M 705 37 L 1004 335 L 1302 36 Z",
  "M 29 56 L 30 344 L 318 344 Z",
  "M 550 211 L 671 332 L 692 278 L 700 242 L 703 212 Z",
  "M 388 373 L 500 485 L 501 374 Z",
  "M 500 236 L 392 344 L 500 344 Z",
  "M 529 232 L 530 344 L 642 344 Z",
  "M 551 373 L 625 447 L 650 373 Z",
  "M 1322 58 L 1024 357 L 1323 655 Z",
  "M 313 373 L 30 373 L 29 657 Z",
  "M 338 398 L 230 506 L 338 506 Z",
  "M 368 394 L 368 506 L 480 506 Z",
  "M 530 394 L 529 505 L 616 506 L 618 482 Z",
  "M 725 108 L 736 160 L 738 203 L 736 235 L 724 291 L 794 221 L 815 241 L 698 358 L 737 400 L 717 419 L 683 385 L 666 426 L 654 477 L 737 560 L 717 581 L 651 515 L 651 542 L 657 583 L 669 624 L 682 655 L 799 541 L 819 561 L 715 665 L 801 665 L 777 641 L 797 621 L 842 665 L 963 665 L 939 641 L 959 621 L 1004 665 L 1125 665 L 1101 641 L 1121 621 L 1165 665 L 1281 665 L 1242 624 L 1203 663 L 1185 646 L 1183 642 L 1221 603 L 1080 462 L 1041 501 L 1022 483 L 1021 480 L 1059 441 L 919 301 L 879 339 L 859 318 L 897 279 Z M 1119 545 L 1138 566 L 1041 663 L 1021 642 Z M 961 541 L 980 562 L 879 663 L 859 642 Z M 958 460 L 961 460 L 1061 561 L 1042 581 L 940 480 Z M 797 460 L 899 560 L 880 581 L 778 480 Z M 957 383 L 977 403 L 878 500 L 859 480 Z M 799 379 L 819 399 L 716 502 L 696 481 Z M 795 299 L 799 298 L 897 396 L 899 400 L 880 419 L 778 318 Z",
  "M 177 561 L 71 665 L 176 665 Z",
  "M 206 556 L 206 665 L 315 665 Z",
  "M 226 535 L 338 647 L 338 535 Z",
  "M 368 556 L 368 665 L 477 665 Z",
  "M 388 535 L 500 647 L 500 535 Z",
  "M 529 556 L 529 665 L 639 665 Z",
  "M 550 535 L 630 615 L 621 579 L 617 536 Z",
  "M 71 700 L 177 804 L 176 700 Z",
  "M 705 700 L 716 726 L 730 773 L 737 830 L 824 830 L 824 700 Z",
  "M 853 701 L 854 830 L 986 830 L 986 700 Z",
  "M 1015 700 L 1016 830 L 1148 830 L 1148 700 Z",
  "M 1282 700 L 1177 700 L 1177 805 Z",
  "M 29 708 L 29 991 L 312 991 Z",
  "M 206 700 L 206 830 L 311 831 L 310 859 L 230 859 L 338 967 L 338 729 L 367 729 L 367 991 L 472 993 L 473 1017 L 471 1021 L 392 1021 L 500 1129 L 500 888 L 502 886 L 529 887 L 529 1153 L 616 1154 L 619 1123 L 628 1080 L 650 1021 L 557 1021 L 556 993 L 665 992 L 681 958 L 692 926 L 700 890 L 703 860 L 396 859 L 395 831 L 703 830 L 700 799 L 691 760 L 667 701 L 530 700 L 529 802 L 502 803 L 500 801 L 500 700 Z",
  "M 1123 859 L 1016 859 L 1015 967 Z",
  "M 1324 708 L 1040 992 L 1324 992 Z",
  "M 738 859 L 727 929 L 704 992 L 824 992 L 824 859 Z",
  "M 854 859 L 853 992 L 986 992 L 986 859 Z",
  "M 688 1022 L 661 1090 L 653 1128 L 651 1154 L 824 1154 L 824 1021 Z",
  "M 853 1129 L 962 1021 L 853 1021 Z",
  "M 1299 1021 L 1016 1021 L 1015 1304 Z",
  "M 30 1021 L 29 1330 L 338 1331 L 338 1021 Z",
  "M 368 1047 L 368 1331 L 649 1330 Z",
  "M 554 1183 L 629 1258 L 619 1214 L 617 1184 Z",
  "M 681 1300 L 800 1183 L 651 1183 L 659 1239 Z",
  "M 986 1046 L 702 1330 L 986 1330 Z",
  "M 1324 1037 L 1031 1330 L 1324 1330 Z"
];

export default function EnquiryBackdrop() {
  const artwork = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = artwork.current;
    if (!svg) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const strokes = Array.from(svg.querySelectorAll<SVGPathElement>("path"));
    let timeline: gsap.core.Timeline | undefined;
    const context = gsap.context(() => {
      strokes.forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: preference.matches ? 0 : length });
      });
    }, svg);
    const reveal = () => {
      timeline?.kill();
      timeline = gsap.timeline()
        .to(strokes, { strokeDashoffset: 0, duration: preference.matches ? 0 : 3.4, stagger: preference.matches ? 0 : { amount: 1.5, from: "center" }, ease: "power2.inOut" })
        .to(strokes, { fillOpacity: .035, duration: preference.matches ? 0 : 1.6, stagger: preference.matches ? 0 : .012 }, preference.matches ? 0 : 2.4);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { reveal(); observer.disconnect(); }
    }, { threshold: .2 });
    observer.observe(svg.closest("section")!);
    const reduce = () => { if (preference.matches) { timeline?.kill(); gsap.set(strokes, { strokeDashoffset: 0, fillOpacity: .035 }); } };
    preference.addEventListener("change", reduce);
    return () => { observer.disconnect(); preference.removeEventListener("change", reduce); timeline?.kill(); context.revert(); };
  }, []);

  return (
    <div className="enquiries__artwork" aria-hidden="true">
      <svg ref={artwork} viewBox="0 0 1360 1360" fill="currentColor" focusable="false">
        {paths.map((d, index) => <path key={index} d={d} fillOpacity="0" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
      </svg>
    </div>
  );
}
