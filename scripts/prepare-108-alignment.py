"""Convert the supplied KMZ to a lightweight SVG overlay (standard library only).

The PDF-derived map has no CRS. This local affine registration uses its Gelephu,
Sarpang and Trongsa city-dot centers; it is illustrative, not survey-accurate.
Control coordinates: https://mapcarta.com/Gelephu,
https://mapcarta.com/14850598, https://www.geonames.org/1252408/trongsa.html.
Re-run after replacing the KMZ or changing the base artwork.
"""
from pathlib import Path
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
NS = {'k': 'http://www.opengis.net/kml/2.2'}
# lon, lat, artwork x, artwork y
G = (90.4856, 26.8704, 1315.511, 1668.09)
S = (90.26895, 26.86585, 1192.48, 1675.57)
T = (90.50716, 27.50260, 1325.339, 1227.78)


def project(lon, lat):
    a, b = S[0] - G[0], T[0] - G[0]
    c, d = S[1] - G[1], T[1] - G[1]
    u = ((lon - G[0]) * d - b * (lat - G[1])) / (a * d - b * c)
    v = (a * (lat - G[1]) - (lon - G[0]) * c) / (a * d - b * c)
    return (round(G[2] + u * (S[2] - G[2]) + v * (T[2] - G[2]), 1),
            round(G[3] + u * (S[3] - G[3]) + v * (T[3] - G[3]), 1))


def main():
    with zipfile.ZipFile(ROOT / 'public/108 Alignment.kmz') as archive:
        kml = ET.fromstring(archive.read('doc.kml'))
    # Quantize to 0.1 artwork unit and deduplicate CAD segments. Tiny CAD text,
    # point annotations and subpixel segments do not need thousands of DOM nodes.
    segments = set()
    source_count = 0
    for line in kml.findall('.//k:LineString/k:coordinates', NS):
        points = [project(*map(float, token.split(',')[:2])) for token in line.text.split()]
        source_count += 1
        for start, end in zip(points, points[1:]):
            if start != end:
                segments.add(tuple(sorted((start, end))))
    if not segments:
        raise ValueError('KMZ contains no drawable alignment geometry')
    path = ' '.join(f'M{x:g},{y:g} {xx:g},{yy:g}' for ((x, y), (xx, yy)) in sorted(segments))
    svg = ('<svg xmlns="http://www.w3.org/2000/svg"><g id="layer-alignment108" '
           'class="map-layer" aria-label="108 Alignment (approximate placement)" '
           'fill="none" stroke="#ff7d45" stroke-width="1.5" stroke-linecap="round" '
           'stroke-linejoin="round" pointer-events="none">'
           f'<path vector-effect="non-scaling-stroke" d="{path}"/></g></svg>\n')
    destination = ROOT / 'public/img/108-alignment.svg'
    destination.write_text(svg)
    print(f'{source_count:,} source lines → {len(segments):,} unique segments, {destination.stat().st_size:,} bytes')


if __name__ == '__main__':
    main()
