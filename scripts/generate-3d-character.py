#!/usr/bin/env python3
"""Generate a reviewable GLB on CPU with TripoSR's memory-heavy stages split."""

from __future__ import annotations

import argparse
import gc
import subprocess
import sys
from pathlib import Path

import numpy as np
import torch
from einops import rearrange
from PIL import Image


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("image", type=Path)
    parser.add_argument("--triposr-dir", type=Path, required=True)
    parser.add_argument("--checkpoint", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--resolution", type=int, default=128)
    parser.add_argument("--chunk-size", type=int, default=1024)
    parser.add_argument("--views", type=int, default=12)
    return parser.parse_args()


def convert_module_in_place(module: torch.nn.Module, dtype: torch.dtype) -> None:
    """Convert module tensors without temporarily duplicating the whole model."""
    with torch.no_grad():
        for parameter in module.parameters():
            if parameter.is_floating_point() and parameter.dtype != dtype:
                parameter.data = parameter.data.to(dtype)
        for child in module.modules():
            for name, buffer in tuple(child._buffers.items()):
                if buffer is not None and buffer.is_floating_point() and buffer.dtype != dtype:
                    child._buffers[name] = buffer.to(dtype)


def extract_mesh(decoder, renderer, scene_codes, resolution: int):
    import trimesh
    from tsr.models.isosurface import MarchingCubeHelper
    from tsr.utils import scale_tensor

    helper = MarchingCubeHelper(resolution)
    points = scale_tensor(
        helper.grid_vertices.to(scene_codes.device),
        helper.points_range,
        (-renderer.cfg.radius, renderer.cfg.radius),
    )
    with torch.inference_mode():
        density = renderer.query_triplane(decoder, points, scene_codes[0])["density_act"]
    vertices, faces = helper(-(density - 25.0))
    vertices = scale_tensor(
        vertices,
        helper.points_range,
        (-renderer.cfg.radius, renderer.cfg.radius),
    )
    with torch.inference_mode():
        colors = renderer.query_triplane(decoder, vertices, scene_codes[0])["color"]
    return trimesh.Trimesh(
        vertices=vertices.cpu().numpy(),
        faces=faces.cpu().numpy(),
        vertex_colors=colors.cpu().numpy(),
    )


def main() -> None:
    args = parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    sys.path.insert(0, str(args.triposr_dir.resolve()))

    # The host has no GPU and limited RAM. Constructing the model directly in
    # bfloat16 prevents the fp32 module and fp32 checkpoint from coexisting at
    # full size. CPU inference supports bfloat16 on the installed PyTorch.
    torch.set_num_threads(2)
    torch.set_default_dtype(torch.bfloat16)

    scene_code_path = args.output_dir / "scene-codes.pt"
    rgb = image_tokens = tokens = None

    if scene_code_path.exists():
        from omegaconf import OmegaConf
        from tsr.utils import find_class

        print("loading cached TripoSR decoder", flush=True)
        config = OmegaConf.load(args.checkpoint / "config.yaml")
        OmegaConf.resolve(config)
        decoder = find_class(config.decoder_cls)(config.decoder).eval()
        renderer = find_class(config.renderer_cls)(config.renderer).eval()
        checkpoint = torch.load(
            args.checkpoint / "model.ckpt",
            map_location="cpu",
            mmap=True,
            weights_only=True,
        )
        decoder.load_state_dict(
            {
                key.removeprefix("decoder."): value
                for key, value in checkpoint.items()
                if key.startswith("decoder.")
            }
        )
        del checkpoint
        renderer.set_chunk_size(args.chunk_size)
        print(f"loading cached scene code: {scene_code_path}", flush=True)
        scene_codes = torch.load(
            scene_code_path,
            map_location="cpu",
            weights_only=True,
        ).to(dtype=torch.bfloat16)
    else:
        from tsr.system import TSR

        print("loading TripoSR in bfloat16", flush=True)
        model = TSR.from_pretrained(
            str(args.checkpoint.resolve()),
            config_name="config.yaml",
            weight_name="model.ckpt",
        ).eval()
        # Some normalization layers explicitly allocate fp32 parameters even
        # under a bfloat16 default.
        convert_module_in_place(model, torch.bfloat16)
        model.renderer.set_chunk_size(args.chunk_size)
        dtype = next(model.parameters()).dtype
        image = Image.open(args.image).convert("RGB")
        rgb = model.image_processor([image], model.cfg.cond_image_size)[:, None].to(
            device="cpu", dtype=dtype
        )

        print("reconstructing scene code", flush=True)
        with torch.inference_mode():
            image_tokens = model.image_tokenizer(
                rearrange(rgb, "B Nv H W C -> B Nv C H W", Nv=1)
            )
            image_tokens = rearrange(
                image_tokens, "B Nv C Nt -> B (Nv Nt) C", Nv=1
            )
            tokens = model.tokenizer(rgb.shape[0])
            tokens = model.backbone(tokens, encoder_hidden_states=image_tokens)
            scene_codes = model.post_processor(model.tokenizer.detokenize(tokens))
        torch.save(scene_codes.cpu(), scene_code_path)

        decoder = model.decoder
        renderer = model.renderer

    # Release the encoder before switching the compact decoder and triplane to
    # fp32 for marching cubes, whose CPU extension does not accept bfloat16.
    rgb = image_tokens = tokens = None
    if "model" in locals():
        model.image_tokenizer = None
        model.tokenizer = None
        model.backbone = None
        model.post_processor = None
    gc.collect()

    torch.set_default_dtype(torch.float32)
    convert_module_in_place(decoder, torch.float32)
    scene_codes = scene_codes.float()

    print(f"extracting {args.resolution}³ mesh", flush=True)
    mesh = extract_mesh(decoder, renderer, scene_codes, args.resolution)
    mesh.remove_unreferenced_vertices()
    # Keep a simple recovery artifact even if a GLB exporter dependency fails.
    mesh.export(args.output_dir / "character.ply")
    mesh_path = args.output_dir / "character.glb"
    mesh.export(mesh_path)

    print(f"rendering {args.views} review angles", flush=True)
    review_script = Path(__file__).with_name("render-mesh-review.py")
    subprocess.run(
        [
            sys.executable,
            str(review_script),
            str(mesh_path),
            "--output-dir",
            str(args.output_dir),
            "--views",
            str(args.views),
        ],
        check=True,
    )

    metadata = {
        "vertices": int(len(mesh.vertices)),
        "faces": int(len(mesh.faces)),
        "bounds": np.asarray(mesh.bounds).round(6).tolist(),
    }
    (args.output_dir / "mesh-info.txt").write_text(
        "\n".join(f"{key}: {value}" for key, value in metadata.items()) + "\n",
        encoding="utf-8",
    )
    print(mesh_path, flush=True)


if __name__ == "__main__":
    main()
