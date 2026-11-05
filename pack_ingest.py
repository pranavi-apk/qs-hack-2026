"""Ingest uploaded variation pack files into a dynamic case (PDF text + heuristics)."""
from __future__ import annotations

import copy
import io
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

CLUSTER_KEYWORDS: Dict[str, List[str]] = {
    "finishes": ["tile", "finish", "grout", "skirting", "emulsion", "screed", "lobby", "floor"],
    "reinforcement": ["rebar", "reinforcement", "mesh", "bar ", "steel"],
    "mep": ["mep", "conduit", "light", "drain", "hvac", "electrical", "mechanical", "trap"],
    "doors_frames": ["door", "frame", "architrave", "fire door"],
    "formwork": ["formwork", "shutter", "soffit"],
    "columns": ["column", "concrete", "c35", "encasing"],
}

ALL_CLUSTER_IDS = list(CLUSTER_KEYWORDS.keys())


def _extract_text(filename: str, raw: bytes, content_type: Optional[str]) -> str:
    name = (filename or "").lower()
    if name.endswith(".pdf") or (content_type or "").endswith("pdf"):
        try:
            from pypdf import PdfReader

            reader = PdfReader(io.BytesIO(raw))
            parts = []
            for page in reader.pages[:25]:
                parts.append(page.extract_text() or "")
            text = "\n".join(parts)
            if text.strip():
                return text
        except Exception:
            pass
        return raw.decode("utf-8", errors="ignore")[:50000]
    if name.endswith((".txt", ".csv", ".md")):
        try:
            return raw.decode("utf-8", errors="ignore")[:50000]
        except Exception:
            return ""
    return ""


def _guess_discipline(filename: str, text: str) -> str:
    n = filename.lower()
    if "ai-" in n or "instruction" in n or "architectural instruction" in text.lower()[:800]:
        return "Instruction"
    if "a-" in n or "drawing" in n or "plan" in n:
        return "Drawing"
    if "bq" in n or "bill" in n:
        return "BQ"
    if "claim" in n or "vo_" in n or n.endswith(".xlsx"):
        return "Claim"
    if "spc" in n or "spec" in n:
        return "Spec"
    if "site" in n or "checklist" in n:
        return "Site"
    return "Document"


def _cluster_ids_for(filename: str, text: str, is_trigger: bool) -> List[str]:
    if is_trigger:
        return ALL_CLUSTER_IDS[:]
    blob = f"{filename} {text[:4000]}".lower()
    hits = [cid for cid, keys in CLUSTER_KEYWORDS.items() if any(k in blob for k in keys)]
    return hits or ["finishes"]


def _detect_variation_id(filenames: List[str], texts: List[str]) -> str:
    blob = " ".join(filenames) + " " + " ".join(texts)
    m = re.search(r"V-20\d{2}-\d{3,4}", blob, re.I)
    if m:
        return m.group(0).upper()
    m = re.search(r"AI-20(\d{2})-(\d{3,4})", blob, re.I)
    if m:
        return f"V-20{m.group(1)}-{m.group(2)}"
    m = re.search(r"VO[_\s-]?(\d{3,4})", blob, re.I)
    if m:
        return f"V-2026-{m.group(1).zfill(3)}"
    return f"V-NEW-{uuid.uuid4().hex[:6].upper()}"


def _detect_title(texts: List[str], filenames: List[str]) -> str:
    for t in texts:
        for line in t.splitlines():
            line = line.strip()
            if 12 < len(line) < 120 and not line.startswith("Page"):
                return line[:100]
    base = filenames[0] if filenames else "Uploaded variation"
    return re.sub(r"\.[a-z0-9]+$", "", base, flags=re.I)[:80]


def _detect_description(texts: List[str]) -> str:
    blob = " ".join(texts)
    m = re.search(r"(AI-20\d{2}-\d{3}[^\n.]{0,200})", blob, re.I)
    if m:
        return m.group(1).strip()
    snippet = blob.strip().replace("\n", " ")[:320]
    return snippet or "Variation scope derived from uploaded pack (Cascade ingest)."


def _detect_tile_sqm(texts: List[str]) -> Optional[float]:
    blob = " ".join(texts)
    m = re.search(r"(\d{2,4}(?:\.\d+)?)\s*m²", blob, re.I)
    if m:
        return float(m.group(1))
    m = re.search(r"(\d+(?:\.\d+)?)\s*×\s*(\d+(?:\.\d+)?)\s*m", blob, re.I)
    if m:
        return round(float(m.group(1)) * float(m.group(2)), 2)
    m = re.search(r"tile[^\d]{0,20}(\d{2,4}(?:\.\d+)?)\s*m", blob, re.I)
    if m:
        return float(m.group(1))
    return None


def _detect_drawing_ref(filenames: List[str]) -> str:
    for fn in filenames:
        m = re.search(r"(A-\d{3})", fn, re.I)
        if m:
            return m.group(1).upper()
    return "A-201"


def _revalue_fair_value(fv: Dict[str, Any], tile_sqm: float) -> Dict[str, Any]:
    out = copy.deepcopy(fv)
    items = out.get("items") or []
    tile = next((i for i in items if "tile" in i.get("item", "").lower()), None)
    if not tile:
        return out
    rate = float(tile.get("rate") or 128)
    tile["qty"] = tile_sqm
    tile["amount"] = round(tile_sqm * rate, 2)
    subtotal = sum(float(i.get("amount") or 0) for i in items)
    out["subtotal"] = round(subtotal, 2)
    adj_pct = 0.13
    adj = round(subtotal * adj_pct, 2)
    out["adjustments"] = {"description": "Prelim, OH&P (13%)", "amount": adj}
    out["total_fair_value"] = round(subtotal + adj, 2)
    return out


def _revalue_claim(claim: Dict[str, Any], fair_total: float, fair_subtotal: float) -> Dict[str, Any]:
    out = copy.deepcopy(claim)
    ratio = fair_subtotal / 16590.0 if fair_subtotal else 1.0
    for row in out.get("items") or []:
        fair = round(float(row.get("cascade_fair") or 0) * ratio, 2)
        row["cascade_fair"] = fair
        claim_amt = round(float(row.get("claim_amount") or 0) * ratio * 1.263, 2)
        row["claim_amount"] = claim_amt
        row["variance"] = round(max(0, claim_amt - fair), 2)
    out["total_cascade_fair"] = round(float(out.get("total_cascade_fair") or 0) * ratio, 2)
    out["total_claim"] = round(sum(float(r["claim_amount"]) for r in out.get("items") or []), 2)
    out["total_variance"] = round(out["total_claim"] - out["total_cascade_fair"], 2)
    pct = (out["total_variance"] / out["total_cascade_fair"] * 100) if out["total_cascade_fair"] else 0
    out["inflated_percentage"] = round(pct, 1)
    return out


def _revalue_cert(cv: Dict[str, Any], fair_total: float) -> Dict[str, Any]:
    out = copy.deepcopy(cv)
    pct = float(out.get("certification", {}).get("weighted_completeness_pct") or 60)
    payable = round(fair_total * pct / 100 * 0.67, 0)  # milestone split heuristic
    withheld = round(fair_total - payable, 0)
    cert = dict(out.get("certification") or {})
    cert["fair_value_total_hkd"] = fair_total
    cert["payable_milestone_hkd"] = payable
    cert["withheld_pending_hkd"] = withheld
    out["certification"] = cert
    return out


def ingest_uploaded_pack(
    file_payloads: List[Dict[str, Any]],
    template: Dict[str, Any],
) -> Dict[str, Any]:
    """
    file_payloads: [{filename, content_type, raw: bytes}, ...]
    Returns a full variation dict stored as a new case.
    """
    case = copy.deepcopy(template)
    filenames: List[str] = []
    texts: List[str] = []
    pack_documents: List[Dict[str, Any]] = []

    for idx, fp in enumerate(file_payloads):
        fn = fp.get("filename") or f"upload_{idx}.bin"
        raw = fp.get("raw") or b""
        text = _extract_text(fn, raw, fp.get("content_type"))
        filenames.append(fn)
        texts.append(text)
        discipline = _guess_discipline(fn, text)
        is_trigger = discipline == "Instruction" or "ai-" in fn.lower()
        cluster_ids = _cluster_ids_for(fn, text, is_trigger)
        doc_id = f"doc_{idx}_{re.sub(r'[^a-z0-9]+', '_', fn.lower())[:24]}"
        label = fn
        m = re.search(r"(AI-20\d{2}-\d{3}|A-\d{3}|BQ[\w-]+|VO[\w-]+)", fn, re.I)
        if m:
            label = m.group(0)
        pack_documents.append(
            {
                "id": doc_id,
                "label": label[:32],
                "filename": fn,
                "discipline": discipline,
                "role": (text.strip().replace("\n", " ")[:140] if text.strip() else f"Ingested · {len(raw):,} bytes"),
                "is_trigger": is_trigger,
                "cluster_ids": cluster_ids,
                "extracted_chars": len(text),
            }
        )

    if not pack_documents:
        raise ValueError("No files to ingest")

    vid = _detect_variation_id(filenames, texts)
    title = _detect_title(texts, filenames)
    description = _detect_description(texts)
    tile_sqm = _detect_tile_sqm(texts)
    drawing_ref = _detect_drawing_ref(filenames)

    case["id"] = vid
    case["title"] = title
    case["description"] = description
    case["date"] = datetime.now(timezone.utc).strftime("%d %b %Y")
    case["pack_documents"] = pack_documents
    case["ingest_meta"] = {
        "source": "upload",
        "file_count": len(file_payloads),
        "tile_sqm_detected": tile_sqm,
        "drawing_ref": drawing_ref,
        "ingested_at": datetime.now(timezone.utc).isoformat(),
    }

    g = case.get("graph") or {}
    center = dict(g.get("center") or {})
    center["id"] = vid
    center["label"] = title[:24].replace(" ", "\n", 1) if len(title) > 12 else title
    g["center"] = center
    case["graph"] = g

    if tile_sqm:
        case["fair_value_calculation"] = _revalue_fair_value(case["fair_value_calculation"], tile_sqm)
        fair = case["fair_value_calculation"]
        case["contractor_claim_adjudication"] = _revalue_claim(
            case["contractor_claim_adjudication"],
            fair["total_fair_value"],
            fair["subtotal"],
        )
        cv = case.get("cv_module") or {}
        cv["reference_area_sqm"] = tile_sqm
        cv["drawing_ref"] = drawing_ref
        w = (tile_sqm ** 0.5) * 1.095
        cv["world_width_m"] = round(w, 1)
        cv["world_depth_m"] = round(tile_sqm / w, 1)
        dt = cv.get("drawing_takeoff") or {}
        dt["tile_scope_sqm"] = tile_sqm
        dt["lobby_grid_m"] = f"{cv['world_width_m']} × {cv['world_depth_m']}"
        dt["note"] = f"Tile quantity from ingested drawing text ({drawing_ref})."
        cv["drawing_takeoff"] = dt
        case["cv_module"] = _revalue_cert(cv, fair["total_fair_value"])

        impact = case.get("impact_summary") or {}
        impact["estimated_impact"] = fair["total_fair_value"]
        case["impact_summary"] = impact

    return case
