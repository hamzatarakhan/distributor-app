"""One-off generator for the Sales Rep app icon/splash/favicon mark.

No AI image gen available (banana MCP not configured, no API key) — draws a
simple two-tone "pin + check" glyph with PIL instead: a location pin (visit)
with a checkmark cut out of its head (confirmed). Supersampled 4x then
downscaled for anti-aliasing since PIL has no native AA drawing.

Run once: py -3 scripts/gen_brand_assets.py
"""
from PIL import Image, ImageDraw, ImageChops

BRAND = (10, 110, 189, 255)       # #0A6EBD — primary (light mode)
BRAND_DARK = (59, 158, 229, 255)  # #3B9EE5 — primary (dark mode, brighter for contrast)
WHITE = (255, 255, 255, 255)

OUT = "assets/images"
SS = 4  # supersample factor


def pin_glyph_mask(size: int) -> Image.Image:
    """Returns an 'L' mask: white pin silhouette with a checkmark-shaped hole cut out."""
    S = size * SS
    cx, cy, r = S * 0.5, S * 0.40, S * 0.27

    pin = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(pin)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
    d.polygon(
        [
            (cx - r * 0.95, cy + r * 0.05),
            (cx + r * 0.95, cy + r * 0.05),
            (cx, S * 0.86),
        ],
        fill=255,
    )

    check = Image.new("L", (S, S), 0)
    dc = ImageDraw.Draw(check)
    pts = [
        (cx - r * 0.48, cy + r * 0.02),
        (cx - r * 0.08, cy + r * 0.42),
        (cx + r * 0.55, cy - r * 0.32),
    ]
    w = max(2, int(r * 0.30))
    dc.line(pts, fill=255, width=w, joint="curve")
    for p in pts:
        dc.ellipse([p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2], fill=255)

    glyph = ImageChops.subtract(pin, check)
    return glyph.resize((size, size), Image.LANCZOS)


def solid_square(size: int, color) -> Image.Image:
    return Image.new("RGBA", (size, size), color)


def composited_icon(size: int, bg_color) -> Image.Image:
    """Full-bleed square: brand-color background + white pin/check glyph (checkmark
    hole reveals the background color underneath — no separate 'draw the check' step)."""
    base = solid_square(size, bg_color)
    glyph_scale = 0.62
    g = pin_glyph_mask(int(size * glyph_scale))
    white_layer = Image.new("RGBA", g.size, WHITE)
    white_layer.putalpha(g)
    off = ((size - g.size[0]) // 2, int(size * 0.16))
    base.alpha_composite(white_layer, off)
    return base


def transparent_glyph(size: int, color, scale: float) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    g = pin_glyph_mask(int(size * scale))
    layer = Image.new("RGBA", g.size, color)
    layer.putalpha(g)
    off = ((size - g.size[0]) // 2, (size - g.size[1]) // 2)
    canvas.alpha_composite(layer, off)
    return canvas


if __name__ == "__main__":
    composited_icon(1024, BRAND).save(f"{OUT}/icon.png")
    composited_icon(1024, BRAND).resize((256, 256), Image.LANCZOS).save(f"{OUT}/favicon.png")

    solid_square(1024, BRAND).save(f"{OUT}/android-icon-background.png")
    transparent_glyph(1024, WHITE, 0.50).save(f"{OUT}/android-icon-foreground.png")
    transparent_glyph(1024, WHITE, 0.46).save(f"{OUT}/android-icon-monochrome.png")

    transparent_glyph(640, BRAND, 0.62).save(f"{OUT}/splash-icon.png")
    transparent_glyph(640, BRAND_DARK, 0.62).save(f"{OUT}/splash-icon-dark.png")

    print("Wrote icon.png, favicon.png, android-icon-{background,foreground,monochrome}.png, splash-icon(-dark).png")
