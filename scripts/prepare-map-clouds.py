"""Bake the original procedural cloud fields; keep this work out of the scroll thread."""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
WIDTH, HEIGHT = 512, 320


def texture(seed, variant):
    def random():
        nonlocal seed
        seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF
        return seed / 4294967296

    grids = [(size, np.fromiter((random() for _ in range((size + 1) ** 2)), np.float32).reshape(size + 1, size + 1))
             for size in (6, 15, 37, 89, 211)]

    def sample(x, y, octave):
        size, values = grids[octave]
        px, py = np.clip(x, 0, .9999) * size, np.clip(y, 0, .9999) * size
        ix, iy = px.astype(int), py.astype(int)
        sx, sy = px - ix, py - iy
        fx, fy = sx * sx * (3 - 2 * sx), sy * sy * (3 - 2 * sy)
        top = values[iy, ix] * (1 - fx) + values[iy, ix + 1] * fx
        bottom = values[iy + 1, ix] * (1 - fx) + values[iy + 1, ix + 1] * fx
        return top * (1 - fy) + bottom * fy

    def noise(x, y):
        return sum(sample(x, y, i) * weight for i, weight in enumerate((.25, .24, .22, .18, .11)))

    wispy = variant == 2
    lobes = [(.2 + random() * .6, .28 + random() * .44,
              .09 + random() * (.2 if variant == 3 else .14), .06 + random() * (.09 if wispy else .18))
             for _ in range(8 if wispy else 12)]

    def smoothstep(value, low, high):
        t = np.clip((value - low) / (high - low), 0, 1)
        return t * t * (3 - 2 * t)

    def density_at(x, y):
        wx, wy = x + (sample(x, y, 1) - .5) * .14, y + (sample(y, x, 2) - .5) * .13
        envelope = np.maximum.reduce([np.exp(-(((wx - lx) / rx) ** 2 + ((wy - ly) / ry) ** 2) * 1.5)
                                      for lx, ly, rx, ry in lobes])
        density = np.maximum(0, envelope * (noise(wx, wy) * 1.7 + .15) - (.27 if wispy else .18))
        edge = smoothstep(np.minimum.reduce([x, y, 1 - x, 1 - y]), .015, .13)
        return (1 - np.exp(-density * (3.8 if variant == 1 else 1.6 if wispy else 2.8))) * edge

    y, x = np.mgrid[:HEIGHT, :WIDTH]
    u, v = x / WIDTH, y / HEIGHT
    density = density_at(u, v)
    light = np.clip(.79 + (density - density_at(u - .008, v - .012)) * 1.2 + (noise(u, v) - .4) * .55, .66, 1)
    rgba = np.stack([248 * light, 250 * light, np.minimum(255, 253 * light + (1 - light) * 12),
                     np.power(density, 1.15 if wispy else .8) * 255], axis=-1)
    rgba[density == 0] = 0
    return Image.fromarray(np.rint(rgba).clip(0, 255).astype('uint8'))


if __name__ == '__main__':
    output = ROOT / 'public/img/map-clouds'
    output.mkdir(exist_ok=True)
    for i, seed in enumerate((137, 721, 1931, 3109)):
        path = output / f'cloud-{i + 1}.png'
        texture(seed, i).save(path, optimize=True)
        print(f'{path.name}: {path.stat().st_size:,} bytes')
