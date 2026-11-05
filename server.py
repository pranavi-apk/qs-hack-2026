import os
import json
import requests
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, Response
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv

from cv_measure import enrich_cv_module
from graph_store import get_impact_graph
from evidence_pack import assemble_evidence_pack
from pack_ingest import ingest_uploaded_pack
from document_export import render_evidence_html, render_evidence_pdf

load_dotenv()

# In-memory cases keyed by variation id (uploaded packs + demo id)
CASES: Dict[str, Any] = {}
CASE_FILE_STORE: Dict[str, List[Dict[str, Any]]] = {}

app = FastAPI(title="Cascade AI - QS Decision Support")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("ALIBABA_LLM_API_KEY", "")
ENDPOINT = os.getenv("ALIBABA_LLM_ENDPOINT", "")
MODEL = os.getenv("ALIBABA_LLM_MODEL", "qwen3.6-plus")

# Mock Initial Data representing the exact variation scenario V-2026-017
VARIATION_DATA = {
    "id": "V-2026-017",
    "title": "Lobby size increase 20%",
    "project": "HA Public Housing Development - Block 4",
    "status": "In Progress",
    "category": "Finishes & Structural",
    "description": "Architectural Instruction AI-2026-084 instructing an extension of the ground floor entrance lobby footprint by 20% eastward towards Gridline E.",
    "date": "28 Jul 2026",
    "impact_summary": {
        "total_affected_items": 263,
        "direct_items": 48,
        "indirect_2hop": 126,
        "indirect_3hop": 89,
        "estimated_impact": 18750.00
    },
    "graph": {
        "center": {
            "id": "V-2026-017",
            "label": "Lobby size\nincrease 20%",
            "type": "root",
            "count": 263
        },
        "clusters": [
            { "id": "finishes", "label": "Finishes", "count": 3, "level": 1, "items": ["Floor Tiles 600x600", "Skirting 100mm", "Wall Emulsion"] },
            { "id": "reinforcement", "label": "Reinforcement", "count": 4, "level": 1, "items": ["T16 High Tensile Rebar", "Mesh Fabric A142", "Starter Bars", "T10 Links"] },
            { "id": "mep", "label": "MEP", "count": 11, "level": 1, "items": ["Conduit Extension", "Lobby Downlights", "Floor Trap Drainage", "HVAC Diffusers"] },
            { "id": "doors_frames", "label": "Doors /\nFrames", "count": 2, "level": 1, "items": ["Glazed Fire Door Relocation", "Aluminium Architrave"] },
            { "id": "formwork", "label": "Formwork", "count": 4, "level": 1, "items": ["Soffit Formwork class F2", "Edge Stop-ends", "Beam Side Shuttering"] },
            { "id": "columns", "label": "Columns", "count": 4, "level": 1, "items": ["C35/45 Concrete", "Column Encasing", "Expansion Joint"] }
        ]
    },
    "fair_value_calculation": {
        "items": [
            { "item": "Tiles 600x600", "qty": 120, "unit": "m²", "rate": 128.00, "amount": 15360.00, "basis": "HKSMM4 2024 Edition", "source": "IPC Tile work Section 6.2.3" },
            { "item": "Tile Adhesive", "qty": 18, "unit": "bags", "rate": 28.00, "amount": 504.00, "basis": "Schedule of Rates C&SD Market Index", "source": "Spec 23 40 00" },
            { "item": "Grout", "qty": 10, "unit": "bags", "rate": 15.00, "amount": 150.00, "basis": "Approved Material Submittal", "source": "Item BQ 08-12" },
            { "item": "Skirting", "qty": 48, "unit": "m", "rate": 12.00, "amount": 576.00, "basis": "HKSMM4 Section 6.2.3", "source": "Drawing A-201" }
        ],
        "subtotal": 16590.00,
        "adjustments": {
            "description": "Prelim, OH&P (13%)",
            "amount": 2157.00
        },
        "total_fair_value": 18750.00,
        "rate_breakdown": {
            "labour": 40,
            "material": 45,
            "plant": 10,
            "other": 5
        }
    },
    "contractor_claim_adjudication": {
        "items": [
            { "item": "Tiles 600x600", "claim_amount": 20400.00, "cascade_fair": 15360.00, "variance": 5040.00, "variance_pct": 32.8, "flag": "Overpriced", "reason": "Rate higher than HKSMM4 benchmark ($170/m² claimed vs $128/m² standard)" },
            { "item": "Tile Adhesive", "claim_amount": 900.00, "cascade_fair": 504.00, "variance": 396.00, "variance_pct": 78.6, "flag": "Overpriced", "reason": "Claimed 30 bags ($30/bag) vs verified theoretical coverage of 18 bags ($28/bag)" },
            { "item": "Grout", "claim_amount": 250.00, "cascade_fair": 150.00, "variance": 100.00, "variance_pct": 66.7, "flag": "Excess Qty", "reason": "Excess quantity claimed without justification" },
            { "item": "Skirting", "claim_amount": 960.00, "cascade_fair": 576.00, "variance": 384.00, "variance_pct": 66.7, "flag": "Overpriced", "reason": "Rate higher than benchmark" }
        ],
        "total_claim": 22510.00,
        "total_cascade_fair": 16590.00,
        "total_variance": 5920.00,
        "inflated_percentage": 26.3
    },
    "cv_module": {
        "area_name": "Lobby Floor Area",
        "timestamp": "28 Jul 2026 10:15 AM",
        "completeness": 60,
        "breakdown": {
            "completed": 60,
            "in_progress": 30,
            "not_started": 10
        },
        "ai_confidence": 92,
        "delta_valued": "40% of scope remains payable only after skirting, grouting and edge protection pass final inspection (HKSMM4 §6.2.3).",
        "image_src": "/lobby_evidence.jpg",
        "drawing_ref": "A-201",
        "reference_area_sqm": 120.0,
        "world_width_m": 12.0,
        "world_depth_m": 10.0,
        "calibration_method": "drawing_takeoff_a201",
        "drawing_takeoff": {
            "tool": "deterministic_grid",
            "pdf_takeoff_when_available": "pdf2takeoff",
            "lobby_grid_m": "12.0 × 10.0",
            "tile_scope_sqm": 120.0,
            "note": "Tile quantity from Drawing A-201; site photos support milestone sign-off only.",
        },
        "evidence_chain": {
            "primary_photo": "IMG_20260728_1045.jpg",
            "captured_at": "28 Jul 2026 10:15 AM",
            "captured_by": "Site QS — HA Block 4 (Team Quantum audit)",
            "linked_drawings": ["A-201", "A-105"],
            "integrity": "SHA-256 e4b71…9c2f (local vault)"
        },
        "gallery": [
            {"id": "cam1", "label": "Lobby finishes — general view", "src": "/lobby_evidence.jpg"},
            {"id": "cam2", "label": "Floor screed inspection", "src": "/construction_screed.jpg"},
            {"id": "cam3", "label": "Tiling progress milestone", "src": "/construction_tiling.jpg"}
        ],
        "milestones": [
            {
                "id": "screed",
                "element": "Floor sub-base & screed",
                "taxonomy": "Finishes / Floor — Spec 23 40 00",
                "status": "verified",
                "progress_pct": 100,
                "weight_pct": 20,
                "citation": "SPC 23 40 00 §3.2 · BQ 08-12",
                "observation": "Screed levels and falls to floor trap verified on site walk-down."
            },
            {
                "id": "tiling",
                "element": "Homogeneous floor tiles 600×600",
                "taxonomy": "Finishes / Floor — HKSMM4 §6.2.3",
                "status": "in_progress",
                "progress_pct": 60,
                "weight_pct": 45,
                "citation": "Drawing A-201 · IPC Tile work",
                "observation": "Approximately 60% of lobby tile field laid; adhesive curing in active bays."
            },
            {
                "id": "grout",
                "element": "Waterproof grout & jointing",
                "taxonomy": "Finishes / Floor — Approved submittal",
                "status": "in_progress",
                "progress_pct": 30,
                "weight_pct": 20,
                "citation": "Material submittal MS-FT-2026-044",
                "observation": "Grouting commenced at completed bays only; not ready for final measure."
            },
            {
                "id": "skirting",
                "element": "100 mm tile skirting & edge protection",
                "taxonomy": "Finishes / Floor edge — Drawing A-105",
                "status": "not_started",
                "progress_pct": 0,
                "weight_pct": 15,
                "citation": "Drawing A-105 detail 3 · GCC cl. 14",
                "observation": "Perimeter skirting not commenced — withhold milestone payment on this element."
            }
        ],
        "certification": {
            "weighted_completeness_pct": 60,
            "fair_value_total_hkd": 18750,
            "payable_milestone_hkd": 7500,
            "withheld_pending_hkd": 11250,
            "cap652_window": "Issue payment certificate or written response within 30 days — Cap. 652",
            "certifier_note": "Cascade certifies 60% weighted completeness on lobby finishes. Pay HK$7,500 against fair value HK$18,750; balance withheld pending skirting and final grouting sign-off."
        },
        "footprint_norm": [
            {"x": 0.10, "y": 0.93},
            {"x": 0.90, "y": 0.93},
            {"x": 0.74, "y": 0.56},
            {"x": 0.26, "y": 0.56}
        ],
        "segments": [
            {
                "id": "completed",
                "label": "Floor screed & tiling (verified)",
                "category": "completed",
                "confidence": 0.92,
                "color": "#2D6A4F",
                "points_norm": [
                    {"x": 0.16, "y": 0.88},
                    {"x": 0.84, "y": 0.88},
                    {"x": 0.70, "y": 0.66},
                    {"x": 0.30, "y": 0.66}
                ]
            },
            {
                "id": "in_progress",
                "label": "Tile adhesive & laying (active)",
                "category": "in_progress",
                "confidence": 0.89,
                "color": "#D97706",
                "points_norm": [
                    {"x": 0.30, "y": 0.66},
                    {"x": 0.70, "y": 0.66},
                    {"x": 0.74, "y": 0.56},
                    {"x": 0.26, "y": 0.56}
                ]
            },
            {
                "id": "not_started",
                "label": "Skirting & edge protection",
                "category": "not_started",
                "confidence": 0.86,
                "color": "#64748B",
                "points_norm": [
                    {"x": 0.10, "y": 0.93},
                    {"x": 0.90, "y": 0.93},
                    {"x": 0.84, "y": 0.88},
                    {"x": 0.16, "y": 0.88}
                ]
            }
        ]
    },
    "cited_report": {
        "variation_id": "V-2026-017",
        "variation_title": "Lobby size increase 20%",
        "executive_summary": {
            "total_fair_value": 18750.00,
            "inflated_amount_detected": 5920.00,
            "inflated_percentage": 26.3,
            "payable_delta": 7500.00,
            "completeness_cv": "60%",
            "certification_impact": "Payable within Cap. 652 30-day window"
        },
        "references": [
            { "label": "BQ Page", "ref": "08-12" },
            { "label": "Drawing", "ref": "A-201, A-105" },
            { "label": "Specification", "ref": "SPC 23 40 00" },
            { "label": "Site Photo", "ref": "IMG_20260728_1045.jpg" },
            { "label": "Rate Source", "ref": "HKSMM4 (2024) Section 6.2.3" }
        ],
        "conclusion": "Based on the neuro-symbolic analysis and milestone evidence, HK$7,500 is payable for Variation V-2026-017 at the current certification stage. Fair value HK$18,750 is benchmarked to HKSMM4 (2024) and ArchSD indices. HK$5,920 of contractor inflation is recommended for deduction under GCC Clause 62, consistent with Cap. 652 payment response obligations.",
        "metadata": {
            "report_id": "RPT-V-2026-017-001",
            "issued_date": "28 Jul 2026",
            "prepared_by": "Team Quantum — Cascade Decision Support",
            "reviewer_role": "QS Senior Analyst (demo)",
            "document_hash": "SHA-256: c4e291a8…7f02",
            "cap652_reference": "Cap. 652 — Security of Payment Ordinance (30-day response)"
        },
        "methodology": [
            {
                "step": 1,
                "module": "Impact Trace",
                "engine": "Knowledge graph (Neo4j ontology)",
                "citation": "BQ 08-12 · Drawings A-201/A-105 · GCC",
                "outcome": "263 affected items traced (48 direct / 126+89 indirect)"
            },
            {
                "step": 2,
                "module": "Fair Value",
                "engine": "Deterministic HKSMM4 calculator",
                "citation": "HKSMM4 (2024) §6.2.3 · ArchSD SOR · DATA.GOV.HK BWTPI",
                "outcome": "Fair value HK$18,750 (rounded)"
            },
            {
                "step": 3,
                "module": "Claim Check",
                "engine": "Line-by-line adjudication",
                "citation": "GCC Clause 62 · Contractor VO submission",
                "outcome": "HK$5,920 inflation flagged (26.3%)"
            },
            {
                "step": 4,
                "module": "As-Built Verify",
                "engine": "Milestone taxonomy + site evidence",
                "citation": "Spec SPC 23 40 00 · IMG_20260728_1045.jpg",
                "outcome": "60% weighted completeness → payable delta HK$7,500"
            }
        ],
        "citations": [
            {
                "id": "C-01",
                "category": "Measurement",
                "source": "HKSMM4 (2024 Edition)",
                "reference": "Section 6.2.3 — Floor tiling",
                "excerpt": "Measured net area of finished tile surface; adhesive and grout measured separately per schedule.",
                "supports": "Tile qty 120 m² · adhesive 18 bags"
            },
            {
                "id": "C-02",
                "category": "Drawing",
                "source": "Architectural Drawing",
                "reference": "A-201, A-105",
                "excerpt": "Lobby extension grid 12.0 m × 10.0 m; skirting detail on A-105.",
                "supports": "Drawing takeoff quantity"
            },
            {
                "id": "C-03",
                "category": "Contract",
                "source": "GCC / HAGCC",
                "reference": "Clause 62 — Variation valuation",
                "excerpt": "Variations valued at fair rates; employer entitled to reject unsubstantiated portions of contractor claims.",
                "supports": "Deduction recommendation HK$5,920"
            },
            {
                "id": "C-04",
                "category": "Specification",
                "source": "Employer's Specification",
                "reference": "SPC 23 40 00",
                "excerpt": "Homogeneous floor tile 600×600; polymer adhesive and waterproof grout per approved submittal.",
                "supports": "Finishes scope & milestone checklist"
            },
            {
                "id": "C-05",
                "category": "Evidence",
                "source": "Site record",
                "reference": "IMG_20260728_1045.jpg",
                "excerpt": "Site evidence gallery — milestone sign-off only; not used for m² takeoff.",
                "supports": "60% completeness certification"
            },
            {
                "id": "C-06",
                "category": "Legislation",
                "source": "Cap. 652",
                "reference": "Payment response timeframe",
                "excerpt": "Payment schedule / adjudication response within prescribed period.",
                "supports": "Certification impact statement"
            }
        ],
        "valuation_lines": [
            {"item": "Tiles 600×600", "qty": "120 m²", "rate": 128.00, "amount": 15360.00, "citation_id": "C-01"},
            {"item": "Tile adhesive", "qty": "18 bags", "rate": 28.00, "amount": 504.00, "citation_id": "C-01"},
            {"item": "Grout", "qty": "10 bags", "rate": 15.00, "amount": 150.00, "citation_id": "C-04"},
            {"item": "Skirting", "qty": "48 m", "rate": 12.00, "amount": 576.00, "citation_id": "C-02"}
        ],
        "valuation_adjustments": {
            "description": "Prelim, OH&P (13%)",
            "amount": 2157.00
        },
        "valuation_subtotal": 16590.00,
        "deductions": [
            {"item": "Tiles — rate variance", "amount": 5040.00, "citation_id": "C-03"},
            {"item": "Adhesive — excess qty", "amount": 396.00, "citation_id": "C-03"},
            {"item": "Grout / skirting", "amount": 484.00, "citation_id": "C-03"}
        ]
    }
}

ALL_VARIATIONS = [
    { "id": "V-2026-017", "title": "Lobby size increase 20%", "status": "In Progress", "impact": "High", "updated": "28 Jul 2026", "affected_items": 263, "cost": 18750 },
    { "id": "V-2026-016", "title": "Structural opening change", "status": "Reviewed", "impact": "Medium", "updated": "27 Jul 2026", "affected_items": 112, "cost": 34200 },
    { "id": "V-2026-015", "title": "MEP reroute impact", "status": "In Progress", "impact": "Medium", "updated": "26 Jul 2026", "affected_items": 84, "cost": 12400 },
    { "id": "V-2026-014", "title": "Finishes modification", "status": "Completed", "impact": "Low", "updated": "25 Jul 2026", "affected_items": 42, "cost": 6500 },
]

class PromptRequest(BaseModel):
    prompt: str
    variation_id: Optional[str] = "V-2026-017"

@app.get("/api/dashboard")
def get_dashboard():
    return {
        "kpis": {
            "active_variations": 12,
            "active_variations_trend": "+2 this week",
            "total_claim_amount": 168590,
            "total_claim_trend": "-8,410 vs last week",
            "items_checked": 328,
            "items_checked_pct": "76% of total",
            "flagged_items": 23,
            "flagged_items_label": "Ready review"
        },
        "recent_variations": ALL_VARIATIONS,
        "impact_summary": {
            "total": 263,
            "direct": 48,
            "indirect_2hop": 126,
            "indirect_3hop": 89
        }
    }

@app.get("/api/variation/{variation_id}")
def get_variation_detail(variation_id: str):
    if variation_id in CASES:
        return CASES[variation_id]
    if variation_id == "V-2026-017":
        return VARIATION_DATA
    raise HTTPException(status_code=404, detail=f"Unknown variation {variation_id}")

@app.post("/api/ai/analyze-variation")
def analyze_with_ai(req: PromptRequest):
    """
    Invokes the Alibaba Qwen3.6-plus model using the provided credentials
    to analyze contractual impacts, HKSMM4 rules, and claim validation.
    """
    if not API_KEY or not ENDPOINT:
        # Fallback simulated response if no internet or key error
        return {
            "source": "fallback-rule-engine",
            "analysis": f"Evaluated variation query '{req.prompt}'. HKSMM4 Section 6.2.3 and Cap. 652 rules applied. Line item variance confirmed with 26.3% inflation."
        }

    system_instruction = (
        "You are Cascade AI, an expert Hong Kong Quantity Surveying and Contract Adjudication Engine. "
        "You are strictly knowledgeable in HKSMM4 (Hong Kong Standard Method of Measurement 4th Edition), "
        "General Conditions of Contract (GCC/HAGCC), Cap. 652 (Security of Payment Legislation), "
        "and deterministic rate pricing. Analyze the user instruction and provide clear, professional, "
        "and cited recommendations for the QS team."
    )

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": req.prompt}
        ],
        "temperature": 0.2
    }

    try:
        response = requests.post(
            ENDPOINT,
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=30
        )
        if response.status_code == 200:
            res_data = response.json()
            content = res_data["choices"][0]["message"]["content"]
            return {
                "source": MODEL,
                "analysis": content
            }
        else:
            return {
                "source": "error",
                "error": f"API returned status {response.status_code}",
                "analysis": "Could not complete online analysis, relying on deterministic HKSMM4 rule cache."
            }
    except Exception as e:
        return {
            "source": "exception",
            "error": str(e),
            "analysis": "Deterministic HKSMM4 evaluation applied: All rates benchmarked to ArchSD Schedule of Rates."
        }

@app.get("/api/graph/{variation_id}")
def get_knowledge_graph(variation_id: str):
    """Contract impact graph (Neo4j when configured; isomorphic fallback for demo)."""
    detail = get_variation_detail(variation_id)
    return get_impact_graph(detail)


@app.get("/api/cv/module/{variation_id}")
def get_cv_module(variation_id: str):
    """As-built masks on site photo, m² from OpenCV homography to Drawing A-201 floor grid (local)."""
    detail = get_variation_detail(variation_id)
    raw = detail.get("cv_module", VARIATION_DATA["cv_module"])
    return enrich_cv_module(raw)


@app.get("/api/drawing/takeoff/{variation_id}")
def get_drawing_takeoff(variation_id: str):
    """Deterministic drawing quantities for Fair Value (A-201); swap in pdf2takeoff when PDF samples arrive."""
    detail = get_variation_detail(variation_id)
    cv = enrich_cv_module(detail.get("cv_module", VARIATION_DATA["cv_module"]))
    fv = detail.get("fair_value_calculation", VARIATION_DATA["fair_value_calculation"])
    tile = next((i for i in fv["items"] if "Tile" in i["item"]), fv["items"][0])
    return {
        "variation_id": variation_id,
        "drawing_ref": cv.get("drawing_ref", "A-201"),
        "lobby_footprint_m": {
            "width": cv.get("world_width_m", 12.0),
            "depth": cv.get("world_depth_m", 10.0),
        },
        "tile_area_sqm": cv.get("reference_area_sqm", tile["qty"]),
        "hksmm4_line": tile,
        "measurement_stack": cv.get("drawing_takeoff"),
        "cv_completed_sqm": next(
            (s["area_sqm"] for s in cv.get("segments", []) if s.get("id") == "completed"),
            None,
        ),
    }


@app.get("/api/report/{variation_id}")
def get_cited_report(variation_id: str):
    """Export-ready cited valuation + Claims Evidence pack (OCE-inspired, HK-scoped)."""
    return _build_report_payload(variation_id)


@app.get("/api/evidence-pack/{variation_id}")
def get_evidence_pack(variation_id: str):
    """Standalone Claims Evidence reconstruct (OpenConstructionERP-pattern port)."""
    detail = get_variation_detail(variation_id)
    report = detail.get("cited_report", VARIATION_DATA["cited_report"])
    return assemble_evidence_pack(detail, report)


def _build_report_payload(variation_id: str) -> Dict[str, Any]:
    detail = get_variation_detail(variation_id)
    report = dict(detail.get("cited_report", VARIATION_DATA["cited_report"]))
    fv = detail.get("fair_value_calculation", VARIATION_DATA["fair_value_calculation"])
    claim = detail.get("contractor_claim_adjudication", VARIATION_DATA["contractor_claim_adjudication"])
    pack = assemble_evidence_pack(detail, report)
    meta = dict(report.get("metadata") or {})
    meta["document_hash"] = pack["document_hash"]
    report["metadata"] = meta
    es = dict(report.get("executive_summary") or {})
    es["total_fair_value"] = fv.get("total_fair_value")
    es["inflated_amount_detected"] = claim.get("total_variance")
    es["inflated_percentage"] = claim.get("inflated_percentage")
    es["payable_delta"] = pack["payment_clock"].get("admitted_payable_hkd")
    es["completeness_cv"] = f"{pack['certification_math'].get('weighted_completeness_pct', 60):.0f}%"
    report["executive_summary"] = es
    return {
        **report,
        "variation_id": variation_id,
        "variation_title": detail.get("title", report.get("variation_title")),
        "fair_value_total": fv.get("total_fair_value"),
        "contractor_claim_total": claim.get("total_claim"),
        "variance_total": claim.get("total_variance"),
        "evidence_pack": pack,
    }


@app.get("/api/evidence-pack/{variation_id}/export.html")
def export_evidence_html(variation_id: str, lang: str = "en"):
    detail = get_variation_detail(variation_id)
    report = _build_report_payload(variation_id)
    html = render_evidence_html(detail, report, lang)
    filename = f"Cascade-EP-{variation_id}.html"
    return HTMLResponse(
        content=html,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-store",
        },
    )


@app.get("/api/evidence-pack/{variation_id}/export.pdf")
def export_evidence_pdf(variation_id: str, lang: str = "en"):
    detail = get_variation_detail(variation_id)
    report = _build_report_payload(variation_id)
    try:
        pdf_bytes, _engine = render_evidence_pdf(detail, report, lang)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    filename = f"Cascade-EP-{variation_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-store",
        },
    )


@app.post("/api/pack/upload")
async def upload_variation_pack(
    files: List[UploadFile] = File(...),
    variation_id: Optional[str] = Form(None),
):
    """Ingest uploaded pack: extract PDF text, build case, graph, and valuation."""
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    payloads = []
    for f in files:
        raw = await f.read()
        payloads.append(
            {
                "filename": f.filename or "upload.bin",
                "content_type": f.content_type,
                "raw": raw,
            }
        )
    if variation_id and variation_id in CASE_FILE_STORE:
        CASE_FILE_STORE[variation_id].extend(payloads)
        ingest_payloads = CASE_FILE_STORE[variation_id]
    else:
        ingest_payloads = payloads
    try:
        variation = ingest_uploaded_pack(ingest_payloads, VARIATION_DATA)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Ingest failed: {exc}") from exc
    vid = variation_id if variation_id and variation_id in CASES else variation["id"]
    variation["id"] = vid
    gcenter = variation.get("graph", {}).get("center")
    if gcenter:
        gcenter["id"] = vid
    CASES[vid] = variation
    CASE_FILE_STORE[vid] = ingest_payloads
    accepted = []
    for doc in variation.get("pack_documents") or []:
        accepted.append(
            {
                "id": doc["id"],
                "name": doc["filename"],
                "category": doc["discipline"],
                "status": "ready",
                "role": doc.get("role", "Ingested"),
            }
        )
    return {
        "ok": True,
        "count": len(accepted),
        "files": accepted,
        "variation_id": vid,
        "title": variation.get("title"),
        "ingest": variation.get("ingest_meta", {}),
        "message": f"Case {vid} created from {len(files)} file(s). Fair value and graph updated from extracted data.",
    }


@app.get("/api/gov-data/rates")
def get_gov_benchmarks():
    return {
        "source": "DATA.GOV.HK - Census and Statistics & ArchSD",
        "tender_price_index": {
            "quarter": "Q2 2026",
            "bwtpi": 2180,
            "trend": "+1.8%"
        },
        "daily_wages": [
            { "trade": "Carpenter (Formwork)", "rate_hkd": 1420 },
            { "trade": "Bar Bender and Fixer", "rate_hkd": 1650 },
            { "trade": "Plasterer / Tiler", "rate_hkd": 1380 },
            { "trade": "General Construction Worker", "rate_hkd": 980 }
        ],
        "material_prices": [
            { "material": "Portland Cement (ordinary)", "unit": "tonne", "price_hkd": 860 },
            { "material": "High Tensile Steel Deformed Bar (20mm)", "unit": "tonne", "price_hkd": 5600 },
            { "material": "Aggregates (20mm)", "unit": "m³", "price_hkd": 145 },
            { "material": "Homogeneous Floor Tiles (600x600)", "unit": "m²", "price_hkd": 115 }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

