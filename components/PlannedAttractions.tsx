"use client";

import { useEffect, useRef } from "react";
import FitText from "@/components/FitText";

const attractions = ["Light Festival", "Water Festival", "GMC Marathon Series", "Outdoor Film Festival", "GMC Treasure Hunt Race", "Street Art Weekends", "Riverfront Night Bazaar", "Lantern River Evenings", "Farmers & Wellness Market", "Bhutanese Food & Culture Weekend", "GMC Craft Trail", "Mindful Leadership Retreat", "Monsoon Festival", "Meditation Programs", "GMC Student Discovery Camp", "GMC Viewpoint Experience Series", "Riverside Yoga", "Traditional Games Weekend", "GMC Open-Air Music Evenings", "GMC Firefly & Night Nature Walks"];

export default function PlannedAttractions() {
  const railRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const rail = railRef.current!;
    const surface = surfaceRef.current!;
    const cursor = cursorRef.current!;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, target = rail.scrollLeft, velocity = 0, lastX = 0, lastTime = 0, lastFrame = 0;
    let pointer: number | null = null;
    let cursorFrame = 0, cursorTime = 0;
    let cursorX = 0, cursorY = 0, aimX = 0, aimY = 0, stretch = 0, angle = 0;
    const animateCursor = (time: number) => {
      const dt = Math.min(32, time - (cursorTime || time - 16));
      cursorTime = time;
      const dx = aimX - cursorX, dy = aimY - cursorY;
      const distance = Math.hypot(dx, dy);
      const follow = reducedMotion.matches ? 1 : 1 - Math.exp(-dt / 42);
      cursorX += dx * follow;
      cursorY += dy * follow;
      if (distance > .5) angle = Math.atan2(dy, dx);
      const desiredStretch = reducedMotion.matches ? 0 : Math.min(.32, distance / 160);
      stretch += (desiredStretch - stretch) * (1 - Math.exp(-dt / 75));
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      cursor.style.setProperty("--cursor-angle", `${angle}rad`);
      cursor.style.setProperty("--cursor-stretch", String(1 + stretch));
      cursor.style.setProperty("--cursor-squash", String(1 - stretch * .55));
      if (distance > .1 || stretch > .001) cursorFrame = requestAnimationFrame(animateCursor);
      else { cursorFrame = 0; cursorTime = 0; }
    };
    const clamp = (value: number) => Math.max(0, Math.min(rail.scrollWidth - rail.clientWidth, value));
    const progress = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      progressRef.current!.style.transform = `scaleX(${max > 0 ? rail.scrollLeft / max : 1})`;
    };
    const tick = (time: number) => {
      const dt = Math.min(32, time - (lastFrame || time - 16));
      lastFrame = time;
      if (pointer === null && Math.abs(velocity) > .02) {
        target = clamp(target + velocity * dt);
        velocity *= Math.exp(-dt / 210);
      }
      const difference = target - rail.scrollLeft;
      rail.scrollLeft += difference * (reducedMotion.matches ? 1 : 1 - Math.exp(-dt / 65));
      if (Math.abs(difference) > .5 || Math.abs(velocity) > .02) frame = requestAnimationFrame(tick);
      else { rail.scrollLeft = target; frame = 0; lastFrame = 0; }
    };
    const animate = () => { if (!frame) frame = requestAnimationFrame(tick); };
    const positionCursor = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const bounds = surface.getBoundingClientRect();
      aimX = event.clientX - bounds.left;
      aimY = event.clientY - bounds.top;
      if (!surface.classList.contains("has-pointer")) {
        cursorX = aimX;
        cursorY = aimY;
        stretch = 0;
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
      }
      if (!cursorFrame) cursorFrame = requestAnimationFrame(animateCursor);
      surface.classList.toggle("has-pointer", event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom);
    };
    const down = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      event.preventDefault();
      pointer = event.pointerId;
      velocity = 0;
      target = rail.scrollLeft;
      lastX = event.clientX;
      lastTime = performance.now();
      rail.setPointerCapture(pointer);
      surface.classList.add("is-dragging");
      positionCursor(event);
    };
    const move = (event: PointerEvent) => {
      positionCursor(event);
      if (event.pointerId !== pointer) return;
      const now = performance.now();
      const delta = lastX - event.clientX;
      target = clamp(target + delta);
      velocity = .6 * velocity + .4 * delta / Math.max(8, now - lastTime);
      lastX = event.clientX;
      lastTime = now;
      animate();
    };
    const end = (event: PointerEvent) => {
      if (event.pointerId !== pointer) return;
      pointer = null;
      if (event.type !== "pointerup" || performance.now() - lastTime > 90 || reducedMotion.matches) velocity = 0;
      if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
      surface.classList.remove("is-dragging");
      animate();
    };
    const leave = () => {
      surface.classList.remove("has-pointer");
      cancelAnimationFrame(cursorFrame);
      cursorFrame = 0;
      cursorTime = 0;
    };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || pointer !== null) return;
      const delta = (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rail.clientWidth : 1);
      if (!frame) target = rail.scrollLeft;
      const next = clamp(target + delta);
      if (next === target) return;
      event.preventDefault();
      event.stopPropagation();
      velocity = 0;
      target = next;
      animate();
    };
    const key = (event: KeyboardEvent) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      velocity = 0;
      target = clamp(event.key === "Home" ? 0 : event.key === "End" ? rail.scrollWidth : rail.scrollLeft + (event.key === "ArrowRight" ? 1 : -1) * 320);
      animate();
    };
    const touch = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
      velocity = 0;
      const captured = pointer;
      pointer = null;
      if (captured !== null && rail.hasPointerCapture(captured)) rail.releasePointerCapture(captured);
      surface.classList.remove("is-dragging");
      leave();
    };
    rail.addEventListener("pointerdown", down);
    rail.addEventListener("pointermove", move);
    rail.addEventListener("pointerenter", positionCursor);
    rail.addEventListener("pointerleave", leave);
    rail.addEventListener("pointerup", end);
    rail.addEventListener("pointercancel", end);
    rail.addEventListener("lostpointercapture", end);
    rail.addEventListener("wheel", wheel, { passive: false });
    rail.addEventListener("keydown", key);
    rail.addEventListener("touchstart", touch, { passive: true });
    rail.addEventListener("scroll", progress, { passive: true });
    window.addEventListener("blur", touch);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(cursorFrame);
      rail.removeEventListener("pointerdown", down);
      rail.removeEventListener("pointermove", move);
      rail.removeEventListener("pointerenter", positionCursor);
      rail.removeEventListener("pointerleave", leave);
      rail.removeEventListener("pointerup", end);
      rail.removeEventListener("pointercancel", end);
      rail.removeEventListener("lostpointercapture", end);
      rail.removeEventListener("wheel", wheel);
      rail.removeEventListener("keydown", key);
      rail.removeEventListener("touchstart", touch);
      rail.removeEventListener("scroll", progress);
      window.removeEventListener("blur", touch);
    };
  }, []);
  return (
    <section className="planned-attractions" aria-labelledby="planned-attractions-title">
      <div className="planned-attractions__inner">
        <header className="planned-attractions__header">
          <p className="planned-attractions__eyebrow">Planned attractions</p>
          <h2 id="planned-attractions-title"><FitText>A city that keeps</FitText><FitText><em>giving you reasons to return.</em></FitText></h2>
          <p>Twenty planned experiences, designed as an evolving programme rather than a fixed list.</p>
        </header>
        <div ref={surfaceRef} className="planned-attractions__surface">
        <div ref={railRef} className="planned-attractions__rail" role="region" tabIndex={0} aria-label="Planned attractions. Drag, scroll, or use the arrow keys to explore.">
          <ol className="planned-attractions__cards">
            {attractions.map((attraction, index) => <li key={attraction}><span className="planned-attractions__number">{String(index + 1).padStart(2, "0")}</span><b aria-hidden="true">{String(index + 1).padStart(2, "0")}</b><strong><FitText>{attraction}</FitText></strong></li>)}
          </ol>
        </div>
        <span ref={cursorRef} className="planned-attractions__drag-label" aria-hidden="true">‹ <span>Drag</span> ›</span>
        </div>
        <div className="planned-attractions__rail-footer" aria-hidden="true"><span>20 experiences · Explore the collection</span><div className="planned-attractions__progress"><span ref={progressRef} /></div><span>Drag to explore ↔</span></div>
      </div>
    </section>
  );
}
