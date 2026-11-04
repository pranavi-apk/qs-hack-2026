"""
Claims-Evidence style pack for Cascade (inspired by OpenConstructionERP patterns).

Deterministic ordered records + SHA-256 digest, change provability score,
Cap. 652 payment clock, and variation workflow trail — HK-scoped for V-2026-017.
"""
from __future__ import annotations

import hashlib
import json
from datetime import date, timedelta
from typing import Any, Dict, List


def _digest(payload: Any) -> str:
    raw = json.dumps(payload, sort_keys=True, ensure_ascii=False, default=str)
    return "SHA-256: " + hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16] + "…" + hashlib.sha256(raw.encode("utf-8")).hexdigest()[-4:]


def build_variation_workflow(variation: Dict[str, Any]) -> List[Dict[str, Any]]:
    """OCE-style Notice → Request → Order → Claim → Certificate stepper."""
    vid = variation.get("id", "V-2026-017")
    return [
        {
            "step": 1,
            "stage": "Instruction",
            "status": "complete",
            "ref": "AI-2026-084",
            "detail": "Architectural Instruction — lobby footprint +20% eastward (Gridline E).",
            "date": "14 Jul 2026",
        },
        {
            "step": 2,
            "stage": "Variation request",
            "status": "complete",
            "ref": vid,
            "detail": variation.get("title", "Lobby size increase 20%"),
            "date": "18 Jul 2026",
        },
        {
            "step": 3,
            "stage": "Fair value order",
            "status": "complete",
            "ref": "FV-017-001",
            "detail": "HKSMM4 fair value HK$18,750 (rounded) — employer benchmark.",
            "date": "22 Jul 2026",
        },
        {
            "step": 4,
            "stage": "Contractor claim",
            "status": "disputed",
            "ref": "VO-CLAIM-017",
            "detail": "Contractor claimed HK$22,510 — Cascade flags HK$5,920 inflation (GCC cl. 62).",
            "date": "25 Jul 2026",
        },
        {
            "step": 5,
            "stage": "Milestone certificate",
            "status": "active",
            "ref": "MC-017-M3",
            "detail": "60% weighted completeness → payable HK$7,500 this period.",
            "date": "28 Jul 2026",
        },
        {
            "step": 6,
            "stage": "Payment response",
            "status": "pending",
            "ref": "Cap. 652",
            "detail": "Issue payment schedule / written response within 30 days of claim.",
            "date": "Due 24 Aug 2026",
        },
    ]


def build_payment_clock(claim_received: str = "2026-07-25") -> Dict[str, Any]:
    """Cap. 652–aligned payment clock (response ≤30 days; pay admitted ≤60 days)."""
    received = date.fromisoformat(claim_received)
    response_due = received + timedelta(days=30)
    payment_due = received + timedelta(days=60)
    today = date(2026, 7, 28)  # demo freeze date (site walk-down)
    days_left = (response_due - today).days
    return {
        "ordinance": "Cap. 652 — Construction Industry Security of Payment Ordinance",
        "claim_received": received.isoformat(),
        "response_deadline": response_due.isoformat(),
        "payment_deadline_admitted": payment_due.isoformat(),
        "days_to_response": days_left,
        "status": "on_track" if days_left > 7 else ("due_soon" if days_left >= 0 else "overdue"),
        "admitted_payable_hkd": 7500.0,
        "disputed_hkd": 5920.0,
        "withheld_pending_milestones_hkd": 11250.0,
        "response_basis": "Admit milestone-certified amount; dispute inflated rates under GCC Clause 62 with cited schedule.",
    }


def build_provability(detail: Dict[str, Any]) -> Dict[str, Any]:
    """
    Change provability 0–100 (OCE Change Intelligence pattern).
    Signals: notice, instruction, drawing link, rate basis, claim annex, site evidence, Cap. 652 clock.
    """
    signals = [
        {"id": "instruction", "label": "Client instruction on record", "weight": 15, "met": True, "note": "AI-2026-084 dated 14 Jul 2026"},
        {"id": "variation_ref", "label": "Variation ID continuity", "weight": 10, "met": True, "note": detail.get("id", "V-2026-017")},
        {"id": "drawing", "label": "Drawing / BQ linked quantities", "weight": 15, "met": True, "note": "A-201 takeoff 120 m² · BQ 08-12"},
        {"id": "measurement_rule", "label": "Measurement standard cited", "weight": 15, "met": True, "note": "HKSMM4 (2024) §6.2.3"},
        {"id": "claim_annex", "label": "Line-by-line claim adjudication", "weight": 15, "met": True, "note": "GCC Clause 62 — HK$5,920 flagged"},
        {"id": "site_evidence", "label": "Contemporaneous site evidence", "weight": 15, "met": True, "note": "IMG_20260728_1045.jpg + milestone checklist"},
        {"id": "payment_clock", "label": "Payment response clock set", "weight": 15, "met": True, "note": "Cap. 652 — 30-day response window"},
    ]
    score = sum(s["weight"] for s in signals if s["met"])
    band = "strong" if score >= 85 else ("adequate" if score >= 65 else "weak")
    cures = [s["label"] for s in signals if not s["met"]]
    return {
        "score": score,
        "band": band,
        "signals": signals,
        "cure_list": cures if cures else ["No critical gaps — pack ready for payment response / adjudication annex."],
        "summary": f"Provability {score}/100 ({band}) — contemporaneous instruction, HKSMM4 basis, claim annex and Cap. 652 clock all present.",
    }


def build_certification_math(detail: Dict[str, Any]) -> Dict[str, Any]:
    cert = detail.get("cv_module", {}).get("certification", {})
    fair = float(cert.get("fair_value_total_hkd") or detail.get("fair_value_calculation", {}).get("total_fair_value") or 18750)
    pct = float(cert.get("weighted_completeness_pct") or 60)
    payable = float(cert.get("payable_milestone_hkd") or round(fair * pct / 100))
    withheld = float(cert.get("withheld_pending_hkd") or fair - payable)
    milestones = detail.get("cv_module", {}).get("milestones", [])
    return {
        "fair_value_hkd": fair,
        "weighted_completeness_pct": pct,
        "formula": f"Payable ≈ fair value × weighted completeness = {fair:,.0f} × {pct:.0f}% → HK${payable:,.0f} (demo certified amount).",
        "payable_this_period_hkd": payable,
        "withheld_hkd": withheld,
        "milestones": [
            {
                "element": m.get("element"),
                "status": m.get("status"),
                "progress_pct": m.get("progress_pct"),
                "weight_pct": m.get("weight_pct"),
                "citation": m.get("citation"),
            }
            for m in milestones
        ],
    }


def build_valuation_buildup(fv: Dict[str, Any]) -> Dict[str, Any]:
    items = fv.get("items", [])
    lines = [
        {
            "item": it["item"],
            "qty": f"{it['qty']} {it['unit']}",
            "rate": it["rate"],
            "amount": it["amount"],
            "basis": it.get("basis", ""),
            "citation_id": "C-01" if "Tile" in it["item"] and "Adhesive" not in it["item"] else (
                "C-01" if "Adhesive" in it["item"] else ("C-04" if "Grout" in it["item"] else "C-02")
            ),
        }
        for it in items
    ]
    adj = fv.get("adjustments", {})
    return {
        "lines": lines,
        "subtotal": fv.get("subtotal", sum(l["amount"] for l in lines)),
        "adjustments": adj,
        "total_fair_value": fv.get("total_fair_value"),
    }


def build_claim_annex(claim: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "title": "Contractor claim vs Cascade fair value (GCC Clause 62)",
        "items": claim.get("items", []),
        "total_claim": claim.get("total_claim"),
        "total_cascade_fair": claim.get("total_cascade_fair"),
        "total_variance": claim.get("total_variance"),
        "inflated_percentage": claim.get("inflated_percentage"),
        "recommendation": "Recommend deduction of inflated amount; admit only milestone-certified payable this period.",
    }


def build_evidence_records(detail: Dict[str, Any], report: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Ordered pack records — same idea as OCE claims_evidence reconstruct."""
    records: List[Dict[str, Any]] = [
        {
            "seq": 1,
            "type": "instruction",
            "title": "Architectural Instruction AI-2026-084",
            "source": "Employer / Architect",
            "date": "14 Jul 2026",
            "summary": detail.get("description", ""),
            "citation_ids": ["C-02"],
        },
        {
            "seq": 2,
            "type": "drawing",
            "title": "Drawing takeoff A-201 / A-105",
            "source": "Architectural drawings",
            "date": "22 Jul 2026",
            "summary": "Lobby grid 12.0 m × 10.0 m → 120 m² tile scope (not from site photo tracing).",
            "citation_ids": ["C-02", "C-01"],
        },
        {
            "seq": 3,
            "type": "measurement",
            "title": "HKSMM4 fair value build-up",
            "source": "HKSMM4 (2024) §6.2.3",
            "date": "22 Jul 2026",
            "summary": f"Fair value HK${detail.get('fair_value_calculation', {}).get('total_fair_value', 18750):,.0f} including prelim/OH&P.",
            "citation_ids": ["C-01", "C-04"],
        },
        {
            "seq": 4,
            "type": "claim",
            "title": "Contractor VO claim adjudication",
            "source": "GCC Clause 62",
            "date": "25 Jul 2026",
            "summary": f"Claim HK${detail.get('contractor_claim_adjudication', {}).get('total_claim', 22510):,.0f}; variance HK${detail.get('contractor_claim_adjudication', {}).get('total_variance', 5920):,.0f} ({detail.get('contractor_claim_adjudication', {}).get('inflated_percentage', 26.3)}%).",
            "citation_ids": ["C-03"],
        },
        {
            "seq": 5,
            "type": "evidence",
            "title": "Site evidence & milestone checklist",
            "source": detail.get("cv_module", {}).get("evidence_chain", {}).get("primary_photo", "IMG_20260728_1045.jpg"),
            "date": "28 Jul 2026",
            "summary": detail.get("cv_module", {}).get("certification", {}).get("certifier_note", "60% weighted completeness."),
            "citation_ids": ["C-05", "C-04"],
        },
        {
            "seq": 6,
            "type": "legislation",
            "title": "Cap. 652 payment response obligation",
            "source": "Cap. 652",
            "date": "28 Jul 2026",
            "summary": "Payment response within 30 days; admitted amount payable within 60 days of claim.",
            "citation_ids": ["C-06"],
        },
    ]
    # Attach report citation excerpts where available
    by_id = {c["id"]: c for c in report.get("citations", [])}
    for rec in records:
        rec["excerpts"] = [
            {"id": cid, "reference": by_id[cid]["reference"], "excerpt": by_id[cid]["excerpt"]}
            for cid in rec.get("citation_ids", [])
            if cid in by_id
        ]
    return records


def assemble_evidence_pack(detail: Dict[str, Any], report: Dict[str, Any]) -> Dict[str, Any]:
    fv = detail.get("fair_value_calculation", {})
    claim = detail.get("contractor_claim_adjudication", {})
    records = build_evidence_records(detail, report)
    buildup = build_valuation_buildup(fv)
    annex = build_claim_annex(claim)
    workflow = build_variation_workflow(detail)
    clock = build_payment_clock("2026-07-25")
    provability = build_provability(detail)
    cert_math = build_certification_math(detail)

    core = {
        "subject_type": "variation_order",
        "subject_id": detail.get("id", "V-2026-017"),
        "project": detail.get("project"),
        "records": records,
        "valuation_buildup": buildup,
        "claim_annex": annex,
        "variation_workflow": workflow,
        "payment_clock": clock,
        "provability": provability,
        "certification_math": cert_math,
        "executive": report.get("executive_summary"),
        "conclusion": report.get("conclusion"),
    }
    digest = _digest(core)
    return {
        **core,
        "pack_id": f"EP-{detail.get('id', 'V-2026-017')}-001",
        "assembled_at": "2026-07-28T10:15:00+08:00",
        "document_hash": digest,
        "inspired_by": [
            "OpenConstructionERP — claims_evidence reconstruct + change provability (pattern port; AGPL — ideas only)",
            "Cascade HK layer — HKSMM4, GCC Clause 62, Cap. 652",
        ],
    }
