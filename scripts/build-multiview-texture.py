#!/usr/bin/env python3
"""Build a projection texture without leaking the generated turntable backdrop."""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import binary_erosion, distance_transform_edt


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--threshold", type=float, default=13.0)
    parser.add_argument("--padding", type=int, default=3)
    parser.add_argument("--max-height", type=int, default=512)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    image = Image.open(args.input).convert("RGB")
    pixels = np.asarray(image, dtype=np.float32)

    border = np.concatenate(
        (
            pixels[:12].reshape(-1, 3),
            pixels[-12:].reshape(-1, 3),
            pixels[:, :12].reshape(-1, 3),
            pixels[:, -12:].reshape(-1, 3),
        ),
        axis=0,
    )
    backdrop = np.median(border, axis=0)
    distance = np.linalg.norm(pixels - backdrop, axis=2)
    foreground = distance >= args.threshold

    rows, columns = np.nonzero(foreground)
    if rows.size == 0:
        raise RuntimeError(f"No foreground detected in {args.input}")

    top = max(0, int(rows.min()) - args.padding)
    bottom = min(pixels.shape[0], int(rows.max()) + args.padding + 1)
    left = max(0, int(columns.min()) - args.padding)
    right = min(pixels.shape[1], int(columns.max()) + args.padding + 1)
    crop = pixels[top:bottom, left:right].astype(np.uint8)
    crop_foreground = foreground[top:bottom, left:right]

    # Projection textures intentionally extend the nearest painted surface
    # beyond the silhouette. Trilinear sampling can then never pull the gray
    # turntable backdrop onto a grazing-angle mesh surface.
    interior = binary_erosion(crop_foreground, iterations=2)
    if not interior.any():
        interior = crop_foreground
    _, nearest = distance_transform_edt(~interior, return_indices=True)
    extended = crop.copy()
    background = ~crop_foreground
    extended[background] = crop[nearest[0][background], nearest[1][background]]

    texture = Image.fromarray(extended, "RGB")
    if texture.height > args.max_height:
        target_width = max(1, round(texture.width * args.max_height / texture.height))
        texture = texture.resize((target_width, args.max_height), Image.Resampling.LANCZOS)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    texture.save(args.output, "WEBP", quality=94, method=6)
    print(
        f"{args.output}: {texture.width}x{texture.height}; "
        f"background={backdrop.round(1).tolist()}"
    )


if __name__ == "__main__":
    main()
