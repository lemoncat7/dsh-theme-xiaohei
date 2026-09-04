#!/usr/bin/env python3
"""Build the reproducible texture atlas for the Xiaohei 2.5D skeleton."""

import json
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "src" / "assets" / "model"
SOURCE = ASSET_DIR / "xiaohei-avatar-2d-front-v1.webp"
BLINK = ASSET_DIR / "xiaohei-avatar-2d-blink-v1.webp"
ATLAS = ASSET_DIR / "xiaohei-avatar-2d-rig-atlas-v1.webp"
LAYOUT = ASSET_DIR / "xiaohei-avatar-2d-rig-atlas-v1.json"
ATLAS_SIZE = 1024
PADDING = 5


MASKS = {
    "head": [
        (174, 0), (592, 0), (592, 246), (540, 322),
        (450, 338), (318, 338), (225, 319), (174, 250),
    ],
    "torso": [
        (252, 279), (300, 273), (340, 294), (384, 304),
        (430, 294), (482, 276), (516, 305), (510, 538),
        (480, 604), (270, 604), (244, 540), (244, 314),
    ],
    "arm-left": [
        (279, 294), (300, 316), (289, 365), (250, 383),
        (202, 402), (164, 416), (145, 408), (126, 414),
        (96, 405), (82, 386), (99, 369), (128, 361),
        (154, 347), (195, 332), (235, 315),
    ],
    "arm-right": [
        (489, 294), (468, 316), (479, 365), (518, 383),
        (566, 402), (604, 416), (623, 408), (642, 414),
        (672, 405), (686, 386), (669, 369), (640, 361),
        (614, 347), (573, 332), (533, 315),
    ],
    "leg-left": [
        (258, 520), (382, 520), (383, 610), (370, 663),
        (381, 767), (240, 767), (248, 713), (252, 652),
    ],
    "leg-right": [
        (386, 520), (510, 520), (516, 652), (520, 713),
        (528, 767), (387, 767), (398, 663), (385, 610),
    ],
}


def masked_layer(source: Image.Image, polygon: list[tuple[int, int]]) -> Image.Image:
    mask = Image.new("L", source.size, 0)
    ImageDraw.Draw(mask).polygon(polygon, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(1.25))
    alpha = ImageChops.multiply(source.getchannel("A"), mask)
    result = source.copy()
    result.putalpha(alpha)
    visible = alpha.point(lambda value: 255 if value else 0)
    result = Image.composite(result, Image.new("RGBA", source.size), visible)
    result.putalpha(alpha)
    return result


def padded_bbox(images: list[Image.Image]) -> tuple[int, int, int, int]:
    boxes = [image.getchannel("A").getbbox() for image in images]
    boxes = [box for box in boxes if box]
    left = max(0, min(box[0] for box in boxes) - PADDING)
    top = max(0, min(box[1] for box in boxes) - PADDING)
    right = min(images[0].width, max(box[2] for box in boxes) + PADDING)
    bottom = min(images[0].height, max(box[3] for box in boxes) + PADDING)
    return left, top, right, bottom


def pack_shelves(items: list[dict]) -> None:
    x = PADDING
    y = PADDING
    shelf_height = 0
    for item in sorted(items, key=lambda entry: (-entry["height"], -entry["width"], entry["name"])):
        if x + item["width"] + PADDING > ATLAS_SIZE:
            x = PADDING
            y += shelf_height + PADDING
            shelf_height = 0
        if y + item["height"] + PADDING > ATLAS_SIZE:
            raise RuntimeError("2.5D rig atlas exceeded 1024x1024")
        item["atlas_x"] = x
        item["atlas_y"] = y
        x += item["width"] + PADDING
        shelf_height = max(shelf_height, item["height"])


def main() -> None:
    base = Image.open(SOURCE).convert("RGBA")
    blink = Image.open(BLINK).convert("RGBA")
    layers = {
        name: masked_layer(base, polygon)
        for name, polygon in MASKS.items()
    }
    layers["head-blink"] = masked_layer(blink, MASKS["head"])

    head_bbox = padded_bbox([layers["head"], layers["head-blink"]])
    items = []
    for name, image in layers.items():
        box = head_bbox if name.startswith("head") else padded_bbox([image])
        crop = image.crop(box)
        items.append({
            "name": name,
            "image": crop,
            "source_box": box,
            "width": crop.width,
            "height": crop.height,
        })
    pack_shelves(items)

    atlas = Image.new("RGBA", (ATLAS_SIZE, ATLAS_SIZE))
    manifest = {
        "version": 1,
        "atlas": {"width": ATLAS_SIZE, "height": ATLAS_SIZE},
        "attachments": {},
    }
    source_width, source_height = base.size
    for item in items:
        atlas.alpha_composite(item["image"], (item["atlas_x"], item["atlas_y"]))
        left, top, right, bottom = item["source_box"]
        manifest["attachments"][item["name"]] = {
            "rect": [item["atlas_x"], item["atlas_y"], item["width"], item["height"]],
            "bounds": [
                left / source_width - 0.5,
                right / source_width - 0.5,
                1 - bottom / source_height,
                1 - top / source_height,
            ],
        }

    atlas.save(ATLAS, "WEBP", lossless=True, method=6, exact=True)
    LAYOUT.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(ATLAS.relative_to(ROOT))
    print(LAYOUT.relative_to(ROOT))


if __name__ == "__main__":
    main()
