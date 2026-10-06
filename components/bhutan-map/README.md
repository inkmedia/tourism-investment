# Bhutan development landscape

The existing map still mounts the trusted local production SVG. Geography, raster assets, city hits, native place selector, legend and endpoint-ordered trail paths remain intact. Three.js is only an atmospheric enhancement.

## Interaction handoff

Exploration starts when both raw scroll progress and the naturally scrubbed story reach 94%. Fast scrolling never forces the reveal to its endpoint; controls fade in as the story catches up. Visibility, pointer events, native disabled state, inert and aria-disabled change together. Reverse scrolling disables controls and clears exploration state. An explicit one-second master duration keeps narrative percentages stable.

The controls sit outside the clipped visual stage at z-index 30. The loading overlay, cloud host, cloud canvas, captions and progress indicator ignore pointers. Lightweight SVG story wrappers own cinematic opacity; exploration owns the original layer groups. This prevents late scrub updates from undoing toggles and keeps story tweens available on reversal. Layer buttons independently toggle their own SVG group's opacity and expose visibility with aria-pressed. Focus and Overview use the same geographic camera coordinates as the story. A nested CSS camera projects those coordinates over a fixed SVG viewBox, so camera movement does not repeatedly relayout and repaint the full vector scene. The story stops writing camera transforms during exploration. The native dropdown retains browser keyboard and popup behavior.

## Framing and narrative

The boundary's measured bbox, stage aspect and satellite extent determine the final overview, with 3.5% contextual padding. Desktop uses a 1.96:1 stage; mobile retains 1.14:1. The altitude frame is constrained to the supplied raster. Desktop approach is approximately 17%; mobile is capped at 12%. All framing preserves proportions and avoids blank columns.

Arrival includes a 1% camera push through 12%, followed by cloud descent and SVG approach through 60%. The boundary draws from 34%, protected forests use a feathered SVG mask from 43%, corridors settle from 49%, and rivers draw from 54%. Endpoint-ordered trail strokes follow at 65–79%, then dams, cities, airports and six west-to-east site bands. Airports have one thin introduction ring; controls activate at 94%. Layer reactivation uses the same restrained motion vocabulary. A separate unpinned exit begins only after controls have room to enter the viewport, quietens secondary label wrappers, restores overview/filter state and leads into Why invest now?. The original outside-country white veil stays at zero to retain satellite colour. Reduced motion reveals the fitted map promptly without a long pin or camera travel.

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
