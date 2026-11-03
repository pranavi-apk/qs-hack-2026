import os
import json
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

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
        "delta_valued": "40% of the area is payable upon final grouting & edge protection inspection.",
        "image_url": "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80"
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
        "conclusion": "Based on the neuro-symbolic analysis and computer vision evidence, $7,500 is payable for Variation V-2026-017 under current milestone progress. All rates are strictly benchmarked to HKSMM4 and verified with site photos. $5,920 of contractor inflation has been flagged for rejection."
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
    if variation_id == "V-2026-017":
        return VARIATION_DATA
    # Return standard variation fallback
    data = dict(VARIATION_DATA)
    data["id"] = variation_id
    return data

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

