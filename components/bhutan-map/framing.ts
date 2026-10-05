export type MapViewBox = { x: number; y: number; width: number; height: number };

/** Match the stage aspect exactly, keep the geographic bbox, and stay on the supplied raster. */
export function fitViewBoxToBBox(bbox: MapViewBox, aspect: number, extent: MapViewBox, padding = .035): MapViewBox {
  const ratio = Math.max(.01, aspect);
  let width = bbox.width * (1 + padding);
  let height = bbox.height * (1 + padding);
  if (width / height < ratio) width = height * ratio;
  else height = width / ratio;
  // Stage ratios are kept within the source's geographic coverage by the responsive CSS.
  // Reduce contextual padding first if the source edge would otherwise be exposed.
  const limit = Math.min(1, extent.width / width, extent.height / height);
  width *= limit; height *= limit;
  return centerViewBox(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2, width, height, extent);
}

export function centerViewBox(cx: number, cy: number, width: number, height: number, extent: MapViewBox): MapViewBox {
  return {
    x: Math.max(extent.x, Math.min(extent.x + extent.width - width, cx - width / 2)),
    y: Math.max(extent.y, Math.min(extent.y + extent.height - height, cy - height / 2)),
    width, height,
  };
}

export function altitudeViewBox(final: MapViewBox, extent: MapViewBox, mobile: boolean): MapViewBox {
  const factor = Math.min(mobile ? 1.12 : 1.2, extent.width / final.width, extent.height / final.height);
  return centerViewBox(final.x + final.width / 2, final.y + final.height / 2, final.width * factor, final.height * factor, extent);
}

export function interpolateViewBox(from: MapViewBox, to: MapViewBox, progress: number): MapViewBox {
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
    width: from.width + (to.width - from.width) * progress,
    height: from.height + (to.height - from.height) * progress,
  };
}
