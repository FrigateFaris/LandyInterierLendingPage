"""Vector brand assets from the Illustrator source (Landy Исходник.ai is PDF-compatible).

-> media/brand/landy.svg (wordmark), lnd.svg (short logo), mark.svg (n̄ sign), arch.svg (big arch sign)
   all painted with currentColor so CSS sets the colour per theme.
"""
import os, re
import pymupdf

SRC = r'C:\Users\Asus\Downloads\Telegram Desktop\Landy Исходник.ai'
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'media', 'brand')
os.makedirs(OUT, exist_ok=True)

d = pymupdf.open(SRC)
for idx, name in [(9, 'landy'), (10, 'lnd'), (11, 'mark'), (13, 'arch')]:
    p = d[idx]; W, H = p.rect.width, p.rect.height
    rects = [dr['rect'] for dr in p.get_drawings() if not (dr['rect'].width >= W - 1 and dr['rect'].height >= H - 1)]
    bb = rects[0]
    for r in rects[1:]: bb |= r
    svg = p.get_svg_image()
    # drop the full-artboard background, paint the artwork with currentColor
    svg = re.sub(r'<path transform="matrix\(1,0,0,-1,0,%d\)" d="M0 [\d.]+H%dV%dH0Z" fill="#[0-9a-fA-F]{6}"/>\n?' % (int(H), int(W), int(H)), '', svg)
    svg = re.sub(r'fill="#[0-9a-fA-F]{6}"', 'fill="currentColor"', svg)
    svg = re.sub(r'\s*xmlns:inkscape="[^"]*"', '', svg); svg = re.sub(r'\s*inkscape:[a-z]+="[^"]*"', '', svg)
    pad = 2
    svg = re.sub(r'width="[\d.]+" height="[\d.]+" viewBox="[^"]+"',
                 'viewBox="%.1f %.1f %.1f %.1f"' % (bb.x0 - pad, bb.y0 - pad, bb.width + 2 * pad, bb.height + 2 * pad), svg, count=1)
    with open(os.path.join(OUT, name + '.svg'), 'w', encoding='utf-8') as fh: fh.write(svg)
    print(name, round(bb.width), round(bb.height), len(svg))
