"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { attachAlignmentGestures, type GestureView } from "./alignmentGestures";
import { createPortal } from "react-dom";
import { satelliteTiles, type MercatorOrigin } from "./satellite";

type Bounds = { x: number; y: number; width: number; height: number };
type Marker = { x: number; y: number; name: string; numbered: boolean; latitude: number; longitude: number };
type Detail = { projection: "EPSG:3857"; origin: MercatorOrigin; bounds: Bounds; paths: { color: string; d: string }[]; points: Marker[] };

export default function AlignmentDetail({ onClose }: { onClose: () => void }) {
  const [closing, setClosing] = useState(false);
  const requestClose = () => {
    if (closing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) onClose();
    else setClosing(true);
  };
  // Fallback also handles an animation interrupted by a motion-preference change.
  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(onClose, 380);
    return () => window.clearTimeout(timer);
  }, [closing, onClose]);
  const [data, setData] = useState<Detail>();
  const [satellite, setSatellite] = useState(true);
  const [tileStates, setTileStates] = useState<Record<string, "loaded" | "failed">>({});
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [markerDetails, setMarkerDetails] = useState<Marker | null>(null);
  const [selectedMarker, setSelectedMarker] = useState("");
  const [annotations, setAnnotations] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const gestureView = useRef<GestureView>({ zoom: 1, x: 0, y: 0, unit: 1 });
  useEffect(() => {
    const scrollOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    const abort = new AbortController();
    fetch('/img/108-alignment-detail.json?v=mercator-2', { signal: abort.signal })
      .then(r => { if (!r.ok) throw new Error('Detail unavailable'); return r.json(); })
      .then((result: Detail) => { if (result.projection !== "EPSG:3857" || !result.origin) throw new Error("Unsupported alignment projection"); setData(result); setCenter({ x: result.bounds.x + result.bounds.width / 2, y: result.bounds.y + result.bounds.height / 2 }); })
      .catch(e => { if (e.name !== 'AbortError') setFailed(true); });
    return () => { document.body.style.overflow = scrollOverflow; abort.abort(); previous?.focus({ preventScroll: true }); };
  }, []);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(svg);
    return () => observer.disconnect();
  }, [data]);
  const bounds = data?.bounds;
  const aspect = size.width / Math.max(1, size.height);
  const height = bounds ? Math.max(bounds.height, bounds.width / aspect) * 1.14 / zoom : 1;
  const width = height * aspect;
  const unit = height / Math.max(1, size.height);
  useLayoutEffect(() => { gestureView.current = { zoom, x: center.x, y: center.y, unit }; }, [zoom, center, unit]);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    return attachAlignmentGestures(svg, () => gestureView.current, next => {
      gestureView.current = next;
      setZoom(next.zoom);
      setCenter({ x: next.x, y: next.y });
      setSelectedMarker("");
    }, point => {
      const view = gestureView.current;
      const world = { x: view.x + point.x * view.unit, y: view.y + point.y * view.unit };
      const nearest = data?.points.filter(p => p.numbered).reduce<Marker | null>((best,p) => !best || Math.hypot(p.x-world.x,p.y-world.y) < Math.hypot(best.x-world.x,best.y-world.y) ? p : best, null);
      if (nearest && Math.hypot(nearest.x-world.x,nearest.y-world.y) <= 22 * view.unit) {
        setMarkerDetails(nearest);
        setSelectedMarker(nearest.name);
      }
    });
  }, [data]);
  const tiles = data && satellite ? satelliteTiles({ x: center.x-width/2, y: center.y-height/2, width, height }, data.origin, size.width) : [];
  const tileFailed = tiles.some(tile => tileStates[tile.key] === "failed");
  const tilesLoading = tiles.some(tile => !tileStates[tile.key]);
  const fit = () => { setMarkerDetails(null); setSelectedMarker(""); if (bounds) { setZoom(1); setCenter({ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }); } };
  const move = (x: number, y: number) => {
    if (bounds) setCenter({ x: Math.max(bounds.x, Math.min(bounds.x + bounds.width, x)), y: Math.max(bounds.y, Math.min(bounds.y + bounds.height, y)) });
  };
  return createPortal(<section className="alignment-detail" data-closing={closing} onAnimationEnd={e => {
    if (e.target === e.currentTarget && e.animationName === "alignment-detail-exit") onClose();
  }} role="dialog" aria-modal="true" aria-label="108 Alignment detailed view" data-lenis-prevent onKeyDown={e => {
    if (e.key === 'Tab') {
      const controls = [...e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),select:not(:disabled),input,a[href],[tabindex="0"]')];
      const first = controls[0], last = controls[controls.length-1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
    if (e.key === 'Escape') { e.stopPropagation(); requestClose(); } }}>
    <div className="alignment-detail__header"><strong>108 Alignment</strong><button ref={closeRef} onClick={requestClose}>Back to Bhutan</button></div>
    <div className="alignment-detail__tools">
      <button aria-label="Zoom in on alignment" disabled={!data || zoom >= 32} onClick={() => setZoom(z => Math.min(32, z * 2))}>+</button>
      <button aria-label="Zoom out of alignment" disabled={!data || zoom <= 1} onClick={() => setZoom(z => Math.max(1, z / 2))}>−</button>
      <button disabled={!data} onClick={fit}>Fit alignment</button>
      <label>Marker <select aria-label="Focus on numbered alignment marker" disabled={!data} value={selectedMarker} onChange={e => { setSelectedMarker(e.target.value); const p = data?.points.find(p => p.numbered && p.name === e.target.value); if (p) { setMarkerDetails(p); setCenter(p); setZoom(16); } else fit(); }}><option value="">All 108</option>{data?.points.filter(p => p.numbered).sort((a,b) => Number(a.name)-Number(b.name)).map(p => <option key={p.name} value={p.name}>{p.name}</option>)}</select></label>
      <label><input type="checkbox" checked={satellite} onChange={e => setSatellite(e.target.checked)} /> Satellite</label>
      <label><input type="checkbox" checked={annotations} onChange={e => setAnnotations(e.target.checked)} /> Annotations</label>
    </div>
    {failed ? <p role="alert">Unable to load the detailed alignment. Close and reopen to retry.</p> : !data ? <p role="status">Loading alignment details…</p> : <svg ref={svgRef} viewBox={`${center.x-width/2} ${center.y-height/2} ${width} ${height}`} role="group" aria-label="Satellite imagery with original alignment linework and numbered markers. Drag to pan; pinch or scroll to zoom; or choose a marker." tabIndex={0}
      onKeyDown={e => { const steps: Record<string, [number,number]> = { ArrowUp:[0,-height/5], ArrowDown:[0,height/5], ArrowLeft:[-width/5,0], ArrowRight:[width/5,0] }; if (steps[e.key]) { e.preventDefault(); move(center.x+steps[e.key][0],center.y+steps[e.key][1]); } }}
      >
      <g aria-hidden="true" pointerEvents="none">{tiles.map(tile => <image key={tile.key} href={tile.url} x={tile.x} y={tile.y} width={tile.size} height={tile.size} preserveAspectRatio="none"
        onLoad={() => setTileStates(previous => ({ ...previous, [tile.key]: "loaded" }))}
        onError={() => setTileStates(previous => ({ ...previous, [tile.key]: "failed" }))} />)}</g>
      <g fill="none" strokeWidth="1" strokeLinecap="round">{data.paths.map(p => <path key={p.color} d={p.d} stroke={p.color} vectorEffect="non-scaling-stroke" />)}</g>
      {data.points.filter(p => p.numbered || annotations).map((p,i) => <g key={i} role={p.numbered ? "button" : undefined} tabIndex={p.numbered ? 0 : undefined}
        aria-label={p.numbered ? `View location of marker ${p.name}` : undefined}
        aria-pressed={p.numbered ? markerDetails?.name === p.name : undefined}
        className={p.numbered ? "alignment-detail__marker" : undefined}
        onClick={e => { if (p.numbered && e.detail === 0) { setMarkerDetails(p); setSelectedMarker(p.name); } }}
        onKeyDown={e => { if (p.numbered && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); e.stopPropagation(); setMarkerDetails(p); setSelectedMarker(p.name); } }}>
        {p.numbered && <circle cx={p.x} cy={p.y} r={unit*10} fill="transparent" />}
        {markerDetails?.name === p.name && <circle cx={p.x} cy={p.y} r={unit*7} fill="none" stroke="white" strokeWidth={unit*2} />}
        <circle cx={p.x} cy={p.y} r={unit*(p.numbered ? 2.5 : 1.5)} fill={p.numbered ? 'var(--brand-orange)' : '#d5dce1'} />{(zoom >= 8 || (p.numbered && (Number(p.name)%10===0 || p.name==='1' || p.name==='108'))) && <text x={p.x+unit*7} y={p.y+unit*4} fontSize={unit*12} fill="white" stroke="#14201d" strokeWidth={unit*3} paintOrder="stroke">{p.name}</text>}</g>)}
    </svg>}
    {markerDetails && <aside className="alignment-detail__marker-card" aria-label={`Marker ${markerDetails.name} location`}>
      <div><strong>Marker {markerDetails.name}</strong><button aria-label="Close marker details" onClick={() => { setMarkerDetails(null); setSelectedMarker(""); svgRef.current?.focus(); }}>×</button></div>
      <dl><dt>Latitude</dt><dd>{markerDetails.latitude.toFixed(6)}° N</dd><dt>Longitude</dt><dd>{markerDetails.longitude.toFixed(6)}° E</dd></dl>
      <p>Location from the supplied KMZ · WGS84</p>
    </aside>}
    <div className="alignment-detail__footer">
      <p className="alignment-detail__hint">Drag to pan · Pinch or scroll to zoom · N ↑</p>
      {satellite && <><span className="alignment-detail__hint" role="status">{tileFailed ? "Some satellite imagery is unavailable. Alignment remains visible." : tilesLoading ? "Loading satellite imagery…" : ""}</span><a className="alignment-detail__attribution" href="https://doc.arcgis.com/en/data-appliance/latest/imagery-elevation/world-imagery.htm" target="_blank" rel="noopener noreferrer">Imagery © Esri, Maxar, Earthstar Geographics, and the GIS User Community</a></>}
    </div>
  </section>, document.body);
}
