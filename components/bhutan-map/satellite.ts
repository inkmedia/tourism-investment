import type { MapViewBox } from './framing';

export const MERCATOR_WORLD = 2 * Math.PI * 6378137;
export type MercatorOrigin = { x: number; y: number };
export type SatelliteTile = { key: string; url: string; x: number; y: number; size: number };

/** Tile placement in the same local EPSG:3857 coordinates as the KMZ overlay. */
export function satelliteTiles(view: MapViewBox, origin: MercatorOrigin, pixelWidth: number): SatelliteTile[] {
  if (pixelWidth <= 1 || view.width <= 0) return [];
  const level = Math.max(0, Math.min(19, Math.floor(Math.log2(MERCATOR_WORLD * pixelWidth / (256 * view.width)))));
  const count = 2 ** level;
  const size = MERCATOR_WORLD / count;
  const ox = MERCATOR_WORLD / 2 + origin.x;
  const oy = MERCATOR_WORLD / 2 - origin.y;
  const left = Math.max(0, Math.floor((view.x + ox) / size));
  const right = Math.min(count - 1, Math.floor((view.x + view.width + ox) / size));
  const top = Math.max(0, Math.floor((view.y + oy) / size));
  const bottom = Math.min(count - 1, Math.floor((view.y + view.height + oy) / size));
  const tiles: SatelliteTile[] = [];
  for (let row = top; row <= bottom; row++) {
    for (let col = left; col <= right; col++) {
      tiles.push({ key: `${level}/${row}/${col}`, x: col * size - ox, y: row * size - oy, size,
        url: `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${level}/${row}/${col}` });
    }
  }
  return tiles;
}
