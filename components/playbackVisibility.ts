// Keep slideshow timers idle outside the viewport and in background tabs.
export function observePlaybackVisibility(
  element: Element,
  onChange: (playing: boolean) => void,
) {
  let intersecting = false;
  let playing = false;
  const update = () => {
    const next = intersecting && !document.hidden;
    if (playing === next) return;
    playing = next;
    onChange(playing);
  };
  const observer = new IntersectionObserver(([entry]) => {
    intersecting = entry.isIntersecting;
    update();
  });
  observer.observe(element);
  document.addEventListener("visibilitychange", update);
  return () => {
    observer.disconnect();
    document.removeEventListener("visibilitychange", update);
    if (playing) onChange(false);
  };
}
