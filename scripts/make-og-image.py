"""
Generate the Open Graph share image referenced by src/app/layout.tsx.

The metadata pointed at /og-image.png, which did not exist — every social share
would have rendered a broken preview. This draws it from the site's own tokens
(background #050505, gold gradient #f6ecc4 -> #d4af37 -> #a07d24) so the card
matches the portfolio rather than looking bolted on.

Text is intentionally minimal: name, role, and site. No statistics, since the
whole point of this pass is that unverifiable numbers came off the site.
"""

from PIL import Image, ImageDraw, ImageFont
import math

W, H = 1200, 630
BG = (5, 5, 5)
GOLD_STOPS = [(0.0, (246, 236, 196)), (0.45, (212, 175, 55)), (1.0, (160, 125, 36))]


def lerp(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def gold_at(t):
    """Sample the site's gold gradient at position t in [0, 1]."""
    t = max(0.0, min(1.0, t))
    for i in range(len(GOLD_STOPS) - 1):
        t0, c0 = GOLD_STOPS[i]
        t1, c1 = GOLD_STOPS[i + 1]
        if t0 <= t <= t1:
            return lerp(c0, c1, (t - t0) / (t1 - t0))
    return GOLD_STOPS[-1][1]


img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img, "RGBA")

# Radial gold wash at the top, echoing .bg-gold-radial on the site.
#
# Kept deliberately faint. A denser wash reads as a glowing yellow slab and
# washes out the white type — on the site itself this radial sits at 0.18 alpha
# and is barely perceptible, so the share card should match that restraint.
cx, cy, radius = W * 0.5, -H * 0.55, H * 1.15
for r in range(int(radius), 0, -3):
    t = r / radius
    alpha = int(11 * (1 - t) ** 2.6)
    if alpha <= 0:
        continue
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(212, 175, 55, alpha))

# Faint grid, matching .grid-pattern.
for x in range(0, W, 48):
    draw.line([(x, 0), (x, H)], fill=(255, 255, 255, 8), width=1)
for y in range(0, H, 48):
    draw.line([(0, y), (W, y)], fill=(255, 255, 255, 8), width=1)


def load(paths, size):
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            continue
    raise SystemExit(
        f"none of these fonts could be opened at size {size}: {paths}\n"
        "Install one, or add a path for this platform to the lists below. "
        "Falling back to ImageFont.load_default() was the old behaviour and it "
        "is worse than failing: that face is a fixed ~11px bitmap, so it "
        "silently ignores every size here and writes a card nobody can read."
    )


# Font candidates, tried in order; first one that opens wins.
#
# DejaVu leads because the committed card was drawn with it, so regenerating on a
# machine that has it reproduces the same typography. The Windows paths are the
# fallback for a machine without DejaVu — Georgia Bold, Segoe UI, and Consolas
# are the closest stock equivalents, and a card redrawn with them is a slightly
# different but coherent design rather than a broken one.
SERIF = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
    "C:/Windows/Fonts/georgiab.ttf",
]
SANS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "C:/Windows/Fonts/segoeui.ttf",
]
MONO = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
    "C:/Windows/Fonts/consola.ttf",
]

f_name = load(SERIF, 78)
f_head = load(SERIF, 52)
f_body = load(SANS, 27)
f_mono = load(MONO, 21)

M = 90
y = 132

# Eyebrow rule + label
draw.line([(M, y), (M + 54, y)], fill=(212, 175, 55), width=3)
draw.text((M + 70, y - 12), "INDEPENDENT", font=f_mono, fill=(150, 150, 150))
y += 44

draw.text((M, y), "Bandidoz", font=f_name, fill=(255, 255, 255))
y += 104

# Headline, drawn per-glyph so it carries the gold gradient.
headline = "Web3 Security · AI Agents"
x = M
for ch in headline:
    w = draw.textlength(ch, font=f_head)
    draw.text((x, y), ch, font=f_head, fill=gold_at((x - M) / 620))
    x += w
y += 82

for line in [
    "Blockchain security research, autonomous AI agents,",
    "and the infrastructure underneath them.",
]:
    draw.text((M, y), line, font=f_body, fill=(163, 163, 163))
    y += 38

# Footer: site + tech, separated by a hairline.
#
# Keep this host in step with SITE_URL in src/lib/site.ts. It is baked into the
# PNG, so a domain move means re-running this script — the previous domain sat
# printed on the share card for every link shared after the site had already
# moved off it.
draw.line([(M, H - 108), (W - M, H - 108)], fill=(255, 255, 255, 26), width=1)
draw.text((M, H - 78), "bandidoz.tech", font=f_mono, fill=(212, 175, 55))

tail = "Python · TypeScript · Solidity · Rust"
draw.text(
    (W - M - draw.textlength(tail, font=f_mono), H - 78),
    tail,
    font=f_mono,
    fill=(115, 115, 115),
)

# Corner bracket — a small nod to the gold accents used across the site.
draw.line([(W - M - 60, 118), (W - M, 118)], fill=(212, 175, 55, 190), width=3)
draw.line([(W - M, 118), (W - M, 178)], fill=(212, 175, 55, 190), width=3)

img.save("public/og-image.png", "PNG", optimize=True)
print(f"wrote public/og-image.png  {img.size[0]}x{img.size[1]}")
