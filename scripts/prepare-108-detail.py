"""Preserve KMZ line colors and point annotations for the on-demand detail viewer."""
from pathlib import Path
import collections, json, math, zipfile
import xml.etree.ElementTree as ET
ROOT = Path(__file__).resolve().parents[1]
NS = {'k': 'http://www.opengis.net/kml/2.2'}
r = ET.fromstring(zipfile.ZipFile(ROOT / 'public/108 Alignment.kmz').read('doc.kml'))
RADIUS = 6378137
ORIGIN = {'x': RADIUS * math.radians(90.51),
          'y': RADIUS * math.log(math.tan(math.pi / 4 + math.radians(26.94) / 2))}
def xy(token):
    lon, lat = map(float, token.split(',')[:2])
    # EPSG:3857, translated locally and with south-positive SVG y.
    # The same projection and origin are used by the satellite tile grid.
    return [round(RADIUS * math.radians(lon) - ORIGIN['x'], 2),
            round(ORIGIN['y'] - RADIUS * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)), 2)]
paths = collections.defaultdict(set)
points = []
allxy = []
for p in r.findall('.//k:Placemark', NS):
    color = p.findtext('k:Style/k:LineStyle/k:color', 'ffffffff', NS)
    rgb = '#' + color[6:8] + color[4:6] + color[2:4]
    for line in p.findall('.//k:LineString/k:coordinates', NS):
        coords = [xy(t) for t in line.text.split()]
        allxy.extend(coords)
        for a,b in zip(coords,coords[1:]):
            if a != b: paths[rgb].add(tuple(sorted((tuple(a),tuple(b)))))
    for point in p.findall('.//k:Point/k:coordinates', NS):
        lon,lat = map(float, point.text.strip().split(',')[:2])
        x,y = xy(point.text.strip()); name = p.findtext('k:name','',NS)
        points.append({'x':x,'y':y,'name':name,'longitude':lon,'latitude':lat,'numbered':name.isdigit() and 1 <= int(name) <= 108})
        allxy.append([x,y])
xs,ys=zip(*allxy)
data={'projection':'EPSG:3857','origin':ORIGIN,'bounds':{'x':min(xs),'y':min(ys),'width':max(xs)-min(xs),'height':max(ys)-min(ys)},'paths':[{'color':c,'d':' '.join(f'M{a[0]},{a[1]} {b[0]},{b[1]}' for a,b in sorted(lines))} for c,lines in paths.items()], 'points':points}
out=ROOT/'public/img/108-alignment-detail.json';out.write_text(json.dumps(data,separators=(',',':')))
print(f'{len(paths)} original colors, {len(points)} point annotations, {sum(p["numbered"] for p in points)} numbered markers; {out.stat().st_size} bytes')
