#!/usr/bin/env python3
"""Render fast, deterministic turntable previews from a vertex-colored mesh."""

from __future__ import annotations

import argparse
import math
from pathlib import Path

import cv2
import numpy as np
import trimesh
from PIL import Image


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("mesh", type=Path)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--views", type=int, default=12)
    parser.add_argument("--size", type=int, default=384)
    parser.add_argument("--supersample", type=int, default=2)
    return parser.parse_args()


def normalize(vector: np.ndarray) -> np.ndarray:
    length = np.linalg.norm(vector)
    return vector / max(length, 1e-8)


def render_view(
    mesh: trimesh.Trimesh,
    angle: float,
    size: int,
    supersample: int,
) -> Image.Image:
    canvas_size = size * supersample
    background = np.asarray([236, 236, 232], dtype=np.uint8)
    canvas = np.full((canvas_size, canvas_size, 3), background, dtype=np.uint8)

    center = mesh.bounds.mean(axis=0)
    extent = mesh.bounds[1] - mesh.bounds[0]
    radius = max(float(extent[0]), float(extent[1])) * 2.8
    camera = center + np.asarray(
        [math.cos(angle) * radius, math.sin(angle) * radius, extent[2] * 0.08]
    )
    forward = normalize(center - camera)
    world_up = np.asarray([0.0, 0.0, 1.0])
    right = normalize(np.cross(forward, world_up))
    camera_up = normalize(np.cross(right, forward))

    relative = np.asarray(mesh.vertices) - center
    projected = np.column_stack((relative @ right, relative @ camera_up))
    depth = relative @ forward

    projected_extent = np.ptp(projected, axis=0)
    scale = (canvas_size * 0.82) / max(float(projected_extent.max()), 1e-8)
    points = projected * scale
    points[:, 0] += canvas_size * 0.5
    points[:, 1] = canvas_size * 0.51 - points[:, 1]

    faces = np.asarray(mesh.faces)
    face_depth = depth[faces].mean(axis=1)
    order = np.argsort(face_depth)
    vertex_colors = np.asarray(mesh.visual.vertex_colors[:, :3], dtype=np.float32)
    face_colors = vertex_colors[faces].mean(axis=1)

    light = normalize(np.asarray([0.5, -0.45, 0.74]))
    diffuse = np.clip(np.asarray(mesh.face_normals) @ light, -1.0, 1.0)
    lighting = 0.88 + np.maximum(diffuse, 0.0) * 0.12
    face_colors = np.clip(face_colors * lighting[:, None], 0, 255).astype(np.uint8)

    for face_index in order:
        polygon = np.rint(points[faces[face_index]]).astype(np.int32)
        color = tuple(int(channel) for channel in face_colors[face_index][::-1])
        cv2.fillConvexPoly(canvas, polygon, color, lineType=cv2.LINE_AA)

    canvas = cv2.cvtColor(canvas, cv2.COLOR_BGR2RGB)
    image = Image.fromarray(canvas)
    if supersample > 1:
        image = image.resize((size, size), Image.Resampling.LANCZOS)
    return image


def main() -> None:
    args = parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    mesh = trimesh.load(args.mesh, process=False)
    if isinstance(mesh, trimesh.Scene):
        mesh = mesh.dump(concatenate=True)
    if not isinstance(mesh, trimesh.Trimesh):
        raise TypeError(f"expected one mesh, got {type(mesh).__name__}")

    for index in range(args.views):
        angle = index * math.tau / args.views
        image = render_view(mesh, angle, args.size, args.supersample)
        image.save(args.output_dir / f"view-{index:02d}.png")


if __name__ == "__main__":
    main()
