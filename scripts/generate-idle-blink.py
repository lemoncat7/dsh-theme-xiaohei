#!/usr/bin/env python3
"""Build a geometry-locked blink frame from the canonical idle sheet.

The open frame owns every pixel outside the eyes. Only the eye patch is taken
from the closed frame, so blinking cannot resize or shift Xiaohei's body.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src/assets/character/xiaohei-idle.webp"
OUTPUT = ROOT / "src/assets/character/xiaohei-idle-blink-v1.webp"
FRAME_SIZE = 256
OPEN_FRAME = 7
CLOSED_FRAME = 6
EYE_REGION = (47, 78, 140, 140)


def frame(sheet: Image.Image, index: int) -> Image.Image:
    column = index % 4
    row = index // 4
    return sheet.crop((
        column * FRAME_SIZE,
        row * FRAME_SIZE,
        (column + 1) * FRAME_SIZE,
        (row + 1) * FRAME_SIZE,
    ))


def eye_mask() -> Image.Image:
    mask = Image.new("L", (FRAME_SIZE, FRAME_SIZE), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((50, 82, 90, 134), fill=255)
    draw.ellipse((90, 81, 136, 137), fill=255)
    return mask.filter(ImageFilter.GaussianBlur(1.5))


def assert_only_eyes_changed(opened: Image.Image, blink: Image.Image) -> None:
    difference = ImageChops.difference(opened, blink)
    if difference.getbbox() is None:
        raise RuntimeError("blink frame did not change")

    allowed = Image.new("L", opened.size, 0)
    ImageDraw.Draw(allowed).rectangle(EYE_REGION, fill=255)
    visible_difference = ImageChops.lighter(
        difference.getchannel("A"),
        ImageChops.lighter(
            difference.getchannel("R"),
            ImageChops.lighter(difference.getchannel("G"), difference.getchannel("B")),
        ),
    )
    outside = ImageChops.multiply(visible_difference, ImageChops.invert(allowed))
    if outside.getbbox() is not None:
        raise RuntimeError(f"blink changed pixels outside the eyes: {outside.getbbox()}")


def main() -> None:
    sheet = Image.open(SOURCE).convert("RGBA")
    if sheet.size != (FRAME_SIZE * 4, FRAME_SIZE * 2):
        raise RuntimeError(f"expected 1024x512 idle sheet, got {sheet.size}")

    opened = frame(sheet, OPEN_FRAME)
    closed = frame(sheet, CLOSED_FRAME)
    blink = Image.composite(closed, opened, eye_mask())
    assert_only_eyes_changed(opened, blink)

    blink.save(OUTPUT, "WEBP", lossless=True, method=6, exact=True)
    written = Image.open(OUTPUT).convert("RGBA")
    assert_only_eyes_changed(opened, written)
    print(f"wrote {OUTPUT.relative_to(ROOT)} ({written.width}x{written.height})")


if __name__ == "__main__":
    main()
