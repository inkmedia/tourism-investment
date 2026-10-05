"""Build production assets without changing the supplied SVG or its semantic IDs.
Run with Python 3 + Pillow: python scripts/prepare-bhutan-map.py
"""
from pathlib import Path
import base64
import io
import re
from PIL import Image

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
(root / 'public/img/bhutan-map-production.svg').write_text(optimized)
assert re.findall(r'\bid="([^"]+)"', source) == re.findall(r'\bid="([^"]+)"', optimized)
print('Satellite:', (root / 'public/img/bhutan-satellite.webp').stat().st_size)
print('SVG:', len(optimized.encode()))
