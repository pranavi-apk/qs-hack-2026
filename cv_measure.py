"""
Floor-plane area from site-photo polygons via OpenCV homography.

Maps a quadrilateral on the image (lobby footprint) to a rectangle in metres
from Drawing A-201, then measures segment polygons in real m² on that plane.
"""
from __future__ import annotations

from typing import List, Sequence, TypedDict

import cv2
import numpy as np


class PointNorm(TypedDict):
    x: float
    y: float


def _to_np(points: Sequence[PointNorm]) -> np.ndarray:
    return np.array([[p["x"], p["y"]] for p in points], dtype=np.float32)


def homography_areas_sqm(
    footprint_norm: Sequence[PointNorm],
    segment_norm: Sequence[PointNorm],
    world_width_m: float,
    world_depth_m: float,
) -> dict:
    """
    footprint_norm: 4 corners of lobby on photo (clockwise), normalized 0–1.
    segment_norm: polygon vertices on the same photo plane.
    world_*: true lobby dimensions from drawing takeoff (A-201).
    """
    if len(footprint_norm) != 4:
        raise ValueError("footprint_norm requires exactly 4 points")
    if len(segment_norm) < 3:
        raise ValueError("segment_norm requires at least 3 points")

    src = _to_np(footprint_norm)
    dst = np.array(
        [
            [0.0, 0.0],
            [world_width_m, 0.0],
            [world_width_m, world_depth_m],
            [0.0, world_depth_m],
        ],
        dtype=np.float32,
    )
    h_mat, _ = cv2.findHomography(src, dst)

    seg = _to_np(segment_norm).reshape(-1, 1, 2)
    world = cv2.perspectiveTransform(seg, h_mat).reshape(-1, 2)

    area = 0.0
    n = len(world)
    for i in range(n):
        x1, y1 = world[i]
        x2, y2 = world[(i + 1) % n]
        area += x1 * y2 - x2 * y1
    area = abs(area) / 2.0

    footprint_world = cv2.perspectiveTransform(src.reshape(-1, 1, 2), h_mat).reshape(-1, 2)
    fp_area = 0.0
    for i in range(4):
        x1, y1 = footprint_world[i]
        x2, y2 = footprint_world[(i + 1) % 4]
        fp_area += x1 * y2 - x2 * y1
    fp_area = abs(fp_area) / 2.0

    return {
        "area_sqm": round(float(area), 2),
        "footprint_sqm": round(float(fp_area), 2),
        "share_of_footprint": round(float(area / fp_area), 4) if fp_area > 0 else 0.0,
        "method": "opencv_homography_x_drawing_a201",
    }


def enrich_cv_module(cv: dict) -> dict:
    """Attach homography-derived m² to each segment."""
    footprint = cv.get("footprint_norm") or []
    world_w = float(cv.get("world_width_m", 12.0))
    world_d = float(cv.get("world_depth_m", 10.0))
    segments: List[dict] = []
    for seg in cv.get("segments") or []:
        pts = seg.get("points_norm") or []
        try:
            metrics = homography_areas_sqm(footprint, pts, world_w, world_d)
        except ValueError:
            metrics = {"area_sqm": 0.0, "footprint_sqm": world_w * world_d, "share_of_footprint": 0.0}
        segments.append({**seg, **metrics})
    out = {**cv, "segments": segments, "measurement_engine": "OpenCV homography (local)"}
    out["footprint_sqm_drawing"] = round(world_w * world_d, 2)
    return out
