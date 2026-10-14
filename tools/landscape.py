"""Draws the transparent landscape behind the hero, the page heads, the menu and the footer:
misty hills in layers of translucent white, a wind farm on the far ridge and a power line
running off into the distance. White, so it only lightens the light it sits on.

    python3 tools/landscape.py        (writes assets/img/deco/landscape.svg and landscape-hero.svg)

The drawing is 2400 x 520 units with the wind farm on the right; the canvas reaches 3200
units further left (hills and the power line only), so it covers wide screens when it is
anchored bottom right. The hero version leaves out the power line (it would run behind the
slogan). Standard library only.
"""
import math
import os

W, H = 2400, 520        # the drawing; the wind farm stands in its right part
EXT = 3200              # how far the canvas continues to the left of x = 0
INK = "#14261d"         # --ink in style.css

# x, hub height, rotor angle (degrees), depth (1 = farther: smaller, fainter, lower on the ridge).
# Blade tips must stay inside the canvas (far(x) + 6 - 1.62 * height > 8), no blade may point
# straight down along its tower, and neighbouring rotors keep clear of each other.
TURBINES = [(1745, 168, -14, 0), (1930, 150, 36, 1), (2090, 204, -6, 0), (2265, 176, 2, 0), (2395, 140, -34, 1)]
# x, height: equal towers on the left, then smaller and closer together towards the wind farm
PYLONS = [(x, 118) for x in range(-3300, -500, 400)] + [(-560, 118), (-200, 118), (150, 116), (540, 110),
                                                         (900, 100), (1220, 88), (1490, 76), (1700, 64)]


def num(v):
    s = f"{v:.1f}"
    s = s[:-2] if s.endswith(".0") else s
    return "0" if s == "-0" else s


def bump(x, c, h, w):
    return h * math.exp(-((x - c) / w) ** 2)


def far(x):
    return (418 - bump(x, 2050, 70, 560) - bump(x, 1250, 26, 300) - bump(x, -700, 22, 420)
            - bump(x, -2300, 30, 520) - 9 * math.sin(x / 230) - 5 * math.sin(x / 101 + 1.3))


def mid(x):
    return (452 - bump(x, 1650, 40, 380) - bump(x, 2300, 34, 260) - bump(x, 700, 26, 330)
            - bump(x, -1300, 24, 380) - bump(x, -2800, 20, 420) - 6 * math.sin(x / 170 + .4))


def near(x):
    return (492 - bump(x, 2150, 40, 420) - bump(x, 950, 18, 380) - bump(x, -1800, 16, 500)
            - 4 * math.sin(x / 140 + 2.1))


def ridge(fn, step=40):
    """A hill layer: the ridge as a smooth curve (Catmull-Rom as cubic Béziers), closed below the
    canvas, so one path carries both the translucent fill and the white edge line."""
    x0, x1 = -EXT - 40, W + 40
    pts = [(x, fn(x)) for x in range(x0, x1, step)] + [(x1, fn(x1))]
    d = [f"M{num(pts[0][0])} {num(pts[0][1])}"]
    cur = pts[0]
    for i in range(len(pts) - 1):
        p0, p1, p2 = pts[max(i - 1, 0)], pts[i], pts[i + 1]
        p3 = pts[min(i + 2, len(pts) - 1)]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d.append("c" + " ".join(num(v) for v in (c1[0] - cur[0], c1[1] - cur[1], c2[0] - cur[0],
                                                c2[1] - cur[1], p2[0] - cur[0], p2[1] - cur[1])))
        cur = p2
    d.append(f"V{H + 40}H{num(pts[0][0])}Z")
    return "".join(d)


def turbine(x, y, h, angle):
    """Three-blade turbine standing at (x, y) with hub height h, the rotor facing the viewer."""
    hx, hy = x, y - h
    bw, tw = 0.036 * h, 0.018 * h
    d = [f"M{num(x - bw / 2)} {num(y)}L{num(hx - tw / 2)} {num(hy + 0.03 * h)}H{num(hx + tw / 2)}L{num(x + bw / 2)} {num(y)}Z"]
    nl, nh = 0.09 * h, 0.032 * h        # nacelle, seen a little from the side
    d.append(f"M{num(hx - 0.015 * h)} {num(hy - nh / 2)}h{num(nl)}a{num(nh / 2)} {num(nh / 2)} 0 0 1 0 {num(nh)}h{num(-nl)}z")
    length = 0.62 * h
    for k in range(3):
        a = math.radians(angle + 120 * k)
        ux, uy = math.sin(a), -math.cos(a)

        def p(t, c):            # t along the blade, c across it (chord)
            return (hx + ux * t * length - uy * c * h, hy + uy * t * length + ux * c * h)
        a0, a1, a2 = p(0.04, -0.011), p(0.4, -0.012), p(1.0, -0.002)
        b0, b1, b2, b3 = p(1.0, 0.002), p(0.5, 0.019), p(0.17, 0.034), p(0.05, 0.017)
        d.append(f"M{num(a0[0])} {num(a0[1])}Q{num(a1[0])} {num(a1[1])} {num(a2[0])} {num(a2[1])}"
                 f"L{num(b0[0])} {num(b0[1])}C{num(b1[0])} {num(b1[1])} {num(b2[0])} {num(b2[1])} {num(b3[0])} {num(b3[1])}Z")
    return "".join(d), f'<circle cx="{num(hx)}" cy="{num(hy)}" r="{num(0.024 * h)}"/>'


def pylon(x, y, h):
    """Lattice transmission tower: legs, X bracing, two crossarms with insulator strings.
    Returns the drawing and the points the cables hang from."""
    bw, tw = 0.30 * h, 0.07 * h
    top = y - h

    def half(t):
        return (bw + (tw - bw) * t) / 2
    d = [f"M{num(x - bw / 2)} {num(y)}L{num(x - tw / 2)} {num(top + 0.08 * h)}L{num(x)} {num(top)}"
         f"L{num(x + tw / 2)} {num(top + 0.08 * h)}L{num(x + bw / 2)} {num(y)}"]
    levels = [0, 0.17, 0.32, 0.46, 0.58, 0.70, 0.86]
    for a, b in zip(levels, levels[1:]):
        ya, yb = y - a * h, y - b * h
        d.append(f"M{num(x - half(a))} {num(ya)}L{num(x + half(b))} {num(yb)}M{num(x + half(a))} {num(ya)}L{num(x - half(b))} {num(yb)}")
    tips = []
    for t, span in ((0.70, 0.60 * h), (0.86, 0.44 * h)):
        ya = y - t * h
        hw = half(t)
        d.append(f"M{num(x - span / 2)} {num(ya)}H{num(x + span / 2)}"
                 f"M{num(x - span / 2)} {num(ya)}L{num(x - hw)} {num(ya + 0.05 * h)}"
                 f"M{num(x + span / 2)} {num(ya)}L{num(x + hw)} {num(ya + 0.05 * h)}")
        for sx in (-1, 1):
            tip = (x + sx * span / 2, ya)
            d.append(f"M{num(tip[0])} {num(tip[1])}v{num(0.065 * h)}")
            tips.append((tip[0], tip[1] + 0.065 * h))
    return "".join(d), tips


def opacity(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def draw(power_line=True):
    ns = ' vector-effect="non-scaling-stroke"'
    edge = f'stroke="#fff" stroke-opacity=".95" stroke-width="1.3"{ns}'
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-EXT} 0 {W + EXT} {H}" width="{W + EXT}" height="{H}">',
         "<!-- ECOES JV site: transparent landscape, drawn by tools/landscape.py -->", "<defs>"]
    # each hill layer is most opaque along its ridge and fades towards the bottom
    for gid, top, (a0, a1) in (("f", far(2050), (.46, .12)), ("m", mid(1650), (.52, .16)), ("n", near(2150), (.6, .22))):
        o.append(f'<linearGradient id="{gid}" gradientUnits="userSpaceOnUse" x1="0" y1="{num(top)}" x2="0" y2="{H}">'
                 f'<stop offset="0" stop-color="#fff" stop-opacity="{a0}"/><stop offset="1" stop-color="#fff" stop-opacity="{a1}"/></linearGradient>')
    o.append("</defs>")

    # the wind farm on the far ridge, farther turbines first (the ridge covers their feet)
    for depth in (1, 0):
        paths, hubs = [], []
        for x, h, angle, dp in TURBINES:
            if dp == depth:
                d, hub = turbine(x, far(x) + 6 + 10 * depth, h, angle)
                paths.append(d)
                hubs.append(hub.replace("/>", ns + "/>"))
        o.append(f'<g fill="#fff" fill-opacity="{opacity(.62 * (1 - .35 * depth))}" stroke="{INK}" '
                 f'stroke-opacity="{opacity(.2 * (1 - .4 * depth))}" stroke-width=".9" stroke-linejoin="round">'
                 f'<path d="{"".join(paths)}"{ns}/>{"".join(hubs)}</g>')
    o.append(f'<path d="{ridge(far)}" fill="url(#f)" {edge}/>')

    # the power line over the middle hills, its cables sagging between the towers
    if power_line:
        towers, tips = [], []
        for x, h in PYLONS:
            d, t = pylon(x, mid(x) + 3, h)
            if -EXT <= x <= W:
                towers.append(d)
            tips.append(t)
        cables = []
        for t0, t1 in zip(tips, tips[1:]):
            for a, b in zip(t0, t1):
                sag = 2 * .045 * (b[0] - a[0])
                cables.append(f"M{num(a[0])} {num(a[1])}Q{num((a[0] + b[0]) / 2)} {num((a[1] + b[1]) / 2 + sag)} {num(b[0])} {num(b[1])}")
        o.append(f'<g fill="none" stroke="{INK}" stroke-linejoin="round">'
                 f'<path d="{"".join(cables)}" stroke-opacity=".13" stroke-width=".9"{ns}/>'
                 f'<path d="{"".join(towers)}" stroke-opacity=".15" stroke-width="1"{ns}/></g>')
    o.append(f'<path d="{ridge(mid)}" fill="url(#m)" {edge}/>')
    o.append(f'<path d="{ridge(near)}" fill="url(#n)" {edge}/>')
    o.append("</svg>")
    return "\n".join(o) + "\n"


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "img", "deco")
    os.makedirs(out, exist_ok=True)
    for name, svg in (("landscape.svg", draw()), ("landscape-hero.svg", draw(power_line=False))):
        with open(os.path.join(out, name), "w") as fh:
            fh.write(svg)
        print(name, round(len(svg.encode()) / 1024, 1), "KB")
