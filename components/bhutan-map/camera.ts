import type { MapViewBox } from "./framing";

/** The same geographic projection as a changing viewBox, without repainting the SVG camera. */
export function mapCameraTransform(reference: MapViewBox, view: MapViewBox) {
  return {
    x: (reference.x - view.x) / view.width * 100,
    y: (reference.y - view.y) / view.height * 100,
    scale: reference.width / view.width,
  };
}
