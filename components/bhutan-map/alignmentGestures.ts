export type GestureView = { zoom: number; x: number; y: number; unit: number };
type Point = { x: number; y: number };

/** Preserve the world point under the gesture while its centroid moves. */
export function anchoredZoom(view: GestureView, from: Point, to: Point, factor: number): GestureView {
  const zoom = Math.max(1, Math.min(32, view.zoom * factor));
  const unit = view.unit * view.zoom / zoom;
  return { zoom, unit, x: view.x + from.x * view.unit - to.x * unit,
    y: view.y + from.y * view.unit - to.y * unit };
}

export function attachAlignmentGestures(svg: SVGSVGElement, read: () => GestureView, write: (view: GestureView) => void, tap?: (point: Point) => void) {
  let candidate: { id: number; start: Point } | null = null;
  const pointers = new Map<number, Point>();
  const local = (x: number, y: number) => {
    const box = svg.getBoundingClientRect();
    return { x: x - box.left - box.width / 2, y: y - box.top - box.height / 2 };
  };
  const pair = () => {
    const [a,b] = [...pointers.values()];
    return { center: { x: (a.x+b.x)/2, y: (a.y+b.y)/2 }, distance: Math.hypot(a.x-b.x,a.y-b.y) };
  };
  const down = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointers.set(e.pointerId, local(e.clientX,e.clientY));
    candidate = pointers.size === 1 ? { id: e.pointerId, start: local(e.clientX,e.clientY) } : null;
    svg.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent) => {
    const before = pointers.get(e.pointerId);
    if (!before) return;
    const oldPair = pointers.size >= 2 ? pair() : null;
    const after = local(e.clientX,e.clientY);
    if (candidate && Math.hypot(after.x-candidate.start.x,after.y-candidate.start.y) > 6) candidate = null;
    pointers.set(e.pointerId, after);
    if (oldPair) {
      const next = pair();
      write(anchoredZoom(read(),oldPair.center,next.center,oldPair.distance > 1 ? next.distance/oldPair.distance : 1));
    } else write(anchoredZoom(read(),before,after,1));
  };
  const end = (e: PointerEvent) => {
    if (e.type === 'pointerup' && candidate?.id === e.pointerId && pointers.size === 1) tap?.(local(e.clientX,e.clientY));
    candidate = null;
    pointers.delete(e.pointerId);
  };
  const wheel = (e: WheelEvent) => {
    e.preventDefault();
    const point = local(e.clientX,e.clientY);
    const pixels = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? svg.clientHeight : 1);
    write(anchoredZoom(read(),point,point,Math.exp(-Math.max(-200,Math.min(200,pixels)) * .003)));
  };
  svg.addEventListener('pointerdown',down);
  svg.addEventListener('pointermove',move);
  svg.addEventListener('pointerup',end);
  svg.addEventListener('pointercancel',end);
  svg.addEventListener('lostpointercapture',end);
  svg.addEventListener('wheel',wheel,{passive:false});
  return () => {
    pointers.clear();
    svg.removeEventListener('pointerdown',down);
    svg.removeEventListener('pointermove',move);
    svg.removeEventListener('pointerup',end);
    svg.removeEventListener('pointercancel',end);
    svg.removeEventListener('lostpointercapture',end);
    svg.removeEventListener('wheel',wheel);
  };
}
