"""Build production assets without changing the supplied SVG or its semantic IDs.
Run with Python 3 + Pillow: python scripts/prepare-bhutan-map.py
"""
from pathlib import Path
import base64
import io
import re
from PIL import Image

def update_map_layers(markup):
    """Expose the supplied GMC outline and remove dams from the published map."""
    markup = re.sub(r'<g id="layer-dams"[^>]*>.*?</g>', '', markup, flags=re.S)
    markup = re.sub(r'<path id="dam-key-[^"]*"[^>]*/>', '', markup)
    markup = re.sub(r'<g id="legend-label-dam"[^>]*>.*?</g>', '', markup, flags=re.S)
    outline = re.search(r'<path id="boundary-002"[^>]*/>', markup)
    if not outline:
        raise RuntimeError('Expected supplied GMC outline boundary-002')
    border = outline[0].replace('stroke="#ffffff"', 'stroke="#f4d274"').replace('stroke-width="1"', 'stroke-width="3"')
    border = border.replace('stroke-linejoin="miter"', 'stroke-linejoin="round"')
    markup = markup.replace(outline[0], '')
    layer = ('<g id="layer-gmc-boundary" class="map-layer" aria-label="Gelephu Mindfulness City boundary">'
             + border + '<text x="1250" y="1505" fill="#f4d274" font-family="Arial, sans-serif" font-size="24" '
             'font-weight="600" stroke="#17291e" stroke-width="3" paint-order="stroke" pointer-events="none">GMC</text></g>')
    markup = markup.replace('<g id="layer-religious-sites"', layer + '\n<g id="layer-religious-sites"', 1)
    legend = ('<path id="gmc-boundary-key" d="M 37 2387 L 58 2387" fill="none" stroke="#f4d274" stroke-width="3"/>'
              '<g id="legend-label-gmc-boundary" class="animatable legend-label-group">'
              '<text class="legend-label" x="70.05" y="2392.791" font-family="Arial, sans-serif" '
              'font-size="14" fill="#ffffff">GMC boundary</text></g>')
    return re.sub(r'(<g id="layer-legend"[^>]*>)', lambda match: match[0] + legend, markup, count=1)

Image.MAX_IMAGE_PIXELS = 120_000_000
root = Path(__file__).resolve().parents[1]
source = (root / 'public/img/Bhutan_Map.svg').read_text()
pattern = r'(?:xlink:)?href="data:image/[^;]+;base64,([^"]+)"'
match = re.search(pattern, source)
if not match:
    raise RuntimeError('Expected embedded satellite raster')
image = Image.open(io.BytesIO(base64.b64decode(match[1])))
image.thumbnail((4096, 4096), Image.Resampling.LANCZOS)
image.save(root / 'public/img/bhutan-satellite.webp', 'WEBP', quality=88, method=6)
preview = Image.open(root / 'public/img/site-context.png').convert('RGB')
preview.thumbnail((1600, 1000), Image.Resampling.LANCZOS)
preview.save(root / 'public/img/bhutan-map-preview.webp', 'WEBP', quality=82, method=6)
optimized = re.sub(pattern, 'href="/img/bhutan-satellite.webp"', source)
# Scope source style rules so inline artwork cannot affect unrelated SVGs.
optimized = optimized.replace('.map-label{', '.bhutan-map-svg .map-label{').replace('.animatable{', '.bhutan-map-svg .animatable{')
optimized = re.sub(r'<\?xml[^>]+>\s*', '', optimized)
optimized = optimized.replace('<svg ', '<svg class="bhutan-map-svg" ', 1)
optimized = update_map_layers(optimized)
(root / 'public/img/bhutan-map-production.svg').write_text(optimized)
assert 'id="layer-dams"' not in optimized and 'id="layer-gmc-boundary"' in optimized
print('Satellite:', (root / 'public/img/bhutan-satellite.webp').stat().st_size)
print('SVG:', len(optimized.encode()))
