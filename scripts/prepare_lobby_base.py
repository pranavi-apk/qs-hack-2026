"""Strip baked-in green QA overlays from lobby site photos for live SVG masks."""
from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "asbuilt_lobby_pure_hd.png"
OUT = ROOT / "public" / "lobby_site_base.jpg"


def main() -> None:
    img = cv2.imread(str(SRC))
    if img is None:
        raise SystemExit(f"Missing source image: {SRC}")

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    mask = cv2.inRange(hsv, np.array([40, 35, 35]), np.array([95, 255, 255]))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    cleaned = cv2.inpaint(img, mask, 3, cv2.INPAINT_NS)

    h, w = cleaned.shape[:2]
    target_w = 1200
    scale = target_w / w
    upscaled = cv2.resize(
        cleaned,
        (target_w, int(h * scale)),
        interpolation=cv2.INTER_LANCZOS4,
    )
    cv2.imwrite(str(OUT), upscaled, [cv2.IMWRITE_JPEG_QUALITY, 95])
    print(f"Wrote {OUT} ({upscaled.shape[1]}x{upscaled.shape[0]})")


if __name__ == "__main__":
    main()
