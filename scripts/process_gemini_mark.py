"""Turns the Gemini-generated pin+check artwork into app assets:
favicon.png (as-is, it's already a clean square on brand blue) and a
transparent-background splash-icon.png (chroma-keyed off the flat blue
backdrop, cropped to content, centered on a padded square canvas).

Run once: py -3 scripts/process_gemini_mark.py <path-to-source-image>
"""
import sys
import math
from PIL import Image

OUT = "assets/images"


def chroma_key(im: Image.Image, bg, near=14, far=60) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            d = math.dist((r, g, b), bg)
            if d <= near:
                px[x, y] = (r, g, b, 0)
            elif d < far:
                px[x, y] = (r, g, b, int(255 * (d - near) / (far - near)))
    return im


def crop_to_content(im: Image.Image, pad_frac=0.10) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    x0, y0, x1, y1 = bbox
    w, h = x1 - x0, y1 - y0
    side = int(max(w, h) * (1 + pad_frac * 2))
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    off = ((side - w) // 2, (side - h) // 2)
    canvas.alpha_composite(im.crop(bbox), off)
    return canvas


if __name__ == "__main__":
    src = sys.argv[1]
    im = Image.open(src).convert("RGB")
    bg = im.getpixel((5, 5))

    im.resize((512, 512), Image.LANCZOS).save(f"{OUT}/favicon.png")

    keyed = chroma_key(im, bg)
    mark = crop_to_content(keyed).resize((640, 640), Image.LANCZOS)
    mark.save(f"{OUT}/splash-icon.png")
    mark.save(f"{OUT}/splash-icon-dark.png")

    print("Wrote favicon.png, splash-icon.png, splash-icon-dark.png from", src)
