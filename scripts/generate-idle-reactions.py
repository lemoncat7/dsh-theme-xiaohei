#!/usr/bin/env python3
"""Build complete-frame idle reaction strips from the canonical idle frame.

The runtime never rotates a detached ear or tail.  This source-only helper
applies a smooth inverse deformation field to the whole RGBA frame, anchors
the joint, and writes lossless WebP strips containing complete 256px frames.
"""

from __future__ import annotations

from math import cos, hypot, pi, sin
from pathlib import Path

from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src/assets/character/xiaohei-idle-eye-base-v1.webp"
ASSETS = ROOT / "src/assets/character"
FRAME_SIZE = 256
GRID_SIZE = 4


def clamp(value: float, minimum: float = 0.0, maximum: float = 1.0) -> float:
    return min(maximum, max(minimum, value))


def smoothstep(value: float) -> float:
    value = clamp(value)
    return value * value * (3.0 - 2.0 * value)


def bell(value: float, center: float, radius: float) -> float:
    distance = abs(value - center) / radius
    return 0.0 if distance >= 1.0 else 0.5 + 0.5 * cos(pi * distance)


def inverse_rotate(
    x: float,
    y: float,
    pivot_x: float,
    pivot_y: float,
    angle_degrees: float,
) -> tuple[float, float]:
    radians = -angle_degrees * pi / 180.0
    cosine = cos(radians)
    sine = sin(radians)
    dx = x - pivot_x
    dy = y - pivot_y
    return (
        pivot_x + dx * cosine - dy * sine,
        pivot_y + dx * sine + dy * cosine,
    )


def ear_mapper(side: str, angle_degrees: float):
    if side == "left":
        pivot_x, pivot_y = 84.0, 94.0
        center_x, radius_x = 84.0, 45.0
    else:
        pivot_x, pivot_y = 158.0, 111.0
        center_x, radius_x = 169.0, 48.0

    def mapper(x: float, y: float) -> tuple[float, float]:
        vertical = smoothstep((pivot_y - y) / 70.0)
        horizontal = bell(x, center_x, radius_x)
        boundary = bell(y, 64.0 if side == "left" else 78.0, 58.0)
        weight = vertical * horizontal * boundary
        return inverse_rotate(x, y, pivot_x, pivot_y, angle_degrees * weight)

    return mapper


def tail_mapper(angle_degrees: float):
    pivot_x, pivot_y = 174.0, 190.0

    def mapper(x: float, y: float) -> tuple[float, float]:
        radial = smoothstep((hypot(x - pivot_x, y - pivot_y) - 5.0) / 42.0)
        rightward = smoothstep((x - 166.0) / 32.0)
        vertical = bell(y, 213.0, 45.0)
        boundary = bell(x, 197.0, 43.0)
        weight = radial * rightward * vertical * boundary
        return inverse_rotate(x, y, pivot_x, pivot_y, angle_degrees * weight)

    return mapper


def mesh_for(mapper) -> list[tuple[tuple[int, int, int, int], tuple[float, ...]]]:
    mesh = []
    for top in range(0, FRAME_SIZE, GRID_SIZE):
        bottom = min(FRAME_SIZE, top + GRID_SIZE)
        for left in range(0, FRAME_SIZE, GRID_SIZE):
            right = min(FRAME_SIZE, left + GRID_SIZE)
            # Pillow QUAD source order: upper-left, lower-left,
            # lower-right, upper-right.
            upper_left = mapper(left, top)
            lower_left = mapper(left, bottom)
            lower_right = mapper(right, bottom)
            upper_right = mapper(right, top)
            mesh.append(((left, top, right, bottom), (
                *upper_left,
                *lower_left,
                *lower_right,
                *upper_right,
            )))
    return mesh


def deform(source: Image.Image, mapper) -> Image.Image:
    return source.transform(
        source.size,
        Image.Transform.MESH,
        mesh_for(mapper),
        resample=Image.Resampling.BICUBIC,
    )


def write_strip(name: str, frames: list[Image.Image]) -> None:
    strip = Image.new("RGBA", (FRAME_SIZE * len(frames), FRAME_SIZE))
    for index, frame in enumerate(frames):
        strip.alpha_composite(frame, (FRAME_SIZE * index, 0))
    output = ASSETS / name
    strip.save(output, "WEBP", lossless=True, method=6, exact=True)
    print(f"wrote {output.relative_to(ROOT)} ({strip.width}x{strip.height})")


def assert_local_change(source: Image.Image, frame: Image.Image, region: tuple[int, int, int, int]) -> None:
    difference = ImageChops.difference(source, frame)
    changed = difference.getbbox()
    if changed is None:
        raise RuntimeError("reaction frame did not change")
    expected = Image.new("L", source.size)
    expected.paste(255, region)
    outside = ImageChops.multiply(difference.getchannel("A"), ImageChops.invert(expected))
    # RGB changes on transparent pixels are irrelevant; visible changes must be local.
    visible = ImageChops.multiply(ImageChops.lighter(
        difference.getchannel("R"),
        ImageChops.lighter(difference.getchannel("G"), difference.getchannel("B")),
    ), source.getchannel("A"))
    if ImageChops.lighter(outside, ImageChops.multiply(visible, ImageChops.invert(expected))).getbbox():
        raise RuntimeError(f"visible deformation escaped expected region {region}: {changed}")


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    if source.size != (FRAME_SIZE, FRAME_SIZE):
        raise RuntimeError(f"expected 256x256 source, got {source.size}")

    left = [source] + [deform(source, ear_mapper("left", angle)) for angle in (-4.0, -8.0, -3.0)] + [source]
    right = [source] + [deform(source, ear_mapper("right", angle)) for angle in (4.0, 8.0, 3.0)] + [source]
    tail = [source] + [deform(source, tail_mapper(angle)) for angle in (-3.5, -8.0, -2.0, 2.0)] + [source]

    for frame in left[1:-1]:
        assert_local_change(source, frame, (35, 10, 132, 112))
    for frame in right[1:-1]:
        assert_local_change(source, frame, (110, 30, 220, 132))
    for frame in tail[1:-1]:
        assert_local_change(source, frame, (145, 157, 238, 248))

    write_strip("xiaohei-idle-ear-left-v1.webp", left)
    write_strip("xiaohei-idle-ear-right-v1.webp", right)
    write_strip("xiaohei-idle-tail-v1.webp", tail)


if __name__ == "__main__":
    main()
