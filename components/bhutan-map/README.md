# Bhutan development landscape

The existing map still mounts the trusted local production SVG. Geography, raster assets, city hits, native place selector, legend and endpoint-ordered trail paths remain intact. Three.js is only an atmospheric enhancement.

## Interaction handoff

ScrollTrigger's actual progress enables exploration at 94%. The scrub tween settles before this handoff, so fast scrolling cannot leave controls disabled behind a lagging animation. Visibility, pointer events, native disabled state, inert and aria-disabled change together. Reverse scrolling disables controls and clears exploration state. An explicit one-second master duration keeps narrative percentages stable.

The controls sit outside the clipped visual stage at z-index 30. The preview, cloud host, cloud canvas, captions and progress indicator ignore pointers. Lightweight SVG story wrappers own cinematic opacity; exploration owns the original layer groups. This prevents late scrub updates from undoing toggles and keeps story tweens available on reversal. Layer buttons independently toggle their own SVG group's opacity and expose visibility with aria-pressed. Focus and Overview retain the final interactive viewBox; the scroll timeline stops writing that viewBox while exploring. The native dropdown retains browser keyboard and popup behavior.

## Framing and narrative

The boundary's measured bbox, stage aspect and satellite extent determine the final overview, with 3.5% contextual padding. Desktop uses a 1.96:1 stage; mobile retains 1.14:1. The altitude frame is constrained to the supplied raster. Desktop approach is approximately 17%; mobile is capped at 12%. All framing preserves proportions and avoids blank columns.

Arrival lasts through 12%, followed by cloud descent and simultaneous SVG approach through 60%. Boundary, forests and corridors enter from 50%; rivers and dams follow. Real trail lengths and endpoints drive sequential stroke drawing at 68–83%. Places, airports and sites follow; controls activate at 94%. The original outside-country white veil stays at zero to retain satellite colour. Reduced motion reveals the fitted map promptly without a long pin or camera travel.

## Clouds

Four depth groups contain 21 cards on desktop, 17 on tablet and 11 on mobile. Four deterministic local CanvasTextures provide soft, dense, wispy and broad formations. Five-frequency noise warps density envelopes, carves transparent gaps and tendrils, and supplies internal lighting variation. There are no remote texture dependencies or fullscreen white cloud layers.

A 42-degree perspective camera moves from Z=8.4 to Z=-1. Near cards enlarge and pass the camera first, with varied lateral exits; far cards stay over the approaching terrain longer. Near-camera opacity only softens crossings. Very slow idle drift is subordinate to scroll, and all transforms reverse from the same timeline state.

One plane geometry and four textures are shared. DPR is capped at 1.5 on desktop/tablet and 1 on mobile. Cloud RAF pauses offscreen, in hidden tabs, after clearing, or after context loss. Observers, listeners, textures, materials, geometry, renderer and tweens are disposed on unmount. WebGL failure leaves SVG storytelling and exploration available.

## Assets

- Original: `public/img/Bhutan_Map.svg`
- Production vectors: `public/img/bhutan-map-production.svg`
- Satellite: `public/img/bhutan-satellite.webp`
- Preview: `public/img/bhutan-map-preview.webp`

No geographic asset was changed for this refinement.
