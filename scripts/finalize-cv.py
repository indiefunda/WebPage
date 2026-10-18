"""Finalise the printed CV.

Chrome's headless print pipeline shrinks the A4 artwork slightly and leaves
unused paper to the right/bottom. This post-process scales the vector content
back up to the full A4 canvas, keeps the hyperlinks aligned, and writes proper
document metadata.

Requires: Python 3 + PyMuPDF (`pip install pymupdf`).
"""

from pathlib import Path
import shutil

import pymupdf

ROOT = Path(__file__).resolve().parent.parent
PUBLIC_PDF = ROOT / "public" / "cv" / "Natalia-Afentoulidou-CV.pdf"
DIST_PDF = ROOT / "dist" / "cv" / "Natalia-Afentoulidou-CV.pdf"
TMP_PDF = PUBLIC_PDF.with_suffix(".tmp.pdf")

SCALE_X = 1.089
SCALE_Y = 1.05
TRANSLATE_Y = -35.0

document = pymupdf.open(PUBLIC_PDF)

for page in document:
    links = [
        (link.get("uri"), link["from"])
        for link in page.get_links()
        if link.get("uri")
    ]

    for link in page.get_links():
        page.delete_link(link)

    for xref in page.get_contents():
        content = document.xref_stream(xref)
        scaled = (
            f"q {SCALE_X} 0 0 {SCALE_Y} 0 {TRANSLATE_Y} cm\n".encode("ascii")
            + content
            + b"\nQ"
        )
        document.update_stream(xref, scaled)

    # PyMuPDF link rectangles use top-left coordinates. The content matrix is
    # expressed in PDF (bottom-left) coordinates, so translate accordingly.
    link_y_shift = page.rect.height * (1 - SCALE_Y) - TRANSLATE_Y

    for uri, rect in links:
        new_rect = pymupdf.Rect(
            rect.x0 * SCALE_X,
            rect.y0 * SCALE_Y + link_y_shift,
            rect.x1 * SCALE_X,
            rect.y1 * SCALE_Y + link_y_shift,
        )
        page.insert_link({"kind": pymupdf.LINK_URI, "from": new_rect, "uri": uri})

document.set_metadata(
    {
        "title": "Natalia Afentoulidou - Curriculum Vitae",
        "author": "Natalia Afentoulidou",
        "subject": "Curriculum Vitae: selected exhibitions, education, residencies, awards, illustrations and press.",
        "keywords": "Natalia Afentoulidou, artist, curriculum vitae, Athens, drawing, installation, mixed media",
        "creator": "Natalia Afentoulidou",
        "producer": "Natalia Afentoulidou studio",
    }
)

document.save(TMP_PDF, deflate=True, garbage=3)
document.close()

TMP_PDF.replace(PUBLIC_PDF)
DIST_PDF.parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile(PUBLIC_PDF, DIST_PDF)

final = pymupdf.open(PUBLIC_PDF)
print(f"Finalised {PUBLIC_PDF.name}: {len(final)} pages, {PUBLIC_PDF.stat().st_size / 1024:.0f} KB")
final.close()
