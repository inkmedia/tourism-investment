# Bhutan development landscape

The existing map still mounts the trusted local production SVG. Geography, raster assets, city hits, native place selector, legend and endpoint-ordered trail paths remain intact. Three.js is only an atmospheric enhancement.

## Interaction and scroll layout

A native sticky map sits inside a reserved story shell (800svh desktop, 900svh tablet/mobile). This space exists before any asset fetch; loading does not insert a pin spacer or shift following sections. The sticky panel reserves 80px for navigation and measures the HTML legend and exploration controls to fit the remaining viewport. The skip toolbar overlays the map, and desktop exploration uses a single row to leave more height for full-width geography. Mobile layer controls form a horizontally scrollable row with 44px targets.

The scroll timeline tracks the scroll position directly, avoiding a delayed scrub playhead that can outlive the sticky section. Wheel smoothing remains owned by the site's existing Lenis controller; touch uses native scrolling. The story finishes 0.7 viewport heights before the shell's normal release, with exploration available from 90%. A persistent Skip map anchor moves to Why invest now and transfers keyboard focus. Reduced motion presents the fitted interactive map without the long sticky sequence.

The thematic order is GMC boundary (8%), Mindfulness Trail (24%), protected forests (40%), ecological corridors (53%), rivers (64%), then places, airports and religious sites (76–87%). Each reveal has a holding interval before the next. The brief cloud approach finishes before the GMC boundary appears. Camera projection remains separate from the SVG layers and exploration toggles.

The legend is responsive HTML outside the camera and clipped stage. Keys appear with their corresponding layers, stay readable during camera movement and reflect exploration toggles. Hidden entries reserve their layout space to avoid resize jumps. The old SVG legend is hidden. Map and controls remain fully opaque through the final hold; no separate exit animation fades them prematurely.

Assets begin loading within 2400px of the section. The production SVG, satellite decode and cloud assets load concurrently. The loader stays up through geometry setup and the first cloud frame. A failed load collapses the long story shell while leaving Skip map available.

## Clouds

Four depth groups contain 21 cards on desktop, 17 on tablet and 11 on mobile. Three additional distant cards retain 7.5% material opacity around the northern mountainous edge after descent; they share the existing geometry and wispy texture. Their pointer response is damped in the existing cloud loop. A low-opacity CSS gradient shadow passes across the terrain during cloud clearance, without another renderer or animation loop. Four deterministic 512×320 baked PNG textures provide the original soft, dense, wispy and broad formations. `scripts/prepare-map-clouds.py` reproduces the original density generator offline; no procedural image generation runs in the browser. Images decode and the first cloud frame uploads/renders under the loader before the map is shown. Five-frequency noise warps density envelopes, carves transparent gaps and tendrils, and supplies internal lighting variation. There are no remote texture dependencies or fullscreen white cloud layers.

A 42-degree perspective camera moves from Z=8.4 to Z=-1. Near cards enlarge and pass the camera first, with varied lateral exits; far cards stay over the approaching terrain longer. Near-camera opacity only softens crossings. Very slow idle drift is subordinate to scroll, and all transforms reverse from the same timeline state.

One plane geometry and four textures are shared. DPR is capped at 1.25 on desktop/tablet and 1 on mobile. Active camera/scroll/pointer changes render at the display cadence; slow idle edge fog uses a 30-draw/second budget. Cloud RAF pauses offscreen, in hidden tabs, after the exit atmosphere clears, or after context loss. Pin/refresh suspension preserves the drawing buffer until ScrollTrigger restores its playhead. Offscreen observers also preserve pixels. Identical rounded dimensions skip all canvas reallocation; real resizes repaint synchronously and retain meshes within a device tier. Observers, listeners, textures, materials, geometry, renderer and tweens are disposed on unmount. WebGL failure leaves SVG storytelling and exploration available.

## Assets

- Original: `public/img/Bhutan_Map.svg`
- Production vectors: `public/img/bhutan-map-production.svg`
- Satellite: `public/img/bhutan-satellite.webp`
- Legacy preview asset (no longer rendered): `public/img/bhutan-map-preview.webp`

No geographic asset was changed for this refinement.

## Exploration controller

`interactions.ts` caches city and infrastructure coordinates once. Pointer events coalesce into one frame, convert through the current SVG screen matrix, and interpolate proximity within a configurable 140px radius. GSAP quickTo damps marker scale (up to 1.07) and terrain rotation (±0.55°); React state changes only for selections, filters and scene handoffs. Focus/hover keeps primary orientation labels strong and quietens distant infrastructure without hiding geography. City groups support Tab, Enter and Space; the native place selector remains the touch/keyboard alternative. Reduced motion disables pointer depth, cloud motion, filter drawing and camera travel.

`layerMotion.ts` owns the forest mask, route reactivation, symbol introductions and six site bands. Story wrappers and filter opacity remain separate. Temporary filter tweens are cancelled and restored before returning to the scroll story. All controller events, quickTo tweens, masks, band wrappers, WebGL materials and exit triggers are cleaned up on unmount.

## Performance regression checks

Run `node scripts/check-map-performance.mjs`. It verifies camera projection equivalence, baked texture dimensions, first-frame readiness, pin/refresh buffer continuity, mesh reuse on resizing, offscreen suspension, idle versus active render cadence, mobile cloud counts, and disposal. The renderer is mocked for lifecycle tests; this does not claim measured GPU FPS. Browser checks separately verify pin entry/reversal, focus and filter controls. Completed forest reveals release their SVG mask; reversing or reactivating the layer reinstates it. Hover transforms and label opacity use independent wrappers so the reversing story never competes for the same SVG properties.

The supplied `boundary-002` outline is displayed as a gold GMC boundary, with a matching legend entry and independent layer toggle. Dam geometry, its legend entry and its control are removed by `prepare-bhutan-map.py`. The supplied outline was cross-checked against the [public NSDI GMC boundary dataset](https://nsdi.systems.gov.bt/portal/home/item.html?id=69bdfca3640846f0a04b5c62288fa4eb); the source artwork retains its original registration.

## 108 Alignment

`python3 scripts/prepare-108-alignment.py` converts `public/108 Alignment.kmz`
into `public/img/108-alignment.svg`. The client loads this 69 KB overlay alongside
its base SVG, reveals it after the Mindfulness Trail, and uses the shared layer
controls for independent visibility. CAD line segments are quantized to 0.1 SVG
unit and deduplicated; point annotations and details smaller than that are omitted.

The base artwork was recovered from a PDF and has no geographic reference. The
converter uses a local affine fit to the Gelephu, Sarpang and Trongsa city markers
(coordinate sources are linked in the script). Placement is approximate and must
not be used for surveying or land measurement. Accurate registration requires the
original map CRS/extent or surveyed control points. The original KMZ is unchanged.

### Detailed alignment viewer

“Zoom to 108 Alignment” opens a full-screen, on-demand 2D viewer. Run
`python3 scripts/prepare-108-detail.py` to regenerate its JSON from the KMZ.
The detail viewer uses the source coordinates in Web Mercator (EPSG:3857), translated to a local north-up frame,
not the approximate artwork registration. It preserves nine line colors, 875
point annotations and all 108 numbered markers. Altitude is not rendered.
Duplicate segments are removed and coordinates rounded to 0.01 local metre.
The 1.9 MB detail asset is fetched only when opened. Users can fit the full
alignment, zoom up to 32×, drag or use arrow keys to pan, choose numbered markers,
and enable other annotations. Labels are thinned at overview scale for clarity.
Escape or “Back to Bhutan” closes the viewer and restores keyboard focus.


Satellite imagery is enabled by default in the detailed viewer. Esri World Imagery
256px tiles are positioned in the same EPSG:3857 frame as the source KMZ geometry;
the generated JSON includes the Mercator origin. Only visible tiles are requested,
at a viewport-dependent level capped at 19. Tiles and vectors share one SVG
viewBox, so marker focus, zoom, resize and pan preserve registration. Attribution
links to Esri's imagery documentation. The Satellite checkbox removes imagery
requests; failed tiles show a status message without hiding the alignment.
An internet connection is needed for satellite imagery. Imagery dates and accuracy
vary; this does not validate the source KMZ against surveyed ground positions.

Run `node scripts/check-alignment-satellite.mjs` to verify a source KMZ marker
against the global tile grid, viewport coverage and bounded tile counts across
phone, landscape and desktop dimensions at fit, 2×, 16× and 32× zoom.

### Gesture controls and entry callout

The detail viewer supports cursor-anchored wheel zoom and midpoint-anchored
multi-pointer pinch zoom, limited to 1–32×. Pointer capture keeps one-finger
panning continuous when a pinch ends; cancellation and lost capture clear the
ended pointer. The non-passive wheel listener prevents page scrolling only over
the map canvas. `node scripts/check-alignment-gestures.mjs` verifies anchoring,
zoom bounds, pinch-to-pan transitions, cancellation and listener cleanup using
simulated pointer input. Browser checks cover wheel zoom and dragging; physical
multi-touch hardware was not available.

A 44px-high “View 108 Alignment” callout follows the alignment's artwork position
and is clamped to the stage on small screens. It fades in only during a focused, zoomed view when the alignment is on-screen
and its layer is visible; the full Bhutan overview hides it. The viewer opens with a 320ms fade/scale;
`prefers-reduced-motion: reduce` disables that animation.


Numbered markers accept pointer taps (nearest marker within 22 screen pixels),
Enter or Space. Their location card shows original KMZ latitude/longitude in
WGS84, rounded to six decimal places for display, and highlights the selection.
The generated data retains the original unrounded coordinates. Marker selection
also works through the dropdown. Pointer travel beyond 6px, a second pointer,
or cancellation suppresses tap selection so panning and pinching remain usable.
Browser checks covered desktop and phone-sized selection, keyboard activation,
closing cards, drag suppression, and callout hiding/restoration at overview/focus.
